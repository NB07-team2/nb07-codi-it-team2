import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.get('/', authenticate, inquiryController.myInquiryList);
router.get('/:id', authenticate, inquiryController.getInquiryDetail);
router.patch('/:id', authenticate, inquiryController.updateInquiry);
router.delete('/:id', authenticate, inquiryController.deleteInquiry);

export default router;