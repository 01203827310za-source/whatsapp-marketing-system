import { describe, expect, it } from "vitest";
import { campaignService } from "../../src/services/campaign.service";

describe("campaign service", () => {
  it("rejects discount campaigns with an end date before the start date", async () => {
    await expect(
      campaignService.createDiscount({
        title: "خصم غير صالح",
        percentage: 20,
        startDate: new Date("2026-06-10"),
        endDate: new Date("2026-06-01"),
        createdById: "user_1"
      })
    ).rejects.toThrow("Discount end date");
  });
});
