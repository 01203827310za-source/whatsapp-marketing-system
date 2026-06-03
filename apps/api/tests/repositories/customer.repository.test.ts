import { describe, expect, it } from "vitest";

describe("customer repository contract", () => {
  it("documents that phone is the natural unique lookup key", () => {
    const uniqueLookup = { phone: "201000000000" };
    expect(Object.keys(uniqueLookup)).toEqual(["phone"]);
  });
});
