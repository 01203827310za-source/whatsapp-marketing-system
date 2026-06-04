import { Role } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../utils/http";
import { hashPassword, verifyPassword } from "../utils/password";

export const userService = {
  async create(input: { email: string; name: string; password: string; role: Role }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new HttpError(409, "A user with this email already exists");
    const passwordHash = await hashPassword(input.password);
    const { passwordHash: _passwordHash, ...user } = await userRepository.create({
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash
    });
    return user;
  },

  async update(id: string, input: { name?: string; role?: Role; isActive?: boolean }) {
    const existing = await userRepository.findById(id);
    if (!existing) throw new HttpError(404, "User not found");
    const { passwordHash: _passwordHash, ...user } = await userRepository.update(id, input);
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new HttpError(404, "User not found");
    const validPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!validPassword) throw new HttpError(401, "Current password is incorrect");
    await userRepository.update(userId, { passwordHash: await hashPassword(newPassword) });
    return { changed: true };
  }
};
