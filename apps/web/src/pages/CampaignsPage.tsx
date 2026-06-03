import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const CampaignsPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["campaigns"], queryFn: () => api.get("/api/campaigns").then(unwrap<any[]>) });
  const send = useMutation({
    mutationFn: (id: string) => api.post(`/api/campaigns/${id}/send`).then(unwrap),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] })
  });

  return (
    <>
      <PageTitle
        title="الحملات"
        action={<Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white" to="/campaigns/new"><Plus size={18} /> حملة جديدة</Link>}
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b text-right text-slate-500"><th className="py-3">العنوان</th><th>النوع</th><th>الحالة</th><th>المستلمون</th><th></th></tr></thead>
            <tbody>
              {data?.map((campaign: any) => (
                <tr key={campaign.id} className="border-b last:border-0">
                  <td className="py-3 font-medium"><Link className="text-accent hover:underline" to={`/campaigns/${campaign.id}`}>{campaign.title}</Link></td>
                  <td>{campaign.type}</td>
                  <td>{campaign.status}</td>
                  <td>{campaign._count?.recipients ?? 0}</td>
                  <td>
                    <button className="focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2" onClick={() => send.mutate(campaign.id)}>
                      <Send size={16} /> إرسال
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
