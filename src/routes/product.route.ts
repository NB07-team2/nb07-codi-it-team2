import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middlewares';
import { upload } from '../services/image.service';

const productRouter = Router();

productRouter.post(
  '/',
  authenticate,
  upload.single('image'),
  productController.createProduct,
);
// productRouter.get(
//   '/',
//   authenticate,
//   getProductsList,
// );
// productRouter.patch(
//   '/productId',
//   authenticate,
//   upload.single('image'),
//   patchProduct,
// );
// productRouter.get(
//   '/productId',
//   authenticate,
//   getProduct,
// );
// productRouter.delete(
//   '/productId',
//   authenticate,
//   deleteProduct,
// );

export default productRouter;
