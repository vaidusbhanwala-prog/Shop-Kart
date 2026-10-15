import mongoose from 'mongoose';
import Product from '../models/product.model.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (
      name === '' || description === '' || price === '' || category === '' || image === '' || stock === '') {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0',
      });
    }

    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative integer',
      });
    }

    const product = new Product({
      name: typeof name === 'string' ? name.trim() : name,
      description: typeof description === 'string' ? description.trim() : description,
      price: numericPrice,
      category: typeof category === 'string' ? category.trim() : category,
      image: typeof image === 'string' ? image.trim() : image,
      stock: numericStock,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(', '),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (
      category &&
      typeof category === 'string' &&
      category.trim() !== '' &&
      category.toLowerCase() !== 'all' &&
      category.toLowerCase() !== 'all categories'
    ) {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
