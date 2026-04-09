import { Router } from 'express';
import * as inquiryController from '../controllers/inquiry.controller';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.get('/', authenticate, inquiryController.myInquiryList);

export default router;