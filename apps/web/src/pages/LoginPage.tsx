import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { api, unwrap } from "../lib/api";
import { useAuthStore } from "../store/auth.store";

const schema = z.object({
  email: z.string().email("البريد غير صحيح"),
  password: z.string().min(8, "كلمة المرور قصيرة")
});

type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const { accessToken, setSession } = useAuthStore();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const login = useMutation({
    mutationFn: (values: FormValues) => api.post("/api/auth/login", values).then(unwrap),
    onSuccess: (session: any) => setSession(session)
  });

  if (accessToken) return <Navigate to="/" replace />;

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-6">
      <form className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={form.handleSubmit((v) => login.mutate(v))}>
        <h1 className="mb-1 text-2xl font-bold">تسجيل الدخول</h1>
        <p className="mb-6 text-sm text-slate-500">لوحة إدارة حملات واتساب لمصنع الملابس</p>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium">البريد الإلكتروني</span>
          <input className="focus-ring w-full rounded-md border px-3 py-2" {...form.register("email")} />
          <span className="text-xs text-berry">{form.formState.errors.email?.message}</span>
        </label>
        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-medium">كلمة المرور</span>
          <input type="password" className="focus-ring w-full rounded-md border px-3 py-2" {...form.register("password")} />
          <span className="text-xs text-berry">{form.formState.errors.password?.message}</span>
        </label>
        {login.isError && <p className="mb-3 text-sm text-berry">تعذر تسجيل الدخول</p>}
        <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-white" disabled={login.isPending}>
          <LogIn size={18} />
          دخول
        </button>
      </form>
    </main>
  );
};
