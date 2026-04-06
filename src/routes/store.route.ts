import { Router } from 'express';
import {
  createStoreController,
  getMyStoreController,
  storeDetail,
  updateStore,
} from '../controllers/store.controller';
import { upload } from '../services/image.service';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.post('/', authenticate, upload.single('image'), createStoreController);
router.patch('/:storeId', authenticate, upload.single('image'), updateStore);
router.get('/:storeId', storeDetail);
router.get('/detail/my', authenticate, getMyStoreController);
//router.get('/detail/my/product,', authenticate);
//router.post(':/storeId/favorite', authenticate);
//outer.delete(':/storeId/favorite', authenticate);

export default router;
