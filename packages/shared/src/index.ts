export const ROLES = ["OWNER", "MANAGER", "MARKETING_EMPLOYEE"] as const;
export type Role = (typeof ROLES)[number];

export const CAMPAIGN_TYPES = ["NEW_MODEL", "DISCOUNT", "OFFER", "ANNOUNCEMENT"] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const DELIVERY_STATUSES = ["PENDING", "SENT", "DELIVERED", "READ", "FAILED"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export type Permission =
  | "users:manage"
  | "settings:manage"
  | "customers:view"
  | "customers:manage"
  | "campaigns:create"
  | "campaigns:manage"
  | "analytics:view";

export const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    "users:manage",
    "settings:manage",
    "customers:view",
    "customers:manage",
    "campaigns:create",
    "campaigns:manage",
    "analytics:view"
  ],
  MANAGER: ["customers:view", "customers:manage", "campaigns:create", "campaigns:manage", "analytics:view"],
  MARKETING_EMPLOYEE: ["customers:view", "campaigns:create"]
};

export const subscriptionKeywords = ["موافق", "نعم", "اشتراك", "subscribe", "yes", "ok"];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
