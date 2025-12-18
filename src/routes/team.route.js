import express from 'express';
import { verifyToken } from "../middlewares/auth.middleware.js";
import { TeamController } from '../controllers/team.controller.js';
import { rbacTeam, TeamRoleAccess } from "../middlewares/rbac.middleware.js";


const router = express.Router();

router.post("/", verifyToken, TeamController.createTeam);
router.get("/", verifyToken, TeamController.getMyTeams);
router.get("/:teamId", verifyToken, TeamController.getTeamDetails);
router.put("/:teamId", verifyToken, rbacTeam([TeamRoleAccess.MANAGER]), TeamController.updateTeam);
router.delete("/:teamId", verifyToken, rbacTeam([TeamRoleAccess.MANAGER]), TeamController.deleteTeam);

// Member management routes
router.post("/:teamId/members", verifyToken, rbacTeam([TeamRoleAccess.MANAGER]), TeamController.addMember);
router.delete("/:teamId/members/:memberId", verifyToken, rbacTeam([TeamRoleAccess.MANAGER]), TeamController.removeMember);
router.put("/:teamId/members/:memberId", verifyToken, rbacTeam([TeamRoleAccess.MANAGER]), TeamController.updateMemberRole);

export default router;