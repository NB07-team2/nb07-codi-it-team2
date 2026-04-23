import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middlewares';
import {
  getReviewDetailController,
  updateReviewController,
} from '../controllers/review.controller';

const router = Router();

router.get('/:reviewId', authenticate, getReviewDetailController);
router.patch('/:reviewId', authenticate, updateReviewController);
//router.delete('/:reviewId',authenticate );

export default router;
