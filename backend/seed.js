import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Product from './models/product.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart_db';

const sampleProducts = [
  {
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Custom hot-swappable mechanical keyboard with tactile blue switches, per-key RGB backlighting, and durable aluminum top plate.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    stock: 15,
  },
  {
    name: 'Noise Cancelling Wireless Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam ear cushions.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 22,
  },
  {
    name: 'Ultra-Slim Minimalist Smart Watch',
    description: 'Water-resistant smartwatch featuring always-on AMOLED display, heart rate tracking, sleep analysis, and 7-day battery life.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    name: 'Classic Vintage Denim Jacket',
    description: 'Timeless washed denim jacket crafted from 100% organic heavyweight cotton with reinforced stitching and button-flap chest pockets.',
    price: 1899,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    name: 'Urban Canvas Everyday Backpack',
    description: 'Durable water-resistant canvas backpack with dedicated 15.6-inch laptop compartment, ergonomic padded straps, and anti-theft hidden pocket.',
    price: 1499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive guide to the architecture and principles behind reliable, scalable, and maintainable modern data systems by Martin Kleppmann.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    stock: 30,
  },
  {
    name: 'Clean Code: A Handbook of Agile Craftsmanship',
    description: 'Essential reading for any software engineer looking to write clean, readable, and maintainable code by Robert C. Martin.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
    stock: 8,
  },
  {
    name: 'Minimalist Ceramic Pour-Over Coffee Dripper',
    description: 'Artisan handcrafted ceramic coffee dripper for the ultimate pour-over brew experience, ensuring optimal extraction and temperature retention.',
    price: 799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 14,
  },
  {
    name: 'Modern Nordic Table Lamp',
    description: 'Sleek matte metal desk lamp with warm LED illumination, touch dimming control, and minimalist Scandinavian geometry.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 9,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
