import { Router } from "express";
import { workflowController } from "../controllers/workflowController";
import { authenticate } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.use(authenticate);

router.get("/stats", requireRole("Admin", "Editor", "Journalist"), workflowController.getWorkflowStats);
router.get("/articles", requireRole("Admin", "Editor", "Journalist"), workflowController.getEditorialArticles);
router.get("/notifications", requireRole("Admin", "Editor", "Journalist", "Moderator"), workflowController.getNotifications);
router.patch("/notifications/:id/read", requireRole("Admin", "Editor", "Journalist", "Moderator"), workflowController.markNotificationRead);
router.get("/editors", requireRole("Admin", "Editor"), workflowController.getEditors);

router.post("/articles/:id/submit", requireRole("Admin", "Editor", "Journalist"), workflowController.submitForReview);
router.post("/articles/:id/approve", requireRole("Admin", "Editor"), workflowController.approve);
router.post("/articles/:id/request-changes", requireRole("Admin", "Editor"), workflowController.requestChanges);
router.post("/articles/:id/reject", requireRole("Admin", "Editor"), workflowController.reject);
router.post("/articles/:id/schedule", requireRole("Admin", "Editor"), workflowController.schedule);
router.post("/articles/:id/publish", requireRole("Admin", "Editor"), workflowController.publish);
router.post("/articles/:id/archive", requireRole("Admin", "Editor"), workflowController.archive);
router.post("/articles/:id/restore", requireRole("Admin", "Editor", "Journalist"), workflowController.restore);
router.post("/articles/:id/assign", requireRole("Admin", "Editor"), workflowController.assignEditor);
router.patch("/articles/:id/status", requireRole("Admin", "Editor", "Journalist"), workflowController.changeStatus);

router.get("/articles/:id/workflow", requireRole("Admin", "Editor", "Journalist"), workflowController.getWorkflowData);

router.get("/articles/:id/comments", requireRole("Admin", "Editor", "Journalist"), workflowController.getComments);
router.post("/articles/:id/comments", requireRole("Admin", "Editor", "Journalist"), workflowController.createComment);
router.patch("/comments/:commentId/resolve", requireRole("Admin", "Editor"), workflowController.resolveComment);

router.get("/articles/:id/revisions", requireRole("Admin", "Editor", "Journalist"), workflowController.getRevisions);
router.get("/articles/:id/revisions/:version", requireRole("Admin", "Editor", "Journalist"), workflowController.getRevision);
router.post("/articles/:id/revisions/:version/restore", requireRole("Admin", "Editor", "Journalist"), workflowController.restoreRevision);

router.get("/articles/:id/approvals", requireRole("Admin", "Editor", "Journalist"), workflowController.getApprovals);
router.get("/articles/:id/audit-log", requireRole("Admin", "Editor", "Journalist"), workflowController.getAuditLog);

export default router;
