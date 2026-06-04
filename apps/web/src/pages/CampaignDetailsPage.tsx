import { useMutation, useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const CampaignDetailsPage = () => {
  const { id } = useParams();
  const { data: campaign, refetch } = useQuery({ queryKey: ["campaign", id], queryFn: () => api.get(`/api/campaigns/${id}`).then(unwrap<any>) });
  const { data: summary } = useQuery({ queryKey: ["campaign-recipient-summary", id], queryFn: () => api.get(`/api/campaigns/${id}/recipients/summary`).then(unwrap<any>) });
  const send = useMutation({ mutationFn: () => api.post(`/api/campaigns/${id}/send`).then(unwrap), onSuccess: () => refetch() });
  const stats = campaign?.deliveryStats ?? {};

  return (
    <>
      <PageTitle
        title={campaign?.title ?? "Campaign details"}
        action={
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!summary?.canSend || send.isPending}
            onClick={() => send.mutate()}
            type="button"
          >
            <Send size={18} /> Send to {summary?.subscribedRecipients ?? 0}
          </button>
        }
      />
      {summary && !summary.canSend ? <div className="mb-4 rounded-md border border-berry/30 bg-berry/10 p-3 text-sm text-berry">This campaign cannot be sent because there are no subscribed customers.</div> : null}
      <div className="mb-4 grid gap-4 md:grid-cols-5">
        <Card><p className="text-sm text-slate-500">Recipients</p><p className="mt-2 text-2xl font-bold">{stats.total ?? 0}</p></Card>
        <Card><p className="text-sm text-slate-500">Sent</p><p className="mt-2 text-2xl font-bold">{stats.sent ?? 0}</p></Card>
        <Card><p className="text-sm text-slate-500">Delivered</p><p className="mt-2 text-2xl font-bold">{stats.deliveryRate ?? 0}%</p></Card>
        <Card><p className="text-sm text-slate-500">Read</p><p className="mt-2 text-2xl font-bold">{stats.readRate ?? 0}%</p></Card>
        <Card><p className="text-sm text-slate-500">Failed</p><p className="mt-2 text-2xl font-bold">{stats.failed ?? 0}</p></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          {campaign?.imageUrl && <img src={campaign.imageUrl} alt={campaign.title} className="mb-4 max-h-96 w-full rounded-md object-cover" />}
          <p className="whitespace-pre-line text-sm leading-7">{campaign?.message}</p>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Delivery log</h3>
          <div className="grid max-h-[520px] gap-2 overflow-y-auto text-sm">
            {campaign?.recipients?.length ? campaign.recipients.map((recipient: any) => (
              <div key={recipient.id} className="flex justify-between gap-3 rounded-md bg-slate-50 p-2">
                <span className="font-mono">{recipient.customer.phone}</span>
                <span>{recipient.status}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No delivery records yet.</p>}
          </div>
        </Card>
      </div>
    </>
  );
};
