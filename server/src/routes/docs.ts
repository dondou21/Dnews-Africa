import { Router, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerDoc } from "../config/swagger";
import { config } from "../config";

const router = Router();

if (config.enableApiDocs) {
  router.use("/", swaggerUi.serve);
  router.get("/", swaggerUi.setup(swaggerDoc, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Dnews Africa API Docs",
  }));
} else {
  router.get("/", (_req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "API documentation is disabled" });
  });
}

export default router;