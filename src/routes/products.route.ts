import { Router } from 'express';
import * as productsController from '../controllers/products.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();
router.post(
  '/:productId/inquiries',
  authenticate,
  productsController.createInquiry,
);

export default router;