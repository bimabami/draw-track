import { TeamRepository } from "../repositories/team.repository.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { CustomError } from "../utils/customError.js";

export const TeamService = {
  createTeam: async (userId, name, description, topics) => {
    const team = await TeamRepository.Create({
      name,
      description,
      ownerId: userId,
      topics,
    });
    return team;
  },

  getMyTeams: async (userId) => {
    const teams = await TeamRepository.GetTeamsByUser(userId);
    return teams.map((userTeam) => userTeam.team);
  },

  getTeamDetails: async (teamId) => {
    const team = await TeamRepository.GetTeamById(teamId);

    if (!team) throw new CustomError(404, "Team not found");

    return team;
  },

  updateTeam: async (teamId, data) => {
    const updatedTeam = await TeamRepository.Update(teamId, data);
    return updatedTeam;
  },

  deleteTeam: async (teamId) => {
    return await TeamRepository.Delete(teamId);
  },

  addMember: async (teamId, email, role = "STAFF") => {
    // Find user by email
    const user = await AuthRepository.FindByEmail(email);
    if (!user) throw new CustomError(404, "User not found");

    // Check if already a member
    const existingMembership = await TeamRepository.FindMembership(teamId, user.id);
    if (existingMembership) throw new CustomError(400, "User is already a member of this team");

    // Use the user's global role from their account
    const memberRole = user.role || role;

    // If user is a MANAGER, check if team already has a manager
    if (memberRole === "MANAGER") {
      const team = await TeamRepository.GetTeamById(teamId);
      const existingManager = team.members.find(m => m.role === "MANAGER");
      if (existingManager) {
        throw new CustomError(400, "Manajer hanya bisa satu dalam tim");
      }
    }

    // Add member with their global role
    const member = await TeamRepository.AddMember(teamId, user.id, memberRole);
    return member;
  },

  removeMember: async (teamId, memberId) => {
    const membership = await TeamRepository.GetMembershipById(memberId);
    if (!membership) throw new CustomError(404, "Member not found");
    if (membership.teamId !== teamId) throw new CustomError(400, "Member does not belong to this team");

    await TeamRepository.RemoveMember(memberId);
  },

  updateMemberRole: async (teamId, memberId, role) => {
    const membership = await TeamRepository.GetMembershipById(memberId);
    if (!membership) throw new CustomError(404, "Member not found");
    if (membership.teamId !== teamId) throw new CustomError(400, "Member does not belong to this team");

    const updatedMember = await TeamRepository.UpdateMemberRole(memberId, role);
    return updatedMember;
  },
};