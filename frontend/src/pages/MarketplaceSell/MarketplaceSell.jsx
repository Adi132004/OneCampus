// import { useNavigate } from "@tanstack/react-router";
// import { useState } from "react";
// import { ImagePlus, X } from "lucide-react";
// import { PageShell } from "@/components/PageShell";
// import { CATEGORIES } from "@/lib/mock-data";

// export function MarketplaceSellPage() {
//   const navigate = useNavigate();
//   const [previews, setPreviews] = useState([]);
//   function onFiles(files) {
//     if (!files) return;
//     const urls = Array.from(files)
//       .slice(0, 5)
//       .map((f) => URL.createObjectURL(f));
//     setPreviews((p) => [...p, ...urls].slice(0, 5));
//   }
//   return (
//     <PageShell
//       eyebrow="Marketplace"
//       title="Sell something"
//       subtitle="Reach students from your campus instantly."
//     >
//       <form
//         className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
//         onSubmit={(e) => {
//           e.preventDefault();
//           navigate({
//             to: "/marketplace",
//           });
//         }}
//       >
//         <div className="rounded-3xl border border-border bg-card p-6">
//           <div className="text-sm font-medium text-foreground">Product images</div>
//           <p className="mt-1 text-xs text-muted-foreground">
//             Up to 5 photos. First one becomes the cover.
//           </p>
//           <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
//             {previews.map((src, i) => (
//               <div
//                 key={i}
//                 className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-[var(--surface-2)]"
//               >
//                 <img src={src} alt="" className="h-full w-full object-cover" />
//                 <button
//                   type="button"
//                   onClick={() => setPreviews((p) => p.filter((_, j) => j !== i))}
//                   className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-card/90 text-foreground"
//                 >
//                   <X className="h-3.5 w-3.5" />
//                 </button>
//               </div>
//             ))}
//             {previews.length < 5 && (
//               <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-[var(--surface-2)] text-muted-foreground hover:bg-muted">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   className="hidden"
//                   onChange={(e) => onFiles(e.target.files)}
//                 />
//                 <div className="flex flex-col items-center gap-1 text-xs">
//                   <ImagePlus className="h-5 w-5" /> Upload
//                 </div>
//               </label>
//             )}
//           </div>
//         </div>

//         <div className="rounded-3xl border border-border bg-card p-6">
//           <div className="grid gap-4">
//             <Field label="Product name" placeholder="e.g. DSA Textbook" />
//             <Field label="Description" placeholder="Describe condition, age, etc." textarea />
//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Price (₹)" type="number" placeholder="450" />
//               <Select label="Condition" options={["New", "Like new", "Good", "Used"]} />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <Select label="Category" options={CATEGORIES.filter((c) => c !== "All")} />
//               <Field label="Contact (phone/email)" placeholder="you@college.edu" />
//             </div>
//             <button
//               type="submit"
//               className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
//               style={{
//                 boxShadow: "0 6px 16px rgba(232,89,12,0.25)",
//               }}
//             >
//               Publish listing
//             </button>
//           </div>
//         </div>
//       </form>
//     </PageShell>
//   );
// }
// function Field({ label, type = "text", placeholder, textarea = false }) {
//   const cls =
//     "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
//   return (
//     <label className="block">
//       <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
//       {textarea ? (
//         <textarea rows={4} placeholder={placeholder} className={cls} />
//       ) : (
//         <input
//           type={type}
//           placeholder={placeholder}
//           className={cls.replace("rounded-2xl", "rounded-full")}
//         />
//       )}
//     </label>
//   );
// }
// function Select({ label, options }) {
//   return (
//     <label className="block">
//       <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
//       <select className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
//         {options.map((o) => (
//           <option key={o}>{o}</option>
//         ))}
//       </select>
//     </label>
//   );
// }


import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { CATEGORIES } from "@/lib/mock-data";
import { createMarketplaceItem } from "@/services/marketplace";


export function MarketplaceSellPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "BOOKS",
    condition: "GOOD",
    image: "",
  });

  function onFiles(files) {
    if (!files) return;

    const urls = Array.from(files)
      .slice(0, 5)
      .map((file) => URL.createObjectURL(file));

    setPreviews((prev) => [...prev, ...urls].slice(0, 5));

    // Image upload will be implemented later
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await createMarketplaceItem({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        image: formData.image,
      });
      
      // Refresh marketplace cache
      await queryClient.invalidateQueries({
        queryKey: ["marketplace"],
      });
      
      alert("Listing published successfully!");
      
      navigate({
        to: "/marketplace",
      });
    } 
    catch (err) {
      console.error("Publish Error:", err);
    
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Failed to publish listing.");
      }
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      eyebrow="Marketplace"
      title="Sell something"
      subtitle="Reach students from your campus instantly."
    >
      <form
        className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
        onSubmit={handleSubmit}
      >
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-foreground">
            Product Images
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Upload up to 5 photos.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-2xl border border-border"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-white p-1"
                  onClick={() =>
                    setPreviews((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {previews.length < 5 && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-[var(--surface-2)]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />

                <div className="flex flex-col items-center text-xs">
                  <ImagePlus className="h-5 w-5" />
                  Upload
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="grid gap-4">
            <Field
              label="Product Name"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
            />

            <Field
              label="Description"
              textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
              />

              <Select
                label="Condition"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value,
                  })
                }
                options={[
                  "GOOD",
                  "LIKE_NEW",
                  "USED",
                  "NEW",
                ]}
              />
            </div>

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              options={CATEGORIES.filter((c) => c !== "All")}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
}) {
  const cls =
    "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm";

  return (
    <label>
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      {textarea ? (
        <textarea
          rows={4}
          className={cls}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          className={cls.replace("rounded-2xl", "rounded-full")}
          value={value}
          onChange={onChange}
        />
      )}
    </label>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      <select
        className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}