import { TaskRepository } from "../repositories/task.repository.js";
import { TeamRepository } from "../repositories/team.repository.js";
import { TopicRepository } from "../repositories/topic.repository.js";
import { CustomError } from "../utils/customError.js";


export const TaskService = {
  createTask: async (ownerId, subtopicId, payload) => {
    const { title, description, priority, startDate, dueDate, assigneeId } = payload;

    const subtopic = await TopicRepository.GetSubtopicById(subtopicId);
    if (!subtopic) throw new CustomError(404, "Subtopic not found");

    const teamId = subtopic.topic?.teamId;

    // Only validate assigneeId if it's provided
    if (assigneeId) {
      const isMember = await TeamRepository.IsMember(teamId, assigneeId);
      if (!isMember) throw new CustomError(400, "Assignee must be a member of the team");

      if (assigneeId === ownerId) throw new CustomError(400, "Manager cannot assign task to themselves");
    }

    const task = await TaskRepository.Create({
      title,
      description,
      priority,
      startDate,
      dueDate,
      assigneeId,
      ownerId,
      subtopicId,
    });

    return task;
  },

  getTasksBySubtopic: async (subtopicId) => {
    const tasks = await TaskRepository.GetBySubtopic(subtopicId);
    return tasks;
  },

  getTaskById: async (taskId) => {
    const task = await TaskRepository.GetById(taskId);
    if (!task) throw new CustomError(404, "Task not found");
    return task;
  },

  updateTask: async (taskId, data) => {
    const task = await TaskRepository.GetById(taskId);
    if (!task) throw new CustomError(404, "Task not found");

    const updatedTask = await TaskRepository.Update(taskId, data);
    return updatedTask;
  },

  deleteTask: async (taskId) => {
    const task = await TaskRepository.GetById(taskId);
    if (!task) throw new CustomError(404, "Task not found");

    await TaskRepository.Delete(taskId);

    return;
  },

  updateTaskStatus: async (userId, teamId, taskId, status) => {
    const task = await TaskRepository.GetById(taskId);
    if (!task) throw new CustomError(404, "Task not found");

    const membership = await TeamRepository.FindMembership(teamId, userId);
    if (!membership) throw new CustomError(403, "You are not a member of this team");

    if (["SUBMITTED", "APPROVED"].includes(status) && membership.role !== "MANAGER") {
      throw new CustomError(403, "Only manager can approve tasks");
    }

    const updatedTask = await TaskRepository.UpdateStatus(taskId, status);

    return updatedTask;
  },

  updateTaskProgress: async (userId, teamId, taskId, progress) => {
    const task = await TaskRepository.GetById(taskId);
    if (!task) throw new CustomError(404, "Task not found");

    const isMember = await TeamRepository.IsMember(teamId, userId);
    console.log(task.assigneeId, userId);
    if (!isMember) throw new CustomError(400, "Assignee must be a member of the team");

    if (task.assigneeId !== userId) {
      throw new CustomError(403, "You are not authorized to update this task");
    }

    const updatedTask = await TaskRepository.UpdateProgress(taskId, progress);

    return updatedTask;
  }
};