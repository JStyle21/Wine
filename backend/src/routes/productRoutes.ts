import { Router } from 'express';
import { addProduct, getProducts, getSuggestions, updateProduct } from '../controllers/productController';

const router = Router();

router.post('/products', addProduct);
router.get('/products', getProducts);
router.get('/products/suggestions', getSuggestions);
router.put('/products/:id', updateProduct);

export default router;