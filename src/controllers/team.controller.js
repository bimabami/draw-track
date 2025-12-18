import * as Yup from 'yup';
import { CustomError } from '../utils/customError.js';
import { TeamService } from '../services/team.service.js';
import { CreateTeamSchema } from '../utils/validations/team.validation.js';


export const TeamController = {
  createTeam: async (req, res, _next) => {
    try {
      const { name, description, topics } = req.body;

      await CreateTeamSchema.validate(req.body, {
        abortEarly: false,
      });

      const team = await TeamService.createTeam(req.user.id, name, description, topics);

      // No WebSocket emit needed - creator gets team from API response
      // Other users will see team when they are invited (via member:invited)

      res.status(201).json({
        success: true,
        message: "Team successfully created",
        data: team,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        _next(new CustomError(400, "Validation failed!", error.errors));
      }
      _next(error);
    }
  },

  getMyTeams: async (req, res, _next) => {
    try {
      const teams = await TeamService.getMyTeams(req.user.id);

      res.status(200).json({
        success: true,
        message: "Teams retrieved successfully",
        data: teams,
      });
    } catch (error) {
      _next(error);
    }
  },

  getTeamDetails: async (req, res, _next) => {
    try {
      const { teamId } = req.params;
      const team = await TeamService.getTeamDetails(teamId);

      res.status(200).json({
        success: true,
        message: "Team details retrieved successfully",
        data: team,
      });
    } catch (error) {
      _next(error);
    }
  },

  updateTeam: async (req, res, _next) => {
    try {
      const { teamId } = req.params;

      const updatedTeam = await TeamService.updateTeam(teamId, req.body);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.to(`team:${teamId}`).emit("team:updated", updatedTeam);

      res.status(200).json({
        success: true,
        message: "Team updated successfully",
        data: updatedTeam,
      });
    } catch (error) {
      _next(error);
    }
  },

  deleteTeam: async (req, res, _next) => {
    try {
      const { teamId } = req.params;

      // Get team members before deletion so we can notify them
      const teamDetails = await TeamService.getTeamDetails(teamId);
      const memberIds = teamDetails.members?.map(m => m.userId) || [];
      
      const deletedTeam = await TeamService.deleteTeam(teamId);

      // Emit WebSocket event to all team members' user rooms
      const io = req.app.get("io");
      if (io) {
        memberIds.forEach(userId => {
          io.to(`user:${userId}`).emit("team:deleted", teamId);
        });
      }

      res.status(200).json({
        success: true,
        message: "Team deleted successfully",
        data: deletedTeam,
      });

    } catch (error) {
      _next(error);
    }
  },

  addMember: async (req, res, _next) => {
    try {
      const { teamId } = req.params;
      const { email, role } = req.body;

      const member = await TeamService.addMember(teamId, email, role);

      // Emit WebSocket event to team room and only to the invited user
      const io = req.app.get("io");
      if (io) {
        io.to(`team:${teamId}`).emit("member:added", { teamId, member });
        // Only notify the invited user, not everyone
        if (member.userId) {
          io.to(`user:${member.userId}`).emit("member:invited", { teamId, member });
        }
      }

      res.status(201).json({
        success: true,
        message: "Member added successfully",
        data: member,
      });
    } catch (error) {
      _next(error);
    }
  },

  removeMember: async (req, res, _next) => {
    try {
      const { teamId, memberId } = req.params;

      await TeamService.removeMember(teamId, memberId);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.to(`team:${teamId}`).emit("member:removed", { teamId, memberId });

      res.status(200).json({
        success: true,
        message: "Member removed successfully",
      });
    } catch (error) {
      _next(error);
    }
  },

  updateMemberRole: async (req, res, _next) => {
    try {
      const { teamId, memberId } = req.params;
      const { role } = req.body;

      const updatedMember = await TeamService.updateMemberRole(teamId, memberId, role);

      // Emit WebSocket event
      const io = req.app.get("io");
      if (io) io.to(`team:${teamId}`).emit("member:updated", { teamId, memberId, member: updatedMember });

      res.status(200).json({
        success: true,
        message: "Member role updated successfully",
        data: updatedMember,
      });
    } catch (error) {
      _next(error);
    }
  },
};