/**
 * The onboarding form (docs/integration.html, /en/…, /de/…): everything
 * Dealz needs to set a new client up, asked once, step by step, with a
 * progress bar. The client gets the link by e-mail right after paying
 * (src/billing.js → src/onboarding.js). With ?s=<Stripe Checkout Session>
 * the answers already known (company, contact, plan, website, currency)
 * are filled in; without it, the form works on its own.
 *
 * Answers are kept on this device as the client types (localStorage), so
 * closing the page loses nothing. Sent to POST /api/onboarding.
 */
(function () {
  const LANG = ["en", "de", "it"].includes(window.DEALZ_LANG) ? window.DEALZ_LANG : "fr";
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[LANG] || o.fr);
  const t = (fr, en, de, it) => ({ fr, en, de, it });
  const SESSION = new URLSearchParams(location.search).get("s") || "";
  const DRAFT_KEY = "dealz-onboarding:" + (SESSION || "open");

  const UI = {
    start: t("Commencer", "Start", "Starten", "Iniziare"),
    next: t("Continuer", "Continue", "Weiter", "Continuare"),
    back: t("Retour", "Back", "Zurück", "Indietro"),
    send: t("Envoyer mes réponses", "Send my answers", "Antworten senden", "Inviare le mie risposte"),
    sending: t("Envoi…", "Sending…", "Wird gesendet…", "Invio in corso…"),
    step: t("Étape {i} sur {n}", "Step {i} of {n}", "Schritt {i} von {n}", "Passo {i} di {n}"),
    required: t("Merci de remplir les champs marqués d'un astérisque.", "Please fill in the fields marked with an asterisk.", "Bitte füllen Sie die mit einem Sternchen markierten Felder aus.", "Compilate i campi contrassegnati da un asterisco."),
    badEmail: t("Cette adresse e-mail ne semble pas valide.", "This email address does not look valid.", "Diese E-Mail-Adresse scheint ungültig zu sein.", "Questo indirizzo e-mail non sembra valido."),
    error: t("Une erreur est survenue. Vos réponses sont gardées : réessayez dans un instant.", "Something went wrong. Your answers are saved: please try again in a moment.", "Etwas ist schiefgelaufen. Ihre Antworten sind gespeichert: Bitte versuchen Sie es gleich nochmals.", "Si è verificato un errore. Le vostre risposte sono salvate: riprovate tra un momento."),
    other: t("Précisez…", "Please specify…", "Bitte präzisieren…", "Precisate…"),
    optional: t("facultatif", "optional", "optional", "facoltativo"),
    recapTitle: t("Récapitulatif", "Summary", "Zusammenfassung", "Riepilogo"),
    recapIntro: t("Relisez vos réponses. Vous pouvez revenir à une étape pour corriger.", "Check your answers. You can go back to any step to correct them.", "Prüfen Sie Ihre Antworten. Sie können zu jedem Schritt zurückkehren.", "Rileggete le vostre risposte. Potete tornare a un passo per correggere."),
    edit: t("Modifier", "Edit", "Ändern", "Modificare"),
    saved: t("Enregistré sur cet appareil", "Saved on this device", "Auf diesem Gerät gespeichert", "Salvato su questo dispositivo"),
    doneTitle: t("Merci, c'est reçu !", "Thank you, we have it!", "Danke, alles erhalten!", "Grazie, abbiamo ricevuto tutto!"),
    doneText: t(
      "Nous préparons votre Dealz avec ces informations et revenons vers vous très vite pour la réunion de 30 minutes. Une copie vous est envoyée par e-mail.",
      "We are preparing your Dealz with this information and will come back to you very soon for the 30-minute meeting. A copy is on its way to your inbox.",
      "Wir richten Ihr Dealz mit diesen Angaben ein und melden uns sehr bald für das 30-minütige Gespräch. Eine Kopie erhalten Sie per E-Mail.", "Prepariamo il vostro Dealz con queste informazioni e vi ricontattiamo molto presto per l'incontro di 30 minuti. Vi inviamo una copia via e-mail."
    ),
    empty: "—",
    doneTextBook: t(
      "Nous préparons votre Dealz avec ces informations. Choisissez ci-dessous le moment de notre réunion de 30 minutes. Une copie de vos réponses vous est envoyée par e-mail.",
      "We are preparing your Dealz with this information. Pick a time for our 30-minute meeting below. A copy of your answers is on its way to your inbox.",
      "Wir richten Ihr Dealz mit diesen Angaben ein. Wählen Sie unten einen Termin für unser 30-minütiges Gespräch. Eine Kopie Ihrer Antworten erhalten Sie per E-Mail.", "Prepariamo il vostro Dealz con queste informazioni. Scegliete qui sotto un orario per il nostro incontro di 30 minuti. Vi inviamo una copia delle vostre risposte via e-mail."
    ),
    pickFile: t("Choisir un fichier", "Choose a file", "Datei wählen", "Scegliere un file"),
    removeFile: t("Retirer", "Remove", "Entfernen", "Rimuovere"),
    addFile: t("Ajouter un autre fichier", "Add another file", "Weitere Datei hinzufügen", "Aggiungere un altro file"),
    tooBig: t("Ce fichier dépasse 3 Mo : envoyez-le à info@dealz.website, ou importez une version plus légère.", "This file is over 3 MB: send it to info@dealz.website, or upload a smaller version.", "Diese Datei ist grösser als 3 MB: Senden Sie sie an info@dealz.website oder laden Sie eine kleinere Version hoch.", "Questo file supera i 3 MB: inviatelo a info@dealz.website, oppure caricatene una versione più leggera."),
    tooBigTotal: t("Vos fichiers dépassent 3 Mo au total : envoyez le dernier à info@dealz.website.", "Your files are over 3 MB in total: send the last one to info@dealz.website.", "Ihre Dateien sind zusammen grösser als 3 MB: Senden Sie die letzte an info@dealz.website.", "I vostri file superano i 3 MB in totale: inviate l'ultimo a info@dealz.website."),
  };

  const OTHER = { id: "other", label: t("Autre", "Other", "Andere", "Altro"), other: true };
  const isPlan = (a, ...plans) => plans.includes(a.plan);
  const noSite = (a) => a.integration === "nosite";
  const currencyOf = (a) => a.currency || { CH: "CHF", FR: "EUR", UK: "GBP", US: "USD" }[a.country] || "CHF";
  const usesMiles = (a) => a.country === "UK" || a.country === "US";
  const needsAgency = (a) => !noSite(a) && (a.site_manager === "agency" || a.site_manager === "other");
  // Cantons, départements, counties or states (docs/regions.js).
  const REGIONS = window.DEALZ_REGIONS || {};
  const hasRegions = (a) => !!REGIONS[a.country];
  // US: after the states, the main cities / metro areas of those states,
  // plus "elsewhere in <state>" (docs/regions.js).
  const US_CITIES = window.DEALZ_US_CITIES || {};
  const STATE_NAME = {};
  (REGIONS.US || []).forEach((r) => (STATE_NAME[r.id] = r.label.replace(/ \(..\)$/, "")));
  const chosenStates = (a) => (a.country === "US" && Array.isArray(a.zone_regions) ? a.zone_regions : []);
  const cityList = (a) =>
    chosenStates(a).flatMap((st) =>
      (US_CITIES[st] || [])
        .map((c) => ({ id: st + ":" + c, label: c + " (" + st + ")" }))
        .concat({ id: st + ":other", label: t("Ailleurs en " + STATE_NAME[st], "Elsewhere in " + STATE_NAME[st], "Anderswo in " + STATE_NAME[st], "Altrove in " + STATE_NAME[st]) }),
    );
  const usOther = (a) => (Array.isArray(a.zone_cities) ? a.zone_cities : []).some((x) => /:other$/.test(x));
  const regionList = (f) => (f.source ? f.source(answers) : REGIONS[answers.country] || []);
  const REGION_NAME = {
    CH: t("canton", "canton", "Kanton", "cantone"), FR: t("département", "département", "Departement", "dipartimento"),
    UK: t("county", "county", "County", "contea"), US: t("State", "state", "Bundesstaat", "stato"),
  };

  // ---- the questions ----
  const STEPS = [
    {
      id: "company",
      title: t("Votre entreprise", "Your company", "Ihr Unternehmen", "La vostra impresa"),
      fields: [
        { id: "company", type: "text", required: true, label: t("Nom de l'entreprise, tel qu'il doit apparaître sur les devis", "Company name, as it should appear on quotes", "Firmenname, wie er auf den Offerten erscheinen soll", "Nome dell'impresa, come deve apparire sui preventivi") },
        { id: "contact_name", type: "text", required: true, label: t("Votre nom", "Your name", "Ihr Name", "Il vostro nome") },
        { id: "contact_email", type: "email", required: true, label: t("Votre e-mail", "Your email", "Ihre E-Mail", "La vostra e-mail") },
        { id: "contact_phone", type: "tel", label: t("Votre téléphone", "Your phone", "Ihre Telefonnummer", "Il vostro telefono") },
        { id: "alert_emails", type: "text", label: t("E-mail(s) qui reçoivent les alertes de devis acceptés ou refusés", "Email(s) that receive alerts for accepted or declined quotes", "E-Mail(s), die Benachrichtigungen zu angenommenen oder abgelehnten Offerten erhalten", "E-mail che ricevono gli avvisi di preventivi accettati o rifiutati"), hint: t("Séparés par une virgule. Vide = votre e-mail.", "Comma-separated. Empty = your email.", "Durch Komma getrennt. Leer = Ihre E-Mail.", "Separate da virgole. Vuoto = la vostra e-mail.") },
        { id: "decision_maker", type: "text", label: t("Qui d'autre doit valider les prix ou les messages ?", "Who else needs to approve prices or messages?", "Wer muss Preise oder Nachrichten sonst noch freigeben?", "Chi altro deve approvare i prezzi o i messaggi?"), hint: t("Nom et rôle, si ce n'est pas seulement vous.", "Name and role, if not only you.", "Name und Funktion, falls nicht nur Sie.", "Nome e ruolo, se non siete solo voi.") },
        {
          id: "plan", type: "single", required: true, label: t("Votre formule", "Your plan", "Ihr Paket", "Il vostro piano"),
          options: [
            { id: "CAPTURE", label: "CAPTURE" },
            { id: "CLOSE", label: "CLOSE" },
            { id: "SCALE", label: "SCALE" },
            { id: "unknown", label: t("Je ne sais plus", "Not sure", "Weiss ich nicht mehr", "Non sono sicuro") },
          ],
        },
      ],
    },
    {
      id: "customers",
      title: t("Votre activité et vos clients", "Your business and customers", "Ihre Tätigkeit und Ihre Kunden", "La vostra attività e i vostri clienti"),
      fields: [
        { id: "sector", type: "select", required: true, label: t("Votre secteur", "Your sector", "Ihre Branche", "Il vostro settore"), optionsFrom: "sectors", withOther: true },
        {
          id: "country", type: "single", required: true, label: t("Pays où vous intervenez", "Country you work in", "Land, in dem Sie tätig sind", "Paese in cui lavorate"),
          options: [
            { id: "CH", label: t("Suisse", "Switzerland", "Schweiz", "Svizzera") },
            { id: "FR", label: t("France", "France", "Frankreich", "Francia") },
            { id: "UK", label: t("Royaume-Uni", "United Kingdom", "Vereinigtes Königreich", "Regno Unito") },
            { id: "US", label: t("États-Unis", "United States", "USA", "Stati Uniti") },
            { id: "other", label: t("Autre pays", "Other country", "Anderes Land", "Altro paese") },
          ],
        },
        {
          id: "currency", type: "single", required: true, label: t("Devise de vos prix", "Currency of your prices", "Währung Ihrer Preise", "Valuta dei vostri prezzi"),
          options: ["CHF", "EUR", "GBP", "USD"].map((c) => ({ id: c, label: c })),
        },
        {
          id: "customer_langs", type: "multi", required: true, label: t("Langues de vos clients", "Your customers' languages", "Sprachen Ihrer Kunden", "Lingue dei vostri clienti"),
          options: [
            { id: "fr", label: t("Français", "French", "Französisch", "Francese") },
            { id: "de", label: t("Allemand", "German", "Deutsch", "Tedesco") },
            { id: "it", label: t("Italien", "Italian", "Italienisch", "Italiano") },
            { id: "en", label: t("Anglais", "English", "Englisch", "Inglese") },
            OTHER,
          ],
        },
        {
          id: "address_form", type: "single", label: t("Comment s'adresser à vos clients ?", "How should we address your customers?", "Wie sollen Ihre Kunden angesprochen werden?", "Come dobbiamo rivolgerci ai vostri clienti?"),
          options: [
            { id: "formal", label: t("Vouvoiement", "Formal", "Sie (formell)", "Con il Lei / voi (formale)") },
            { id: "informal", label: t("Tutoiement", "Informal, first name", "Du (informell)", "Con il tu, per nome") },
          ],
        },
        {
          id: "request_volume", type: "single", label: t("Combien de demandes de devis recevez-vous par mois ?", "How many quote requests do you get per month?", "Wie viele Offertanfragen erhalten Sie pro Monat?", "Quante richieste di preventivo ricevete al mese?"),
          options: [
            { id: "lt20", label: t("Moins de 20", "Fewer than 20", "Weniger als 20", "Meno di 20") },
            { id: "20-50", label: "20–50" },
            { id: "50-150", label: "50–150" },
            { id: "gt150", label: t("Plus de 150", "More than 150", "Mehr als 150", "Più di 150") },
          ],
        },
      ],
    },
    {
      id: "prices",
      title: t("Vos prestations et vos prix", "Your services and prices", "Ihre Leistungen und Preise", "I vostri servizi e prezzi"),
      intro: t("C'est l'étape la plus importante : c'est ce qui rend vos devis Dealz justes.", "This is the most important step: it is what makes your Dealz quotes accurate.", "Das ist der wichtigste Schritt: Er macht Ihre Dealz-Offerten genau.", "È il passo più importante: è ciò che rende precisi i vostri preventivi Dealz."),
      fields: [
        { id: "price_files", type: "file", required: true, label: t("Importez vos prestations et vos prix", "Upload your services and prices", "Laden Sie Ihre Leistungen und Preise hoch", "Caricate i vostri servizi e prezzi"), hint: t("Votre grille de prix, votre liste de prestations ou un ancien devis. Excel de préférence, mais tout format est accepté (PDF, Word, photo…).", "Your price list, your list of services or a past quote. Excel preferred, but any format works (PDF, Word, photo…).", "Ihre Preisliste, Ihre Leistungsliste oder eine frühere Offerte. Am liebsten Excel, aber jedes Format geht (PDF, Word, Foto…).", "Il vostro listino, l'elenco dei vostri servizi o un vecchio preventivo. Excel preferito, ma va bene qualsiasi formato (PDF, Word, foto…).") },
        { id: "minimum", type: "number", required: true, label: t("Prix minimum d'une intervention", "Minimum price for a job", "Mindestpreis pro Auftrag", "Prezzo minimo per un lavoro"), hint: t("En dessous, vous ne vous déplacez pas.", "Below this, you don't take the job.", "Darunter nehmen Sie den Auftrag nicht an.", "Sotto questo importo, non accettate il lavoro.") },
        {
          id: "vat", type: "single", required: true, label: t("Vos prix sont…", "Your prices are…", "Ihre Preise sind…", "I vostri prezzi sono…"),
          options: [
            { id: "incl", label: t("TVA comprise (TTC)", "Tax included", "inkl. MWST", "IVA inclusa") },
            { id: "excl", label: t("Hors TVA (HT)", "Excluding tax", "exkl. MWST", "IVA esclusa") },
            { id: "none", label: t("Non assujetti à la TVA", "Not subject to tax", "Nicht MWST-pflichtig", "Non soggetti a IVA") },
          ],
        },
        { id: "vat_rate", type: "text", label: t("Taux de TVA appliqué", "Tax rate applied", "Angewandter MWST-Satz", "Aliquota IVA applicata"), show: (a) => a.vat === "excl" },
        { id: "accuracy", type: "check", required: true, label: t("J'accepte que les devis Dealz soient fermes si les réponses du client sont exactes, et ajustables si la situation sur place est différente.", "I agree that Dealz quotes are firm if the customer's answers are accurate, and may be adjusted if the situation on site differs.", "Ich bin einverstanden, dass Dealz-Offerten verbindlich sind, wenn die Angaben des Kunden stimmen, und angepasst werden können, wenn die Situation vor Ort abweicht.", "Accetto che i preventivi Dealz siano fissi se le risposte del cliente sono esatte, e possano essere adeguati se la situazione sul posto è diversa.") },
      ],
    },
    {
      id: "zone",
      title: t("Zone et disponibilités", "Area and availability", "Gebiet und Verfügbarkeit", "Zona e disponibilità"),
      fields: [
        { id: "zone_regions", type: "regions", required: true, label: t("Où intervenez-vous ?", "Where do you work?", "Wo sind Sie tätig?", "Dove lavorate?"), hint: t("Cochez autant de régions que nécessaire.", "Tick as many as you need.", "Kreuzen Sie so viele an wie nötig.", "Selezionate tutte le voci necessarie."), show: (a) => hasRegions(a) },
        {
          id: "zone_cities", type: "regions", required: true, source: cityList, show: (a) => chosenStates(a).length > 0,
          label: t("Quelles villes ou régions de ces États ?", "Which cities or areas in these states?", "Welche Städte oder Gebiete in diesen Bundesstaaten?", "Quali città o zone in questi stati?"),
          hint: t("Chaque ville comprend ses environs. Si vous travaillez ailleurs, cochez « Ailleurs en… » et précisez ci-dessous.", "Each city includes its surroundings. If you work elsewhere, tick \"Elsewhere in…\" and tell us below.", "Jede Stadt inklusive Umgebung. Wenn Sie anderswo arbeiten, kreuzen Sie «Anderswo in…» an und präzisieren Sie unten.", "Ogni città comprende i suoi dintorni. Se lavorate altrove, selezionate «Altrove in…» e indicatecelo qui sotto."),
          search: t("Rechercher une ville…", "Search for a city…", "Stadt suchen…", "Cercate una città…"),
        },
        {
          id: "zone", type: "textarea", required: (a) => !hasRegions(a) || (a.country === "US" && (!chosenStates(a).length || usOther(a))), label: t("Précisions sur votre zone", "More about your area", "Details zu Ihrem Gebiet", "Altri dettagli sulla vostra zona"),
          // A US state is far too big for a small business: ask for the real area.
          hint: (a) =>
            ({
              CH: t("Communes, NPA ou rayon en km autour de votre adresse, si vous ne couvrez qu'une partie d'un canton.", "Towns, postcodes (NPA) or a radius in km, if you only cover part of a canton.", "Gemeinden, PLZ oder ein Umkreis in km, falls Sie nur einen Teil eines Kantons abdecken.", "Località, NPA o un raggio in km, se coprite solo una parte di un cantone."),
              FR: t("Communes, codes postaux ou rayon en km autour de votre adresse, si vous ne couvrez qu'une partie d'un département.", "Towns, postcodes or a radius in km, if you only cover part of a département.", "Gemeinden, Postleitzahlen oder ein Umkreis in km, falls Sie nur einen Teil eines Departements abdecken.", "Località, codici postali o un raggio in km, se coprite solo una parte di un dipartimento."),
              UK: t("Villes, codes postaux (ex. « LS, HG ») ou rayon en miles, si vous ne couvrez qu'une partie d'un county.", "Towns, postcode areas (e.g. \"LS, HG\") or a radius in miles, if you only cover part of a county.", "Städte, Postleitzahlbereiche (z. B. «LS, HG») oder ein Umkreis in Meilen, falls Sie nur einen Teil eines Countys abdecken.", "Località, zone postali (ad es. «LS, HG») o un raggio in miglia, se coprite solo una parte di una contea."),
              US: t("Pour « Ailleurs en… » : villes, counties ou codes ZIP couverts, ou un rayon en miles autour de votre ville.", "For \"Elsewhere in…\": towns, counties or ZIP codes you cover, or a radius in miles around your town.", "Für «Anderswo in…»: Städte, Counties oder ZIP-Codes, oder ein Umkreis in Meilen um Ihre Stadt.", "Per «Altrove in…»: località, contee o codici ZIP che coprite, o un raggio in miglia attorno alla vostra località."),
            })[a.country] || t("Pays, villes, codes postaux ou rayon en km autour de votre adresse.", "Country, towns, postcodes or a radius around your address.", "Land, Orte, Postleitzahlen oder ein Umkreis um Ihre Adresse.", "Paese, località, codici postali o un raggio attorno al vostro indirizzo."),
        },
        { id: "free_km", type: "number", label: (a) => (usesMiles(a) ? t("Déplacement gratuit jusqu'à (miles)", "Free travel up to (miles)", "Anfahrt gratis bis (Meilen)", "Trasferta gratuita fino a (miglia)") : t("Déplacement gratuit jusqu'à (km)", "Free travel up to (km)", "Anfahrt gratis bis (km)", "Trasferta gratuita fino a (km)")) },
        {
          id: "travel_fee", type: "text", label: t("Au-delà, combien facturez-vous le déplacement ?", "Beyond that, what do you charge for travel?", "Was verrechnen Sie darüber hinaus für die Anfahrt?", "Oltre, quanto fatturate per la trasferta?"),
          // In the client's own currency and unit: "1 CHF par km", "1 GBP per mile"…
          hint: (a) => {
            const c = currencyOf(a);
            return usesMiles(a)
              ? t(`Exemple : « 1 ${c} par mile » ou « 40 ${c} par intervention ».`, `Example: "1 ${c} per mile" or "40 ${c} per job".`, `Beispiel: «1 ${c} pro Meile» oder «40 ${c} pro Einsatz».`, `Esempio: «1 ${c} al miglio» o «40 ${c} per intervento».`)
              : t(`Exemple : « 1 ${c} par km » ou « 40 ${c} par intervention ».`, `Example: "1 ${c} per km" or "40 ${c} per job".`, `Beispiel: «1 ${c} pro km» oder «40 ${c} pro Einsatz».`, `Esempio: «1 ${c} al km» o «40 ${c} per intervento».`);
          },
        },
        {
          id: "lead_time", type: "single", required: true, label: t("Délai minimum entre la demande et l'intervention", "Minimum notice between request and job", "Mindestvorlauf zwischen Anfrage und Einsatz", "Preavviso minimo tra richiesta e lavoro"),
          options: [
            { id: "24h", label: "24 h" },
            { id: "48h", label: "48 h" },
            { id: "1w", label: t("1 semaine", "1 week", "1 Woche", "1 settimana") },
            OTHER,
          ],
        },
        {
          id: "days", type: "multi", required: true, label: t("Jours de travail", "Working days", "Arbeitstage", "Giorni lavorativi"),
          options: [
            t("Lun", "Mon", "Mo", "Lun"), t("Mar", "Tue", "Di", "Mar"), t("Mer", "Wed", "Mi", "Mer"), t("Jeu", "Thu", "Do", "Gio"),
            t("Ven", "Fri", "Fr", "Ven"), t("Sam", "Sat", "Sa", "Sab"), t("Dim", "Sun", "So", "Dom"),
          ].map((label, i) => ({ id: "d" + (i + 1), label })),
        },
        { id: "hours", type: "text", label: t("Horaires", "Hours", "Arbeitszeiten", "Orari"), hint: t("Exemple : « 7h30–18h ».", "Example: \"7:30am–6pm\".", "Beispiel: «7.30–18 Uhr».", "Esempio: «7.30–18».") },
        { id: "closures", type: "text", label: t("Fermetures prévues", "Planned closures", "Geplante Schliessungen", "Chiusure previste"), hint: t("Vacances, jours fériés…", "Holidays…", "Ferien, Feiertage…", "Vacanze…") },
      ],
    },
    {
      id: "after",
      title: t("Après le devis", "After the quote", "Nach der Offerte", "Dopo il preventivo"),
      fields: [
        {
          id: "confirmation", type: "single", required: true, label: t("Quand un client accepte le devis…", "When a customer accepts the quote…", "Wenn ein Kunde die Offerte annimmt…", "Quando un cliente accetta il preventivo…"),
          // Every plan gets the company calendar feed (src/scale.js), which
          // the client subscribes to once; then bookings sync by themselves.
          hint: t("Dans les deux cas, le rendez-vous s'ajoute tout seul à votre agenda actuel (Google, Outlook ou Apple) : vous l'y reliez une seule fois, avec un lien que nous vous donnons.", "Either way, the appointment goes into your current calendar by itself (Google, Outlook or Apple): you link it once, with a link we give you.", "In beiden Fällen erscheint der Termin von selbst in Ihrem bestehenden Kalender (Google, Outlook oder Apple): Sie verbinden ihn einmal, mit einem Link, den wir Ihnen geben.", "In ogni caso, l'appuntamento entra da solo nella vostra agenda attuale (Google, Outlook o Apple): la collegate una volta, con un link che vi diamo."),
          options: [
            { id: "auto", label: t("La date est bloquée directement", "The date is booked right away", "Der Termin wird direkt gebucht", "La data viene prenotata subito") },
            { id: "call", label: t("Je rappelle le client avant de bloquer la date", "I call the customer before booking the date", "Ich rufe den Kunden an, bevor der Termin gebucht wird", "Chiamo il cliente prima di fissare la data") },
          ],
        },
        {
          id: "calendar", type: "single", label: t("Quel agenda utilisez-vous ?", "Which calendar do you use?", "Welchen Kalender verwenden Sie?", "Quale agenda usate?"), withOther: true,
          hint: t("Pas besoin de chercher de lien : nous vous envoyons celui à ajouter dans cet agenda, avec les étapes.", "No need to look for a link: we send you the one to add to this calendar, with the steps.", "Sie müssen keinen Link suchen: Wir senden Ihnen den Link für diesen Kalender, mit den Schritten.", "Non serve cercare un link: vi inviamo quello da aggiungere a questa agenda, con i passaggi."),
          options: [
            { id: "google", label: "Google Agenda" },
            { id: "outlook", label: "Outlook" },
            { id: "apple", label: t("Calendrier Apple (iPhone)", "Apple Calendar (iPhone)", "Apple Kalender (iPhone)", "Calendario Apple (iPhone)") },
            { id: "none", label: t("Je n'ai pas d'agenda en ligne", "I don't use an online calendar", "Ich nutze keinen Online-Kalender", "Non uso un'agenda online") },
          ],
        },
        {
          id: "deposit", type: "single", label: t("Demandez-vous un acompte ?", "Do you ask for a deposit?", "Verlangen Sie eine Anzahlung?", "Chiedete un acconto?"),
          options: [
            { id: "no", label: t("Non", "No", "Nein", "No") },
            { id: "yes", label: t("Oui", "Yes", "Ja", "Sì") },
          ],
        },
        { id: "deposit_detail", type: "text", label: t("Montant ou pourcentage de l'acompte", "Deposit amount or percentage", "Betrag oder Prozentsatz der Anzahlung", "Importo o percentuale dell'acconto"), show: (a) => a.deposit === "yes" },
        { id: "max_discount", type: "text", label: t("Quand un client refuse, jusqu'à quelle remise pouvez-vous aller ?", "When a customer declines, how much discount can you offer?", "Wenn ein Kunde ablehnt: Wie viel Rabatt können Sie gewähren?", "Quando un cliente rifiuta, quanto sconto potete concedere?"), hint: t("Exemple : « 10 % maximum ».", "Example: \"10% maximum\".", "Beispiel: «maximal 10 %».", "Esempio: «10% al massimo».") , show: (a) => isPlan(a, "CLOSE", "SCALE", "unknown") },
        { id: "never_concede", type: "text", label: t("Ce sur quoi vous ne cédez jamais", "What you never give in on", "Worauf Sie nie verzichten", "Ciò su cui non cedete mai"), show: (a) => isPlan(a, "CLOSE", "SCALE", "unknown") },
        { id: "teams", type: "textarea", label: t("Vos équipes : nom, membres et zones couvertes", "Your teams: name, members and areas covered", "Ihre Teams: Name, Mitglieder und Gebiete", "I vostri team: nome, membri e zone coperte"), show: (a) => isPlan(a, "SCALE") },
        { id: "max_jobs", type: "number", label: t("Nombre maximum d'interventions par personne et par jour", "Maximum jobs per person per day", "Maximale Einsätze pro Person und Tag", "Lavori massimi per persona al giorno"), show: (a) => isPlan(a, "SCALE") },
      ],
    },
    {
      id: "channels",
      title: t("WhatsApp et votre site", "WhatsApp and your website", "WhatsApp und Ihre Website", "WhatsApp e il vostro sito"),
      fields: [
        {
          id: "wa_status", type: "single", required: true, label: t("Votre numéro WhatsApp professionnel", "Your business WhatsApp number", "Ihre geschäftliche WhatsApp-Nummer", "Il vostro numero WhatsApp professionale"),
          options: [
            { id: "business", label: t("Il est déjà sur WhatsApp Business", "It is already on WhatsApp Business", "Sie ist bereits auf WhatsApp Business", "È già su WhatsApp Business") },
            { id: "personal", label: t("Il est sur WhatsApp normal (téléphone perso)", "It is on regular WhatsApp (personal phone)", "Sie ist auf normalem WhatsApp (privates Handy)", "È su WhatsApp normale (telefono personale)") },
            { id: "none", label: t("Je n'ai pas encore WhatsApp", "I'm not on WhatsApp yet", "Ich habe noch kein WhatsApp", "Non sono ancora su WhatsApp") },
            { id: "new", label: t("Je veux un nouveau numéro", "I want a new number", "Ich möchte eine neue Nummer", "Voglio un nuovo numero") },
          ],
        },
        { id: "wa_number", type: "tel", required: true, label: t("Numéro WhatsApp que vos clients doivent écrire", "WhatsApp number your customers should message", "WhatsApp-Nummer, an die Ihre Kunden schreiben sollen", "Numero WhatsApp a cui devono scrivere i vostri clienti"), show: (a) => a.wa_status === "business" || a.wa_status === "personal" },
        {
          id: "integration", type: "single", required: true, label: t("Sur votre site, vous voulez…", "On your website, you want…", "Auf Ihrer Website möchten Sie…", "Sul vostro sito, desiderate…"),
          options: [
            { id: "wa", label: t("Le bouton WhatsApp seul", "The WhatsApp button only", "Nur den WhatsApp-Button", "Solo il pulsante WhatsApp") },
            { id: "wa_widget", label: t("Le bouton WhatsApp + un formulaire de devis sur votre site, pour les clients qui n'ont pas WhatsApp", "The WhatsApp button + a quote form on your website, for customers without WhatsApp", "Den WhatsApp-Button + ein Offertenformular auf Ihrer Website, für Kunden ohne WhatsApp", "Il pulsante WhatsApp + un modulo di preventivo sul vostro sito, per i clienti senza WhatsApp") },
            { id: "nosite", label: t("Je n'ai pas de site", "I don't have a website", "Ich habe keine Website", "Non ho un sito web") },
          ],
        },
        { id: "website", type: "url", required: true, label: t("Adresse de votre site", "Your website address", "Adresse Ihrer Website", "L'indirizzo del vostro sito"), show: (a) => !noSite(a) },
        {
          id: "site_manager", type: "single", label: t("Qui gère votre site ?", "Who manages your website?", "Wer betreut Ihre Website?", "Chi gestisce il vostro sito?"), show: (a) => !noSite(a), withOther: true,
          options: [
            { id: "me", label: t("Moi", "Me", "Ich", "Io") },
            { id: "agency", label: t("Une agence", "An agency", "Eine Agentur", "Un'agenzia") },
            { id: "wix", label: "Wix" },
            { id: "wordpress", label: "WordPress" },
            { id: "shopify", label: "Shopify" },
            { id: "squarespace", label: "Squarespace" },
          ],
        },
        { id: "agency_name", type: "text", required: true, label: t("Nom de l'agence ou de la personne qui gère votre site", "Name of the agency or person managing your website", "Name der Agentur oder Person, die Ihre Website betreut", "Nome dell'agenzia o della persona che gestisce il vostro sito"), hint: t("Nous lui demandons uniquement un accès pour installer le bouton WhatsApp et le formulaire de devis Dealz. C'est sans frais pour vous.", "We only ask them for access to install the Dealz WhatsApp button and quote form. There is no cost to you.", "Wir bitten sie nur um Zugang, um den WhatsApp-Button und das Offertenformular von Dealz einzurichten. Für Sie entstehen keine Kosten.", "Le chiediamo solo l'accesso per installare il pulsante WhatsApp e il modulo di preventivo Dealz. Per voi non c'è nessun costo."), show: (a) => needsAgency(a) },
        { id: "agency_contact", type: "text", required: true, label: t("Son e-mail ou son téléphone", "Their email or phone", "Deren E-Mail oder Telefon", "La sua e-mail o il suo telefono"), show: (a) => needsAgency(a) },
        { id: "procuration", type: "check", label: t("Je donne procuration à Dealz pour contacter cette personne et obtenir l'accès à mon site, uniquement pour y installer Dealz. Une lettre de procuration est générée en PDF.", "I authorise Dealz to contact this person and get access to my website, only to install Dealz. An authorisation letter is generated as a PDF.", "Ich bevollmächtige Dealz, diese Person zu kontaktieren und Zugang zu meiner Website zu erhalten, nur um Dealz zu installieren. Ein Vollmachtsschreiben wird als PDF erstellt.", "Autorizzo Dealz a contattare questa persona e a ottenere l'accesso al mio sito, solo per installare Dealz. Viene generata una lettera di autorizzazione in PDF."), show: (a) => needsAgency(a) },
        { id: "logo_files", type: "file", label: t("Votre logo", "Your logo", "Ihr Logo", "Il vostro logo"), hint: t("PNG ou JPG de préférence.", "PNG or JPG preferred.", "Am liebsten PNG oder JPG.", "PNG o JPG preferibilmente.") },
        { id: "brand_color", type: "color", label: t("La couleur de votre logo", "Your logo's colour", "Die Farbe Ihres Logos", "Il colore del vostro logo"), hint: t("Pour que Dealz respecte votre charte graphique.", "So that Dealz matches your brand.", "Damit Dealz zu Ihrem Erscheinungsbild passt.", "Perché Dealz si accordi con il vostro marchio.") },
        { id: "signature", type: "textarea", label: t("Signature en bas de vos devis", "Signature at the bottom of your quotes", "Signatur unter Ihren Offerten", "Firma in fondo ai vostri preventivi"), hint: t("Nom, adresse, téléphone, site…", "Name, address, phone, website…", "Name, Adresse, Telefon, Website…", "Nome, indirizzo, telefono, sito…") },
      ],
    },
    {
      id: "finish",
      title: t("Pour finir", "To finish", "Zum Schluss", "Per finire"),
      fields: [
        { id: "success", type: "textarea", label: t("Dans un mois, qu'est-ce qui vous ferait dire que Dealz vaut le coup ?", "In a month, what would make you say Dealz was worth it?", "Was müsste in einem Monat passiert sein, damit sich Dealz für Sie gelohnt hat?", "Tra un mese, cosa vi farebbe dire che Dealz ne è valsa la pena?") },
        { id: "availability", type: "textarea", required: true, show: () => !calendlyUrl, label: t("Vos disponibilités pour la réunion de 30 minutes", "Your availability for the 30-minute meeting", "Ihre Verfügbarkeit für das 30-minütige Gespräch", "Le vostre disponibilità per l'incontro di 30 minuti"), hint: t("Exemple : « mardi ou jeudi matin ».", "Example: \"Tuesday or Thursday morning\".", "Beispiel: «Dienstag oder Donnerstag Vormittag».", "Esempio: «martedì o giovedì mattina».") },
        { id: "notes", type: "textarea", label: t("Autre chose à nous dire ?", "Anything else we should know?", "Möchten Sie uns sonst noch etwas sagen?", "Qualcos'altro che dovremmo sapere?") },
      ],
    },
  ];

  // ---- state ----
  let answers = {};
  let stepIndex = -1; // -1 = welcome, STEPS.length = recap
  let sectors = [];
  let calendlyUrl = "";
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (saved && saved.answers) answers = saved.answers;
  } catch (e) {}
  function save() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, at: Date.now() })); } catch (e) {}
  }

  const root = document.getElementById("onboarding");
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  const visible = (f) => !f.show || f.show(answers);
  const labelOf = (f) => (typeof f.label === "function" ? f.label(answers) : f.label);
  const isReq = (f) => (typeof f.required === "function" ? f.required(answers) : !!f.required);

  // Uploaded files stay in memory only (too big for the saved draft) and are
  // sent with the answers, then attached to the Dealz team's e-mail.
  const files = {};
  const MAX_FILE = 3 * 1024 * 1024; // the whole request must stay under Vercel's 4.5 MB
  const FILE_ACCEPT = ".xlsx,.xls,.xlsm,.csv,.ods,.numbers,.pdf,.doc,.docx,.odt,.pages,.txt,.rtf,.png,.jpg,.jpeg,.heic,.webp";
  function optionsOf(f) {
    let opts = f.optionsFrom === "sectors" ? sectors : f.options || [];
    if (f.withOther && !opts.some((o) => o.other)) opts = opts.concat([OTHER]);
    return opts;
  }
  function isEmpty(v) {
    return v == null || v === "" || v === false || (Array.isArray(v) && v.length === 0);
  }
  function needsOther(f) {
    const v = answers[f.id];
    return Array.isArray(v) ? v.includes("other") : v === "other";
  }

  // Human-readable answer, in the given language (FR for the Dealz team).
  function display(f, lang) {
    const v = answers[f.id];
    const pick = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang] || o.fr);
    if (f.type === "check") return v ? pick(t("Oui", "Yes", "Ja", "Sì")) : "";
    if (f.type === "file") return (files[f.id] || []).map((x) => x.name).join(", ");
    if (f.type === "regions") {
      const list = regionList(f);
      return (Array.isArray(v) ? v : []).map((id) => { const r = list.find((x) => x.id === id); return r ? pick(r.label) : id; }).join(", ");
    }
    if (f.type === "single" || f.type === "multi" || f.type === "select") {
      const ids = Array.isArray(v) ? v : v ? [v] : [];
      const opts = optionsOf(f);
      return ids
        .map((id) => {
          if (id === "other") return pick(OTHER.label) + (answers[f.id + "_other"] ? " : " + answers[f.id + "_other"] : "");
          const o = opts.find((x) => x.id === id);
          return o ? pick(o.label) : id;
        })
        .join(", ");
    }
    return v == null ? "" : String(v);
  }

  // ---- rendering ----
  function header() {
    const head = el("div", "onb-head");
    const total = STEPS.length;
    const i = Math.min(stepIndex + 1, total);
    const label = stepIndex >= STEPS.length ? L(UI.recapTitle) : L(UI.step).replace("{i}", i).replace("{n}", total) + " · " + L(STEPS[stepIndex].title);
    head.appendChild(el("div", "onb-progress-label", label));
    const bar = el("div", "onb-progress");
    const fill = el("div", "onb-progress-fill");
    fill.style.width = Math.round((stepIndex >= STEPS.length ? 1 : stepIndex / total) * 100) + "%";
    bar.appendChild(fill);
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(total));
    bar.setAttribute("aria-valuenow", String(Math.min(stepIndex, total)));
    head.appendChild(bar);
    return head;
  }

  function fieldLabel(f) {
    const lab = el("label", "onb-label");
    lab.textContent = L(labelOf(f));
    if (isReq(f)) lab.appendChild(el("span", "onb-req", " *"));
    return lab;
  }

  function renderField(f) {
    const wrap = el("div", "onb-field");
    wrap.dataset.field = f.id;
    const inputId = "onb-" + f.id;

    if (f.type === "check") {
      const lab = el("label", "onb-check");
      const box = el("input");
      box.type = "checkbox";
      box.checked = !!answers[f.id];
      box.addEventListener("change", () => { answers[f.id] = box.checked; save(); });
      lab.appendChild(box);
      const span = el("span", null, L(labelOf(f)));
      if (isReq(f)) span.appendChild(el("span", "onb-req", " *"));
      lab.appendChild(span);
      wrap.appendChild(lab);
      return wrap;
    }

    const lab = fieldLabel(f);
    lab.htmlFor = inputId;
    wrap.appendChild(lab);
    if (f.hint) wrap.appendChild(el("div", "onb-hint", L(typeof f.hint === "function" ? f.hint(answers) : f.hint)));

    if (f.type === "single" || f.type === "multi") {
      const chips = el("div", "dop-chips onb-chips");
      chips.setAttribute("role", f.type === "single" ? "radiogroup" : "group");
      const otherInput = el("input", "dcf-input onb-other");
      otherInput.placeholder = L(UI.other);
      otherInput.value = answers[f.id + "_other"] || "";
      otherInput.addEventListener("input", () => { answers[f.id + "_other"] = otherInput.value; save(); });
      const sync = () => {
        const v = answers[f.id];
        chips.querySelectorAll("button").forEach((b) => {
          const on = Array.isArray(v) ? v.includes(b.dataset.id) : v === b.dataset.id;
          b.classList.toggle("selected", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        otherInput.style.display = needsOther(f) ? "" : "none";
      };
      optionsOf(f).forEach((o) => {
        const b = el("button", "dop-chip", L(o.label));
        b.type = "button";
        b.dataset.id = o.id;
        b.addEventListener("click", () => {
          if (f.type === "single") {
            if (f.id === "country" && answers.country !== o.id) answers.zone_regions = answers.zone_cities = [];
            answers[f.id] = o.id;
          } else {
            let v = Array.isArray(answers[f.id]) ? answers[f.id].slice() : [];
            if (v.includes(o.id)) v = v.filter((x) => x !== o.id);
            else if (o.exclusive) v = [o.id];
            else v = v.filter((x) => !optionsOf(f).some((p) => p.exclusive && p.id === x)).concat(o.id);
            answers[f.id] = v;
          }
          save();
          sync();
          refreshConditional();
          if (needsOther(f) && o.other) otherInput.focus();
        });
        chips.appendChild(b);
      });
      wrap.appendChild(chips);
      wrap.appendChild(otherInput);
      sync();
      return wrap;
    }

    if (f.type === "file") {
      const list = files[f.id] || (files[f.id] = []);
      const box = el("div", "onb-file");
      const input = el("input");
      input.type = "file";
      input.id = inputId;
      input.multiple = true;
      input.accept = FILE_ACCEPT;
      input.className = "onb-file-input";
      const pick = el("label", "onb-file-btn", "📎 " + L(list.length ? UI.addFile : UI.pickFile));
      pick.htmlFor = inputId;
      const names = el("ul", "onb-file-list");
      list.forEach((file, i) => {
        const li = el("li", "onb-file-name", file.name + " · " + Math.max(1, Math.round(file.size / 1024)) + " Ko ");
        const remove = el("button", "onb-back", L(UI.removeFile));
        remove.type = "button";
        remove.addEventListener("click", () => { list.splice(i, 1); render(); });
        li.appendChild(remove);
        names.appendChild(li);
      });
      const err = el("div", "onb-file-err");
      input.addEventListener("change", () => {
        const picked = Array.from(input.files || []);
        input.value = "";
        err.textContent = "";
        let total = Object.keys(files).reduce((n, k) => n + files[k].reduce((m, x) => m + x.size, 0), 0);
        const ok = [];
        for (const file of picked) {
          if (total + file.size > MAX_FILE) { err.textContent = L(file.size > MAX_FILE ? UI.tooBig : UI.tooBigTotal); continue; }
          total += file.size;
          ok.push(file);
        }
        if (!ok.length) return;
        let pending = ok.length;
        ok.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            list.push({ name: file.name, type: file.type || "application/octet-stream", size: file.size, data: String(reader.result).split(",")[1] || "" });
            if (--pending === 0) render();
          };
          reader.readAsDataURL(file);
        });
      });
      box.appendChild(input);
      box.appendChild(pick);
      wrap.appendChild(names);
      wrap.appendChild(box);
      wrap.appendChild(err);
            return wrap;
    }

    // Cantons / départements / counties / states: a searchable list with
    // multiple choice, for the country picked on the second step.
    if (f.type === "regions") {
      const list = regionList(f);
      const kind = L(REGION_NAME[answers.country] || t("région", "region", "Region", "regione"));
      const chosen = () => (Array.isArray(answers[f.id]) ? answers[f.id] : []);
      const search = el("input", "dcf-input onb-region-search");
      search.type = "search";
      search.id = inputId;
      search.placeholder = f.search ? L(f.search) : L(t("Rechercher un {k}…", "Search for a {k}…", "{k} suchen…", "Cercare per {k}…")).replace("{k}", kind);
      const tools = el("div", "onb-region-tools");
      const count = el("span", "onb-region-count");
      const all = el("button", "onb-back", L(t("Tout cocher", "Select all", "Alle auswählen", "Selezionare tutto")));
      const none = el("button", "onb-back", L(t("Tout décocher", "Clear", "Alle abwählen", "Cancellare")));
      all.type = none.type = "button";
      tools.appendChild(count);
      tools.appendChild(all);
      tools.appendChild(none);
      const box = el("div", "onb-region-list");
      const rows = list.map((r) => {
        const row = el("label", "onb-region");
        const cb = el("input");
        cb.type = "checkbox";
        cb.value = r.id;
        row.appendChild(cb);
        row.appendChild(el("span", null, L(r.label)));
        box.appendChild(row);
        cb.addEventListener("change", () => {
          const v = chosen().filter((x) => x !== r.id);
          if (cb.checked) v.push(r.id);
          answers[f.id] = v;
          save();
          sync();
          regionsChanged(f);
        });
        return { row, cb, text: L(r.label).toLowerCase() };
      });
      const picked = el("div", "onb-hint onb-region-picked");
      const sync = () => {
        const v = chosen();
        rows.forEach((x) => { x.cb.checked = v.includes(x.cb.value); x.row.classList.toggle("selected", x.cb.checked); });
        count.textContent = L(t("{n} sélectionné(s)", "{n} selected", "{n} ausgewählt", "{n} selezionati")).replace("{n}", v.length);
        picked.textContent = v.length ? display(f, LANG) : "";
      };
      const norm = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      search.addEventListener("input", () => {
        const q = norm(search.value.trim());
        rows.forEach((x) => { x.row.style.display = !q || norm(x.text).includes(q) ? "" : "none"; });
      });
      all.addEventListener("click", () => { answers[f.id] = list.map((r) => r.id); save(); sync(); regionsChanged(f); });
      none.addEventListener("click", () => { answers[f.id] = []; save(); sync(); regionsChanged(f); });
      wrap.appendChild(search);
      wrap.appendChild(tools);
      wrap.appendChild(box);
      wrap.appendChild(picked);
      sync();
      return wrap;
    }

    // A long list (sectors): a dropdown instead of chips.
    if (f.type === "select") {
      const sel = el("select", "dcf-input onb-select");
      sel.id = inputId;
      const ph = el("option", null, L(t("Choisissez…", "Choose…", "Bitte wählen…", "Scegliere…")));
      ph.value = "";
      sel.appendChild(ph);
      optionsOf(f).forEach((o) => {
        const opt = el("option", null, L(o.label));
        opt.value = o.id;
        sel.appendChild(opt);
      });
      sel.value = answers[f.id] || "";
      const otherInput = el("input", "dcf-input onb-other");
      otherInput.placeholder = L(UI.other);
      otherInput.value = answers[f.id + "_other"] || "";
      otherInput.addEventListener("input", () => { answers[f.id + "_other"] = otherInput.value; save(); });
      const sync = () => { otherInput.style.display = needsOther(f) ? "" : "none"; };
      sel.addEventListener("change", () => { answers[f.id] = sel.value; save(); sync(); if (needsOther(f)) otherInput.focus(); });
      wrap.appendChild(sel);
      wrap.appendChild(otherInput);
      sync();
      return wrap;
    }

    let input;
    if (f.type === "textarea") {
      input = el("textarea", "dcf-input onb-textarea");
      input.rows = f.rows || 3;
    } else {
      input = el("input", "dcf-input");
      input.type = f.type === "number" ? "number" : f.type === "color" ? "color" : f.type;
      if (f.type === "number") { input.min = "0"; input.step = "any"; input.inputMode = "decimal"; }
      if (f.type === "url") input.placeholder = "https://";
      if (f.type === "email") input.autocomplete = "email";
      if (f.type === "tel") input.autocomplete = "tel";
      if (f.type === "color") input.className = "onb-color";
    }
    input.id = inputId;
    if (f.type === "color") input.value = answers[f.id] || "#0b5fff";
    else input.value = answers[f.id] || "";
    input.addEventListener("input", () => { answers[f.id] = input.value; save(); });
    if (f.type === "color" && !answers[f.id]) answers[f.id] = "";
    wrap.appendChild(input);
    return wrap;
  }

  let currentFields = null;
  // The US city list depends on the states picked, and whether the zone
  // details are required depends on both: rebuild those two in place.
  function regionsChanged(f) {
    if (!currentFields || (f.id !== "zone_regions" && f.id !== "zone_cities")) return;
    if (f.id === "zone_regions" && Array.isArray(answers.zone_cities)) {
      const states = chosenStates(answers);
      answers.zone_cities = answers.zone_cities.filter((x) => states.includes(x.split(":")[0]));
      save();
    }
    const ids = f.id === "zone_regions" ? ["zone_cities", "zone"] : ["zone"];
    ids.forEach((id) => {
      const node = currentFields.querySelector(`[data-field="${id}"]`);
      const field = STEPS[stepIndex].fields.find((x) => x.id === id);
      if (node && field) node.replaceWith(renderField(field));
    });
    refreshConditional();
  }
  function refreshConditional() {
    if (!currentFields) return;
    STEPS[stepIndex].fields.forEach((f) => {
      const node = currentFields.querySelector(`[data-field="${f.id}"]`);
      if (node) node.style.display = visible(f) ? "" : "none";
    });
  }

  function navButtons(onNext, nextLabel) {
    const nav = el("div", "onb-nav");
    if (stepIndex >= 0) {
      const back = el("button", "onb-back", "← " + L(UI.back));
      back.type = "button";
      back.addEventListener("click", () => go(stepIndex - 1));
      nav.appendChild(back);
    }
    const next = el("button", "dcf-submit onb-next", nextLabel + " →");
    next.type = "button";
    next.addEventListener("click", onNext);
    nav.appendChild(next);
    return nav;
  }

  function msgBox() {
    const m = el("p", "dlg-msg");
    m.setAttribute("aria-live", "polite");
    return m;
  }
  function showMsg(m, text, isError) {
    m.textContent = text;
    m.className = "dlg-msg show" + (isError ? " err" : " ok");
  }

  function validate(step) {
    for (const f of step.fields) {
      if (!visible(f)) continue;
      const v = f.type === "file" ? files[f.id] : answers[f.id];
      if (isReq(f) && (isEmpty(v) || (needsOther(f) && !String(answers[f.id + "_other"] || "").trim()))) return { field: f.id, msg: L(UI.required) };
      if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())) return { field: f.id, msg: L(UI.badEmail) };
    }
    return null;
  }

  function go(i) {
    stepIndex = Math.max(-1, Math.min(i, STEPS.length));
    render();
    const top = root.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }

  function renderWelcome(body) {
    body.appendChild(el("h2", "onb-title", L(t("Préparons votre Dealz", "Let's prepare your Dealz", "Bereiten wir Ihr Dealz vor", "Prepariamo il vostro Dealz"))));
    body.appendChild(el("p", "onb-intro", L(t(
      "7 étapes courtes, environ 10 minutes. Avec vos réponses, notre réunion d'intégration tient en 30 minutes et votre Dealz est prêt plus vite.",
      "7 short steps, about 10 minutes. With your answers, our onboarding meeting takes only 30 minutes and your Dealz is ready sooner.",
      "7 kurze Schritte, etwa 10 Minuten. Mit Ihren Antworten dauert unser Einführungsgespräch nur 30 Minuten und Ihr Dealz ist schneller bereit.", "7 brevi passi, circa 10 minuti. Con le vostre risposte, il nostro incontro di messa in servizio dura solo 30 minuti e il vostro Dealz è pronto prima."
    ))));
    const req = el("p", "onb-intro onb-req-note");
    req.appendChild(el("span", "onb-req", "* "));
    req.appendChild(document.createTextNode(L(t(
      "Les champs marqués d'un astérisque rouge sont obligatoires. Tous les autres sont facultatifs : si vous n'êtes pas sûr, laissez vide, on en parlera en réunion.",
      "Fields marked with a red asterisk are required. All the others are optional: if you're not sure, leave them blank and we'll cover them in the meeting.",
      "Mit einem roten Sternchen markierte Felder sind Pflichtfelder. Alle anderen sind freiwillig: Wenn Sie unsicher sind, lassen Sie sie leer, wir besprechen es im Gespräch.", "I campi contrassegnati da un asterisco rosso sono obbligatori. Tutti gli altri sono facoltativi: se non siete sicuri, lasciateli vuoti e ne parleremo durante l'incontro."
    ))));
    body.appendChild(req);
    // What to have open before starting, so the client doesn't stop halfway.
    body.appendChild(el("h3", "onb-subtitle", L(t("À préparer avant de commencer", "Have these ready before you start", "Bitte vorab bereithalten", "Tenete a portata di mano prima di iniziare"))));
    const prep = el("ul", "onb-list");
    [
      t("Votre grille de prix ou un ancien devis (Excel de préférence, mais PDF ou photo vont aussi) : vous l'importerez tel quel.", "Your price list or a past quote (Excel preferred, PDF or a photo work too): you'll upload it as it is.", "Ihre Preisliste oder eine frühere Offerte (am liebsten Excel, PDF oder Foto gehen auch): Sie laden sie einfach hoch.", "Il vostro listino o un vecchio preventivo (Excel preferito, vanno bene anche PDF o una foto): lo caricherete così com'è."),
      t("Votre logo, en fichier image (celui de votre site ou de vos devis).", "Your logo, as an image file (the one on your website or quotes).", "Ihr Logo als Bilddatei (wie auf Ihrer Website oder Ihren Offerten).", "Il vostro logo, come file immagine (quello del vostro sito o dei vostri preventivi)."),
      t("Le numéro WhatsApp que vos clients utilisent pour vous écrire.", "The WhatsApp number your customers use to message you.", "Die WhatsApp-Nummer, über die Ihre Kunden Ihnen schreiben.", "Il numero WhatsApp che usano i vostri clienti per scrivervi."),
      t("L'adresse de votre site, et le nom et l'e-mail de la personne ou de l'agence qui le gère.", "Your website address, and the name and email of the person or agency who manages it.", "Die Adresse Ihrer Website sowie Name und E-Mail der Person oder Agentur, die sie betreut.", "L'indirizzo del vostro sito, e il nome e l'e-mail della persona o dell'agenzia che lo gestisce."),
    ].forEach((x) => prep.appendChild(el("li", null, L(x))));
    body.appendChild(prep);
    body.appendChild(el("p", "onb-intro", L(t(
      "Rien d'autre à ouvrir : pour votre agenda, nous vous envoyons nous-mêmes le lien à ajouter, avec les étapes.",
      "Nothing else to open: for your calendar, we send you the link to add, with the steps.",
      "Sonst nichts zu öffnen: Für Ihren Kalender senden wir Ihnen den Link zum Hinzufügen, mit den Schritten.", "Nient'altro da aprire: per la vostra agenda, vi inviamo il link da aggiungere, con i passaggi."
    ))));
    body.appendChild(el("h3", "onb-subtitle", L(t("Bon à savoir", "Good to know", "Gut zu wissen", "Buono a sapersi"))));
    const list = el("ul", "onb-list");
    [
      t("Vos fichiers ne sont pas gardés si vous rechargez la page : importez-les juste avant d'envoyer.", "Files are not kept if you reload the page: upload them just before sending.", "Dateien bleiben beim Neuladen der Seite nicht erhalten: Laden Sie sie kurz vor dem Senden hoch.", "I file non vengono conservati se ricaricate la pagina: caricateli appena prima dell'invio."),
      t("Vos réponses sont enregistrées sur cet appareil : vous pouvez reprendre plus tard.", "Your answers are saved on this device: you can come back later.", "Ihre Antworten werden auf diesem Gerät gespeichert: Sie können später weitermachen.", "Le vostre risposte sono salvate su questo dispositivo: potete tornare più tardi."),
    ].forEach((x) => list.appendChild(el("li", null, L(x))));
    body.appendChild(list);
    body.appendChild(navButtons(() => go(0), L(UI.start)));
  }

  function renderStep(body) {
    const step = STEPS[stepIndex];
    body.appendChild(el("h2", "onb-title", L(step.title)));
    if (step.intro) body.appendChild(el("p", "onb-intro", L(step.intro)));
    const fields = el("div", "onb-fields");
    step.fields.forEach((f) => fields.appendChild(renderField(f)));
    currentFields = fields;
    body.appendChild(fields);
    refreshConditional();
    const m = msgBox();
    body.appendChild(navButtons(() => {
      const err = validate(step);
      if (err) {
        showMsg(m, err.msg, true);
        const node = fields.querySelector(`[data-field="${err.field}"]`);
        if (node) {
          node.classList.add("onb-invalid");
          node.scrollIntoView({ block: "center", behavior: "smooth" });
          const inp = node.querySelector("input, textarea, select, button");
          if (inp) inp.focus({ preventScroll: true });
        }
        return;
      }
      go(stepIndex + 1);
    }, L(UI.next)));
    body.appendChild(m);
  }

  function summary(lang) {
    return STEPS.map((s) => ({
      title: s.title[lang] || s.title.fr,
      rows: s.fields.filter(visible).map((f) => [labelOf(f)[lang] || labelOf(f).fr, display(f, lang)]),
    }));
  }

  function renderRecap(body) {
    body.appendChild(el("h2", "onb-title", L(UI.recapTitle)));
    body.appendChild(el("p", "onb-intro", L(UI.recapIntro)));
    STEPS.forEach((s, i) => {
      const sec = el("div", "onb-recap-section");
      const h = el("div", "onb-recap-head");
      h.appendChild(el("span", null, L(s.title)));
      const edit = el("button", "onb-back", L(UI.edit));
      edit.type = "button";
      edit.addEventListener("click", () => go(i));
      h.appendChild(edit);
      sec.appendChild(h);
      const dl = el("dl", "onb-recap");
      s.fields.filter(visible).forEach((f) => {
        dl.appendChild(el("dt", null, L(labelOf(f))));
        dl.appendChild(el("dd", null, display(f, LANG) || UI.empty));
      });
      sec.appendChild(dl);
      body.appendChild(sec);
    });
    const m = msgBox();
    const nav = navButtons(async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (validate(STEPS[i])) return go(i);
      }
      const btn = nav.querySelector(".onb-next");
      btn.disabled = true;
      btn.textContent = L(UI.sending);
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: SESSION, lang: LANG, answers, files: Object.keys(files).flatMap((k) => files[k].map((x) => ({ field: k, ...x }))), summary: summary(LANG === "it" ? "it" : "fr"), clientSummary: summary(LANG) }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        renderDone();
      } catch (err) {
        btn.disabled = false;
        btn.textContent = L(UI.send) + " →";
        showMsg(m, L(UI.error), true);
      }
    }, L(UI.send));
    body.appendChild(nav);
    body.appendChild(m);
  }

  function renderDone() {
    root.innerHTML = "";
    const card = el("div", "referral-card onb-card");
    const body = el("div", "onb-body onb-done");
    body.appendChild(el("div", "onb-done-icon", "✓"));
    body.appendChild(el("h2", "onb-title", L(UI.doneTitle)));
    body.appendChild(el("p", "onb-intro", L(calendlyUrl ? UI.doneTextBook : UI.doneText)));
    card.appendChild(body);
    root.appendChild(card);
    if (calendlyUrl) renderCalendly(card);
  }

  // The 30-minute meeting, booked straight into the Dealz calendar.
  function renderCalendly(card) {
    const url = new URL(calendlyUrl);
    if (answers.contact_name) url.searchParams.set("name", answers.contact_name);
    if (answers.contact_email) url.searchParams.set("email", answers.contact_email);
    url.searchParams.set("hide_gdpr_banner", "1");
    const box = el("div", "calendly-inline-widget onb-calendly");
    box.dataset.url = url.toString();
    card.appendChild(box);
    const script = el("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }

  function render() {
    root.innerHTML = "";
    currentFields = null;
    const card = el("div", "referral-card onb-card");
    if (stepIndex >= 0) card.appendChild(header());
    const body = el("div", "onb-body");
    if (stepIndex < 0) renderWelcome(body);
    else if (stepIndex < STEPS.length) renderStep(body);
    else renderRecap(body);
    card.appendChild(body);
    root.appendChild(card);
  }

  // Clear the red outline as soon as the client edits that field.
  root.addEventListener("input", (e) => { const f = e.target.closest(".onb-invalid"); if (f) f.classList.remove("onb-invalid"); });
  root.addEventListener("click", (e) => { const f = e.target.closest(".onb-invalid"); if (f && e.target.closest("button.dop-chip")) f.classList.remove("onb-invalid"); });

  // ---- start: sectors + what Stripe already knows ----
  async function init() {
    render();
    try {
      const res = await fetch("/api/onboarding/prefill?lang=" + LANG + (SESSION ? "&s=" + encodeURIComponent(SESSION) : ""));
      if (res.ok) {
        const data = await res.json();
        sectors = (data.sectors || []).map((s) => ({ id: s.slug, label: s.label }));
        calendlyUrl = data.calendly || "";
        const known = data.prefill || {};
        Object.keys(known).forEach((k) => {
          if (isEmpty(answers[k]) && !isEmpty(known[k])) answers[k] = known[k];
        });
        save();
        render();
      }
    } catch (e) {}
  }
  init();
})();
