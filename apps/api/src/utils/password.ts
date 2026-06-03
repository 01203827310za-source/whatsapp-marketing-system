import bcrypt from "bcrypt";

const passwordSaltRounds = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, passwordSaltRounds);
export const verifyPassword = (password: string, passwordHash: string) => bcrypt.compare(password, passwordHash);
