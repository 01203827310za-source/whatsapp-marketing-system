export type Role = "OWNER" | "MANAGER" | "MARKETING_EMPLOYEE";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
