import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.get('/', authenticate, inquiryController.myInquiryList);
router.get('/:id', inquiryController.getInquiryDetail);
router.patch('/:id', authenticate, inquiryController.updateInquiry);
router.delete('/:id', authenticate, inquiryController.deleteInquiry);
router.post('/:id/replies', authenticate, inquiryController.createReply);
router.patch('/:id/replies', authenticate, inquiryController.updateReply);



export default router;