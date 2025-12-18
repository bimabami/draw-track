import * as Yup from 'yup';
import { CustomError } from '../utils/customError.js';
import { TopicService } from '../services/topic.service.js';
import { CreateTeamSchema } from '../utils/validations/team.validation.js';


export const TopicController = {
  createTopic: async (req, res, _next) => {
    try {
      const { teamId } = req.params;
      const { title } = req.body;

      const topic = await TopicService.createTopic(teamId, title);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.to(`team:${teamId}`).emit("topic:created", { teamId, topic });

      res.status(201).json({
        success: true,
        message: "Topic successfully created",
        data: topic,
      });
    } catch (error) {
      _next(error);
    }
  },

  getTeamTopics: async (req, res, _next) => {
    try {
      const { teamId } = req.params;
      const topics = await TopicService.getTeamTopics(teamId);

      res.status(200).json({
        success: true,
        message: "Topics retrieved successfully",
        data: topics,
      });
    } catch (error) {
      _next(error);
    }
  },

  updateTopic: async (req, res, _next) => {
    try {
      const { topicId } = req.params;

      const updatedTopic = await TopicService.updateTopic(topicId, req.body);

      // Emit WebSocket event to team room
      const io = req.app.get("io");
      if (io && updatedTopic.teamId) {
        io.to(`team:${updatedTopic.teamId}`).emit("topic:updated", { topicId, topic: updatedTopic });
      }

      res.status(200).json({
        success: true,
        message: "Topic successfully updated",
        data: updatedTopic,
      });

    } catch (error) {
      _next(error);
    }
  },

  deleteTopic: async (req, res, _next) => {
    try {
      const { topicId } = req.params;

      const result = await TopicService.deleteTopic(topicId);

      // Emit WebSocket event to team room
      const io = req.app.get("io");
      if (io && result.teamId) {
        io.to(`team:${result.teamId}`).emit("topic:deleted", { topicId });
      }

      res.status(200).json({
        success: true,
        message: "Topic successfully deleted",
        data: result,
      });

    } catch (error) {
      _next(error);
    }
  },

  // Subtopic
  createSubtopic: async (req, res, _next) => {
    try {
      const { topicId } = req.params;

      const subtopic = await TopicService.createSubtopic(topicId, req.body);

      // Emit WebSocket event to team room (get teamId from subtopic's topic)
      const io = req.app.get("io");
      if (io && subtopic.topic?.teamId) {
        io.to(`team:${subtopic.topic.teamId}`).emit("subtopic:created", { topicId, subtopic });
      }

      res.status(201).json({
        success: true,
        message: "Subtopic successfully created",
        data: subtopic,
      });
    } catch (error) {
      _next(error);
    }
  },

  getSubtopics: async (req, res, _next) => {
    try {
      const { topicId } = req.params;
      const subtopics = await TopicService.getSubtopics(topicId);

      res.status(200).json({
        success: true,
        message: "Subtopics retrieved successfully",
        data: subtopics,
      });
    } catch (error) {
      _next(error);
    }
  },

  updateSubtopic: async (req, res, _next) => {
    try {
      const { subtopicId } = req.params;
      const updatedSubtopic = await TopicService.updateSubtopic(subtopicId, req.body);

      // Emit WebSocket event to team room
      const io = req.app.get("io");
      if (io && updatedSubtopic.teamId) {
        io.to(`team:${updatedSubtopic.teamId}`).emit("subtopic:updated", { subtopicId, subtopic: updatedSubtopic });
      }

      res.status(200).json({
        success: true,
        message: "Subtopic successfully updated",
        data: updatedSubtopic,
      });
    } catch (error) {
      _next(error);
    }
  },

  deleteSubtopic: async (req, res, _next) => {
    try {
      const { subtopicId } = req.params;

      const result = await TopicService.deleteSubtopic(subtopicId);

      // Emit WebSocket event to team room
      const io = req.app.get("io");
      if (io && result.teamId) {
        io.to(`team:${result.teamId}`).emit("subtopic:deleted", { subtopicId });
      }

      res.status(200).json({
        success: true,
        message: "Subtopic successfully deleted",
        data: result,
      });

    } catch (error) {
      _next(error);
    }
  }
};