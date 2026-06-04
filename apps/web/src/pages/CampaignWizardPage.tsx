import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Send, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, getApiErrorDetails, getApiErrorMessage, unwrap } from "../lib/api";
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
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: () => api.get("/api/analytics").then(unwrap<any>) });
  const uploadImage = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("image", file);
      return api.post("/api/campaigns/uploads", body, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap<{ imageUrl: string }>);
    },
    onSuccess: (result) => form.setValue("imageUrl", result.imageUrl, { shouldValidate: true })
  });
  const create = useMutation({
    mutationFn: (values: FormValues) => api.post("/api/campaigns", { ...values, imageUrl: values.imageUrl || undefined }).then(unwrap<any>),
    onSuccess: (campaign) => navigate(`/campaigns/${campaign.id}`)
  });

  const values = form.watch();
  const labels = ["Type", "Message", "Image", "Review", "Create"];
  const subscribedRecipients = analytics?.cards?.subscribedCustomers ?? 0;
  const createDetails = getApiErrorDetails(create.error);

  return (
    <>
      <PageTitle title="New campaign" />
      <div className="mb-4 grid grid-cols-5 gap-2 text-center text-sm">
        {labels.map((label, index) => <div key={label} className={`rounded-md px-2 py-2 ${step === index + 1 ? "bg-accent text-white" : "bg-white"}`}>{label}</div>)}
      </div>
      <form onSubmit={form.handleSubmit((values) => create.mutate(values))}>
        <Card>
          {step === 1 && (
            <div className="grid gap-3 md:grid-cols-4">
              {CAMPAIGN_TYPES.map((type) => (
                <label key={type} className="cursor-pointer rounded-md border p-4 hover:border-accent">
                  <input type="radio" value={type} className="mr-2" {...form.register("type")} />
                  {type}
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4">
              <input className="focus-ring rounded-md border px-3 py-2" placeholder="Campaign title" {...form.register("title")} />
              <textarea className="focus-ring min-h-48 rounded-md border px-3 py-2" placeholder="WhatsApp message" {...form.register("message")} />
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-3">
              <label className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-8 text-sm text-slate-600">
                <Upload size={18} /> Upload campaign image
                <input
                  className="hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadImage.mutate(file);
                  }}
                />
              </label>
              {uploadImage.isPending ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">Uploading image...</p> : null}
              {uploadImage.isError ? <p className="rounded-md border border-berry/30 bg-berry/10 px-3 py-2 text-sm text-berry">{getApiErrorMessage(uploadImage.error, "Image upload failed")}</p> : null}
              {values.imageUrl ? <img src={values.imageUrl} alt="Campaign preview" className="max-h-80 rounded-md object-cover" /> : null}
            </div>
          )}
          {step === 4 && (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-md border bg-slate-50 p-4">
                {values.imageUrl && <img src={values.imageUrl} alt="Campaign preview" className="mb-3 max-h-64 rounded-md object-cover" />}
                <h3 className="font-bold">{values.title || "Campaign title"}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-7">{values.message || "Message body"}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm text-slate-500">Recipients before sending</p>
                <p className="mt-2 text-4xl font-bold">{subscribedRecipients}</p>
                <p className="mt-2 text-sm text-slate-500">The campaign is created as a draft. Sending is blocked if this count is zero.</p>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="grid gap-3">
              <p className="text-lg font-semibold">Create this campaign as a draft. You can send it from the campaign details page after reviewing recipient count.</p>
              {create.isError ? (
                <div className="rounded-md border border-berry/30 bg-berry/10 px-3 py-2 text-sm text-berry">
                  <p>{getApiErrorMessage(create.error, "Campaign could not be created")}</p>
                  {createDetails.length ? (
                    <ul className="mt-2 list-disc pl-5">
                      {createDetails.map((detail, index) => <li key={`${detail.field ?? "field"}-${index}`}>{detail.field ? `${detail.field}: ` : ""}{detail.message}</li>)}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </Card>
        <div className="mt-4 flex justify-between">
          <button type="button" className="focus-ring inline-flex items-center gap-2 rounded-md border px-4 py-2" onClick={() => setStep(Math.max(1, step - 1))}>
            <ArrowLeft size={18} /> Back
          </button>
          {step < 5 ? (
            <button type="button" className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white" onClick={() => setStep(Math.min(5, step + 1))}>
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-white" disabled={create.isPending}>
              <Send size={18} /> Create
            </button>
          )}
        </div>
      </form>
    </>
  );
};
