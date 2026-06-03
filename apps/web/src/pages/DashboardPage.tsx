import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Send, TrendingUp, Users } from "lucide-react";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

const metricIcons = [Users, MessageCircle, TrendingUp, Send];

export const DashboardPage = () => {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/api/analytics").then(unwrap<any>) });
  const cards = data?.cards ?? {};
  const metrics = [
    ["إجمالي العملاء", cards.totalCustomers ?? 0],
    ["المشتركون", cards.subscribedCustomers ?? 0],
    ["عملاء اليوم", cards.newCustomersToday ?? 0],
    ["معدل التسليم", `${cards.deliveryRate ?? 0}%`]
  ];

  return (
    <>
      <PageTitle title="لوحة التحكم" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value], index) => {
          const Icon = metricIcons[index];
          return (
            <Card key={label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold">{value}</p>
                </div>
                <Icon className="text-accent" size={28} />
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};
