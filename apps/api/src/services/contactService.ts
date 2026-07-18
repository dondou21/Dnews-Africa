import { contactRepository } from "../repositories/contactRepository";
import { AppError } from "../middlewares/errorHandler";

export const contactService = {
  async create(data: { name: string; email: string; subject: string; message: string }) {
    return contactRepository.create(data);
  },

  async getAll() {
    return contactRepository.findAll();
  },

  async markAsRead(id: string) {
    const message = await contactRepository.findById(id);
    if (!message) throw new AppError("Message not found", 404);
    return contactRepository.update(id, { isRead: true });
  },

  async delete(id: string) {
    const message = await contactRepository.findById(id);
    if (!message) throw new AppError("Message not found", 404);
    return contactRepository.delete(id);
  },
};
