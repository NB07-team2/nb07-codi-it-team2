import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middlewares';
import { upload } from '../services/image.service';

const productRouter = Router();

productRouter.post(
  '/',
  authenticate,
  upload.single('image'),
  productController.createProductController,
);
productRouter.get('/', productController.getProductsListController);
productRouter.patch(
  '/:productId',
  authenticate,
  upload.single('image'),
  productController.updateProductController,
);
productRouter.get('/:productId', productController.getProductDetailController);
productRouter.delete(
  '/:productId',
  authenticate,
  productController.deleteProductController,
);

export default productRouter;
