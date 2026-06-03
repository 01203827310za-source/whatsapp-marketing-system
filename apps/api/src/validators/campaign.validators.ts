import { CAMPAIGN_TYPES } from "@factory/shared";
import { z } from "zod";

export const createCampaignSchema = z.object({
  body: z.object({
    type: z.enum(CAMPAIGN_TYPES),
    title: z.string().min(2),
    message: z.string().min(1).max(4096),
    imageUrl: z.string().url().optional()
  })
});

export const discountCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    percentage: z.coerce.number().min(1).max(95),
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
  })
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});
