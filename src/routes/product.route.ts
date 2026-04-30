import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import * as inquiryController from '../controllers/inquiry.controller';
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

productRouter.post('/:productId/inquiries',authenticate,inquiryController.createInquiry);
productRouter.get('/:productId/inquiries', inquiryController.getInquiryList);
export default productRouter;
