import { CampaignType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { campaignService } from "./campaign.service";

export const productService = {
  async publishAndSend(input: {
    productName: string;
    description: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    createdById: string;
  }) {
    const priceLine = input.discountPrice ? `السعر بعد الخصم: ${input.discountPrice} بدلا من ${input.price}` : `السعر: ${input.price}`;
    const message = `${input.productName}\n${input.description}\n${priceLine}`;
    const campaign = await campaignService.create({
      type: CampaignType.ANNOUNCEMENT,
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
        campaign: { connect: { id: campaign.id } }
      }
    });
    await campaignService.queueCampaign(campaign.id);
    return { product, campaign };
  },

  list: () => prisma.productAnnouncement.findMany({ orderBy: { createdAt: "desc" }, include: { campaign: true } })
};
