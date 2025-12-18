import prisma from "../db/index.js";

export const CommentRepository = {
  Create: async (data) => {
    return prisma.comment.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
        attachments: true,
        replies: true,
      },
    });
  },

  CreateAttachment: async (data) => {
    return prisma.commentAttachment.create({
      data,
      include: {
        comment: {
          select: { id: true, taskId: true },
        },
      },
    });
  },

  FindByTask: async (taskId) => {
    return prisma.comment.findMany({
      where: { taskId, parentId: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
        attachments: true,
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatarUrl: true,
              },
            }, attachments: true
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  FindById: async (id) => {
    return prisma.comment.findUnique({ where: { id } });
  },

  Delete: async (id) => {
    return prisma.comment.delete({ where: { id } });
  },
};
