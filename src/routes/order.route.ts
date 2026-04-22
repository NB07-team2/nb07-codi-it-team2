import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.post('/', authenticate, orderController.createOrder);

export default router;