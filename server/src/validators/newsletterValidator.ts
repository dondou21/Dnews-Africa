import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
});
