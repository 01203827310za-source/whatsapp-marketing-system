import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

const CAMPAIGN_TYPES = ["NEW_MODEL", "DISCOUNT", "OFFER", "ANNOUNCEMENT"] as const;

const schema = z.object({
  type: z.enum(CAMPAIGN_TYPES),
  title: z.string().min(2),
  message: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal(""))
});

type FormValues = z.infer<typeof schema>;

export const CampaignWizardPage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "NEW_MODEL", title: "", message: "", imageUrl: "" } });
  const create = useMutation({
    mutationFn: (values: FormValues) => api.post("/api/campaigns", { ...values, imageUrl: values.imageUrl || undefined }).then(unwrap<any>),
    onSuccess: (campaign) => navigate(`/campaigns/${campaign.id}`)
  });

  const values = form.watch();
  const labels = ["النوع", "الرسالة", "الصورة", "المعاينة", "الإرسال"];

  return (
    <>
      <PageTitle title="معالج حملة جديدة" />
      <div className="mb-4 grid grid-cols-5 gap-2 text-center text-sm">
        {labels.map((label, index) => <div key={label} className={`rounded-md px-2 py-2 ${step === index + 1 ? "bg-accent text-white" : "bg-white"}`}>{label}</div>)}
      </div>
      <form onSubmit={form.handleSubmit((v) => create.mutate(v))}>
        <Card>
          {step === 1 && (
            <div className="grid gap-3 md:grid-cols-4">
              {CAMPAIGN_TYPES.map((type) => (
                <label key={type} className="rounded-md border p-4">
                  <input type="radio" value={type} className="ml-2" {...form.register("type")} />
                  {type}
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4">
              <input className="focus-ring rounded-md border px-3 py-2" placeholder="عنوان الحملة" {...form.register("title")} />
              <textarea className="focus-ring min-h-48 rounded-md border px-3 py-2" placeholder="نص الرسالة" {...form.register("message")} />
            </div>
          )}
          {step === 3 && <input className="focus-ring w-full rounded-md border px-3 py-2" placeholder="رابط الصورة من Cloudinary" {...form.register("imageUrl")} />}
          {step === 4 && (
            <div className="rounded-md border bg-slate-50 p-4">
              {values.imageUrl && <img src={values.imageUrl} alt="" className="mb-3 max-h-64 rounded-md object-cover" />}
              <h3 className="font-bold">{values.title || "عنوان الحملة"}</h3>
              <p className="mt-2 whitespace-pre-line">{values.message || "نص الرسالة"}</p>
            </div>
          )}
          {step === 5 && <p className="text-lg font-semibold">سيتم إنشاء الحملة كمسودة. يمكنك إرسالها من صفحة تفاصيل الحملة.</p>}
        </Card>
        <div className="mt-4 flex justify-between">
          <button type="button" className="focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2" onClick={() => setStep(Math.max(1, step - 1))}>
            <ArrowRight size={18} /> السابق
          </button>
          {step < 5 ? (
            <button type="button" className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white" onClick={() => setStep(Math.min(5, step + 1))}>
              التالي <ArrowLeft size={18} />
            </button>
          ) : (
            <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white" disabled={create.isPending}>
              <Send size={18} /> إنشاء
            </button>
          )}
        </div>
      </form>
    </>
  );
};
