import { Router } from 'express';
import { createStoreController } from '../controllers/store.controller';
import { upload } from '../services/image.service';
import { authenticate } from '../middlewares/auth.middlewares';

const router = Router();

router.post('/', authenticate, upload.single('image'), createStoreController);
//router.patch('/:storeId', authenticate);
//router.get('/:storeId');
//router.get('/detail/my', authenticate, getMyStoreController);
//router.get('/detail/my/product,', authenticate);
//router.post(':/storeId/favorite', authenticate);
//outer.delete(':/storeId/favorite', authenticate);

export default router;
