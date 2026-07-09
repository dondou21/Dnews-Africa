export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CommentItem {
  id: string;
  content: string;
  status: CommentStatus;
  articleId: string;
  article: {
    id: string;
    title: string;
    slug: string;
  };
  authorId: string | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
  guestName: string | null;
  guestEmail: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
