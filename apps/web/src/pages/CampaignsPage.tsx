import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

type Campaign = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  _count?: { recipients: number };
  deliveryStats?: { deliveryRate: number; readRate: number; failed: number };
};

export const CampaignsPage = () => {
  const queryClient = useQueryClient();
  const { data: campaigns } = useQuery({ queryKey: ["campaigns"], queryFn: () => api.get("/api/campaigns").then(unwrap<Campaign[]>) });
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/api/analytics").then(unwrap<any>) });

  const send = useMutation({
    mutationFn: async (id: string) => {
      const summary = await api.get(`/api/campaigns/${id}/recipients/summary`).then(unwrap<{ subscribedRecipients: number; canSend: boolean }>);
      if (!summary.canSend) throw new Error("No subscribed customers are available for this campaign.");
      return api.post(`/api/campaigns/${id}/send`).then(unwrap);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const subscribedRecipients = analytics?.cards?.subscribedCustomers ?? 0;

  return (
    <>
      <PageTitle
        title="Campaigns"
        action={<Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" to="/campaigns/new"><Plus size={18} /> New campaign</Link>}
      />
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Subscribed audience</p><p className="mt-2 text-3xl font-bold">{subscribedRecipients}</p></Card>
        <Card><p className="text-sm text-slate-500">Campaign history</p><p className="mt-2 text-3xl font-bold">{campaigns?.length ?? 0}</p></Card>
        <Card><p className="text-sm text-slate-500">Messages sent</p><p className="mt-2 text-3xl font-bold">{analytics?.cards?.messagesSent ?? 0}</p></Card>
      </div>
      {send.error ? <div className="mb-4 rounded-md border border-berry/30 bg-berry/10 p-3 text-sm text-berry">{send.error.message}</div> : null}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-3">Campaign</th>
                <th>Type</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Delivery</th>
                <th>Read</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns?.map((campaign) => (
                <tr key={campaign.id} className="border-b last:border-0">
                  <td className="py-3 font-medium"><Link className="text-accent hover:underline" to={`/campaigns/${campaign.id}`}>{campaign.title}</Link></td>
                  <td>{campaign.type}</td>
                  <td>{campaign.status}</td>
                  <td>{campaign._count?.recipients ?? 0}</td>
                  <td>{campaign.deliveryStats?.deliveryRate ?? 0}%</td>
                  <td>{campaign.deliveryStats?.readRate ?? 0}%</td>
                  <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={subscribedRecipients === 0 || send.isPending}
                      onClick={() => send.mutate(campaign.id)}
                      type="button"
                    >
                      <Send size={16} /> Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};
