import { BarChart3, Boxes, LayoutDashboard, Megaphone, Settings, Users, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const nav = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/customers", label: "العملاء", icon: Users },
  { to: "/campaigns", label: "الحملات", icon: Megaphone },
  { to: "/products", label: "المنتجات", icon: Boxes },
  { to: "/analytics", label: "التحليلات", icon: BarChart3 },
  { to: "/settings", label: "الإعدادات", icon: Settings }
];

export const AppLayout = () => {
  const { user, logout } = useAuthStore();
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-l border-slate-200 bg-white p-4">
        <div className="mb-6">
          <p className="text-sm text-slate-500">مصنع الملابس</p>
          <h1 className="text-xl font-bold">حملات واتساب</h1>
        </div>
        <nav className="grid gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-accent text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main>
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">{user?.role}</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm" onClick={logout}>
            <LogOut size={16} />
            خروج
          </button>
        </header>
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
