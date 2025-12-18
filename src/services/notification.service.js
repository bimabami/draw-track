import { NotificationRepository } from "../repositories/notification.repository.js";

export const NotificationService = {
  getUserNotifications: async (userId) => {
    const notifications = await NotificationRepository.GetByUserId(userId);
    return notifications;
  },

  getUnreadCount: async (userId) => {
    const count = await NotificationRepository.GetUnreadCount(userId);
    return count;
  },

  createNotification: async (userId, title, body, meta = null) => {
    const notification = await NotificationRepository.Create(userId, title, body, meta);
    return notification;
  },

  createMentionNotification: async (mentionedUserId, mentionerName, taskId, taskTitle, commentBody, navigationData = {}) => {
    const title = `${mentionerName} menyebut Anda`;
    const body = commentBody.length > 100 ? commentBody.substring(0, 100) + "..." : commentBody;
    const meta = { 
      taskId, 
      taskTitle, 
      type: "mention",
      teamId: navigationData.teamId,
      topicId: navigationData.topicId,
      subTopicId: navigationData.subTopicId,
      teamName: navigationData.teamName,
      topicName: navigationData.topicName,
      subTopicName: navigationData.subTopicName,
    };
    
    return await NotificationRepository.Create(mentionedUserId, title, body, meta);
  },

  markAsRead: async (id, userId) => {
    // Verify ownership
    const notification = await NotificationRepository.GetById(id);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }
    
    return await NotificationRepository.MarkAsRead(id);
  },

  markAllAsRead: async (userId) => {
    return await NotificationRepository.MarkAllAsRead(userId);
  },

  deleteNotification: async (id, userId) => {
    // Verify ownership
    const notification = await NotificationRepository.GetById(id);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }
    
    return await NotificationRepository.Delete(id);
  },

  clearAllNotifications: async (userId) => {
    return await NotificationRepository.DeleteAllByUser(userId);
  },
};
