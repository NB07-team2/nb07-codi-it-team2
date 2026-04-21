import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller"
import { authenticate } from "../middlewares/auth.middlewares";

const router = Router();

router.get('/', authenticate, dashboardController.getDashboardData);

export default router;