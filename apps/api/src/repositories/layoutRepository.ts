import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

const layoutInclude = {
  sections: { orderBy: { position: "asc" as const } },
  createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

export const layoutRepository = {
  async findAll(params: { page: number; limit: number; search?: string; status?: string }) {
    const where: Prisma.HomePageLayoutWhereInput = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.status && params.status !== "ALL") where.status = params.status as $Enums.LayoutStatus;

    const skip = (params.page - 1) * params.limit;
    const [layouts, total] = await Promise.all([
      prisma.homePageLayout.findMany({
        where, orderBy: { updatedAt: "desc" }, skip, take: params.limit,
        include: { ...layoutInclude, _count: { select: { sections: true } } },
      }),
      prisma.homePageLayout.count({ where }),
    ]);
    return { layouts, pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) } };
  },

  async findById(id: string) {
    return prisma.homePageLayout.findUnique({ where: { id }, include: layoutInclude });
  },

  async findBySlug(slug: string) {
    return prisma.homePageLayout.findUnique({ where: { slug }, include: layoutInclude });
  },

  async findPublished() {
    return prisma.homePageLayout.findFirst({
      where: { status: "PUBLISHED", isDefault: true },
      include: layoutInclude,
    });
  },

  async create(data: {
    name: string; slug: string; status?: string; isDefault?: boolean;
    scheduledAt?: string | null; settings?: any; createdById: string;
  }) {
    return prisma.homePageLayout.create({
      data: {
        name: data.name, slug: data.slug,
        status: (data.status as $Enums.LayoutStatus) ?? "DRAFT",
        isDefault: data.isDefault ?? false,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        settings: data.settings ?? {},
        createdById: data.createdById,
      },
      include: layoutInclude,
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    if (typeof data.scheduledAt === "string") {
      data.scheduledAt = new Date(data.scheduledAt);
    }
    if (data.isDefault === true) {
      await prisma.homePageLayout.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }
    return prisma.homePageLayout.update({ where: { id }, data: data as Prisma.HomePageLayoutUpdateInput, include: layoutInclude });
  },

  async delete(id: string) {
    return prisma.homePageLayout.delete({ where: { id } });
  },

  async publish(id: string) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      const current = await tx.homePageLayout.findUnique({ where: { id } });
      const version = (current?.version ?? 0) + 1;
      await tx.homePageLayout.updateMany({
        where: { status: "PUBLISHED", id: { not: id } },
        data: { status: "ARCHIVED" },
      });
      return tx.homePageLayout.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt: now, version },
        include: layoutInclude,
      });
    });
  },

  async saveSections(layoutId: string, sections: any[]) {
    await prisma.homePageSection.deleteMany({ where: { layoutId } });
    if (sections.length > 0) {
      await prisma.homePageSection.createMany({
        data: sections.map((s, i) => ({
          layoutId,
          type: s.type,
          title: s.title ?? null,
          subtitle: s.subtitle ?? null,
          position: s.position ?? i,
          settings: s.settings ?? {},
          visible: s.visible ?? true,
        })),
      });
    }
    return prisma.homePageLayout.findUnique({ where: { id: layoutId }, include: layoutInclude });
  },

  async getVersionHistory(id: string) {
    return prisma.homePageLayout.findMany({
      where: { id },
      select: { id: true, name: true, status: true, version: true, publishedAt: true, updatedAt: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { version: "desc" },
    });
  },
};
