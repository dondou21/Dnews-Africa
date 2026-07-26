import { Router, Request, Response } from "express";
import { eventService } from "../../../services/eventService";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(":\n\n");

  eventService.addSseClient(res);

  const keepAlive = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
    eventService.removeSseClient(res);
  });
});

export default router;
