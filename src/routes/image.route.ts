import { Router } from 'express';
import * as imageController from '../controllers/image.controller';
import { upload } from '../services/image.service';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.post(
  '/upload',
  authenticate,
  upload.single('image'),
  imageController.uploadImage,
);

export default router;
