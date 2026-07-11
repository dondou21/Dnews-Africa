import { workflowRepository } from "../repositories/workflowRepository";

export const notificationService = {
  async notifyArticleSubmitted(article: { id: string; title: string; author: { id: string; firstName: string; lastName: string } }) {
    const editors = await workflowRepository.getEditors();
    for (const editor of editors) {
      if (editor.id === article.author.id) continue;
      await workflowRepository.createNotification({
        userId: editor.id,
        type: "article_submitted",
        title: "Article Submitted for Review",
        message: `${article.author.firstName} ${article.author.lastName} submitted "${article.title}" for review.`,
        link: `/dashboard/editorial/review`,
        articleId: article.id,
      });
    }
  },

  async notifyRequestChanges(article: { id: string; title: string }, authorId: string, editorName: string) {
    await workflowRepository.createNotification({
      userId: authorId,
      type: "changes_requested",
      title: "Changes Requested",
      message: `${editorName} requested changes to "${article.title}".`,
      link: `/dashboard/articles/${article.id}/edit`,
      articleId: article.id,
    });
  },

  async notifyApproved(article: { id: string; title: string }, authorId: string) {
    await workflowRepository.createNotification({
      userId: authorId,
      type: "article_approved",
      title: "Article Approved",
      message: `"${article.title}" has been approved.`,
      link: `/dashboard/articles/${article.id}`,
      articleId: article.id,
    });
  },

  async notifyPublished(article: { id: string; title: string }, authorId: string, publishedUrl: string) {
    await workflowRepository.createNotification({
      userId: authorId,
      type: "article_published",
      title: "Article Published",
      message: `"${article.title}" has been published.`,
      link: publishedUrl,
      articleId: article.id,
    });
  },

  async notifyAssigned(article: { id: string; title: string }, editorId: string, assignerName: string) {
    await workflowRepository.createNotification({
      userId: editorId,
      type: "article_assigned",
      title: "Article Assigned",
      message: `${assignerName} assigned "${article.title}" to you.`,
      link: `/dashboard/editorial/review`,
      articleId: article.id,
    });
  },

  async notifyResubmitted(article: { id: string; title: string; author: { id: string; firstName: string; lastName: string } }) {
    const editors = await workflowRepository.getEditors();
    for (const editor of editors) {
      if (editor.id === article.author.id) continue;
      await workflowRepository.createNotification({
        userId: editor.id,
        type: "article_resubmitted",
        title: "Article Resubmitted",
        message: `${article.author.firstName} ${article.author.lastName} resubmitted "${article.title}" for review.`,
        link: `/dashboard/editorial/review`,
        articleId: article.id,
      });
    }
  },
};
