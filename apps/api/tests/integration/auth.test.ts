import { describe, expect, it } from "vitest";
import { loginSchema, refreshSchema } from "../../src/validators/auth.validators";

describe("auth validation", () => {
  it("accepts valid login credentials", () => {
    const parsed = loginSchema.parse({
      body: { email: "owner@example.com", password: "password123" }
    });
    expect(parsed.body.email).toBe("owner@example.com");
  });

  it("rejects weak login payloads", () => {
    expect(() => loginSchema.parse({ body: { email: "bad", password: "123" } })).toThrow();
  });

  it("requires refresh token rotation input", () => {
    expect(() => refreshSchema.parse({ body: { refreshToken: "short" } })).toThrow();
  });
});
