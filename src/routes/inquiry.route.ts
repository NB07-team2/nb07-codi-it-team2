import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();
router.post(
  '/:productId/inquiries',
  authenticate,
  inquiryController.createInquiry,
);

export default router;