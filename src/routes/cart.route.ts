import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as cartController from "../controllers/cart.controller";

const router = Router();

router.post('/', authenticate, cartController.createCart);
router.get('/', authenticate, cartController.getMyCart);
router.patch('/', authenticate, cartController.updateCart);
router.delete('/:cartItemId', authenticate, cartController.deleteCartItem);
router.get('/:cartItemId', authenticate, cartController.getCartItem);

export default router;