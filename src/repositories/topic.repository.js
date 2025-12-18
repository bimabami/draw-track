import prisma from "../db/index.js";

export const TopicRepository = {
  Create: async (payload) => {
    const createdTopic = await prisma.topic.create({
      data: payload,
    });
    return createdTopic;
  },

  GetTopicsByTeam: async (teamId) => {
    return await prisma.topic.findMany({
      where: { teamId },
    });
  },

  GetById: async (topicId) => {
    return await prisma.topic.findUnique({
      where: { id: topicId },
    });
  },

  Update: async (topicId, data) => {
    return await prisma.topic.update({
      where: { id: topicId },
      data,
    });
  },

  Delete: async (topicId) => {
    return await prisma.topic.delete({
      where: { id: topicId },
    });
  },

  // Subtopic
  CreateSubtopic: async (topicId, payload) => {
    const createdSubtopic = await prisma.subtopic.create({
      data: { title: payload.title, description: payload.description || "", topicId },
      include: { topic: { select: { id: true, teamId: true } } },
    });
    return createdSubtopic;
  },

  GetSubtopicsByTopic: async (topicId) => {
    return await prisma.subtopic.findMany({
      where: { topicId },
    });
  },

  GetSubtopicById: async (subtopicId) => {
    return await prisma.subtopic.findUnique({
      where: { id: subtopicId },
      include: { topic: { select: { teamId: true } } },
    });
  },

  UpdateSubtopic: async (subtopicId, data) => {
    return await prisma.subtopic.update({
      where: { id: subtopicId },
      data,
    });
  },

  DeleteSubtopic: async (subtopicId) => {
    return await prisma.subtopic.delete({
      where: { id: subtopicId },
    });
  },
};
