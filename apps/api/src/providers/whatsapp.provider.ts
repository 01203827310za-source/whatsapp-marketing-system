export interface WhatsAppTextMessage {
  to: string;
  text: string;
}

export interface WhatsAppImageMessage {
  to: string;
  imageUrl: string;
  caption?: string;
}

export interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: unknown[];
}

export interface IncomingWhatsAppMessage {
  providerMessageId: string;
  phone: string;
  profileName?: string;
  message?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  raw: unknown;
}

export interface WhatsAppProvider {
  sendTextMessage(message: WhatsAppTextMessage): Promise<{ providerMessageId: string }>;
  sendImageMessage(message: WhatsAppImageMessage): Promise<{ providerMessageId: string }>;
  sendTemplateMessage(message: WhatsAppTemplateMessage): Promise<{ providerMessageId: string }>;
  verifyWebhook(query: Record<string, unknown>, rawBody?: Buffer, signature?: string): boolean;
  parseIncomingWebhook(payload: unknown): IncomingWhatsAppMessage[];
}
