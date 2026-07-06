import { z } from "zod";

export const mediaIdSchema = z.object({
  id: z.string().uuid("Invalid media ID"),
});
