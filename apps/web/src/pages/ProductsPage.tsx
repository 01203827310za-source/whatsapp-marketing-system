import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const form = useForm({ defaultValues: { productName: "", description: "", price: 0, discountPrice: "", imageUrl: "" } });
  const { data } = useQuery({ queryKey: ["products"], queryFn: () => api.get("/api/products").then(unwrap<any[]>) });
  const publish = useMutation({
    mutationFn: (values: any) =>
      api
        .post("/api/products/publish", {
          ...values,
          discountPrice: values.discountPrice === "" ? undefined : Number(values.discountPrice)
        })
        .then(unwrap),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  return (
    <>
      <PageTitle title="إعلانات المنتجات" />
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card>
          <form className="grid gap-3" onSubmit={form.handleSubmit((v) => publish.mutate(v))}>
            <input className="focus-ring rounded-md border px-3 py-2" placeholder="اسم المنتج" {...form.register("productName")} />
            <textarea className="focus-ring rounded-md border px-3 py-2" placeholder="الوصف" {...form.register("description")} />
            <input type="number" className="focus-ring rounded-md border px-3 py-2" placeholder="السعر" {...form.register("price", { valueAsNumber: true })} />
            <input type="number" className="focus-ring rounded-md border px-3 py-2" placeholder="سعر الخصم" {...form.register("discountPrice")} />
            <input className="focus-ring rounded-md border px-3 py-2" placeholder="رابط الصورة" {...form.register("imageUrl")} />
            <button className="focus-ring rounded-md bg-accent px-4 py-2 font-semibold text-white">نشر وإرسال</button>
          </form>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {data?.map((product) => (
            <Card key={product.id}>
              <img src={product.imageUrl} alt="" className="mb-3 h-40 w-full rounded-md object-cover" />
              <h3 className="font-bold">{product.productName}</h3>
              <p className="mt-1 text-sm text-slate-600">{product.description}</p>
              <p className="mt-2 font-semibold">{product.discountPrice ?? product.price}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};
