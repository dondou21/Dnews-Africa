import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import { cache } from "../utils/cache";

const SPONSOR_CACHE_TTL = 5 * 60 * 1000;
const ACTIVE_KEY = "sponsors:active";
const ALL_KEY = "sponsors:all";

function invalidateSponsorCache() {
  cache.del(ACTIVE_KEY);
  cache.del(ALL_KEY);
}

export interface CreateSponsorInput {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  altText?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateSponsorInput {
  name?: string;
  logoUrl?: string;
  websiteUrl?: string;
  altText?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface SponsorQueryParams {
  page: number;
  limit: number;
  search?: string;
}

export const sponsorRepository = {
  async findActive() {
    return cache.wrap(ACTIVE_KEY, SPONSOR_CACHE_TTL, () =>
      prisma.sponsor.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      })
    );
  },

  async findAll(params: SponsorQueryParams) {
    return cache.wrap(
      `${ALL_KEY}:${JSON.stringify(params)}`,
      SPONSOR_CACHE_TTL,
      async () => {
        const where: Prisma.SponsorWhereInput = {};
        if (params.search) {
          where.OR = [
            { name: { contains: params.search, mode: "insensitive" } },
            { altText: { contains: params.search, mode: "insensitive" } },
          ];
        }

        const skip = (params.page - 1) * params.limit;

        const [sponsors, total] = await Promise.all([
          prisma.sponsor.findMany({
            where,
            orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
            skip,
            take: params.limit,
          }),
          prisma.sponsor.count({ where }),
        ]);

        return {
          sponsors,
          pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages: Math.ceil(total / params.limit),
          },
        };
      }
    );
  },

  async findById(id: string) {
    return prisma.sponsor.findUnique({ where: { id } });
  },

  async create(data: CreateSponsorInput) {
    const sponsor = await prisma.sponsor.create({ data });
    invalidateSponsorCache();
    return sponsor;
  },

  async update(id: string, data: UpdateSponsorInput) {
    const sponsor = await prisma.sponsor.update({ where: { id }, data });
    invalidateSponsorCache();
    return sponsor;
  },

  async delete(id: string) {
    const sponsor = await prisma.sponsor.delete({ where: { id } });
    invalidateSponsorCache();
    return sponsor;
  },
};
