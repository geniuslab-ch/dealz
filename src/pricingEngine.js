const defaultPricing = require("../docs/pricing.json");

const ADDON_LABELS = {
  fr: {
    oven: "Nettoyage du four",
    windows: "Nettoyage des vitres",
    fridge: "Nettoyage du frigo",
    carpet_shampoo: "Shampoing moquette",
    hood: "Nettoyage de la hotte",
    stovetop: "Nettoyage des plaques de cuisson",
    microwave: "Nettoyage du micro-ondes",
    dishwasher: "Nettoyage du lave-vaisselle",
    freezer: "Nettoyage du congélateur",
    sofa: "Nettoyage du canapé",
    armchair: "Nettoyage du fauteuil",
    mattress: "Nettoyage du matelas",
    curtains: "Nettoyage des rideaux",
  },
  en: {
    oven: "Oven cleaning",
    windows: "Window cleaning",
    fridge: "Fridge cleaning",
    carpet_shampoo: "Carpet shampooing",
    hood: "Extractor hood cleaning",
    stovetop: "Stovetop cleaning",
    microwave: "Microwave cleaning",
    dishwasher: "Dishwasher cleaning",
    freezer: "Freezer cleaning",
    sofa: "Sofa cleaning",
    armchair: "Armchair cleaning",
    mattress: "Mattress cleaning",
    curtains: "Curtain cleaning",
  },
  de: {
    oven: "Backofenreinigung",
    windows: "Fensterreinigung",
    fridge: "Kühlschrankreinigung",
    carpet_shampoo: "Teppich-Shampoonierung",
    hood: "Reinigung der Dunstabzugshaube",
    stovetop: "Reinigung des Kochfelds",
    microwave: "Reinigung der Mikrowelle",
    dishwasher: "Reinigung des Geschirrspülers",
    freezer: "Reinigung des Gefrierschranks",
    sofa: "Reinigung des Sofas",
    armchair: "Reinigung des Sessels",
    mattress: "Reinigung der Matratze",
    curtains: "Reinigung der Vorhänge",
  },
};

// item.label is a pure display string — never matched or looked up again
// anywhere downstream (confirmed: the counteroffer "revise" flow round-trips
// whatever label a quote already has through its own checkboxes, it never
// compares against a hardcoded French list) — safe to generate directly in
// the customer's own language, unlike the chat engine's question text.
function L(lang) {
  return ADDON_LABELS[lang] || ADDON_LABELS.fr;
}

function round(n) {
  return Math.round(n * 20) / 20; // nearest 0.05, keeps CHF-style pricing
}

/**
 * Deterministic price calculation. Claude never does the math itself —
 * it only gathers structured inputs and calls this function via a tool.
 * `pricing` defaults to the single demo company's grid (docs/pricing.json)
 * so every existing caller (the website chat) is unaffected; a multi-tenant
 * caller (the WhatsApp channel) passes each company's own grid instead —
 * same shape, different numbers (see src/companies.js). `lang` ("fr"/"en"/
 * "de", default "fr") only affects item.label text — the numbers are
 * identical regardless of language.
 */
