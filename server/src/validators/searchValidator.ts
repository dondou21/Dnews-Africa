import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().max(200, "Search query too long").optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(["latest", "oldest", "relevance"]).optional().default("latest"),
});
