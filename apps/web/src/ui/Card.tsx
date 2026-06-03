import type { PropsWithChildren } from "react";

export const Card = ({ children }: PropsWithChildren) => (
  <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">{children}</section>
);

export const PageTitle = ({ title, action }: { title: string; action?: JSX.Element }) => (
  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-2xl font-bold">{title}</h2>
    {action}
  </div>
);
