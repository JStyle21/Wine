import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { auth } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.post('/orders', auth, createOrder);
router.get('/orders', auth, getOrders);
router.get('/orders/:id', auth, getOrder);
router.put('/orders/:id', auth, updateOrder);
router.delete('/orders/:id', auth, deleteOrder);

export default router;
