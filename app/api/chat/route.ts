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
 *   2. Free-text ("ask") is first matched locally (keyword + price parsing). If a
 *      GEMINI_API_KEY is configured it is upgraded to a natural-language reply,
 *      otherwise it gracefully falls back to the local matcher. Either way the bot
 *      keeps working with no paid dependency.
 */

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
}

const SHOP_NAME = 'Gopi Misthan Bhandar';
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 9425922445';

const DEFAULT_SUGGESTIONS = [
  { label: '🍬 Browse Sweets', action: 'categories' },
  { label: '⭐ Bestsellers', action: 'bestsellers' },
  { label: '📦 Track Order', action: 'track:init' },
  { label: '🚚 Delivery Info', action: 'delivery' },
];

function lowestPrice(p: {
  price: number;
  sizes?: { price: number }[];
}): number {
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

async function searchProducts(rawText: string): Promise<ChatProduct[]> {
  const text = rawText.trim();
  const maxPrice = parseMaxPrice(text);

  // Strip price phrases + filler words to get the actual product keywords.
  const keywords = text
    .toLowerCase()
    .replace(/(?:under|below|less than|upto|up to|<|₹|rs\.?)\s*[0-9]{2,5}/g, '')
    .replace(/\b(show|me|some|any|sweets?|mithai|the|a|an|for|please|dikhao|chahiye|batao|kya|hai)\b/g, '')
    .trim();

  const query: any = { isActive: { $ne: false } };

  if (keywords.length >= 2) {
    query.$or = [
      { name: { $regex: keywords, $options: 'i' } },
      { description: { $regex: keywords, $options: 'i' } },
      { category: { $regex: keywords, $options: 'i' } },
    ];
  }

  let products = await Product.find(query)
    .select('name slug description price image category sizes')
    .sort({ featured: -1, createdAt: -1 })
    .limit(maxPrice ? 30 : 6)
    .lean();

  let chatProducts = products.map(toChatProduct);

  if (maxPrice) {
    chatProducts = chatProducts
      .filter((p) => p.fromPrice <= maxPrice)
      .slice(0, 6);
  }

  return chatProducts.slice(0, 6);
}

/** Optional Gemini upgrade for free-text. Returns null if unavailable/unconfigured. */
async function tryGeminiReply(
  userText: string,
  products: ChatProduct[]
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const menuContext = products.length
    ? products
        .map((p) => `- ${p.name}: from ₹${p.fromPrice}`)
        .join('\n')
    : 'No exact matches found in the catalogue for this query.';

  const systemPrompt = `You are the friendly ordering assistant for ${SHOP_NAME}, an Indian sweets (mithai) shop. Answer in the same language the customer uses (Hindi/Hinglish/English). Be concise (2-3 sentences). Only talk about sweets, orders, delivery and the shop. Never invent products or prices — use only the catalogue context below.\n\nCatalogue context:\n${menuContext}`;

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
  payload: Record<string, string>
): Promise<ChatReply> {
  switch (action) {
    case 'welcome':
      return {
        reply: `Namaste! 🙏 Main ${SHOP_NAME} ka assistant hoon. Kaise madad karun?`,
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };

    case 'categories': {
      const cats = await Category.find({})
        .select('name slug')
        .limit(8)
        .lean();
      return {
        reply: cats.length
          ? 'Hamari categories — kaunsi dekhni hai? 👇'
          : 'Abhi categories load nahi ho payi. "Bestsellers" try karein.',
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
        reply: 'Ye rahe hamare sabse popular sweets ⭐',
        products: list.map(toChatProduct),
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    case 'delivery':
      return {
        reply:
          '🚚 Hum pure India mein deliver karte hain. Sweets 60 din tak fresh rehti hain. Order confirm hone ke baad aapko tracking link mil jaayega. Pincode-wise delivery time checkout par dikhta hai.',
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };

    case 'contact':
      return {
        reply: `📞 Humse baat karein: ${SUPPORT_PHONE}\n🏬 Tilak Marg, Neemuch (M.P.) — 1968 se.`,
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };

    case 'track:init':
      return {
        reply:
          'Apna order number aur registered phone number bhejein (format: ORDER123, 9876543210) — main status bata deta hoon. 📦',
        suggestions: [{ label: '↩️ Wapas menu', action: 'welcome' }],
        source: 'rules',
      };

    case 'track': {
      const orderNumber = (payload.orderNumber || '').trim();
      const phone = (payload.phone || '').replace(/\D/g, '').trim();
      if (!orderNumber || phone.length < 6) {
        return {
          reply:
            'Order number aur phone dono chahiye. Jaise: ORDER123, 9876543210',
          suggestions: [{ label: '↩️ Wapas menu', action: 'welcome' }],
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
          reply:
            'Is order number + phone se koi order nahi mila. Dobara check karein, ya humse contact karein.',
          suggestions: [
            { label: '📞 Contact', action: 'contact' },
            { label: '↩️ Menu', action: 'welcome' },
          ],
          source: 'rules',
        };
      }

      const o = order as any;
      const statusLabel: Record<string, string> = {
        pending: 'Pending ⏳',
        confirmed: 'Confirmed ✅',
        processing: 'Taiyaar ho raha hai 👨‍🍳',
        shipped: 'Ship ho gaya 📦',
        in_transit: 'Raaste mein 🚚',
        out_for_delivery: 'Aaj delivery ke liye nikla 🛵',
        delivered: 'Deliver ho gaya 🎉',
        cancelled: 'Cancel ho gaya ❌',
      };
      const tracking = o.trackingUrl
        ? `\n🔗 Track: ${o.trackingUrl}`
        : o.awbNumber
        ? `\n📮 AWB: ${o.awbNumber} (${o.courierName || 'courier'})`
        : '';
      return {
        reply: `Order ${o.orderNumber}\nStatus: ${
          statusLabel[o.status] || o.status
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
          ? `"${q}" ke liye ye mile 👇`
          : `"${q}" ke liye kuch nahi mila. Categories ya bestsellers dekhein?`,
        products,
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    case 'ask': {
      const text = (payload.text || '').trim();
      if (!text) {
        return handleAction('welcome', {});
      }
      const products = await searchProducts(text);
      const aiReply = await tryGeminiReply(text, products);
      if (aiReply) {
        return {
          reply: aiReply,
          products: products.slice(0, 4),
          suggestions: DEFAULT_SUGGESTIONS,
          source: 'ai',
        };
      }
      // Local fallback — no AI needed.
      return {
        reply: products.length
          ? 'Aapke sawaal se ye sweets match hui 👇 Aur kuch poochna ho toh batayein.'
          : 'Main menu, order tracking aur delivery mein madad kar sakta hoon. Niche se chunein 👇',
        products,
        suggestions: DEFAULT_SUGGESTIONS,
        source: 'rules',
      };
    }

    default:
      return handleAction('welcome', {});
  }
}

export async function POST(request: NextRequest) {
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
        reply: 'Thoda dheere 🙂 ek minute baad dobara koshish karein.',
        source: 'rules',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || 'welcome');
    const payload = (body.payload || {}) as Record<string, string>;

    await connectDB();
    const result = await handleAction(action, payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        reply:
          'Sorry, abhi thodi dikkat aa rahi hai. Thodi der baad try karein ya WhatsApp par message karein.',
        source: 'rules',
      },
      { status: 200 } // graceful: bot never shows a hard error to the customer
    );
  }
}
