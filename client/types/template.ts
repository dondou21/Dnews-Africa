export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  content: string;
  thumbnail: string | null;
  isDefault: boolean;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  subject: string;
  content: string;
  thumbnail?: string;
  isDefault?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  subject?: string;
  content?: string;
  thumbnail?: string;
  isDefault?: boolean;
}
