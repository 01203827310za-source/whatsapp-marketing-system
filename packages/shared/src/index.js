export const ROLES = ["OWNER", "MANAGER", "MARKETING_EMPLOYEE"];
export const CAMPAIGN_TYPES = ["NEW_MODEL", "DISCOUNT", "OFFER", "ANNOUNCEMENT"];
export const DELIVERY_STATUSES = ["PENDING", "SENT", "DELIVERED", "READ", "FAILED"];
export const rolePermissions = {
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
