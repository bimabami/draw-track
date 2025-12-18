import { handleLocalUpload } from "../utils/localStorage.js";
import { CommentRepository } from "../repositories/comment.repository.js";
import { CustomError } from "../utils/customError.js";
import { TaskRepository } from "../repositories/task.repository.js";
import { TeamRepository } from "../repositories/team.repository.js";
import { NotificationService } from "./notification.service.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import prisma from "../db/index.js";

// Helper to extract @mentions from comment body
function extractMentions(body) {
  if (!body) return [];
  // Match @username patterns (alphanumeric, dots, underscores, hyphens)
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const matches = [...body.matchAll(mentionRegex)];
  return matches.map(match => match[1]);
}

// Helper to get io instance
const getIO = () => {
  try {
    // Dynamic import to avoid circular dependency
    return import('../index.js').then(m => m.io);
  } catch {
    return null;
  }
};

export const CommentService = {
  createComment: async (taskId, userId, body, parentId) => {
    const task = await TaskRepository.GetById(taskId);
    if (!task) throw new CustomError(404, "Task not found");
    
    // Get navigation data for the notification
    const subtopic = task.subtopic;
    let navigationData = {};
    if (subtopic) {
      // Get topic and team info
      const topic = await prisma.topic.findUnique({
        where: { id: subtopic.topicId },
        include: { team: true }
      });
      if (topic) {
        navigationData = {
          teamId: topic.teamId,
          topicId: topic.id,
          subTopicId: subtopic.id,
          teamName: topic.team?.name || "",
          topicName: topic.title || "",
          subTopicName: subtopic.title || "",
        };
      }
    }

    const comment = await CommentRepository.Create({
      body,
      authorId: userId,
      taskId,
      parentId: parentId || null,
    });

    // Handle @mentions - create notifications for mentioned users
    const mentionedUsernames = extractMentions(body);
    if (mentionedUsernames.length > 0) {
      // Get the author's info for the notification
      const author = await AuthRepository.FindById(userId);
      const authorName = author?.name || author?.username || "Someone";

      for (const username of mentionedUsernames) {
        try {
          // Find user by username
          const mentionedUser = await AuthRepository.FindByUsername(username);
          if (mentionedUser && mentionedUser.id !== userId) {
            // Create notification for the mentioned user
            const notification = await NotificationService.createMentionNotification(
              mentionedUser.id,
              authorName,
              taskId,
              task.title,
              body,
              navigationData
            );
            
            // Emit socket event for real-time notification
            try {
              const io = await getIO();
              if (io) {
                io.to(`user:${mentionedUser.id}`).emit("notification:new", notification);
              }
            } catch (socketErr) {
              console.log("Could not emit notification socket event:", socketErr.message);
            }
          }
        } catch (err) {
          // Ignore errors for invalid mentions - user might not exist
          console.log(`Could not create notification for @${username}:`, err.message);
        }
      }
    }

    return comment;
  },

  getComments: async (taskId) => {
    const comments = await CommentRepository.FindByTask(taskId);
    return comments;
  },

  uploadAttachment: async (commentId, file) => {
    if (!file) throw new CustomError(400, "File required");

    // Use local file storage instead of Cloudinary
    const result = await handleLocalUpload(file.buffer, file.originalname, "comments");

    const attachment = await CommentRepository.CreateAttachment({
      commentId,
      filename: file.originalname,
      url: result.url,
      mimeType: file.mimetype,
      size: file.size,
    });

    return attachment;
  },

  deleteComment: async (commentId, userId, role) => {
    const comment = await CommentRepository.FindById(commentId);
    if (!comment) throw new CustomError(404, "Comment not found");

    if (comment.authorId !== userId && role !== "MANAGER") {
      throw new CustomError(403, "You don't have permission for this action");
    }

    const deletedComment = await CommentRepository.Delete(commentId);
    return deletedComment;
  },
};