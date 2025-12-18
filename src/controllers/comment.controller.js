import { CommentService } from "../services/comment.service.js";

export const CommentController = {
  create: async (req, res, _next) => {
    try {
      const { teamId, taskId, parentId } = req.params;
      const { body } = req.body;

      const comment = await CommentService.createComment(
        taskId,
        req.user.id,
        body,
        parentId
      );

      const io = req.app.get("io");
      if (io) io.to(`task:${taskId}`).emit("comment:new", comment);

      res
        .status(201)
        .json({ success: true, message: "Comment added", data: comment });
    } catch (err) {
      _next(err);
    }
  },

  list: async (req, res, _next) => {
    try {
      const { taskId } = req.params;

      const comments = await CommentService.getComments(taskId);

      res
        .status(200)
        .json({ success: true, message: "Comments retrieved", data: comments });
    } catch (err) {
      _next(err);
    }
  },

  uploadFile: async (req, res, _next) => {
    try {
      const { commentId, taskId } = req.params;
      const attachment = await CommentService.uploadAttachment(
        commentId,
        req.file
      );

      const io = req.app.get("io");
      if (io) {
        // Send clean attachment data with explicit commentId
        io.to(`task:${taskId}`).emit("comment:file", {
          id: attachment.id,
          commentId: commentId,
          filename: attachment.filename,
          url: attachment.url,
          size: attachment.size,
        });
      }

      res
        .status(201)
        .json({ success: true, message: "File uploaded", data: attachment });
    } catch (err) {
      _next(err);
    }
  },

  delete: async (req, res, _next) => {
    try {
      const { commentId, taskId } = req.params;

      const deletedComment = await CommentService.deleteComment(
        commentId,
        req.user.id,
        req.user.role
      );

      const io = req.app.get("io");
      if (io) io.to(`task:${taskId}`).emit("comment:delete", commentId);

      res
        .status(200)
        .json({ success: true, message: "Deleted", data: deletedComment });
    } catch (err) {
      _next(err);
    }
  },
};
