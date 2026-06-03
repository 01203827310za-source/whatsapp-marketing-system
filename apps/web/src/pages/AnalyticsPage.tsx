import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const AnalyticsPage = () => {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/api/analytics").then(unwrap<any>) });
  const campaignPerformance = data?.campaignPerformance?.map((campaign: any) => ({
    name: campaign.title,
    delivered: campaign.recipients.filter((r: any) => r.status === "DELIVERED" || r.status === "READ").length,
    failed: campaign.recipients.filter((r: any) => r.status === "FAILED").length
  }));

  return (
    <>
      <PageTitle title="التحليلات" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">نمو العملاء</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.customerGrowth ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#0f766e" /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">نمو الاشتراكات</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.subscriptionGrowth ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#be123c" /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">أداء الحملات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignPerformance ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="delivered" fill="#0f766e" /><Bar dataKey="failed" fill="#be123c" /></BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
};
