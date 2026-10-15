import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      validate: {
        validator: function (value) {
          return typeof value === 'number' && value > 0;
        },
        message: 'Price must be greater than 0',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: function (value) {
          return typeof value === 'number' && Number.isInteger(value) && value >= 0;
        },
        message: 'Stock must be a non-negative integer',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.methods.toJSON = function () {
  const product = this.toObject();
  delete product.__v;
  return product;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
