import prisma from "../db/index.js";

export const DocumentRepository = {
  Upload: async (taskId, uploadResult, uploaderId, originalFilename, type = "SHOP_DRAWING") => {
    const url = uploadResult?.url;
    if (!url) throw new Error("File upload failed: url missing");

    const filename = originalFilename;

    const document = await prisma.document.create({
      data: {
        taskId,
        uploadedById: uploaderId,
        filename,
        url,
        type,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return document;
  },

  ListByTask: async (taskId, type = null) => {
    const where = { taskId };
    if (type) {
      where.type = type;
    }
    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { id: true, name: true },
        },
      },
    });
    return documents;
  },

  GetById: async (docId) => {
    const document = await prisma.document.findUnique({
      where: { id: docId },
    });
    return document;
  },

  Delete: async (docId) => {
    const document = await prisma.document.delete({
      where: { id: docId },
    });
    return document;
  },
}