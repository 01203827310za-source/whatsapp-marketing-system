import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const CustomerDetailsPage = () => {
  const { id } = useParams();
  const { data: customer } = useQuery({ queryKey: ["customer", id], queryFn: () => api.get(`/api/customers/${id}`).then(unwrap<any>) });

  return (
    <>
      <PageTitle title={customer?.name ?? "تفاصيل العميل"} />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <dl className="grid gap-3 text-sm">
            <div><dt className="text-slate-500">الهاتف</dt><dd dir="ltr" className="text-right font-semibold">{customer?.phone}</dd></div>
            <div><dt className="text-slate-500">الحالة</dt><dd>{customer?.isSubscribed ? "مشترك" : "غير مشترك"}</dd></div>
            <div><dt className="text-slate-500">ملاحظات</dt><dd>{customer?.notes ?? "-"}</dd></div>
          </dl>
        </Card>
        <div className="grid gap-4">
          <Card>
            <h3 className="mb-3 font-bold">سجل الرسائل</h3>
            <div className="grid gap-2">
              {customer?.messages?.map((message: any) => (
                <div key={message.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-medium">{message.direction === "INBOUND" ? "وارد" : "صادر"} - {message.status ?? "مستلم"}</p>
                  <p className="mt-1">{message.body}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 font-bold">سجل الحملات</h3>
            <div className="grid gap-2">
              {customer?.recipients?.map((recipient: any) => (
                <div key={recipient.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
                  <span>{recipient.campaign.title}</span>
                  <span>{recipient.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
