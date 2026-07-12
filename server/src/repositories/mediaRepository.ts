import prisma from "../utils/prisma";

export const mediaRepository = {
  create: (data: {
    url: string;
    alt?: string;
    type: string;
    fileSize?: number;
    width?: number;
    height?: number;
    originalName?: string;
    filename?: string;
    mimeType?: string;
    extension?: string;
    storageProvider?: string;
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
        originalName: data.originalName,
        filename: data.filename,
        mimeType: data.mimeType,
        extension: data.extension,
        storageProvider: data.storageProvider || "local",
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
