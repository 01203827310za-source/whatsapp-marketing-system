import { z } from "zod";

export const productAnnouncementSchema = z.object({
  body: z.object({
    productName: z.string().min(2),
    description: z.string().min(5),
    price: z.coerce.number().positive(),
    discountPrice: z.coerce.number().positive().optional(),
    imageUrl: z.string().url()
  })
});
