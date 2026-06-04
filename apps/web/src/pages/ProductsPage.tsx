import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { type FormEvent, useState } from "react";
import { api, getApiErrorDetails, getApiErrorMessage, unwrap } from "../lib/api";
import { Card, PageTitle } from "../ui/Card";

type Category = { id: string; name: string; _count?: { products: number } };
type Product = {
  id: string;
  productName: string;
  description: string;
  price: string | number;
  discountPrice: string | number | null;
  imageUrl: string | null;
  category: Category | null;
  gallery: { id: string; imageUrl: string; altText: string | null }[];
};

const emptyProduct = {
  productName: "",
  description: "",
  price: "",
  discountPrice: "",
  imageUrl: "",
  categoryId: ""
};

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryName, setCategoryName] = useState("");
  const [galleryTarget, setGalleryTarget] = useState<string | null>(null);
  const [galleryUrl, setGalleryUrl] = useState("");

  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => api.get("/api/products").then(unwrap<Product[]>) });
  const { data: categories } = useQuery({ queryKey: ["product-categories"], queryFn: () => api.get("/api/products/categories").then(unwrap<Category[]>) });

  const uploadImage = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("image", file);
      return api.post("/api/products/uploads", body, { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap<{ imageUrl: string }>);
    }
  });

  const createProduct = useMutation({
    mutationFn: (values: typeof emptyProduct) =>
      api
        .post("/api/products", {
          productName: values.productName,
          description: values.description,
          price: Number(values.price),
          discountPrice: values.discountPrice ? Number(values.discountPrice) : undefined,
          imageUrl: values.imageUrl || undefined,
          categoryId: values.categoryId || undefined
        })
        .then(unwrap),
    onSuccess: () => {
      setProductForm(emptyProduct);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => api.post("/api/products/categories", { name }).then(unwrap),
    onSuccess: () => {
      setCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`).then(unwrap),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const addGalleryImage = useMutation({
    mutationFn: (input: { productId: string; imageUrl: string }) => api.post(`/api/products/${input.productId}/gallery`, { imageUrl: input.imageUrl }).then(unwrap),
    onSuccess: () => {
      setGalleryTarget(null);
      setGalleryUrl("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const createProductDetails = getApiErrorDetails(createProduct.error);
  const handleCreateProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProduct.mutate(productForm);
  };

  return (
    <>
      <PageTitle title="Products" />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-4">
          <Card>
            <form className="grid gap-3" onSubmit={handleCreateProduct}>
              <div>
                <h3 className="text-base font-semibold">Add product</h3>
                <p className="text-sm text-slate-500">Upload an image, assign a category, and keep a gallery for campaigns.</p>
              </div>
              <input className="focus-ring rounded-md border px-3 py-2" placeholder="Product name" value={productForm.productName} onChange={(event) => setProductForm({ ...productForm, productName: event.target.value })} required />
              <textarea className="focus-ring min-h-24 rounded-md border px-3 py-2" placeholder="Description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="focus-ring rounded-md border px-3 py-2" placeholder="Price" type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required />
                <input className="focus-ring rounded-md border px-3 py-2" placeholder="Discount price" type="number" value={productForm.discountPrice} onChange={(event) => setProductForm({ ...productForm, discountPrice: event.target.value })} />
              </div>
              <select className="focus-ring rounded-md border px-3 py-2" value={productForm.categoryId} onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}>
                <option value="">No category</option>
                {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <label className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm text-slate-600">
                <Upload size={18} /> Upload product image optional
                <input
                  className="hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    uploadImage.mutate(file, { onSuccess: (result) => setProductForm((current) => ({ ...current, imageUrl: result.imageUrl })) });
                  }}
                />
              </label>
              {uploadImage.isPending ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">Uploading image...</p> : null}
              {uploadImage.isError ? <p className="rounded-md border border-berry/30 bg-berry/10 px-3 py-2 text-sm text-berry">{getApiErrorMessage(uploadImage.error, "Image upload failed")}</p> : null}
              {productForm.imageUrl ? <img src={productForm.imageUrl} alt="Uploaded product preview" className="h-44 w-full rounded-md object-cover" /> : null}
              {createProduct.isError ? (
                <div className="rounded-md border border-berry/30 bg-berry/10 px-3 py-2 text-sm text-berry">
                  <p>{getApiErrorMessage(createProduct.error, "Product could not be created")}</p>
                  {createProductDetails.length ? (
                    <ul className="mt-2 list-disc pl-5">
                      {createProductDetails.map((detail, index) => <li key={`${detail.field ?? "field"}-${index}`}>{detail.field ? `${detail.field}: ` : ""}{detail.message}</li>)}
                    </ul>
                  ) : null}
                </div>
              ) : null}
              <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" disabled={createProduct.isPending || uploadImage.isPending}>
                <Plus size={16} /> Save product
              </button>
            </form>
          </Card>
          <Card>
            <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); createCategory.mutate(categoryName); }}>
              <input className="focus-ring min-w-0 flex-1 rounded-md border px-3 py-2" placeholder="New category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
              <button className="focus-ring rounded-md border px-4 py-2 text-sm font-semibold">Add</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories?.map((category) => (
                <span key={category.id} className="rounded-md bg-slate-100 px-3 py-1 text-sm">{category.name} ({category._count?.products ?? 0})</span>
              ))}
            </div>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {products?.map((product) => (
            <Card key={product.id}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.productName} className="mb-3 h-48 w-full rounded-md object-cover" />
              ) : (
                <div className="mb-3 flex h-48 w-full items-center justify-center rounded-md bg-slate-100 px-4 text-center text-sm font-medium text-slate-500">
                  {product.productName}
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{product.category?.name ?? "Uncategorized"}</p>
                  <h3 className="mt-1 font-bold">{product.productName}</h3>
                </div>
                <button className="focus-ring rounded-md border p-2 text-berry" type="button" onClick={() => deleteProduct.mutate(product.id)} aria-label={`Delete ${product.productName}`}>
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{product.description}</p>
              <p className="mt-3 font-semibold">
                {product.discountPrice ? <><span className="text-berry">{product.discountPrice}</span> <span className="text-sm text-slate-400 line-through">{product.price}</span></> : product.price}
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.gallery?.slice(0, 3).map((image) => <img key={image.id} src={image.imageUrl} alt={image.altText ?? product.productName} className="h-16 rounded-md object-cover" />)}
                <button className="focus-ring flex h-16 items-center justify-center rounded-md border border-dashed" type="button" onClick={() => setGalleryTarget(product.id)} aria-label={`Add gallery image to ${product.productName}`}>
                  <ImagePlus size={18} />
                </button>
              </div>
              {galleryTarget === product.id ? (
                <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); addGalleryImage.mutate({ productId: product.id, imageUrl: galleryUrl }); }}>
                  <input className="focus-ring min-w-0 flex-1 rounded-md border px-3 py-2 text-sm" placeholder="Gallery image URL" value={galleryUrl} onChange={(event) => setGalleryUrl(event.target.value)} />
                  <button className="focus-ring rounded-md bg-accent px-3 py-2 text-sm text-white">Add</button>
                </form>
              ) : null}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};
