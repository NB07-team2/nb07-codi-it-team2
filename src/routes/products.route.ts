import { Router } from "express";
import { createProductController } from '../controllers/products.controller';
import { authenticate } from "../middlewares/auth.middlewares";
import { upload } from "../services/image.service";

const router = Router();


router.post('/', authenticate, upload.single('image'), createProductController);

export default router;