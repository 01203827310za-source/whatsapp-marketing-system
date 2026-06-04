import { useQuery } from "@tanstack/react-query";
import { BarChart3, MessageCircle, Plus, Send, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

const metricIcons = [Users, Users, BarChart3, MessageCircle, TrendingUp, Send];

export const DashboardPage = () => {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/api/analytics").then(unwrap<any>) });
  const cards = data?.cards ?? {};
  const metrics = [
    ["Total customers", cards.totalCustomers ?? 0],
    ["Subscribed", cards.subscribedCustomers ?? 0],
    ["Campaigns", cards.campaignCount ?? 0],
    ["Messages sent", cards.messagesSent ?? 0],
    ["Delivery rate", `${cards.deliveryRate ?? 0}%`],
    ["Read rate", `${cards.readRate ?? 0}%`]
  ];

  return (
    <>
      <PageTitle title="Dashboard" />
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {metrics.map(([label, value], index) => {
          const Icon = metricIcons[index];
          return (
            <Card key={label}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold">{value}</p>
                </div>
                <Icon className="text-accent" size={24} />
              </div>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_300px]">
        <Card>
          <h3 className="mb-3 font-bold">Recent campaigns</h3>
          <div className="grid gap-2">
            {data?.recentCampaigns?.map((campaign: any) => (
              <Link key={campaign.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm hover:bg-slate-100" to={`/campaigns/${campaign.id}`}>
                <span className="font-medium">{campaign.title}</span>
                <span>{campaign.status}</span>
              </Link>
            )) ?? <p className="text-sm text-slate-500">No campaigns yet.</p>}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Recent customers</h3>
          <div className="grid gap-2">
            {data?.recentCustomers?.map((customer: any) => (
              <Link key={customer.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm hover:bg-slate-100" to={`/customers/${customer.id}`}>
                <span className="font-medium">{customer.name ?? "Unnamed customer"}</span>
                <span className="font-mono">{customer.phone}</span>
              </Link>
            )) ?? <p className="text-sm text-slate-500">No customers yet.</p>}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">Quick actions</h3>
          <div className="grid gap-2">
            <Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" to="/campaigns/new"><Send size={16} /> New campaign</Link>
            <Link className="focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold" to="/customers"><Plus size={16} /> Add customer</Link>
            <Link className="focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold" to="/products"><Plus size={16} /> Add product</Link>
          </div>
        </Card>
      </div>
    </>
  );
};
