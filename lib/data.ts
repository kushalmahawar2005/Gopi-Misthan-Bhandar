import { Product, Category, InstagramPost } from '@/types';

// Placeholder image URLs using Unsplash and Picsum
const getPlaceholderImage = (id: number, width: number = 400, height: number = 400) => {
  // Using Picsum Photos for variety - each ID gives a different image
  return `https://picsum.photos/seed/sweets${id}/${width}/${height}`;
};

// Categories
export const categories: Category[] = [
  { id: '1', name: 'SWEETS', slug: 'sweets', image: getPlaceholderImage(1, 380, 500) },
  { id: '2', name: 'SNACKS', slug: 'snacks', image: getPlaceholderImage(2, 380, 500) },
  { id: '3', name: 'NAMKEEN', slug: 'namkeen', image: getPlaceholderImage(3, 380, 500) },
];

// All Products Database
const allProducts: Product[] = [
  // Classic Sweets
  {
    id: '1',
    name: 'ASSORTED LADDOOS BOX',
    description: 'A delightful assortment of traditional Indian ladoos including besan ladoo, motichoor ladoo, and rava ladoo. Each ladoo is handcrafted with pure ghee and premium ingredients, delivering the authentic taste of home.',
    price: 775,
    image: getPlaceholderImage(10, 306, 309),
    category: 'sweets',
    featured: true,
    sizes: [
      { weight: '250g', price: 550, label: 'Small' },
      { weight: '500g', price: 775, label: 'Medium' },
      { weight: '1kg', price: 1450, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '7-10 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '2',
    name: 'ARTISANAL GOURMET LADDOO IN TREE BOX',
    description: 'Premium gourmet ladoos beautifully presented in an elegant tree box. Made with the finest nuts, dry fruits, and aromatic spices. Perfect for gifting and special occasions.',
    price: 1349,
    image: getPlaceholderImage(11, 306, 309),
    category: 'sweets',
    featured: true,
    sizes: [
      { weight: '250g', price: 950, label: 'Small' },
      { weight: '500g', price: 1349, label: 'Medium' },
      { weight: '1kg', price: 2499, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '10-15 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '3',
    name: 'SUPREME BAKLAVA BOX',
    description: 'Exquisite baklava made with layers of flaky phyllo pastry, filled with premium nuts, and sweetened with honey. A perfect fusion of Middle Eastern and Indian flavors.',
    price: 925,
    image: getPlaceholderImage(12, 306, 309),
    category: 'sweets',
    featured: true,
    sizes: [
      { weight: '300g', price: 650, label: 'Small' },
      { weight: '500g', price: 925, label: 'Medium' },
      { weight: '1kg', price: 1750, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '15-20 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '4',
    name: 'ALL TIME FAVOURITE MITHAI BOX',
    description: 'A curated collection of all-time favorite Indian sweets including gulab jamun, rasgulla, kaju katli, and peda. A perfect mix for every sweet lover.',
    price: 745,
    image: getPlaceholderImage(13, 306, 309),
    category: 'sweets',
    featured: true,
    sizes: [
      { weight: '250g', price: 520, label: 'Small' },
      { weight: '500g', price: 745, label: 'Medium' },
      { weight: '1kg', price: 1390, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '7-10 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '5',
    name: 'PREMIUM GULAB JAMUN BOX',
    description: 'Soft, melt-in-your-mouth gulab jamuns soaked in fragrant sugar syrup. Made with khoya and premium ingredients, these are the perfect treat for any occasion.',
    price: 850,
    image: getPlaceholderImage(14, 306, 309),
    category: 'sweets',
    featured: false,
    sizes: [
      { weight: '250g', price: 600, label: 'Small' },
      { weight: '500g', price: 850, label: 'Medium' },
      { weight: '1kg', price: 1600, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '5-7 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '6',
    name: 'TRADITIONAL BARFI COLLECTION',
    description: 'An exquisite collection of traditional barfis including kaju barfi, pista barfi, and besan barfi. Each piece is handcrafted and decorated with silver leaf.',
    price: 680,
    image: getPlaceholderImage(15, 306, 309),
    category: 'sweets',
    featured: false,
    sizes: [
      { weight: '250g', price: 480, label: 'Small' },
      { weight: '500g', price: 680, label: 'Medium' },
      { weight: '1kg', price: 1280, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '10-12 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '7',
    name: 'DRY FRUIT DELIGHT BOX',
    description: 'Luxurious dry fruit sweets including badam burfi, pista roll, and anjeer barfi. Rich in nutrients and packed with the goodness of premium dry fruits.',
    price: 1200,
    image: getPlaceholderImage(16, 306, 309),
    category: 'sweets',
    featured: true,
    sizes: [
      { weight: '250g', price: 850, label: 'Small' },
      { weight: '500g', price: 1200, label: 'Medium' },
      { weight: '1kg', price: 2299, label: 'Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '15-20 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '8',
    name: 'FESTIVAL SPECIAL SWEET BOX',
    description: 'A special festive collection featuring traditional sweets perfect for Diwali, Holi, Raksha Bandhan, and other celebrations. Includes modak, ladoo, and traditional mithai.',
    price: 995,
    image: getPlaceholderImage(17, 306, 309),
    category: 'sweets',
    featured: true,
    sizes: [
      { weight: '500g', price: 995, label: 'Medium' },
      { weight: '1kg', price: 1899, label: 'Large' },
      { weight: '2kg', price: 3599, label: 'X-Large' },
    ],
    defaultWeight: '500g',
    shelfLife: '10-15 days',
    deliveryTime: '2-3 days',
  },
  {
    id: '9',
    name: 'ROYAL KAJU KATLI BOX',
    description: 'Premium cashew-based diamond-shaped sweets. Thin, delicate, and melt-in-your-mouth with a rich, nutty flavor. Topped with edible silver leaf.',
    price: 890,
    image: getPlaceholderImage(18, 306, 309),
    category: 'sweets',
    featured: false,
  },
  {
    id: '10',
    name: 'RASGULLA ASSORTMENT',
    description: 'Fresh, spongy rasgullas made from pure chhena. Soaked in light sugar syrup, these are perfect for any sweet craving. Available in plain and flavored varieties.',
    price: 720,
    image: getPlaceholderImage(19, 306, 309),
    category: 'sweets',
    featured: false,
  },
  {
    id: '11',
    name: 'MOTICHOOR LADDOO PREMIUM',
    description: 'Fine, tiny boondi pearls bound together with sugar syrup and ghee. These delicate ladoos are a favorite across all age groups.',
    price: 650,
    image: getPlaceholderImage(25, 306, 309),
    category: 'sweets',
    featured: false,
  },
  {
    id: '12',
    name: 'MILK CAKE SPECIAL',
    description: 'Traditional milk cake with a caramelized texture and rich, creamy taste. Made with pure milk and cooked to perfection.',
    price: 950,
    image: getPlaceholderImage(26, 306, 309),
    category: 'sweets',
    featured: false,
  },
  // Snacks
  {
    id: '13',
    name: 'NAMKEEN MIX DELUXE',
    description: 'A perfect blend of crispy namkeens including sev, bhujia, and mixture. Spiced to perfection and packed fresh for maximum crunch.',
    price: 450,
    image: getPlaceholderImage(30, 306, 309),
    category: 'snacks',
    featured: false,
  },
  {
    id: '14',
    name: 'SAMOSA PARTY PACK',
    description: 'Freshly made, crispy samosas filled with spiced potatoes and peas. Perfect for tea time and parties. Served with mint and tamarind chutney.',
    price: 380,
    image: getPlaceholderImage(31, 306, 309),
    category: 'snacks',
    featured: false,
  },
  {
    id: '15',
    name: 'KACHORI ASSORTMENT',
    description: 'Flaky, deep-fried kachoris with various fillings including dal, pyaz, and mawa. A traditional snack that pairs perfectly with chutney.',
    price: 420,
    image: getPlaceholderImage(32, 306, 309),
    category: 'snacks',
    featured: false,
  },
  {
    id: '16',
    name: 'PAKODA VARIETY PACK',
    description: 'Crispy, golden pakodas made with fresh vegetables. Includes onion pakoda, palak pakoda, and mixed vegetable pakoda. Best enjoyed hot.',
    price: 350,
    image: getPlaceholderImage(33, 306, 309),
    category: 'snacks',
    featured: false,
  },
  // Namkeen
  {
    id: '17',
    name: 'BHUIYA PREMIUM',
    description: 'Crunchy, thin strands of gram flour namkeen. Spiced with traditional masalas and fried to perfection. A classic tea-time snack.',
    price: 280,
    image: getPlaceholderImage(40, 306, 309),
    category: 'namkeen',
    featured: false,
  },
  {
    id: '18',
    name: 'SEV MIXTURE',
    description: 'A delightful mix of sev, peanuts, fried lentils, and spices. Perfect balance of crunch and flavor. Ideal for snacking anytime.',
    price: 320,
    image: getPlaceholderImage(41, 306, 309),
    category: 'namkeen',
    featured: false,
  },
  {
    id: '19',
    name: 'FARSAN ASSORTMENT',
    description: 'Traditional Gujarati farsan including gathiya, khakhra, and mathiya. Light, crispy, and perfectly spiced. A must-try for farsan lovers.',
    price: 480,
    image: getPlaceholderImage(42, 306, 309),
    category: 'namkeen',
    featured: false,
  },
  {
    id: '20',
    name: 'CHANA CHUR PREMIUM',
    description: 'Spiced puffed chickpeas mixed with sev, peanuts, and fried gram. A popular street snack now available in premium quality.',
    price: 250,
    image: getPlaceholderImage(43, 306, 309),
    category: 'namkeen',
    featured: false,
  },
];

// Featured Products (first 8)
export const featuredProducts: Product[] = allProducts.filter(p => p.featured).slice(0, 8);

// Helper Functions
export const getAllProducts = (): Product[] => allProducts;

export const getProductById = (id: string): Product | undefined => {
  return allProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return allProducts.filter(product => product.category === category);
};

export const getProductsBySearch = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return allProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  );
};

export const getClassicProducts = (): Product[] => {
  return allProducts.filter(p => p.category === 'sweets').slice(0, 8);
};

export const getPremiumProducts = (): Product[] => {
  return allProducts.filter(p => p.category === 'sweets').slice(8, 16);
};

export const instagramPosts: InstagramPost[] = [
  { id: '1', image: getPlaceholderImage(20, 200, 360), label: 'Our Store' },
  { id: '2', image: getPlaceholderImage(21, 200, 360), label: 'Hampers' },
  { id: '3', image: getPlaceholderImage(22, 200, 360), label: 'Gifting', isVideo: true },
  { id: '4', image: getPlaceholderImage(23, 200, 360), label: 'Milk Cake' },
  { id: '5', image: getPlaceholderImage(24, 200, 360), label: 'Dry Fruits' },
];
