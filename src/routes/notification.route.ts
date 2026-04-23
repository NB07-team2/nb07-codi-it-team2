import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.get("/sse", authenticate, notificationController.streamNotifications);

export default router;