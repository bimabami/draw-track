import prisma from "../db/index.js";

export const TaskRepository = {
  Create: async (payload) => {
    const task = await prisma.task.create({
      data: payload,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        },
        subtopic: {
          include: {
            topic: {
              select: {
                id: true,
                teamId: true,
              }
            }
          }
        }
      }
    });
    return task;
  },

  GetBySubtopic: async (subtopicId) => {
    const tasks = await prisma.task.findMany({
      where: { subtopicId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        }
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "asc" }
      ]
    });
    return tasks;
  },

  GetById: async (taskId) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        }, subtopic: true, documents: true, comments: true
      },
    });
    return task;
  },

  Update: async (taskId, data) => {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        },
        subtopic: {
          include: {
            topic: {
              select: {
                id: true,
                teamId: true,
              }
            }
          }
        }
      }
    });
    return updatedTask;
  },

  Delete: async (taskId) => {
    await prisma.task.delete({
      where: { id: taskId },
    });
  },

  UpdateStatus: async (taskId, status) => {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    return updatedTask;
  },

  UpdateProgress: async (taskId, progress) => {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { progress },
    });
    return updatedTask;
  },
};