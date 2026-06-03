import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const CustomersPage = () => {
  const [search, setSearch] = useState("");
  const [subscribed, setSubscribed] = useState("");
  const { data } = useQuery({
    queryKey: ["customers", search, subscribed],
    queryFn: () => api.get("/api/customers", { params: { search, subscribed: subscribed || undefined } }).then(unwrap<any>)
  });

  return (
    <>
      <PageTitle title="العملاء" />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="absolute right-3 top-3 text-slate-400" size={18} />
          <input className="focus-ring w-full rounded-md border px-10 py-2" placeholder="بحث بالاسم أو الهاتف" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select className="focus-ring rounded-md border px-3 py-2" value={subscribed} onChange={(e) => setSubscribed(e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="true">مشترك</option>
          <option value="false">غير مشترك</option>
        </select>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-right text-slate-500">
                <th className="py-3">الاسم</th>
                <th>الهاتف</th>
                <th>الاشتراك</th>
                <th>آخر رسالة</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((customer: any) => (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">
                    <Link className="text-accent hover:underline" to={`/customers/${customer.id}`}>{customer.name ?? "بدون اسم"}</Link>
                  </td>
                  <td dir="ltr" className="text-right">{customer.phone}</td>
                  <td>{customer.isSubscribed ? "مشترك" : "غير مشترك"}</td>
                  <td>{customer.lastMessageAt ? new Date(customer.lastMessageAt).toLocaleString("ar-EG") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};
