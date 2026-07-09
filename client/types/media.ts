export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";

export interface MediaItem {
  id: string;
  url: string;
  alt: string | null;
  type: MediaType;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  uploadedById: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}
