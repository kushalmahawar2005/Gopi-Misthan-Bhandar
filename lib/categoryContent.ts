export interface CategoryFAQ {
  q: string;
  a: string;
}

export interface CategorySEO {
  slug: string;
  aliases?: string[];
  h1: string;
  title: string;
  description: string;
  intro: string;
  longCopy: string[];
  highlights: string[];
  faqs: CategoryFAQ[];
  ogImage: string;
  popular: string[];
}

const CONTENT: Record<string, CategorySEO> = {
  sweets: {
    slug: 'sweets',
    h1: 'Buy Indian Sweets Online — Fresh Mithai Delivered Pan-India',
    title: 'Buy Indian Sweets Online | Traditional Mithai Delivery Across India',
    description:
      'Order traditional Indian sweets online from Gopi Misthan Bhandar — Kaju Katli, Soan Papdi, Motichoor Ladoo, Milk Cake, Kalakand, Barfi, Peda & more. Fresh, handcrafted mithai with 60-day shelf life. Pan-India delivery from Neemuch since 1968.',
    intro:
      'From classic Kaju Katli and silky Soan Papdi to fresh Milk Cake and Motichoor Ladoo, every mithai we ship is handcrafted in our Neemuch kitchen using farm-fresh milk, A-grade dry fruits, and Kashmiri saffron. Trusted across India since 1968.',
    longCopy: [
      'Indian sweets are at the heart of every celebration — Diwali, Rakhi, weddings, birthdays and home-coming gifts. At Gopi Misthan Bhandar we have been making traditional mithai by hand since 1968, using slow-cooked recipes passed down across three generations.',
      'Our online sweet shop covers every favourite: Kaju Katli, Pista Burfi, Anjeer Roll, Motichoor Ladoo, Boondi Ladoo, Kalakand, Milk Cake, Doda Burfi, Peda, Gulab Jamun, Halwa, and seasonal specialties such as Gajar Halwa, Gond Ladoo and Til Patti. Every product is freshly prepared, vacuum-packed for travel, and shipped pan-India through cold-chain courier so it reaches you tasting just the way it left our kitchen.',
      'Recognised in 2024 by Dainik Bhaskar with the Best Services Award and listed among India\'s Top 111 Mithai & Namkeen brands, Gopi Misthan Bhandar combines a heritage shop experience with modern e-commerce convenience. Free pan-India shipping on bulk orders. Choose your favourite mithai online and get it delivered fresh to your doorstep across Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Indore, Bhopal, Udaipur, Kota and every corner of India.',
    ],
    highlights: [
      '60-day shelf life on most varieties — vacuum-sealed for travel',
      'Made with farm-fresh A-grade milk, pure ghee, Kashmiri saffron, premium kaju & pista',
      'No artificial colours, no preservatives, no palm oil',
      'Free pan-India shipping on orders above ₹1499',
      'Bulk & corporate orders welcome — wedding, Diwali, Rakhi gifting',
    ],
    faqs: [
      {
        q: 'Which Indian sweets stay fresh the longest for shipping?',
        a: 'Dry mithai such as Kaju Katli, Soan Papdi, Anjeer Burfi, Pista Roll and Doda Burfi stay fresh for up to 60 days when stored in an airtight container at room temperature. Milk-based sweets like Milk Cake and Kalakand are best enjoyed within 7-10 days of delivery.',
      },
      {
        q: 'Do you ship sweets all over India?',
        a: 'Yes. We ship to every PIN code in India through cold-chain courier partners. Delivery typically takes 2-5 working days depending on the destination city.',
      },
      {
        q: 'Can I order Indian sweets online for Diwali or weddings in bulk?',
        a: 'Absolutely. We offer custom Diwali gift hampers, wedding sweet trays, and corporate gifting boxes. WhatsApp +91-9425922445 with your requirement and our team will design a hamper within 24 hours.',
      },
      {
        q: 'Are your sweets pure veg and free from preservatives?',
        a: 'Every mithai we make is 100% vegetarian and contains no artificial preservatives, colours or palm oil. Only milk, ghee, sugar, dry fruits and traditional flavourings.',
      },
    ],
    ogImage: '/Hamper.jpg',
    popular: ['Kaju Katli', 'Soan Papdi', 'Motichoor Ladoo', 'Milk Cake', 'Kalakand', 'Anjeer Burfi'],
  },

  namkeen: {
    slug: 'namkeen',
    h1: 'Buy Indian Namkeen Online — Bhujia, Sev, Mixture & Snacks',
    title: 'Buy Namkeen Online | Bhujia, Sev, Mixture & Indian Snacks',
    description:
      'Order fresh Indian namkeen online from Gopi Misthan Bhandar — bhujia, aloo bhujia, sev, mixture, mathri, chakli, masala peanuts and traditional savoury snacks. Pan-India delivery from Neemuch.',
    intro:
      'Crispy bhujia, hand-twisted sev, masala mixture, mathri, chakli and traditional Indian namkeen — fried fresh in pure refined oil and packed within hours so every bite still crackles when it reaches you.',
    longCopy: [
      'No Indian tea-time is complete without a plate of namkeen. Our namkeen range covers every favourite — Bikaneri Bhujia, Aloo Bhujia, Plain Sev, Ratlami Sev, Khatta Meetha Mixture, Navratan Mix, Moong Dal, Roasted Chana, Masala Peanuts, Chakli, Mathri and seasonal Kachori snacks.',
      'Each batch is prepared in small lots, drained and packed the same day to keep that signature crunch. We ship every namkeen in nitrogen-flushed pouches so the snacks reach you across India tasting fresh out of the kadhai.',
      'Whether you are stocking up for Diwali, gifting at the office, or simply adding a side to your evening chai, our namkeen pairs perfectly with mithai gift boxes for festive hampers.',
    ],
    highlights: [
      'Fried fresh in pure refined oil — never reused',
      'Vacuum / nitrogen-flushed packaging for guaranteed crunch',
      'Combo namkeen + mithai hampers for Diwali and corporate gifting',
      'No artificial flavours, no MSG, no palm oil',
    ],
    faqs: [
      {
        q: 'How long does namkeen stay crispy after delivery?',
        a: 'Sealed packs stay fresh for 90 days from manufacture. Once opened, transfer to an airtight jar and finish within 30 days for the best crunch.',
      },
      {
        q: 'Do you sell namkeen and sweets combo gift boxes?',
        a: 'Yes — our festive hampers combine bhujia, mixture, sev with mithai such as Kaju Katli and Soan Papdi. Browse the Gift Boxes section or message us for a custom combo.',
      },
      {
        q: 'Is your namkeen Jain-friendly (no onion, no garlic)?',
        a: 'Many of our namkeens — Plain Sev, Bhujia, Moong Dal, Roasted Chana, Mathri — are Jain-friendly. WhatsApp us for the full Jain list before ordering.',
      },
    ],
    ogImage: '/Hamper.jpg',
    popular: ['Bikaneri Bhujia', 'Aloo Bhujia', 'Sev', 'Khatta Meetha Mixture', 'Mathri', 'Chakli'],
  },

  'dry-fruit': {
    slug: 'dry-fruit',
    aliases: ['dry-fruits', 'dryfruit'],
    h1: 'Premium Dry Fruits & Dry Fruit Sweets Online',
    title: 'Buy Dry Fruits & Dry Fruit Mithai Online | Premium Quality',
    description:
      'Shop premium A-grade dry fruits and dry-fruit mithai online — Kashmiri Kesar Kaju Katli, Anjeer Burfi, California Almonds, Iranian Pistachio gift packs. Pan-India delivery from Gopi Misthan Bhandar.',
    intro:
      'A-grade California almonds, Iranian pistachios, Kashmiri saffron, Afghan anjeer and premium cashew — sourced direct from regional farms and rolled into our finest dry-fruit mithai gifts.',
    longCopy: [
      'Dry fruits are India\'s most loved gift — pure, healthy, and always welcome. Our dry-fruit catalogue covers single-origin nuts (almonds, cashew, pistachio, walnuts, raisins, anjeer, dates, apricots) and decadent dry-fruit mithai such as Kesar Kaju Katli, Anjeer Roll, Pista Burfi, Dry Fruit Halwa and Khajoor Pak.',
      'Every batch is hand-checked for grade, lightly roasted to lock in flavour, and sealed in food-grade pouches. Curate your own dry-fruit gift box or pick one of our pre-styled hampers for Diwali, Rakhi, weddings or corporate gifting.',
    ],
    highlights: [
      'A-grade premium nuts — California almonds, Iranian pistachios, Kashmiri saffron',
      'Sealed for freshness — minimum 6-month shelf life',
      'Build-your-own gift hampers available — message for custom quotes',
      'Heart-healthy, no added sugar, gifting-grade quality',
    ],
    faqs: [
      {
        q: 'Are your dry fruits A-grade and current-season?',
        a: 'Yes, every batch we ship is current-season A-grade — California almonds, Iranian Akbari/Kerman pistachios, Kashmiri Mamra Kaju, Afghan Anjeer and Kashmiri Kesar.',
      },
      {
        q: 'Can I customise a dry fruit gift box?',
        a: 'Definitely. WhatsApp +91-9425922445 with your budget and quantity — we will design a custom hamper with your choice of nuts and mithai inside 24 hours.',
      },
    ],
    ogImage: '/box-large.jpg',
    popular: ['Kesar Kaju Katli', 'Anjeer Burfi', 'California Almonds', 'Iranian Pistachio', 'Mamra Kaju', 'Dry Fruit Halwa'],
  },

  bakery: {
    slug: 'bakery',
    aliases: ['bakery-items'],
    h1: 'Fresh Bakery Items Online — Cookies, Biscuits & Bakes',
    title: 'Buy Bakery Items Online | Cookies, Biscuits, Cakes & Bakes',
    description:
      'Order fresh bakery items online — handmade cookies, atta biscuits, jeera cookies, nankhatai, rusks and traditional Indian bakes. Pan-India delivery from Gopi Misthan Bhandar.',
    intro:
      'Hand-rolled cookies, ghee nankhatai, jeera biscuits, atta cookies and nostalgic Indian bakes — baked daily in small batches and sealed for travel.',
    longCopy: [
      'Our bakery range pairs traditional Indian recipes with modern small-batch baking. Try our signature Ghee Nankhatai, Jeera Cookies, Atta Coconut Biscuit, Khari, Toast and assorted festive baked treats.',
      'Every cookie is baked fresh, cooled and sealed in food-grade pouches so it stays crisp through the journey. Combine bakery items with mithai for a thoughtful evening-snack gift hamper.',
    ],
    highlights: [
      'Baked fresh daily — no factory pre-mixes',
      'Pure ghee, atta and natural flavourings',
      'Sealed pouches stay crisp for 30+ days',
      'Mix-and-match with sweets for gift hampers',
    ],
    faqs: [
      {
        q: 'How long do your cookies and bakery items last?',
        a: 'Sealed pouches stay fresh for 30-45 days. Once opened, transfer to an airtight tin and finish within 15 days.',
      },
      {
        q: 'Are bakery items vegetarian and egg-free?',
        a: 'Yes — every cookie and biscuit we sell is 100% pure vegetarian and egg-free, baked in pure ghee or refined oil.',
      },
    ],
    ogImage: '/Hamper.jpg',
    popular: ['Ghee Nankhatai', 'Jeera Cookies', 'Atta Cookies', 'Khari', 'Coconut Biscuit'],
  },
};

const ALIAS_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const key of Object.keys(CONTENT)) {
    map[key] = key;
    for (const alias of CONTENT[key].aliases || []) {
      map[alias] = key;
    }
  }
  return map;
})();

export const resolveCategorySlug = (slug: string): string | null => {
  const normalized = String(slug || '').trim().toLowerCase();
  return ALIAS_MAP[normalized] || null;
};

export const getCategorySEO = (slug: string): CategorySEO | null => {
  const resolved = resolveCategorySlug(slug);
  return resolved ? CONTENT[resolved] : null;
};

export const listCategorySlugs = (): string[] => Object.keys(CONTENT);
