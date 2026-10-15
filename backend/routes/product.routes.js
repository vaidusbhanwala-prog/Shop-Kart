import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
} from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

export default router;
