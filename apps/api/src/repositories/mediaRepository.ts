import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";
import { cache } from "../utils/cache";

const MEDIA_CACHE_TTL = 60 * 1000;
const MEDIA_ALL_KEY = "media:all";
const MEDIA_ITEM_KEY = (id: string) => `media:${id}`;

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
    publicId?: string;
    uploadedById: string;
  }) => {
    cache.del(MEDIA_ALL_KEY);
    return prisma.media.create({
      data: {
        url: data.url,
        alt: data.alt,
        type: data.type as $Enums.MediaType,
        fileSize: data.fileSize,
        width: data.width,
        height: data.height,
        originalName: data.originalName,
        filename: data.filename,
        mimeType: data.mimeType,
        extension: data.extension,
        storageProvider: data.storageProvider || "local",
        publicId: data.publicId,
        uploadedById: data.uploadedById,
      },
    });
  },

  findAll: () =>
    cache.wrap(MEDIA_ALL_KEY, MEDIA_CACHE_TTL, () =>
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      })
    ),

  findById: (id: string) =>
    cache.wrap(MEDIA_ITEM_KEY(id), MEDIA_CACHE_TTL, () =>
      prisma.media.findUnique({
        where: { id },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      })
    ),

  delete: (id: string) => {
    cache.del(MEDIA_ALL_KEY);
    cache.del(MEDIA_ITEM_KEY(id));
    return prisma.media.delete({ where: { id } });
  },
};
