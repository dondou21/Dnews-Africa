import { contactRepository } from "../repositories/contactRepository";

export const contactService = {
  async create(data: { name: string; email: string; subject: string; message: string }) {
    return contactRepository.create(data);
  },

  async getAll() {
    return contactRepository.findAll();
  },
};
