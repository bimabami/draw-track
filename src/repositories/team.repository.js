import prisma from "../db/index.js";

export const TeamRepository = {
  Create: async (payload) => {
    const { name, description, ownerId, topics } = payload;
    
    // Prepare topics data if provided
    const topicsData = topics && topics.length > 0 ? {
      create: topics.map(topic => ({
        title: topic.name,
        subtopics: {
          create: topic.subTopics?.map(subtopic => ({
            title: subtopic.name,
            description: subtopic.description || ""
          })) || []
        }
      }))
    } : undefined;
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: {
            role: "MANAGER",
            user: {
              connect: {
                id: ownerId
              }
            }
          },
        },
        ...(topicsData && { topics: topicsData })
      },
      include: { 
        members: true,
        topics: {
          include: {
            subtopics: true
          }
        }
      },
    });
    return team;
  },

  GetTeamsByUser: (userId) => {
    return prisma.userTeam.findMany({
      where: { userId },
      include: { 
        team: {
          include: {
            topics: {
              include: {
                subtopics: true
              }
            }
          }
        }
      },
    });
  },

  GetTeamById: async (teamId) => {
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      },
    });
  },

  Update: async (teamId, data) => {
    return prisma.team.update({ where: { id: teamId }, data });
  },

  Delete: async (teamId) => {
    return prisma.team.delete({ where: { id: teamId } });
  },

  IsMember: async (teamId, userId) => {
    const membership = await prisma.userTeam.findFirst({
      where: { teamId, userId },
      select: { id: true },
    });
    return !!membership;
  },

  FindMembership: async (teamId, userId) => {
    return prisma.userTeam.findFirst({
      where: { teamId, userId },
      select: { id: true, role: true },
    });
  },

  GetMembershipById: async (membershipId) => {
    return prisma.userTeam.findUnique({
      where: { id: membershipId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        }
      }
    });
  },

  AddMember: async (teamId, userId, role = "STAFF") => {
    return prisma.userTeam.create({
      data: {
        teamId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        }
      }
    });
  },

  RemoveMember: async (membershipId) => {
    return prisma.userTeam.delete({
      where: { id: membershipId },
    });
  },

  UpdateMemberRole: async (membershipId, role) => {
    return prisma.userTeam.update({
      where: { id: membershipId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        }
      }
    });
  },
};