interface WeightSource {
  weight?: unknown;
  selectedWeight?: unknown;
  selectedSize?: unknown;
  defaultWeight?: unknown;
}

const KG_UNITS = ['kg', 'kgs', 'kilogram', 'kilograms', 'kilo'];
const G_UNITS = ['g', 'gm', 'gms', 'gram', 'grams'];

function toUnitMultiplier(unit: string): number {
  const normalized = unit.trim().toLowerCase();
  if (KG_UNITS.includes(normalized)) return 1;
  if (G_UNITS.includes(normalized)) return 1 / 1000;
  return 0;
}

export function pickWeightLabel(source: WeightSource): string {
  return String(
    source.weight || source.selectedWeight || source.selectedSize || source.defaultWeight || ''
  ).trim();
}

export function parseWeightToKg(weightInput: unknown): number {
  const raw = String(weightInput || '').trim().toLowerCase();
  if (!raw) return 0;

  const normalized = raw.replace(/\s+/g, ' ');

  const fractionMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|kilo|g|gm|gms|gram|grams)\b/
  );
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    const multiplier = toUnitMultiplier(fractionMatch[3]);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0 && multiplier > 0) {
      return (numerator / denominator) * multiplier;
    }
  }

  const decimalMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|kilo|g|gm|gms|gram|grams)\b/
  );
  if (decimalMatch) {
    const value = Number(decimalMatch[1]);
    const multiplier = toUnitMultiplier(decimalMatch[2]);
    if (Number.isFinite(value) && value > 0 && multiplier > 0) {
      return value * multiplier;
    }
  }

  if (/\bhalf\b/.test(normalized) && /(kg|kgs|kilogram|kilograms|kilo)\b/.test(normalized)) {
    return 0.5;
  }

  if (/\bquarter\b/.test(normalized) && /(kg|kgs|kilogram|kilograms|kilo)\b/.test(normalized)) {
    return 0.25;
  }

  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric > 10 ? numeric / 1000 : numeric;
  }

  return 0;
}

export function calculateTotalWeightKg(items: Array<WeightSource & { quantity?: unknown }>, fallbackKg: number = 0.5): number {
  const totalWeight = (items || []).reduce((sum, item) => {
    const lineWeightLabel = pickWeightLabel(item);
    const lineWeightKg = parseWeightToKg(lineWeightLabel);
    const quantity = Math.max(1, Number(item?.quantity || 1));
    return sum + lineWeightKg * quantity;
  }, 0);

  return totalWeight > 0 ? totalWeight : fallbackKg;
}
