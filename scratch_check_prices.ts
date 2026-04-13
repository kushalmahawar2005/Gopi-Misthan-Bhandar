import connectDB from './lib/mongodb';
import Product from './models/Product';

async function checkProducts() {
  await connectDB();
  const products = await Product.find({});
  console.log(JSON.stringify(products.map(p => ({ name: p.name, price: p.price })), null, 2));
  process.exit(0);
}

checkProducts();
