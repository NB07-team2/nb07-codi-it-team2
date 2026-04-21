import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middlewares';
import { createReviewController } from '../controllers/review.controller';

const router = Router();
router.post('/:productId/reviews', authenticate, createReviewController);

export default router;
