import { describe, expect, it } from "vitest";
import { rolePermissions } from "@factory/shared";

describe("RBAC permissions", () => {
  it("allows owner full administration", () => {
    expect(rolePermissions.OWNER).toContain("users:manage");
    expect(rolePermissions.OWNER).toContain("settings:manage");
    expect(rolePermissions.OWNER).toContain("campaigns:manage");
  });

  it("prevents marketing employees from managing settings and users", () => {
    expect(rolePermissions.MARKETING_EMPLOYEE).not.toContain("settings:manage");
    expect(rolePermissions.MARKETING_EMPLOYEE).not.toContain("users:manage");
  });
});
