import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.get("/", verifyToken, NotificationController.list);
router.get("/unread-count", verifyToken, NotificationController.getUnreadCount);
router.put("/:id/read", verifyToken, NotificationController.markAsRead);
router.put("/read-all", verifyToken, NotificationController.markAllAsRead);
router.delete("/:id", verifyToken, NotificationController.delete);
router.delete("/", verifyToken, NotificationController.clearAll);

export default router;
