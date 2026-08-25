const pricing = require("../docs/pricing.json");

const ADDON_LABELS = {
  oven: "Nettoyage du four",
  windows: "Nettoyage des vitres",
  fridge: "Nettoyage du frigo",
  carpet_shampoo: "Shampoing moquette",
};

function round(n) {
  return Math.round(n * 20) / 20; // nearest 0.05, keeps CHF-style pricing
}

/**
 * Deterministic price calculation. Claude never does the math itself —
 * it only gathers structured inputs and calls this function via a tool.
 */
function calculateQuote(input) {
  const items = [];
  const warnings = [];

  if (input.service_type === "end_of_tenancy") {
    const key = String(input.rooms || "");
    const base = pricing.end_of_tenancy_by_rooms[key];
    if (base === undefined) {
      warnings.push(
        `Aucun tarif exact pour "${input.rooms}" pièces — palier le plus proche utilisé.`
      );
      const keys = Object.keys(pricing.end_of_tenancy_by_rooms).map(Number);
      const target = parseFloat(input.rooms) || keys[0];
      const closest = keys.reduce((a, b) =>
        Math.abs(b - target) < Math.abs(a - target) ? b : a
      );
      items.push({
        label: `Nettoyage de fin de bail (appartement ${closest} pièces)`,
        amount: pricing.end_of_tenancy_by_rooms[String(closest)],
      });
    } else {
      items.push({
        label: `Nettoyage de fin de bail (appartement ${key} pièces)`,
        amount: base,
      });
    }
  } else if (input.service_type === "regular_cleaning") {
    const hours = Number(input.hours) || 0;
    items.push({
      label: `Nettoyage régulier (${hours}h à CHF ${pricing.regular_cleaning_per_hour}/h)`,
      amount: round(hours * pricing.regular_cleaning_per_hour),
    });
  } else {
    warnings.push(`Type de prestation inconnu : "${input.service_type}".`);
  }

  const addons = Array.isArray(input.addons) ? input.addons : [];
  for (const addon of addons) {
    if (addon === "carpet_shampoo") {
      const rooms = Number(input.carpet_rooms) || 1;
      items.push({
        label: `${ADDON_LABELS.carpet_shampoo} (${rooms} pièce${rooms > 1 ? "s" : ""})`,
        amount: round(rooms * pricing.addons.carpet_shampoo_per_room),
      });
    } else if (pricing.addons[addon] !== undefined) {
      items.push({
        label: ADDON_LABELS[addon] || addon,
        amount: pricing.addons[addon],
      });
    } else {
      warnings.push(`Option inconnue "${addon}" — ignorée.`);
    }
  }

  const distanceKm = Number(input.distance_km) || 0;
  if (distanceKm > pricing.travel_fee.free_within_km) {
    const tier = pricing.travel_fee.tiers.find((t) => distanceKm <= t.max_km);
    if (tier) {
      items.push({ label: "Frais de déplacement", amount: tier.fee });
    }
  }

  let total = round(items.reduce((sum, i) => sum + i.amount, 0));
  if (total > 0 && total < pricing.minimum_price) {
    items.push({
      label: "Ajustement au minimum de commande",
      amount: round(pricing.minimum_price - total),
    });
    total = pricing.minimum_price;
  }

  return { currency: pricing.currency, items, total, warnings };
}

module.exports = { calculateQuote };
