const { supabase } = require("./companies");
const { hasFeature } = require("./plans");
const { sendEmail, googleCalendarLink, signatureHtml } = require("./notifications");

/**
 * Bookings and the SCALE plan's team features.
 *
 * Every accepted quote of a real client company is recorded in `bookings`
 * (dealz-crm/scale-schema.sql). For a SCALE company it is also routed:
 *   1. team — the one named by the widget's grid, else the one whose
 *      areas (postcodes / towns) match the customer's address;
 *   2. staff — active in that team, working that weekday, not already at
 *      their daily maximum; the least loaded that day, then overall;
 *   3. the staff member gets the job by e-mail with a calendar invitation.
 * The CRM shows the shared agenda and lets the company reassign.
 *
 * Nothing here may break a booking for the customer: without Supabase or
 * before the schema exists, every function logs and returns null.
 */

const SITE_URL = (process.env.APP_BASE_URL && !/localhost/.test(process.env.APP_BASE_URL) ? process.env.APP_BASE_URL : "https://dealz.website").replace(/\/$/, "");

// ---- dates ----

function isoDay(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// The service date of a quote: quote.date (sector widget), else the first
// date-looking answer (cleaning engine's quote.details), else null.
function bookingDate(quote) {
  const candidates = [quote && quote.date];
  if (quote && quote.details && typeof quote.details === "object") candidates.push(...Object.values(quote.details));
  for (const c of candidates) {
    if (typeof c !== "string") continue;
    let m = c.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[0];
    m = c.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function isoWeekday(day) {
  const d = new Date(day + "T12:00:00Z").getUTCDay();
  return d === 0 ? 7 : d;
}

// ---- routing ----

function postcodeOf(address) {
  const m = String(address || "").match(/\b(\d{4,5})\b/);
  return m ? m[1] : "";
}

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Does a team serve this address? An area is a postcode prefix ("10",
// "1004") or a town name found in the address.
function teamServes(team, address) {
  const areas = String(team.areas || "").split(/[,;\n]/).map((a) => a.trim()).filter(Boolean);
  if (!areas.length) return false;
  const pc = postcodeOf(address);
  const addr = norm(address);
  return areas.some((a) => (/^\d+$/.test(a) ? pc && pc.startsWith(a) : addr.includes(norm(a))));
}

async function pickTeam(companyId, { gridSlug, address }) {
  const { data: teams, error } = await supabase.from("teams").select("*").eq("company_id", companyId);
  if (error) throw error;
  if (!teams || !teams.length) return null;
  if (gridSlug) {
    const t = teams.find((x) => x.slug === gridSlug);
    if (t) return t;
  }
  return teams.find((t) => teamServes(t, address)) || null;
}

// Least-loaded available staff member for that day (in the team when
// there is one; falls back to everyone if nobody in the team is free).
async function pickStaff(companyId, teamId, day) {
  const { data: staff, error } = await supabase.from("staff").select("*").eq("company_id", companyId).eq("active", true);
  if (error) throw error;
  if (!staff || !staff.length) return null;

  const { data: booked } = await supabase
    .from("bookings")
    .select("staff_id, date")
    .eq("company_id", companyId)
    .neq("status", "cancelled")
    .gte("date", isoDay(new Date()));
  const sameDay = {};
  const upcoming = {};
  for (const b of booked || []) {
    if (!b.staff_id) continue;
    upcoming[b.staff_id] = (upcoming[b.staff_id] || 0) + 1;
    if (b.date === day) sameDay[b.staff_id] = (sameDay[b.staff_id] || 0) + 1;
  }

  const weekday = day ? isoWeekday(day) : null;
  const free = (s) =>
    (!weekday || (s.work_days || [1, 2, 3, 4, 5]).includes(weekday)) && (sameDay[s.id] || 0) < (s.max_per_day || 2);
  const byLoad = (a, b) => (sameDay[a.id] || 0) - (sameDay[b.id] || 0) || (upcoming[a.id] || 0) - (upcoming[b.id] || 0);

  const inTeam = teamId ? staff.filter((s) => s.team_id === teamId && free(s)) : [];
  const pool = inTeam.length ? inTeam : staff.filter(free);
  return pool.sort(byLoad)[0] || null;
}

// ---- notifications to staff ----

const STAFF_TEXT = {
  fr: { subject: (d) => `Nouvelle intervention — ${d}`, h2: "Nouvelle intervention attribuée", date: "Date", client: "Client", phone: "Téléphone", address: "Adresse", amount: "Montant", cal: "Ajouter à mon agenda", tbd: "à convenir avec le client", reminderSubject: (d) => `Rappel — intervention demain (${d})`, reminderH2: "Rappel : intervention demain" },
  en: { subject: (d) => `New job — ${d}`, h2: "New job assigned to you", date: "Date", client: "Customer", phone: "Phone", address: "Address", amount: "Amount", cal: "Add to my calendar", tbd: "to be agreed with the customer", reminderSubject: (d) => `Reminder — job tomorrow (${d})`, reminderH2: "Reminder: job tomorrow" },
  de: { subject: (d) => `Neuer Einsatz — ${d}`, h2: "Neuer Einsatz zugeteilt", date: "Datum", client: "Kunde", phone: "Telefon", address: "Adresse", amount: "Betrag", cal: "Zu meinem Kalender hinzufügen", tbd: "mit dem Kunden zu vereinbaren", reminderSubject: (d) => `Erinnerung — Einsatz morgen (${d})`, reminderH2: "Erinnerung: Einsatz morgen" },
};

function showDay(day) {
  if (!day) return null;
  const [y, m, d] = day.split("-");
  return `${d}.${m}.${y}`;
}

// A day-long event in iCalendar form (RFC 5545), for invitations and feeds.
function icsEvent({ uid, day, summary, description, location }) {
  const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => "\\" + c);
  const d = day.replace(/-/g, "");
  const next = new Date(day + "T12:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@dealz.website`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${isoDay(next).replace(/-/g, "")}`,
    `SUMMARY:${esc(summary)}`,
    description ? `DESCRIPTION:${esc(description)}` : null,
    location ? `LOCATION:${esc(location)}` : null,
    "END:VEVENT",
  ].filter(Boolean).join("\r\n");
}

function icsCalendar(name, events, method) {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dealz//Bookings//FR", "CALSCALE:GREGORIAN", method ? `METHOD:${method}` : null, `X-WR-CALNAME:${name}`, ...events, "END:VCALENDAR"]
    .filter(Boolean)
    .join("\r\n");
}

function bookingSummary(company, booking) {
  const c = booking.customer || {};
  return `${company.name} — ${c.name || "Client"}`;
}

function bookingDescription(booking) {
  const c = booking.customer || {};
  const items = ((booking.quote && booking.quote.items) || []).map((i) => `${i.label}: CHF ${Number(i.amount).toFixed(2)}`).join("\n");
  return [c.phone && `Tel: ${c.phone}`, c.email && `E-mail: ${c.email}`, items, booking.total != null && `Total: CHF ${Number(booking.total).toFixed(2)}`].filter(Boolean).join("\n");
}

async function notifyStaff(company, staff, booking, { reminder = false } = {}) {
  if (!staff || !staff.email) return null;
  const L = STAFF_TEXT[booking.lang] || STAFF_TEXT.fr;
  const c = booking.customer || {};
  const day = showDay(booking.date) || L.tbd;
  const calLink = booking.date
    ? googleCalendarLink({
        title: bookingSummary(company, booking),
        details: bookingDescription(booking),
        location: c.address || "",
        startISO: `${booking.date}T08:00:00.000Z`,
        endISO: `${booking.date}T10:00:00.000Z`,
      })
    : null;
  const html = `
    <h2>${reminder ? L.reminderH2 : L.h2}</h2>
    <p>${staff.name},</p>
    <p><b>${L.date} :</b> ${day}<br/>
       <b>${L.client} :</b> ${c.name || "—"}<br/>
       <b>${L.phone} :</b> ${c.phone || "—"}<br/>
       <b>${L.address} :</b> ${c.address || "—"}<br/>
       <b>${L.amount} :</b> CHF ${Number(booking.total || 0).toFixed(2)}</p>
    <table>${((booking.quote && booking.quote.items) || []).map((i) => `<tr><td>${i.label}</td><td style="text-align:right">CHF ${Number(i.amount).toFixed(2)}</td></tr>`).join("")}</table>
    ${calLink ? `<p><a href="${calLink}">${L.cal}</a></p>` : ""}
    ${signatureHtml(company.name, company.signature, company.logoUrl, company.tagline, booking.lang || "fr")}`;
  const icalEvent =
    booking.date && !reminder
      ? { method: "PUBLISH", filename: "intervention.ics", content: icsCalendar(company.name, [icsEvent({ uid: booking.id, day: booking.date, summary: bookingSummary(company, booking), description: bookingDescription(booking), location: c.address })], "PUBLISH") }
      : undefined;
  try {
    return await sendEmail({ to: staff.email, subject: reminder ? L.reminderSubject(day) : L.subject(day), html, replyTo: company.notifyEmail, icalEvent });
  } catch (err) {
    console.error("[scale] staff e-mail failed:", err.message);
    return null;
  }
}

const CUSTOMER_REMINDER = {
  fr: { subject: (c) => `Rappel — votre rendez-vous de demain avec ${c}`, h2: "À demain !", body: (n, c, d) => `Bonjour ${n},<br/>Petit rappel : ${c} intervient chez vous demain, le ${d}.` },
  en: { subject: (c) => `Reminder — your appointment tomorrow with ${c}`, h2: "See you tomorrow!", body: (n, c, d) => `Hello ${n},<br/>A quick reminder: ${c} is coming to you tomorrow, ${d}.` },
  de: { subject: (c) => `Erinnerung — Ihr Termin morgen mit ${c}`, h2: "Bis morgen!", body: (n, c, d) => `Guten Tag ${n},<br/>Eine kurze Erinnerung: ${c} kommt morgen, am ${d}, zu Ihnen.` },
};

async function remindCustomer(company, booking) {
  const c = booking.customer || {};
  if (!c.email) return null;
  const L = CUSTOMER_REMINDER[booking.lang] || CUSTOMER_REMINDER.fr;
  try {
    return await sendEmail({
      to: c.email,
      subject: L.subject(company.name),
      html: `<h2>${L.h2}</h2><p>${L.body(c.name || "", company.name, showDay(booking.date))}</p>${signatureHtml(company.name, company.signature, company.logoUrl, company.tagline, booking.lang || "fr")}`,
      replyTo: company.notifyEmail,
    });
  } catch (err) {
    console.error("[scale] customer reminder failed:", err.message);
    return null;
  }
}

// ---- booking creation ----

/**
 * Records an accepted quote for a real company and, on SCALE, assigns it.
 * Returns { booking, staff, team } or null (demo, no Supabase, no schema).
 */
async function createBooking({ company, quote, customer, source, lang, gridSlug }) {
  if (!supabase || !company || !company.id) return null;
  try {
    const day = bookingDate(quote);
    let team = null;
    let staff = null;
    if (hasFeature(company, "team")) {
      team = await pickTeam(company.id, { gridSlug, address: (customer || {}).address });
      staff = await pickStaff(company.id, team && team.id, day);
    }
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        company_id: company.id,
        team_id: team ? team.id : null,
        staff_id: staff ? staff.id : null,
        date: day,
        customer: customer || {},
        quote: quote || {},
        total: quote && quote.total != null ? quote.total : null,
        source: source || null,
        lang: lang || "fr",
      })
      .select()
      .single();
    if (error) throw error;
    if (staff) await notifyStaff(company, staff, booking);
    return { booking, staff, team };
  } catch (err) {
    console.error("[scale] booking not recorded:", err.message);
    return null;
  }
}

// ---- price grid per team/location ----

// The pricing a widget should use: the team grid named by data-dealz-grid
// (SCALE), else the company's own.
async function pricingFor(company, gridSlug) {
  if (!company) return null;
  if (!gridSlug || !supabase || !hasFeature(company, "team")) return company.pricing;
  try {
    const { data } = await supabase.from("teams").select("pricing").eq("company_id", company.id).eq("slug", gridSlug).maybeSingle();
    return (data && data.pricing) || company.pricing;
  } catch (err) {
    console.error("[scale] grid lookup failed:", err.message);
    return company.pricing;
  }
}

// ---- calendar feeds (shared agenda) ----

/**
 * iCalendar feed for a secret token: a company's calendar_token gives all
 * its bookings, a staff member's gives theirs. Subscribing to the URL in
 * Google Calendar / Outlook / Apple Calendar keeps it in sync.
 */
async function calendarFeed(token) {
  if (!supabase || !/^[a-f0-9]{16,64}$/.test(token || "")) return null;
  let company = null;
  let staff = null;
  const { data: c } = await supabase.from("companies").select("*").eq("calendar_token", token).maybeSingle();
  if (c) company = c;
  else {
    const { data: s } = await supabase.from("staff").select("*").eq("calendar_token", token).maybeSingle();
    if (!s) return null;
    staff = s;
    const { data: c2 } = await supabase.from("companies").select("*").eq("id", s.company_id).maybeSingle();
    company = c2;
  }
  if (!company || !hasFeature({ plan: company.plan }, "team")) return null;

  const since = new Date(Date.now() - 60 * 864e5);
  let q = supabase.from("bookings").select("*").eq("company_id", company.id).neq("status", "cancelled").gte("date", isoDay(since));
  if (staff) q = q.eq("staff_id", staff.id);
  const { data: bookings } = await q;
  const { data: people } = staff ? { data: [staff] } : await supabase.from("staff").select("id, name").eq("company_id", company.id);
  const who = Object.fromEntries((people || []).map((p) => [p.id, p.name]));

  const events = (bookings || [])
    .filter((b) => b.date)
    .map((b) =>
      icsEvent({
        uid: b.id,
        day: b.date,
        summary: `${who[b.staff_id] ? who[b.staff_id] + " · " : ""}${(b.customer || {}).name || "Client"}`,
        description: bookingDescription(b),
        location: (b.customer || {}).address,
      })
    );
  return icsCalendar(staff ? `${company.name} — ${staff.name}` : company.name, events);
}

// ---- daily automations (Vercel cron) ----

/**
 * Once a day, for SCALE companies:
 *   - reminder e-mail to the customer and the assigned staff member for
 *     tomorrow's bookings;
 *   - automatic follow-up to customers whose declined quote got no action
 *     from the company within 48h (same e-mail as the "Follow up" button).
 * `followup(entry, token)` is server.js's own follow-up sender.
 * (Bookings without a staff member still get the customer reminder.)
 */
async function runDailyAutomations({ followup, sendReminderToCustomer = remindCustomer } = {}) {
  if (!supabase) return { skipped: "no database" };
  const out = { reminders: 0, followups: 0 };
  const { data: companies } = await supabase.from("companies").select("*").eq("plan", "SCALE");
  const byId = Object.fromEntries((companies || []).map((c) => [c.id, c]));
  if (!companies || !companies.length) return out;

  const tomorrow = isoDay(new Date(Date.now() + 864e5));
  const { data: due } = await supabase
    .from("bookings")
    .select("*")
    .in("company_id", Object.keys(byId))
    .eq("date", tomorrow)
    .neq("status", "cancelled")
    .is("reminder_sent_at", null);
  for (const b of due || []) {
    const row = byId[b.company_id];
    const company = { id: row.id, name: row.name, notifyEmail: row.notify_email, signature: row.signature, logoUrl: row.logo_url, tagline: row.tagline, plan: row.plan };
    if (b.staff_id) {
      const { data: s } = await supabase.from("staff").select("*").eq("id", b.staff_id).maybeSingle();
      if (s) await notifyStaff(company, s, b, { reminder: true });
    }
    if (sendReminderToCustomer) await sendReminderToCustomer(company, b);
    await supabase.from("bookings").update({ reminder_sent_at: new Date().toISOString() }).eq("id", b.id);
    out.reminders++;
  }

  if (followup) {
    const cutoff = new Date(Date.now() - 48 * 3600e3).toISOString();
    const oldest = new Date(Date.now() - 7 * 864e5).toISOString();
    const { data: declines } = await supabase
      .from("store_entries")
      .select("token, data, created_at")
      .lt("created_at", cutoff)
      .gt("created_at", oldest)
      .eq("data->>type", "decline")
      .eq("data->>status", "pending");
    for (const d of declines || []) {
      if (!d.data.companyId || !byId[d.data.companyId] || !(d.data.customer || {}).email) continue;
      try {
        await followup(d.data, d.token);
        out.followups++;
      } catch (err) {
        console.error("[scale] auto follow-up failed:", err.message);
      }
    }
  }
  return out;
}

module.exports = { createBooking, bookingDate, pricingFor, calendarFeed, runDailyAutomations, teamServes };
