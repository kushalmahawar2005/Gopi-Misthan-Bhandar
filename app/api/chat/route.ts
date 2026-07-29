import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Category from '@/models/Category';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Storefront chatbot backend.
 *
 * Hybrid design (free-first):
 *   1. Button intents (categories / bestsellers / delivery / contact / track) are
 *      answered purely from MongoDB — zero AI cost, always available.
 *   2. Free-text ("ask") is matched locally (intent + keyword + price parsing). If a
 *      GEMINI_API_KEY is configured it is upgraded to a natural-language reply,
 *      otherwise it gracefully falls back to the local matcher.
 *
 * Language: every canned reply is bilingual. detectLang() picks Hinglish vs English
 * from the customer's text; button actions reuse the last detected language (sent by
 * the widget as payload.lang). Gemini, when enabled, mirrors the user's language too.
 */

type Lang = 'en' | 'hi';

interface ChatProduct {
  name: string;
  slug?: string;
  price: number;
  image?: string;
  fromPrice: number;
  category?: string;
}

interface ChatReply {
  reply: string;
  products?: ChatProduct[];
  suggestions?: { label: string; action: string }[];
  source: 'rules' | 'ai';
  lang?: Lang;
}

const SHOP_NAME = 'Gopi Misthan Bhandar';
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 9425922445';

/** Pick the right language string. */
const t = (lang: Lang, hi: string, en: string) => (lang === 'en' ? en : hi);

const DEFAULT_SUGGESTIONS = [
  { label: '🍬 Browse Sweets', action: 'categories' },
  { label: '⭐ Bestsellers', action: 'bestsellers' },
  { label: '📦 Track Order', action: 'track:init' },
  { label: '🚚 Delivery Info', action: 'delivery' },
];

// ---- Language detection ----------------------------------------------------

const DEVANAGARI = /[ऀ-ॿ]/;
// Distinctive Hinglish words (ambiguous English-colliding words like "me/rate/ka"
// are intentionally excluded so plain English isn't misread as Hinglish).
const HINGLISH_MARKERS =
  /\b(kya|hai|hain|kitne|kitna|daam|kahan|kaha|mujhe|chahiye|dikhao|dikha|batao|bata|kaise|kaun|kaunsa|konsa|nahi|haan|accha|acha|theek|mera|meri|aap|aapka|aapke|namaste|namaskar|wala|wali|kab|milega|khulta|hoga|krdo|karo|bhej|chalega)\b/i;

function detectLang(text: string): Lang {
  if (!text) return 'hi';
  if (DEVANAGARI.test(text)) return 'hi';
  if (HINGLISH_MARKERS.test(text)) return 'hi';
  return 'en';
}

// ---- Static FAQ (bilingual) ------------------------------------------------

