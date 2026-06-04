import { z } from "zod";

export const customerQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    subscribed: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(25)
  })
});

export const updateCustomerSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(6).optional(),
    notes: z.string().nullable().optional(),
    isSubscribed: z.boolean().optional()
  })
});

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(6),
    notes: z.string().optional(),
    isSubscribed: z.boolean().optional()
  })
});

export const customerIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});
