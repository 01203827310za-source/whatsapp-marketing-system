import { CampaignType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { productRepository } from "../repositories/product.repository";
import { HttpError } from "../utils/http";
import { campaignService } from "./campaign.service";

const formatProductMessage = (input: {
  productName: string;
  description: string;
  price: Prisma.Decimal | number;
  discountPrice?: Prisma.Decimal | number | null;
}) => {
  const price = input.price.toString();
  const discountPrice = input.discountPrice?.toString();
  const priceLine = discountPrice ? `Sale price: ${discountPrice} instead of ${price}` : `Price: ${price}`;
  return `${input.productName}\n${input.description}\n${priceLine}`;
};

export const productService = {
  async create(input: {
    productName: string;
    description: string;
    price: number;
    discountPrice?: number;
    imageUrl?: string;
    categoryId?: string;
    galleryUrls?: string[];
  }) {
    return productRepository.create({
      productName: input.productName,
      description: input.description,
      price: new Prisma.Decimal(input.price),
      discountPrice: input.discountPrice ? new Prisma.Decimal(input.discountPrice) : undefined,
      imageUrl: input.imageUrl,
      category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
      gallery: input.galleryUrls?.length
        ? { create: input.galleryUrls.map((imageUrl, index) => ({ imageUrl, sortOrder: index })) }
        : undefined
    });
  },

  async update(id: string, input: {
    productName?: string;
    description?: string;
    price?: number;
    discountPrice?: number | null;
    imageUrl?: string;
    categoryId?: string | null;
  }) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new HttpError(404, "Product not found");
    return productRepository.update(id, {
      productName: input.productName,
      description: input.description,
      price: input.price ? new Prisma.Decimal(input.price) : undefined,
      discountPrice:
        input.discountPrice === null
          ? null
          : input.discountPrice === undefined
            ? undefined
            : new Prisma.Decimal(input.discountPrice),
      imageUrl: input.imageUrl,
      category: input.categoryId === null ? { disconnect: true } : input.categoryId ? { connect: { id: input.categoryId } } : undefined
    });
  },

  async remove(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new HttpError(404, "Product not found");
    return productRepository.delete(id);
  },

  async publishAndSend(input: {
    productName: string;
    description: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    categoryId?: string;
    createdById: string;
  }) {
    const message = formatProductMessage(input);
    const campaign = await campaignService.create({
      type: CampaignType.PRODUCT_ANNOUNCEMENT,
      title: input.productName,
      message,
      imageUrl: input.imageUrl,
      createdById: input.createdById
    });
    const product = await prisma.productAnnouncement.create({
      data: {
        productName: input.productName,
        description: input.description,
        price: input.price,
        discountPrice: input.discountPrice,
        imageUrl: input.imageUrl,
        category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
        campaign: { connect: { id: campaign.id } }
      }
    });
    await campaignService.queueCampaign(campaign.id);
    return { product, campaign };
  },

  async sendProduct(id: string, createdById: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new HttpError(404, "Product not found");

    const campaign = await campaignService.create({
      type: CampaignType.PRODUCT_ANNOUNCEMENT,
      title: product.productName,
      message: formatProductMessage(product),
      imageUrl: product.imageUrl ?? undefined,
      createdById
    });
    const queue = await campaignService.queueCampaign(campaign.id);

    const updatedProduct = await productRepository.update(id, {
      campaign: { connect: { id: campaign.id } }
    });

    return { product: updatedProduct, campaign, queued: queue.queued };
  },

  list: () => productRepository.list(),
  categories: () => productRepository.listCategories(),
  createCategory: (name: string) => productRepository.createCategory(name),
  deleteCategory: (id: string) => productRepository.deleteCategory(id),
  addGalleryImage: async (productId: string, input: { imageUrl: string; altText?: string; sortOrder?: number }) => {
    const existing = await productRepository.findById(productId);
    if (!existing) throw new HttpError(404, "Product not found");
    return productRepository.addImage(productId, input);
  },
  deleteGalleryImage: (id: string) => productRepository.deleteImage(id)
};
