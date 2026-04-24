import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.get("/sse", authenticate, notificationController.streamNotifications);
router.get("/", authenticate, notificationController.getNotifications);
router.patch("/:alarmId/check", authenticate, notificationController.checkNotification);

export default router;