const FAQ: { test: RegExp; hi: string; en: string }[] = [
  {
    test: /\b(cod|cash on delivery|payment|pay|upi|card|netbanking|razorpay|online pay)\b/i,
    hi: '💳 Online payment (UPI, cards, netbanking via Razorpay) accept karte hain. Cash on Delivery select areas mein available hai — checkout par pincode daalne se pata chal jaayega.',
    en: '💳 We accept online payment (UPI, cards, netbanking via Razorpay). Cash on Delivery is available in select areas — enter your pincode at checkout to check.',
  },
  {
    test: /\b(refund|return|cancel|cancellation|wapas|paisa wapas|replace)\b/i,
    hi: '↩️ Dispatch hone se pehle order cancel/refund ho sakta hai. Sweets perishable hain isliye dispatch ke baad return nahi hota. Damage ya galat item aaye to turant contact karein — replace/refund kar denge.',
    en: '↩️ Orders can be cancelled/refunded before dispatch. As sweets are perishable, returns are not accepted after dispatch. If an item arrives damaged or wrong, contact us right away — we\'ll replace/refund it.',
  },
  {
    test: /\b(offer|discount|coupon|code|sale|deal)\b/i,
    hi: '🎉 Coupon codes time-time par chalte hain. Checkout par "Coupon" box mein code daalein. Bulk/wedding orders ke liye special pricing — Bulk Enquiry karein.',
    en: '🎉 We run coupon codes from time to time. Enter a code in the "Coupon" box at checkout. For bulk/wedding orders we offer special pricing — use Bulk Enquiry.',
  },
  {
    test: /\b(open|timing|hours|kab khulta|kitne baje|kab tak)\b/i,
    hi: '🕙 Hum Monday–Saturday, 10:00 AM se 9:00 PM tak khule rehte hain. Online order 24x7 le sakte hain!',
    en: '🕙 We\'re open Monday–Saturday, 10:00 AM to 9:00 PM. Online orders are accepted 24x7!',
  },
  {
    test: /\b(bulk|wedding|shaadi|corporate|hamper|wholesale|gifting|festival)\b/i,
    hi: '🎁 Bulk, wedding aur corporate gifting hum karte hain! Left side ke "Bulk Enquiry" button se requirement bhejein — 24 ghante mein team contact karegi.',
    en: '🎁 We do bulk, wedding and corporate gifting! Send your requirement via the "Bulk Enquiry" button on the left — our team will reach out within 24 hours.',
  },
  {
    test: /\b(fresh|shelf life|expiry|kitne din|kharab|store kaise|kaise rakh)\b/i,
    hi: '🌿 Sweets handcrafted aur fresh hoti hain — typically 15–60 din shelf life (product page par exact). Thandi, dry jagah par rakhein.',
    en: '🌿 Our sweets are handcrafted and fresh — typically 15–60 days shelf life (exact value on each product page). Store in a cool, dry place.',
  },
  {
    test: /\b(veg|non.?veg|egg|jain|pure)\b/i,
    hi: '✅ Hamari saari mithai 100% vegetarian hai. Jain options ke liye humein call karein.',
    en: '✅ All our sweets are 100% vegetarian. For Jain options, please call us.',
  },
];

// ---- Product helpers -------------------------------------------------------

function lowestPrice(p: { price: number; sizes?: { price: number }[] }): number {
  const prices = [p.price, ...(p.sizes?.map((s) => s.price) ?? [])].filter(
    (n) => typeof n === 'number' && n > 0
  );
  return prices.length ? Math.min(...prices) : p.price;
}

function toChatProduct(p: any): ChatProduct {
  return {
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.image,
    category: p.category,
    fromPrice: lowestPrice(p),
  };
}

/** Pull a "under ₹X" style budget out of free text. */
function parseMaxPrice(text: string): number | null {
  const m = text
    .toLowerCase()
    .match(/(?:under|below|less than|upto|up to|<|₹|rs\.?)\s*([0-9]{2,5})/);
  if (m) return parseInt(m[1], 10);
  return null;
}

// Filler / question words that should not be treated as product keywords.
const STOPWORDS = new Set([
  'show', 'me', 'some', 'any', 'sweet', 'sweets', 'mithai', 'the', 'and', 'or',
  'for', 'please', 'dikhao', 'dikha', 'chahiye', 'batao', 'bata', 'kya', 'hai',
  'rate', 'price', 'daam', 'cost', 'kitne', 'kitna', 'mrp', 'want', 'need',
  'best', 'good', 'aur', 'mujhe', 'have', 'you', 'your', 'what', 'whats',
  'about', 'list', 'all', 'available', 'order', 'buy', 'get',
]);

/** Break free text into meaningful product keywords (≥3 chars, no stopwords). */
function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/(?:under|below|less than|upto|up to|<|₹|rs\.?)\s*[0-9]{2,5}/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

const PRODUCT_FIELDS = 'name slug description price image category subcategory sizes';

