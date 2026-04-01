import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";

const router = Router();

router.post('/', authenticate, )

export default router;