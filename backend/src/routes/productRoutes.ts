import { Router } from 'express';
import { addProduct, getProducts, getSuggestions, updateProduct, deleteProduct } from '../controllers/productController';
import { auth } from '../middleware/auth';

const router = Router();

// All product routes require authentication
router.post('/products', auth, addProduct);
router.get('/products', auth, getProducts);
router.get('/products/suggestions', auth, getSuggestions);
router.put('/products/:id', auth, updateProduct);
router.delete('/products/:id', auth, deleteProduct);

export default router;