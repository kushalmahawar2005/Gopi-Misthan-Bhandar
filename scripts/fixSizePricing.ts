/**
 * Fix inverted size pricing.
 *
 * Affected products have their `sizes[].price` values in REVERSE order relative
 * to their weights, so the biggest pack ends up cheapest (e.g. Neemuch Sev
 * 250g=Rs.200, 500g=Rs.100, 1kg=Rs.50). The fix sorts sizes by weight ascending
 * and reassigns the SAME price values in ascending order, so no new prices are
 * invented - they are just put back on the right rows.
 *
 * Dry run:  npx tsx scripts/fixSizePricing.ts
 * Apply:    APPLY=1 npx tsx scripts/fixSizePricing.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

const APPLY = process.env.APPLY === '1';
const MONGODB_URI = process.env.MONGODB_URI || '';

function toGrams(weight: string): number | null {
  const match = String(weight).match(/([\d.]+)\s*(kg|gm|g)?/i);
  if (!match) return null;
  let value = parseFloat(match[1]);
  if (/kg/i.test(match[2] || '')) value *= 1000;
  return Number.isFinite(value) ? value : null;
}

async function fixSizePricing() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
  await mongoose.connect(MONGODB_URI);

  const products = mongoose.connection.collection('products');
  const candidates = await products.find({ 'sizes.1': { $exists: true } }).toArray();

  const changes: Array<{
    id: unknown;
    name: string;
    before: string;
    after: string;
    sizes: Record<string, unknown>[];
  }> = [];

  for (const product of candidates) {
    const sizes = (product.sizes || [])
      .map((size: any) => ({ ...size, grams: toGrams(size.weight), value: Number(size.price) }))
      .filter((size: any) => size.grams != null && Number.isFinite(size.value));

    if (sizes.length < 2) continue;

    const byWeight = [...sizes].sort((a, b) => a.grams - b.grams);
    const isBroken = byWeight.some((size, i) => i > 0 && size.value <= byWeight[i - 1].value);
    if (!isBroken) continue;

    const ascendingPrices = byWeight.map((size) => size.value).sort((a, b) => a - b);
    const fixed = byWeight.map((size, i) => ({ ...size, newPrice: ascendingPrices[i] }));

    const newSizes = fixed.map((size) => {
      const { grams, value, newPrice, ...rest } = size;
      return { ...rest, price: newPrice };
    });

    changes.push({
      id: product._id,
      name: product.name,
      before: byWeight.map((s) => `${s.weight}=Rs.${s.value}`).join('  '),
      after: fixed.map((s) => `${s.weight}=Rs.${s.newPrice}`).join('  '),
      sizes: newSizes,
    });
  }

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN'} - ${changes.length} products to fix\n`);
  for (const change of changes) {
    console.log(`  ${change.name}`);
    console.log(`     before: ${change.before}`);
    console.log(`     after : ${change.after}`);
    console.log(`     base price -> Rs.${change.sizes[0].price}\n`);
  }

  if (APPLY) {
    for (const change of changes) {
      await products.updateOne(
        { _id: change.id as never },
        { $set: { sizes: change.sizes, price: change.sizes[0].price } }
      );
    }
    console.log(`Updated ${changes.length} products.`);
  } else {
    console.log('No writes performed. Re-run with APPLY=1 to write.');
  }

  await mongoose.disconnect();
}

fixSizePricing().catch((error) => {
  console.error(error);
  process.exit(1);
});
