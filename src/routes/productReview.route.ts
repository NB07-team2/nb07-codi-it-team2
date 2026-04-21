import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middlewares';
import {
  createReviewController,
  getReviewsController,
} from '../controllers/review.controller';

const router = Router();
router.post('/:productId/reviews', authenticate, createReviewController);
router.get('/:productId/reviews', getReviewsController);
export default router;
