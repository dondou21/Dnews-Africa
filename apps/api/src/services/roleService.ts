import { roleRepository } from "../repositories/roleRepository";

export const roleService = {
  async getAll() {
    return roleRepository.findAll();
  },
};
