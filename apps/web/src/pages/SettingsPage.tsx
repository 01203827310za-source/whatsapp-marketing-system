import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const SettingsPage = () => {
  const { data } = useQuery({ queryKey: ["users"], queryFn: () => api.get("/api/users").then(unwrap<any[]>), retry: false });
  return (
    <>
      <PageTitle title="الإعدادات" />
      <Card>
        <h3 className="mb-3 font-bold">المستخدمون والصلاحيات</h3>
        <div className="grid gap-2">
          {data?.map((user) => (
            <div key={user.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
              <span>{user.name} - {user.email}</span>
              <span>{user.role}</span>
            </div>
          )) ?? <p className="text-sm text-slate-500">هذه الصفحة متاحة للمالك فقط.</p>}
        </div>
      </Card>
    </>
  );
};
