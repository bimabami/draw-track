import prisma from "../db/index.js";

export const NotificationRepository = {
  GetByUserId: async (userId) => {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  GetById: async (id) => {
    return await prisma.notification.findUnique({
      where: { id },
    });
  },

  Create: async (userId, title, body, meta = null) => {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        meta,
      },
    });
  },

  MarkAsRead: async (id) => {
    return await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  MarkAllAsRead: async (userId) => {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  Delete: async (id) => {
    return await prisma.notification.delete({
      where: { id },
    });
  },

  DeleteAllByUser: async (userId) => {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  },

  GetUnreadCount: async (userId) => {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  },
};
