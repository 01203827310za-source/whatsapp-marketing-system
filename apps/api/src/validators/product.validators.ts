import { z } from "zod";

export const productAnnouncementSchema = z.object({
  body: z.object({
    productName: z.string().min(2),
    description: z.string().min(5),
    price: z.coerce.number().positive(),
    discountPrice: z.coerce.number().positive().optional(),
    imageUrl: z.string({ required_error: "Product image is required" }).min(1, "Product image is required").url("Product image must be a valid URL"),
    categoryId: z.string().min(1).optional()
  })
});

export const productSchema = z.object({
  body: z.object({
    productName: z.string().min(2),
    description: z.string().min(5),
    price: z.coerce.number().positive(),
    discountPrice: z.coerce.number().positive().optional(),
    imageUrl: z.string().url("Product image must be a valid URL").optional(),
    categoryId: z.string().min(1).optional(),
    galleryUrls: z.array(z.string().url()).optional()
  })
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    productName: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    price: z.coerce.number().positive().optional(),
    discountPrice: z.union([z.coerce.number().positive(), z.null()]).optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.union([z.string().min(1), z.null()]).optional()
  })
});

export const categorySchema = z.object({
  body: z.object({ name: z.string().min(2).max(80) })
});

export const productIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const galleryImageSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    imageUrl: z.string().url(),
    altText: z.string().optional(),
    sortOrder: z.coerce.number().int().min(0).optional()
  })
});
