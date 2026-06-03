import { describe, expect, it } from "vitest";
import { subscriptionKeywords } from "@factory/shared";

describe("webhook subscription flow", () => {
  it("recognizes Arabic and English opt-in keywords", () => {
    expect(subscriptionKeywords).toContain("موافق");
    expect(subscriptionKeywords).toContain("subscribe");
    expect(subscriptionKeywords).toContain("ok");
  });
});
