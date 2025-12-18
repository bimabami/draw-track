import { NotificationService } from "../services/notification.service.js";

export const NotificationController = {
  list: async (req, res, _next) => {
    try {
      const userId = req.user.id;
      const notifications = await NotificationService.getUserNotifications(userId);
      
      res.status(200).json({
        success: true,
        message: "Notifications retrieved",
        data: notifications,
      });
    } catch (err) {
      _next(err);
    }
  },

  getUnreadCount: async (req, res, _next) => {
    try {
      const userId = req.user.id;
      const count = await NotificationService.getUnreadCount(userId);
      
      res.status(200).json({
        success: true,
        message: "Unread count retrieved",
        data: { count },
      });
    } catch (err) {
      _next(err);
    }
  },

  markAsRead: async (req, res, _next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const notification = await NotificationService.markAsRead(id, userId);
      
      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (err) {
      _next(err);
    }
  },

  markAllAsRead: async (req, res, _next) => {
    try {
      const userId = req.user.id;
      
      await NotificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (err) {
      _next(err);
    }
  },

  delete: async (req, res, _next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await NotificationService.deleteNotification(id, userId);
      
      res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (err) {
      _next(err);
    }
  },

  clearAll: async (req, res, _next) => {
    try {
      const userId = req.user.id;
      
      await NotificationService.clearAllNotifications(userId);
      
      res.status(200).json({
        success: true,
        message: "All notifications cleared",
      });
    } catch (err) {
      _next(err);
    }
  },
};