/** Compare slugs/names ignoring case, spaces and punctuation ("dry-fruit" == "Dry Fruit"). */
function normalizeKey(value: string): string {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * If the query IS a category (chip taps send the raw slug, e.g. "dry-fruit"),
 * return every slug that should be considered part of it. Returning null means
 * "not a category" and the caller falls back to keyword search.
 */
async function resolveCategorySlugs(rawText: string): Promise<string[] | null> {
  const key = normalizeKey(rawText);
  if (!key) return null;

  const categories = await Category.find({}).select('name slug subCategories').lean();

  for (const category of categories as any[]) {
    const subs = Array.isArray(category.subCategories) ? category.subCategories : [];

    if (normalizeKey(category.slug || '') === key || normalizeKey(category.name || '') === key) {
      return [category.slug, ...subs.map((s: any) => s.slug)].filter(Boolean);
    }

    for (const sub of subs) {
      if (normalizeKey(sub.slug || '') === key || normalizeKey(sub.name || '') === key) {
        return [sub.slug].filter(Boolean);
      }
    }
  }

  return null;
}

async function searchProducts(rawText: string): Promise<ChatProduct[]> {
  const maxPrice = parseMaxPrice(rawText);
  const limit = maxPrice ? 40 : 8;
  const base: any = { isActive: { $ne: false } };

  // 1. Exact category match wins. A category chip must return ONLY products
  //    actually filed under it — never products that merely mention the word
  //    somewhere in their description ("...fried in dry spices" is not a dry fruit).
  const categorySlugs = await resolveCategorySlugs(rawText);
  if (categorySlugs?.length) {
    const products = await Product.find({
      ...base,
      $or: [{ category: { $in: categorySlugs } }, { subcategory: { $in: categorySlugs } }],
    })
      .select(PRODUCT_FIELDS)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return applyBudget(products.map(toChatProduct), maxPrice);
  }

  const tokens = extractTokens(rawText);
  if (!tokens.length) {
    const products = await Product.find(base)
      .select(PRODUCT_FIELDS)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return applyBudget(products.map(toChatProduct), maxPrice);
  }

  // 2. Keyword match on name/category/subcategory — the high-confidence signal.
  const strong = await Product.find({
    ...base,
    $or: tokens.flatMap((tok) => [
      { name: { $regex: tok, $options: 'i' } },
      { category: { $regex: tok, $options: 'i' } },
      { subcategory: { $regex: tok, $options: 'i' } },
    ]),
  })
    .select(PRODUCT_FIELDS)
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  const strongResults = applyBudget(strong.map(toChatProduct), maxPrice);
  if (strongResults.length) return strongResults;

  // 3. Only when nothing matched by name/category do we search descriptions,
  //    so vague queries still get an answer without polluting precise ones.
  const loose = await Product.find({
    ...base,
    $or: tokens.map((tok) => ({ description: { $regex: tok, $options: 'i' } })),
  })
    .select(PRODUCT_FIELDS)
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return applyBudget(loose.map(toChatProduct), maxPrice);
}

function applyBudget(products: ChatProduct[], maxPrice: number | null): ChatProduct[] {
  const filtered = maxPrice ? products.filter((p) => p.fromPrice <= maxPrice) : products;
  return filtered.slice(0, 6);
}

/** Optional Gemini upgrade for free-text. Returns null if unavailable/unconfigured. */
async function tryGeminiReply(
  userText: string,
  products: ChatProduct[]
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const menuContext = products.length
    ? products.map((p) => `- ${p.name}: from ₹${p.fromPrice}`).join('\n')
    : 'No exact matches found in the catalogue for this query.';

  const shopFacts = `Shop facts (use when relevant):
- ${SHOP_NAME} — Tilak Marg, Neemuch (M.P.), serving since 1968. Phone: ${SUPPORT_PHONE}.
- 100% vegetarian Indian sweets, namkeen & gift hampers. Pan-India delivery.
- Payments: UPI, cards, netbanking (Razorpay); COD in select pincodes.
- Store hours: Mon–Sat, 10am–9pm. Online orders 24x7.
- Shelf life 15–60 days depending on product. Bulk/wedding/corporate gifting available.
- Order tracking: customer needs order number + registered phone.`;

  const systemPrompt = `You are the friendly ordering assistant for ${SHOP_NAME}, an Indian sweets (mithai) shop. CRITICAL: reply in the SAME language the customer used — if they wrote in English reply in English, if they wrote in Hindi/Hinglish reply in Hinglish (Roman script). Be concise (2-3 sentences) and warm. Only talk about sweets, orders, delivery, payment and the shop — politely decline unrelated topics. Never invent products or prices; use only the catalogue + shop facts below.\n\n${shopFacts}\n\nCatalogue context for this query:\n${menuContext}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userText }] }],
          generationConfig: { maxOutputTokens: 250, temperature: 0.4 },
        }),
        // Keep the bot responsive even if Gemini is slow.
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || null;
  } catch {
    // Free tier exhausted / network error / timeout → silent fallback to rules.
    return null;
  }
}

async function handleAction(
  action: string,
  payload: Record<string, string>,
  lang: Lang
): Promise<ChatReply> {
  const backBtn = {
    label: t(lang, '↩️ Wapas menu', '↩️ Back to menu'),
    action: 'welcome',
  };

  switch (action) {
    case 'welcome':
      return {
        reply: t(
          lang,
          `Namaste! 🙏 Main ${SHOP_NAME} ka assistant hoon. Kaise madad karun?`,
          `Hello! 🙏 I'm the ${SHOP_NAME} assistant. How can I help you?`
        ),
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };

    case 'categories': {
      const cats = await Category.find({}).select('name slug').limit(8).lean();
      return {
        reply: cats.length
          ? t(lang, 'Hamari categories — kaunsi dekhni hai? 👇', 'Here are our categories — which one? 👇')
          : t(lang, 'Abhi categories load nahi ho payi. "Bestsellers" try karein.', "Couldn't load categories right now. Try \"Bestsellers\"."),
        suggestions: [
          ...cats.map((c: any) => ({
            label: c.name,
            action: `search:${c.slug || c.name}`,
          })),
          { label: '⭐ Bestsellers', action: 'bestsellers' },
        ],
        source: 'rules',
      };
    }

    case 'bestsellers': {
      const products = await Product.find({
        isActive: { $ne: false },
        featured: true,
      })
        .select('name slug description price image category sizes')
        .limit(6)
        .lean();
      const list = products.length
        ? products
        : await Product.find({ isActive: { $ne: false } })
            .select('name slug price image category sizes')
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();
      return {
        reply: t(lang, 'Ye rahe hamare sabse popular sweets ⭐', 'Here are our most popular sweets ⭐'),
        products: list.map(toChatProduct),
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    case 'delivery':
      return {
        reply: t(
          lang,
          '🚚 Hum pure India mein deliver karte hain. Sweets 60 din tak fresh rehti hain. Order confirm hone ke baad tracking link mil jaayega. Pincode-wise delivery time checkout par dikhta hai.',
          "🚚 We deliver across India. Our sweets stay fresh up to 60 days. You'll get a tracking link once your order is confirmed. Pincode-wise delivery time shows at checkout."
        ),
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };

    case 'contact':
      return {
        reply: t(
          lang,
          `📞 Humse baat karein: ${SUPPORT_PHONE}\n🏬 Tilak Marg, Neemuch (M.P.) — 1968 se.`,
          `📞 Talk to us: ${SUPPORT_PHONE}\n🏬 Tilak Marg, Neemuch (M.P.) — since 1968.`
        ),
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };

    case 'track:init':
      return {
        reply: t(
          lang,
          'Apna order number aur registered phone number bhejein (jaise: ORDER123, 9876543210) — main status bata deta hoon. 📦',
          "Please send your order number and registered phone (e.g. ORDER123, 9876543210) — I'll check the status. 📦"
        ),
        suggestions: [backBtn],
        source: 'rules',
      };

    case 'track': {
      const orderNumber = (payload.orderNumber || '').trim();
      const phone = (payload.phone || '').replace(/\D/g, '').trim();
      if (!orderNumber || phone.length < 6) {
        return {
          reply: t(
            lang,
            'Order number aur phone dono chahiye. Jaise: ORDER123, 9876543210',
            'I need both order number and phone. e.g. ORDER123, 9876543210'
          ),
          suggestions: [backBtn],
          source: 'rules',
        };
      }
      const order = await Order.findOne({
        orderNumber,
        $or: [
          { 'shipping.phone': { $regex: phone.slice(-10) } },
          { 'billing.phone': { $regex: phone.slice(-10) } },
        ],
      })
        .select('orderNumber status total items awbNumber trackingUrl courierName createdAt')
        .lean();

      if (!order) {
        return {
          reply: t(
            lang,
            'Is order number + phone se koi order nahi mila. Dobara check karein, ya humse contact karein.',
            'No order found for that number + phone. Please re-check, or contact us.'
          ),
          suggestions: [
            { label: '📞 Contact', action: 'contact' },
            { label: t(lang, '↩️ Menu', '↩️ Menu'), action: 'welcome' },
          ],
          source: 'rules',
        };
      }

      const o = order as any;
      const statusLabels: Record<Lang, Record<string, string>> = {
        hi: {
          pending: 'Pending ⏳',
          confirmed: 'Confirmed ✅',
          processing: 'Taiyaar ho raha hai 👨‍🍳',
          shipped: 'Ship ho gaya 📦',
          in_transit: 'Raaste mein 🚚',
          out_for_delivery: 'Aaj delivery ke liye nikla 🛵',
          delivered: 'Deliver ho gaya 🎉',
          cancelled: 'Cancel ho gaya ❌',
          failed: 'Fail ho gaya ⚠️',
          expired: 'Expire ho gaya (payment nahi hua) ⌛',
        },
        en: {
          pending: 'Pending ⏳',
          confirmed: 'Confirmed ✅',
          processing: 'Being prepared 👨‍🍳',
          shipped: 'Shipped 📦',
          in_transit: 'In transit 🚚',
          out_for_delivery: 'Out for delivery 🛵',
          delivered: 'Delivered 🎉',
          cancelled: 'Cancelled ❌',
          failed: 'Failed ⚠️',
          expired: 'Expired (payment not completed) ⌛',
        },
      };
      const tracking = o.trackingUrl
        ? `\n🔗 Track: ${o.trackingUrl}`
        : o.awbNumber
        ? `\n📮 AWB: ${o.awbNumber} (${o.courierName || 'courier'})`
        : '';
      return {
        reply: `Order ${o.orderNumber}\nStatus: ${
          statusLabels[lang][o.status] || o.status
        }\nItems: ${o.items?.length || 0} • Total: ₹${o.total}${tracking}`,
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    case 'search': {
      const q = payload.query || '';
      const products = await searchProducts(q);
      return {
        reply: products.length
          ? t(lang, `"${q}" ke liye ye mile 👇`, `Here's what I found for "${q}" 👇`)
          : t(lang, `"${q}" ke liye kuch nahi mila. Categories ya bestsellers dekhein?`, `Nothing found for "${q}". Try categories or bestsellers?`),
        products,
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    case 'ask': {
      const text = (payload.text || '').trim();
      if (!text) {
        return handleAction('welcome', {}, lang);
      }
      const lower = text.toLowerCase();

      // 1. Greetings / thanks → friendly menu.
      if (/^(hi+|hello|hey+|namaste|namaskar|hlo|yo|hii+|good (morning|evening|afternoon))\b/i.test(lower)) {
        return handleAction('welcome', {}, lang);
      }
      if (/\b(thanks|thank you|dhanyavad|shukriya|ok|great|nice)\b/i.test(lower)) {
        return {
          reply: t(lang, 'Khushi hui madad karke! 😊 Aur kuch poochna ho to bataiye 👇', 'Happy to help! 😊 Ask me anything else 👇'),
          suggestions: DEFAULT_SUGGESTIONS,
          source: 'rules',
        };
      }

      // 2a. Auto-detect an "<order-id> <phone>" pair anywhere in the text and look
      //     it up directly — works even if the customer never clicked "Track Order".
      const phoneMatch = text.match(/(?:\+?91[\s-]?)?([6-9]\d{9})(?!\d)/);
      if (phoneMatch) {
        const phone = phoneMatch[1];
        const orderToken =
          text
            .replace(phoneMatch[0], ' ')
            .split(/[\s,]+/)
            .map((s) => s.replace(/[^a-z0-9-]/gi, '').trim())
            .filter((s) => s.length >= 4 && /\d/.test(s)) // order ids contain a number
            .find(Boolean) || '';
        if (orderToken) {
          return handleAction('track', { orderNumber: orderToken, phone }, lang);
        }
      }

      // 2b. Route to existing rich handlers by intent keywords.
      if (/\b(deliver|delivery|shipping|ship|kab milega|kitne din|pincode|charge)\b/i.test(lower)) {
        return handleAction('delivery', {}, lang);
      }
      if (/\b(track|order status|order update|order detail|last order|previous order|my order|mera order|order kahan|order kaha|where.*order|status of.*order)\b/i.test(lower)) {
        return handleAction('track:init', {}, lang);
      }
      if (/\b(contact|phone number|call you|baat|address|location|kahan ho|shop address|store address)\b/i.test(lower)) {
        return handleAction('contact', {}, lang);
      }

      // 3. Static FAQ (payment, refund, offers, timing, bulk, freshness, veg).
      for (const f of FAQ) {
        if (f.test.test(lower)) {
          return { reply: t(lang, f.hi, f.en), suggestions: DEFAULT_SUGGESTIONS, source: 'rules' };
        }
      }

      // 4. Product / price questions.
      const products = await searchProducts(text);

      // If AI is configured, let it phrase the answer naturally (mirrors language).
      const aiReply = await tryGeminiReply(text, products);
      if (aiReply) {
        return {
          reply: aiReply,
          products: products.slice(0, 4),
          suggestions: DEFAULT_SUGGESTIONS,
          source: 'ai',
        };
      }

      if (products.length) {
        const isPrice = /\b(rate|price|daam|cost|kitne|kitna|mrp|₹|rs)\b/i.test(lower);
        const priceList = products
          .slice(0, 5)
          .map((p) => `• ${p.name} — From ₹${p.fromPrice}`)
          .join('\n');
        const reply = isPrice
          ? t(
              lang,
              `💰 Rate ye rahe:\n${priceList}\n(Alag weight ke alag daam — card par tap karke dekhein.)`,
              `💰 Here are the prices:\n${priceList}\n(Different weights have different prices — tap a card to see.)`
            )
          : t(lang, 'Aapke liye ye mile 👇', "Here's what I found for you 👇");
        return { reply, products, suggestions: DEFAULT_SUGGESTIONS, source: 'rules' };
      }

      // 5. Nothing matched — guide the customer.
      return {
        reply: t(
          lang,
          'Hmm, ispe main sure nahi 🤔 Par in cheezon mein madad kar sakta hoon — sweets dhoondhna, rate, order tracking, delivery, payment & contact. Niche se chunein ya product ka naam likhein 👇',
          "Hmm, I'm not sure about that 🤔 But I can help with — finding sweets, prices, order tracking, delivery, payment & contact. Pick below or type a product name 👇"
        ),
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    default:
      return handleAction('welcome', {}, lang);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || 'welcome');
  const payload = (body.payload || {}) as Record<string, string>;

  // Detect language from the user's text; fall back to the language the widget
  // remembers from earlier in the conversation (sent as payload.lang).
  const freeText = payload.text || payload.query || '';
  const lang: Lang = freeText
    ? detectLang(freeText)
    : payload.lang === 'en'
    ? 'en'
    : 'hi';

  // Abuse / cost guard: 20 messages per IP per minute.
  const limit = checkRateLimit({
    request,
    keyPrefix: 'chat',
    maxRequests: 20,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        reply: t(
          lang,
          'Thoda dheere 🙂 ek minute baad dobara koshish karein.',
          'Slow down a moment 🙂 please try again in a minute.'
        ),
        source: 'rules',
        lang,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    await connectDB();
    const result = await handleAction(action, payload, lang);
    result.lang = lang;
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        reply: t(
          lang,
          'Sorry, abhi thodi dikkat aa rahi hai. Thodi der baad try karein ya WhatsApp par message karein.',
          'Sorry, something went wrong. Please try again shortly or message us on WhatsApp.'
        ),
        source: 'rules',
        lang,
      },
      { status: 200 } // graceful: bot never shows a hard error to the customer
    );
  }
}
