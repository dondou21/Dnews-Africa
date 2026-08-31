import prisma from "./prisma";

export async function warmUpPool(): Promise<void> {
  // Database warm-up removed to prevent unnecessary Neon compute consumption and parallel connection overhead.
}
