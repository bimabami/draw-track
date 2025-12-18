import * as Yup from 'yup';
import { CustomError } from '../utils/customError.js';
import { DocumentService } from '../services/document.service.js';

export const DocumentController = {
  uploadDocument: async (req, res, _next) => {
    try {
      const { teamId, taskId } = req.params;
      const file = req.file;
      const type = req.body.type || "SHOP_DRAWING";

      const document = await DocumentService.uploadDocument(req.user.id, teamId, taskId, file, type);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.to(`task:${taskId}`).emit("document:uploaded", { taskId, document });

      res.status(201).json({
        success: true,
        message: "Document successfully uploaded",
        data: document,
      });
    } catch (error) {
      _next(error);
    }
  },

  listDocument: async (req, res, _next) => {
    try {
      const { teamId, taskId } = req.params;
      const type = req.query.type || null;

      const documents = await DocumentService.listDocument(req.user.id, teamId, taskId, type);

      res.status(200).json({
        success: true,
        message: "Documents successfully retrieved",
        data: documents,
      });
    } catch (error) {
      _next(error);
    }
  },

  deleteDocument: async (req, res, _next) => {
    try {
      const { teamId, taskId, docId } = req.params;

      const document = await DocumentService.deleteDocument(req.user.id, teamId, taskId, docId);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.to(`task:${taskId}`).emit("document:deleted", { taskId, docId });

      res.status(200).json({
        success: true,
        message: "Document successfully deleted",
        data: document,
      });
    } catch (error) {
      _next(error);
    }
  }
};