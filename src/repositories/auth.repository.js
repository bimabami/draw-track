import prisma from "../db/index.js";

export const AuthRepository = {
  Create: async (payload) => {
    const user = await prisma.user.create({
      data: payload,
    });

    return user;
  },

  FindById: async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
    });

    return user;
  },

  FindByEmail: async (email) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  },

  FindByUsername: async (username) => {
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
      },
    });

    return user;
  },

  FindAll: async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  },

  DeleteById: async (id) => {
    const user = await prisma.user.delete({
      where: { id },
    });

    return user;
  },
};