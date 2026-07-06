import prisma from "../utils/prisma";

export const mediaRepository = {
  create: (data: {
    url: string;
    alt?: string;
    type: string;
    fileSize?: number;
    width?: number;
    height?: number;
    uploadedById: string;
  }) =>
    prisma.media.create({
      data: {
        url: data.url,
        alt: data.alt,
        type: data.type as any,
        fileSize: data.fileSize,
        width: data.width,
        height: data.height,
        uploadedById: data.uploadedById,
      },
    }),

  findAll: () =>
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),

  findById: (id: string) =>
    prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),

  delete: (id: string) =>
    prisma.media.delete({ where: { id } }),
};
