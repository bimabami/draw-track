import { TeamRepository } from "../repositories/team.repository.js";
import { TopicRepository } from "../repositories/topic.repository.js";
import { CustomError } from "../utils/customError.js";

export const TopicService = {
  createTopic: async (teamId, title) => {
    const topic = await TopicRepository.Create({
      title, teamId,
    });

    return topic;
  },

  getTeamTopics: async (teamId) => {
    const topics = await TopicRepository.GetTopicsByTeam(teamId);

    return topics;
  },

  updateTopic: async (topicId, data) => {
    const topic = await TopicRepository.GetById(topicId);
    if (!topic) throw new CustomError(404, "Topic not found");

    const updatedTopic = await TopicRepository.Update(topicId, data);
    // Return with teamId for WebSocket routing
    return { ...updatedTopic, teamId: topic.teamId };
  },

  deleteTopic: async (topicId) => {
    const topic = await TopicRepository.GetById(topicId);
    if (!topic) throw new CustomError(404, "Topic not found");
    
    const teamId = topic.teamId;
    await TopicRepository.Delete(topicId);
    return { topicId, teamId };
  },

  // Subtopic
  createSubtopic: async (topicId, payload) => {
    const topic = await TopicRepository.GetById(topicId);
    if (!topic) throw new CustomError(404, "Topic not found");

    const subtopic = await TopicRepository.CreateSubtopic(topicId, payload);

    return subtopic;
  },

  getSubtopics: async (topicId) => {
    const topic = await TopicRepository.GetById(topicId);
    if (!topic) throw new CustomError(404, "Topic not found");

    const subtopics = await TopicRepository.GetSubtopicsByTopic(topicId);

    return subtopics;
  },

  updateSubtopic: async (subtopicId, data) => {
    const subtopic = await TopicRepository.GetSubtopicById(subtopicId);
    if (!subtopic) throw new CustomError(404, "Subtopic not found");

    const updatedSubtopic = await TopicRepository.UpdateSubtopic(subtopicId, data);
    // Return with teamId for WebSocket routing
    return { ...updatedSubtopic, teamId: subtopic.topic?.teamId };
  },

  deleteSubtopic: async (subtopicId) => {
    const subtopic = await TopicRepository.GetSubtopicById(subtopicId);
    if (!subtopic) throw new CustomError(404, "Subtopic not found");

    const teamId = subtopic.topic?.teamId;
    await TopicRepository.DeleteSubtopic(subtopicId);
    return { subtopicId, teamId };
  },
};