import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, orderController.getOrderMyList);
router.get('/:id', authenticate, orderController.getOrderDetail);
router.patch('/:id', authenticate, orderController.updateOrder);


export default router;