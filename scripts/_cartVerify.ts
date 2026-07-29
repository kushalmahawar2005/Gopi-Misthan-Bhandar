/** Throwaway verification of the cart fixes. Uses a synthetic userId. */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { resolve } from 'path';

process.env.NEXTAUTH_SECRET='REPLACE_THIS_WITH_A_NEW_PROD_SECRET';
dotenv.config({ path: resolve(process.cwd(), '.env') });

const BASE = 'http://localhost:3111';
const FAKE_USER = '0000000000000000000000ce';

const token = jwt.sign(
  { userId: FAKE_USER, email: 'cart-verify@example.invalid', role: 'user' },
  process.env.NEXTAUTH_SECRET as string,
  { algorithm: 'HS256', expiresIn: '7d', issuer: 'gopi-misthan-bhandar', audience: 'gopi-misthan-bhandar-auth', subject: FAKE_USER }
);
const H = { 'Content-Type': 'application/json', Cookie: `auth_token=${token}` };

const get = async () => (await (await fetch(`${BASE}/api/cart`, { headers: H })).json()).data || [];
const post = async (b: unknown) => (await fetch(`${BASE}/api/cart`, { method: 'POST', headers: H, body: JSON.stringify(b) })).json();
const show = (i: any[]) => i.map((x: any) => `${x.name}(${x.selectedWeight})x${x.quantity}`).join(', ') || '(empty)';

(async () => {
  await fetch(`${BASE}/api/cart`, { method: 'DELETE', headers: H });

  console.log('\n=== TEST 1: fresh-browser login must NOT wipe the saved cart ===');
  await post({ items: [
    { id: 'p1', name: 'Badam Chikki', price: 330, image: '/a.jpg', quantity: 2, selectedWeight: '250 gm' },
    { id: 'p2', name: 'Kaju Katli', price: 500, image: '/b.jpg', quantity: 1, selectedWeight: '250 gm' },
  ]});
  console.log('  saved on phone :', show(await get()));
  await post({ items: [], action: 'sync' });          // fresh browser: empty local
  const after = await get();
  console.log('  after login    :', show(after));
  console.log(after.length === 2 ? '  PASS - cart survived' : '  FAIL - cart lost');

  console.log('\n=== TEST 2: merge still works when the browser HAS items ===');
  await post({ items: [
    { id: 'p1', name: 'Badam Chikki', price: 330, image: '/a.jpg', quantity: 5, selectedWeight: '250 gm' },
    { id: 'p3', name: 'Soan Papdi', price: 135, image: '/c.jpg', quantity: 1, selectedWeight: '250 gm' },
  ], action: 'sync' });
  const merged = await get();
  console.log('  merged         :', show(merged));
  const badam = merged.find((i: any) => i.id === 'p1');
  console.log(merged.length === 3 && badam.quantity === 5 ? '  PASS - union kept, larger qty won' : '  FAIL');

  console.log('\n=== TEST 3: /api/cart/validate returns live prices ===');
  const prods = (await (await fetch(`${BASE}/api/products?limit=5`)).json()).data || [];
  const real = prods.find((p: any) => (p.sizes || []).length >= 2);
  const w = real.sizes[1].weight;
  const r = await fetch(`${BASE}/api/cart/validate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: real._id, weight: w }, { id: '0000000000000000000000ff', weight: '250 gm' }] }),
  });
  const v = (await r.json()).data;
  console.log(`  ${real.name} @ ${w}:`, JSON.stringify(v[0]));
  console.log(`  expected live price = ₹${real.sizes[1].price}`);
  console.log(v[0].price === real.sizes[1].price ? '  PASS - live price returned' : '  FAIL - wrong price');
  console.log('  deleted product line ->', JSON.stringify(v[1]), v[1].available === false ? ' PASS' : ' FAIL');

  await fetch(`${BASE}/api/cart`, { method: 'DELETE', headers: H });
  console.log('\n  (probe cart deleted)\n');
})();
