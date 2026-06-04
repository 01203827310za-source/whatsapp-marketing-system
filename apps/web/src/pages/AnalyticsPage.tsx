import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const AnalyticsPage = () => {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/api/analytics").then(unwrap<any>) });
  const campaignPerformance = data?.campaignPerformance?.map((campaign: any) => ({
    name: campaign.title,
    delivered: campaign.recipients.filter((recipient: any) => recipient.status === "DELIVERED" || recipient.status === "READ").length,
    read: campaign.recipients.filter((recipient: any) => recipient.status === "READ").length,
    failed: campaign.recipients.filter((recipient: any) => recipient.status === "FAILED").length
  }));

  return (
    <>
      <PageTitle title="Analytics" />
      <div className="mb-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Total customers", data?.cards?.totalCustomers ?? 0],
          ["Subscribed", data?.cards?.subscribedCustomers ?? 0],
          ["Campaigns", data?.cards?.campaignCount ?? 0],
          ["Messages sent", data?.cards?.messagesSent ?? 0],
          ["Delivery rate", `${data?.cards?.deliveryRate ?? 0}%`],
          ["Read rate", `${data?.cards?.readRate ?? 0}%`]
        ].map(([label, value]) => (
          <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">Customer growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.customerGrowth ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#0f766e" /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Subscription growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.subscriptionGrowth ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#be123c" /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Campaign delivery</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={campaignPerformance ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="delivered" fill="#0f766e" /><Bar dataKey="read" fill="#2563eb" /><Bar dataKey="failed" fill="#be123c" /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
};