function calculateQuote(input, pricing = defaultPricing, lang = "fr") {
  const items = [];
  const warnings = [];
  const addonLabel = L(lang);

  if (input.service_type === "end_of_tenancy") {
    const key = String(input.rooms || "");
    const base = pricing.end_of_tenancy_by_rooms[key];
    if (base === undefined) {
      warnings.push(
        lang === "en"
          ? `No exact rate for "${input.rooms}" rooms — nearest tier used.`
          : lang === "de"
          ? `Kein exakter Tarif für "${input.rooms}" Zimmer — nächstgelegene Stufe verwendet.`
          : `Aucun tarif exact pour "${input.rooms}" pièces — palier le plus proche utilisé.`
      );
      const keys = Object.keys(pricing.end_of_tenancy_by_rooms).map(Number);
      const target = parseFloat(input.rooms) || keys[0];
      const closest = keys.reduce((a, b) =>
        Math.abs(b - target) < Math.abs(a - target) ? b : a
      );
      items.push({
        label:
          lang === "en"
            ? `End-of-tenancy cleaning (${closest}-room apartment)`
            : lang === "de"
            ? `Endreinigung (Wohnung mit ${closest} Zimmern)`
            : `Nettoyage de fin de bail (appartement ${closest} pièces)`,
        amount: pricing.end_of_tenancy_by_rooms[String(closest)],
      });
    } else {
      items.push({
        label:
          lang === "en"
            ? `End-of-tenancy cleaning (${key}-room apartment)`
            : lang === "de"
            ? `Endreinigung (Wohnung mit ${key} Zimmern)`
            : `Nettoyage de fin de bail (appartement ${key} pièces)`,
        amount: base,
      });
    }
  } else if (input.service_type === "regular_cleaning") {
    const hours = Number(input.hours) || 0;
    items.push({
      label:
        lang === "en"
          ? `Regular cleaning (${hours}h at CHF ${pricing.regular_cleaning_per_hour}/h)`
          : lang === "de"
          ? `Regelmässige Reinigung (${hours} Std. zu CHF ${pricing.regular_cleaning_per_hour}/Std.)`
          : `Nettoyage régulier (${hours}h à CHF ${pricing.regular_cleaning_per_hour}/h)`,
      amount: round(hours * pricing.regular_cleaning_per_hour),
    });
  } else {
    warnings.push(
      lang === "en"
        ? `Unknown service type: "${input.service_type}".`
        : lang === "de"
        ? `Unbekannter Leistungstyp: "${input.service_type}".`
        : `Type de prestation inconnu : "${input.service_type}".`
    );
  }

  const addons = Array.isArray(input.addons) ? input.addons : [];
  for (const addon of addons) {
    if (addon === "carpet_shampoo") {
      const rooms = Number(input.carpet_rooms) || 1;
      const roomsSuffix =
        lang === "en" ? `${rooms} room${rooms > 1 ? "s" : ""}` : lang === "de" ? `${rooms} Zimmer` : `${rooms} pièce${rooms > 1 ? "s" : ""}`;
      items.push({
        label: `${addonLabel.carpet_shampoo} (${roomsSuffix})`,
        amount: round(rooms * pricing.addons.carpet_shampoo_per_room),
      });
    } else if (pricing.addons[addon] !== undefined) {
      items.push({
        label: addonLabel[addon] || addon,
        amount: pricing.addons[addon],
      });
    } else {
      warnings.push(
        lang === "en"
          ? `Unknown option "${addon}" — ignored.`
          : lang === "de"
          ? `Unbekannte Option "${addon}" — ignoriert.`
          : `Option inconnue "${addon}" — ignorée.`
      );
    }
  }

  const distanceKm = Number(input.distance_km) || 0;
  if (distanceKm > pricing.travel_fee.free_within_km) {
    const tier = pricing.travel_fee.tiers.find((t) => distanceKm <= t.max_km);
    if (tier) {
      items.push({
        label: lang === "en" ? "Travel fee" : lang === "de" ? "Anfahrtskosten" : "Frais de déplacement",
        amount: tier.fee,
      });
    }
  }

  const conditionFee = pricing.condition_surcharge[input.condition];
  if (conditionFee) {
    const conditionLabel =
      input.condition === "very_dirty"
        ? lang === "en"
          ? "Heavy-dirt surcharge"
          : lang === "de"
          ? "Zuschlag für starke Verschmutzung"
          : "Supplément saleté importante"
        : lang === "en"
        ? "Deep-cleaning surcharge"
        : lang === "de"
        ? "Zuschlag für Tiefenreinigung"
        : "Supplément nettoyage en profondeur";
    items.push({ label: conditionLabel, amount: conditionFee });
  } else if (input.condition && pricing.condition_surcharge[input.condition] === undefined) {
    warnings.push(
      lang === "en"
        ? `Unknown condition "${input.condition}" — ignored.`
        : lang === "de"
        ? `Unbekannter Zustand "${input.condition}" — ignoriert.`
        : `État inconnu "${input.condition}" — ignoré.`
    );
  }

  if (input.difficult_access_windows && addons.includes("windows")) {
    items.push({
      label:
        lang === "en"
          ? "Hard-to-access windows surcharge (bay windows, height…)"
          : lang === "de"
          ? "Zuschlag für schwer zugängliche Fenster (Fensterfronten, Höhe usw.)"
          : "Supplément vitres difficiles d'accès (baies vitrées, hauteur…)",
      amount: pricing.difficult_access_windows_fee,
    });
  }

  const floorsNoElevator = Number(input.floors_no_elevator) || 0;
  if (floorsNoElevator > 0) {
    items.push({
      label:
        lang === "en"
          ? `No-lift floors surcharge (${floorsNoElevator})`
          : lang === "de"
          ? `Zuschlag für Stockwerke ohne Lift (${floorsNoElevator})`
          : `Supplément étages sans ascenseur (${floorsNoElevator})`,
      amount: round(floorsNoElevator * pricing.floor_fee_per_floor_no_elevator),
    });
  }

  let total = round(items.reduce((sum, i) => sum + i.amount, 0));
  if (total > 0 && total < pricing.minimum_price) {
    items.push({
      label:
        lang === "en"
          ? "Adjustment to minimum order"
          : lang === "de"
          ? "Anpassung an den Mindestbestellwert"
          : "Ajustement au minimum de commande",
      amount: round(pricing.minimum_price - total),
    });
    total = pricing.minimum_price;
  }

  return { currency: pricing.currency, items, total, warnings };
}

module.exports = { calculateQuote };
