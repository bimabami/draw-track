import express from "express";
import { CommentController } from "../controllers/comment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import uploadMiddleware from "../middlewares/upload.middleware.js";
import { rbacTeam, TeamRoleAccess } from "../middlewares/rbac.middleware.js";

const router = express.Router();

router.post("/:teamId/task/:taskId/comments", verifyToken, rbacTeam([TeamRoleAccess.MANAGER, TeamRoleAccess.STAFF]), CommentController.create);

router.post("/:teamId/task/:taskId/comments/:parentId", verifyToken, rbacTeam([TeamRoleAccess.MANAGER, TeamRoleAccess.STAFF]), CommentController.create);

router.get("/:teamId/task/:taskId/comments", verifyToken, rbacTeam([TeamRoleAccess.MANAGER, TeamRoleAccess.STAFF]), CommentController.list);

router.post("/:teamId/task/:taskId/comments/:commentId/file", verifyToken, rbacTeam([TeamRoleAccess.MANAGER, TeamRoleAccess.STAFF]), uploadMiddleware.single, CommentController.uploadFile);

router.delete("/:teamId/task/:taskId/comments/:commentId", verifyToken, rbacTeam([TeamRoleAccess.MANAGER, TeamRoleAccess.STAFF]), CommentController.delete);

export default router;