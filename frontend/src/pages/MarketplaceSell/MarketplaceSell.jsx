import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { CATEGORIES } from "@/lib/mock-data";
import {
  createMarketplaceItem,
  updateMarketplaceItem,
  getMarketplaceItem,
} from "@/services/marketplace";

export function MarketplaceSellPage({ editMode = false, itemId = null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(editMode);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "BOOKS",
    condition: "GOOD",
    image: "",
  });

  useEffect(() => {
    if (!editMode || !itemId) return;

    let isMounted = true;
    setFetching(true);

    async function loadListing() {
      try {
        const item = await getMarketplaceItem(itemId);
        if (!isMounted) return;

        setFormData({
          title: item.title || "",
          description: item.description || "",
          price: item.price !== undefined && item.price !== null ? item.price : "",
          category: item.category || "BOOKS",
          condition: item.condition || "GOOD",
          image: item.image || "",
        });

        if (item.image) {
          setPreviews([item.image]);
        }
      } catch (err) {
        console.error("Failed to load listing for edit:", err);
        if (isMounted) {
          alert("Failed to load existing listing details.");
          navigate({ to: "/marketplace" });
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [editMode, itemId, navigate]);

  function onFiles(files) {
    if (!files || !files[0]) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreviews([dataUrl]);
      setFormData((prev) => ({
        ...prev,
        image: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  }

  function removePreview(index) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a product title.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      alert("Please enter a valid price greater than 0.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        image: formData.image,
      };

      if (editMode && itemId) {
        await updateMarketplaceItem(itemId, payload);
        alert("Listing updated successfully!");
        await queryClient.invalidateQueries({
          queryKey: ["marketplace-item", itemId],
        });
      } else {
        await createMarketplaceItem(payload);
        alert("Listing published successfully!");
      }

      await queryClient.invalidateQueries({
        queryKey: ["marketplace"],
      });

      navigate({
        to: "/marketplace",
      });
    } catch (err) {
      console.error("Marketplace Error:", err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Operation failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <PageShell eyebrow="Marketplace" title="Edit Listing">
        <div className="py-20 text-center text-lg font-medium">
          Loading listing details...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Marketplace"
      title={editMode ? "Edit Listing" : "Sell something"}
      subtitle={
        editMode
          ? "Update your marketplace listing."
          : "Reach students from your campus instantly."
      }
    >
      <form
        className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
        onSubmit={handleSubmit}
      >
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-foreground">
            Product Image
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Upload a clear photo of your item.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-2xl border border-border"
              >
                <img
                  src={src}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-foreground hover:bg-white shadow"
                  onClick={() => removePreview(i)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {previews.length === 0 && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border border-dashed border-border bg-[var(--surface-2)] hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />

                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <ImagePlus className="h-5 w-5 mb-1 text-foreground/70" />
                  Upload Image
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
                label="Price (₹)"
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
                options={["GOOD", "LIKE_NEW", "USED", "NEW"]}
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
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading
                ? editMode
                  ? "Updating..."
                  : "Publishing..."
                : editMode
                  ? "Update Listing"
                  : "Publish Listing"}
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
    "w-full rounded-2xl border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>

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

function Select({ label, options, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>

      <select
        className="w-full rounded-full border border-border bg-[var(--surface-2)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
