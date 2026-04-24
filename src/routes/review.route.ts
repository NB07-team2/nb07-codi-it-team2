import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middlewares';
import {
  deleteReviewController,
  getReviewDetailController,
  updateReviewController,
} from '../controllers/review.controller';

const router = Router();

router.get('/:reviewId', authenticate, getReviewDetailController);
router.patch('/:reviewId', authenticate, updateReviewController);
router.delete('/:reviewId', authenticate, deleteReviewController);

export default router;
