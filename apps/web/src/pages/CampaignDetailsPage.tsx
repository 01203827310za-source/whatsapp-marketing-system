import { useMutation, useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const CampaignDetailsPage = () => {
  const { id } = useParams();
  const { data: campaign, refetch } = useQuery({ queryKey: ["campaign", id], queryFn: () => api.get(`/api/campaigns/${id}`).then(unwrap<any>) });
  const send = useMutation({ mutationFn: () => api.post(`/api/campaigns/${id}/send`).then(unwrap), onSuccess: () => refetch() });

  return (
    <>
      <PageTitle title={campaign?.title ?? "تفاصيل الحملة"} action={<button className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white" onClick={() => send.mutate()}><Send size={18} /> إرسال</button>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          {campaign?.imageUrl && <img src={campaign.imageUrl} alt="" className="mb-4 max-h-80 rounded-md object-cover" />}
          <p className="whitespace-pre-line">{campaign?.message}</p>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">التسليم</h3>
          <div className="grid gap-2 text-sm">
            {campaign?.recipients?.map((recipient: any) => (
              <div key={recipient.id} className="flex justify-between rounded-md bg-slate-50 p-2">
                <span dir="ltr">{recipient.customer.phone}</span>
                <span>{recipient.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};
