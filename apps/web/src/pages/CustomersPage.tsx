import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Search, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

type Customer = {
  id: string;
  name: string | null;
  phone: string;
  notes: string | null;
  isSubscribed: boolean;
  lastMessageAt: string | null;
};

type CustomerForm = {
  id?: string;
  name: string;
  phone: string;
  notes: string;
  isSubscribed: boolean;
};

const emptyForm: CustomerForm = { name: "", phone: "", notes: "", isSubscribed: true };

export const CustomersPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [subscribed, setSubscribed] = useState("");
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search, subscribed],
    queryFn: () => api.get("/api/customers", { params: { search, subscribed: subscribed || undefined } }).then(unwrap<{ items: Customer[]; total: number }>)
  });

  const save = useMutation({
    mutationFn: (values: CustomerForm) => {
      const payload = {
        name: values.name || undefined,
        phone: values.phone,
        notes: values.notes || undefined,
        isSubscribed: values.isSubscribed
      };
      return values.id
        ? api.patch(`/api/customers/${values.id}`, payload).then(unwrap)
        : api.post("/api/customers", payload).then(unwrap);
    },
    onSuccess: () => {
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/customers/${id}`).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const importCustomers = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return api.post("/api/customers/import", body, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
    },
    onSuccess: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const exportCustomers = async () => {
    const response = await api.get("/api/customers/export", { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle
        title="Customers"
        action={
          <div className="flex flex-wrap gap-2">
            <button className="focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm" onClick={() => fileInputRef.current?.click()} type="button">
              <Upload size={16} /> Import CSV
            </button>
            <button className="focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm" onClick={exportCustomers} type="button">
              <Download size={16} /> Export
            </button>
          </div>
        }
      />
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) importCustomers.mutate(file);
        }}
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); save.mutate(form); }}>
            <div>
              <h3 className="text-base font-semibold">{form.id ? "Edit customer" : "Add customer"}</h3>
              <p className="text-sm text-slate-500">Use international WhatsApp phone format when possible.</p>
            </div>
            <input className="focus-ring rounded-md border px-3 py-2" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input className="focus-ring rounded-md border px-3 py-2" placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            <textarea className="focus-ring min-h-24 rounded-md border px-3 py-2" placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isSubscribed} onChange={(event) => setForm({ ...form, isSubscribed: event.target.checked })} />
              Subscribed to WhatsApp campaigns
            </label>
            <div className="flex gap-2">
              <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" disabled={save.isPending}>
                <Plus size={16} /> {form.id ? "Save changes" : "Add customer"}
              </button>
              {form.id && (
                <button className="focus-ring rounded-md border px-4 py-2 text-sm" type="button" onClick={() => setForm(emptyForm)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          {importCustomers.data ? <p className="mt-3 text-sm text-slate-600">Import completed.</p> : null}
        </Card>
        <Card>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input className="focus-ring w-full rounded-md border py-2 pl-10 pr-3" placeholder="Search by name or phone" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <select className="focus-ring rounded-md border px-3 py-2" value={subscribed} onChange={(event) => setSubscribed(event.target.value)}>
              <option value="">All customers</option>
              <option value="true">Subscribed</option>
              <option value="false">Not subscribed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-3">Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Last message</th>
                  <th className="w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="py-6 text-slate-500" colSpan={5}>Loading customers...</td></tr>
                ) : data?.items?.length ? (
                  data.items.map((customer) => (
                    <tr key={customer.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        <Link className="text-accent hover:underline" to={`/customers/${customer.id}`}>{customer.name ?? "Unnamed customer"}</Link>
                        {customer.notes ? <p className="mt-1 max-w-md truncate text-xs font-normal text-slate-500">{customer.notes}</p> : null}
                      </td>
                      <td className="font-mono">{customer.phone}</td>
                      <td>{customer.isSubscribed ? "Subscribed" : "Not subscribed"}</td>
                      <td>{customer.lastMessageAt ? new Date(customer.lastMessageAt).toLocaleString() : "-"}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="focus-ring rounded-md border px-3 py-2" type="button" onClick={() => setForm({
                            id: customer.id,
                            name: customer.name ?? "",
                            phone: customer.phone,
                            notes: customer.notes ?? "",
                            isSubscribed: customer.isSubscribed
                          })}>
                            Edit
                          </button>
                          <button className="focus-ring rounded-md border px-3 py-2 text-berry" type="button" onClick={() => remove.mutate(customer.id)} aria-label={`Delete ${customer.phone}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-6 text-slate-500" colSpan={5}>No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
};
