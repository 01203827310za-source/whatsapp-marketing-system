import { describe, expect, it } from "vitest";
import { MetaWhatsAppProvider } from "../../src/providers/meta-whatsapp.provider";

describe("MetaWhatsAppProvider", () => {
  it("parses inbound text messages and delivery statuses", () => {
    const provider = new MetaWhatsAppProvider();
    const events = provider.parseIncomingWebhook({
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: "201000000000", profile: { name: "Ali" } }],
                messages: [{ id: "wamid.1", from: "201000000000", text: { body: "موافق" } }],
                statuses: [{ id: "wamid.2", recipient_id: "201000000000", status: "delivered" }]
              }
            }
          ]
        }
      ]
    });

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ phone: "201000000000", profileName: "Ali", message: "موافق" });
    expect(events[1]).toMatchObject({ providerMessageId: "wamid.2", status: "delivered" });
  });
});
