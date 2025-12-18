import * as Yup from 'yup';
import { CustomError } from '../utils/customError.js';
import { TaskService } from '../services/task.service.js';

export const TaskController = {
  createTask: async (req, res, _next) => {
    try {
      const { subtopicId } = req.params;

      const task = await TaskService.createTask(req.user.id, subtopicId, req.body);

      // Emit WebSocket event to team room (get teamId from task's subtopic)
      const io = req.app.get("io");
      if (io && task.subtopic?.topic?.teamId) {
        io.to(`team:${task.subtopic.topic.teamId}`).emit("task:created", { subtopicId, task });
      }

      res.status(201).json({
        success: true,
        message: "Task successfully created",
        data: task,
      });
    } catch (error) {
      _next(error);
    }
  },

  getTasksBySubtopic: async (req, res, _next) => {
    try {
      const { subtopicId } = req.params;
      const tasks = await TaskService.getTasksBySubtopic(subtopicId);

      res.status(200).json({
        success: true,
        message: "Tasks successfully retrieved",
        data: tasks,
      });
    } catch (error) {
      _next(error);
    }
  },

  getTaskById: async (req, res, _next) => {
    try {
      const { taskId } = req.params;
      const task = await TaskService.getTaskById(taskId);

      res.status(200).json({
        success: true,
        message: "Task successfully retrieved",
        data: task,
      });
    } catch (error) {
      _next(error);
    }
  },

  updateTask: async (req, res, _next) => {
    try {
      const { taskId } = req.params;
      const updatedTask = await TaskService.updateTask(taskId, req.body);

      // Emit WebSocket event to team room
      const io = req.app.get("io");
      if (io) {
        // Emit to both task room and team room for real-time updates
        io.to(`task:${taskId}`).emit("task:updated", updatedTask);
        if (updatedTask.subtopic?.topic?.teamId) {
          io.to(`team:${updatedTask.subtopic.topic.teamId}`).emit("task:updated", updatedTask);
        }
      }

      res.status(200).json({
        success: true,
        message: "Task successfully updated",
        data: updatedTask,
      });
    } catch (error) {
      _next(error);
    }
  },

  deleteTask: async (req, res, _next) => {
    try {
      const { taskId } = req.params;
      const deletedTask = await TaskService.deleteTask(taskId);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.emit("task:deleted", { taskId });

      res.status(200).json({
        success: true,
        message: "Task successfully deleted",
        data: deletedTask,
      });
    } catch (error) {
      _next(error);
    }
  },

  updateTaskStatus: async (req, res, _next) => {
    try {
      const { teamId, taskId } = req.params;
      const { status } = req.body;
      const task = await TaskService.updateTaskStatus(req.user.id, teamId, taskId, status);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.emit("task:status", { taskId, status, task });

      res.status(200).json({
        success: true,
        message: "Task status successfully updated",
        data: task,
      });
    } catch (error) {
      _next(error);
    }
  },

  updateTaskProgress: async (req, res, _next) => {
    try {
      const { teamId, taskId } = req.params;
      const { progress } = req.body;

      const task = await TaskService.updateTaskProgress(req.user.id, teamId, taskId, progress);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.emit("task:progress", { taskId, progress, task });

      res.status(200).json({
        success: true,
        message: "Task progress successfully updated",
        data: task,
      });
    } catch (error) {
      _next(error);
    }
  },
};