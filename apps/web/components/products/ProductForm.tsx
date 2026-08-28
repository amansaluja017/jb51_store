'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2, ImageOff, Check } from 'lucide-react';
import { type Product, type ProductVariant } from '@repo/products';
import { api } from '@/lib/trpc/client/react';
import { toast } from 'sonner';
import { Dropdown } from '@/components/ui/Dropdown';

interface ProductFormProps {
  initialData?: Product | null;
  isEdit?: boolean;
}

const CATEGORIES = [
  'Formal Suits',
  'Anarkali Suits',
  'Silk Co-ords',
  'Velvet Edit',
  'Occasion Wear'
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'].map(sz => ({ value: sz, label: sz }));

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  // Custom categories state
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('jb51_custom_categories');
    if (saved) {
      try {
        setCustomCategories(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const allCategories = [...CATEGORIES, ...customCategories];
  if (initialData?.category && !allCategories.includes(initialData.category)) {
    allCategories.push(initialData.category);
  }

  const categoryOptions = allCategories.map(cat => ({ value: cat, label: cat }));

  const handleCreateCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      toast.error('Category name cannot be empty.');
      return;
    }
    const exists = allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const match = allCategories.find(c => c.toLowerCase() === trimmed.toLowerCase()) || trimmed;
      setCategory(match);
      setIsAddingCategory(false);
      setNewCategoryInput('');
      toast.success(`Selected existing category: ${match}`);
      return;
    }

    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    localStorage.setItem('jb51_custom_categories', JSON.stringify(updated));
    setCategory(trimmed);
    setIsAddingCategory(false);
    setNewCategoryInput('');
    toast.success(`Category "${trimmed}" added and selected.`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (CATEGORIES.includes(catToDelete)) {
      toast.error('Default boutique categories cannot be deleted.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${catToDelete}"?`)) {
      const updated = customCategories.filter(c => c !== catToDelete);
      setCustomCategories(updated);
      localStorage.setItem('jb51_custom_categories', JSON.stringify(updated));
      
      if (category === catToDelete) {
        setCategory(CATEGORIES[0]);
      }
      toast.success(`Category "${catToDelete}" deleted successfully.`);
    }
  };

  // Primary fields
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [fabric, setFabric] = useState(initialData?.fabric || '');
  const [fit, setFit] = useState(initialData?.fit || '');
  const [careInstructions, setCareInstructions] = useState(initialData?.careInstructions || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [newArrival, setNewArrival] = useState(initialData?.newArrival || false);
  const [bestseller, setBestseller] = useState(initialData?.bestseller || false);
  const [isListed, setIsListed] = useState(initialData?.isListed !== false);

  // Array fields
  const [images, setImages] = useState<string[]>(initialData?.images || ['']);
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  
  // Variants fields
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || [{ color: '', size: 'M', stock: 10 }]
  );

  // Auto slug generation
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);

  useEffect(() => {
    if (autoSlug && !isEdit) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [name, autoSlug, isEdit]);

  // tRPC Mutations
  const createMutation = api.products.create.useMutation({
    onSuccess: () => {
      toast.success('Outfit created successfully.');
      router.push('/admin/products');
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create outfit.');
    }
  });

  const updateMutation = api.products.update.useMutation({
    onSuccess: () => {
      toast.success('Outfit updated successfully.');
      router.push('/admin/products');
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update outfit.');
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug) {
      toast.error('Slug is required.');
      return;
    }

    const cleanedImages = images.filter(img => img.trim() !== '');
    if (cleanedImages.length === 0) {
      toast.error('Please provide at least one product image.');
      return;
    }

    const cleanedVariants = variants.filter(v => v.color.trim() !== '');
    if (cleanedVariants.length === 0) {
      toast.error('Please configure at least one variant.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== '');

    const payload = {
      id: initialData?.id || Math.random().toString(36).substring(2, 9),
      name,
      slug,
      description,
      price: Number(price),
      category,
      images: cleanedImages,
      fabric,
      fit,
      careInstructions,
      variants: cleanedVariants,
      featured,
      newArrival,
      bestseller,
      isListed,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      tags,
    };

    if (isEdit && initialData) {
      updateMutation.mutate({
        slug: initialData.slug,
        data: payload
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Image helpers
  const handleAddImage = () => setImages([...images, '']);
  const handleRemoveImage = (index: number) => {
    const next = [...images];
    next.splice(index, 1);
    setImages(next.length === 0 ? [''] : next);
  };
  const handleImageChange = (index: number, val: string) => {
    const next = [...images];
    next[index] = val;
    setImages(next);
  };

  // Variant helpers
  const handleAddVariant = () => {
    setVariants([...variants, { color: '', size: 'M', stock: 10 }]);
  };
  const handleRemoveVariant = (index: number) => {
    const next = [...variants];
    next.splice(index, 1);
    setVariants(next.length === 0 ? [{ color: '', size: 'M', stock: 10 }] : next);
  };
  const handleVariantChange = <K extends keyof ProductVariant>(
    index: number,
    key: K,
    val: ProductVariant[K]
  ) => {
    const next = [...variants];
    next[index] = { ...next[index], [key]: val };
    setVariants(next);
  };

  return (
    <form onSubmit={handleSubmit} className="font-sans space-y-10 pb-20">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-600 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs uppercase tracking-widest text-[#FF5E36] font-bold block mb-1">
              {isEdit ? 'Modification' : 'Creation'}
            </span>
            <h1 className="font-serif text-3xl font-bold text-zinc-950">
              {isEdit ? `Edit Outfit: ${initialData?.name}` : 'New Atelier Outfit'}
            </h1>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-[#FF5E36] hover:bg-[#FF5E36]/90 text-white rounded-full px-6 py-3 flex items-center justify-center gap-2 text-xs tracking-wider uppercase font-semibold transition-all duration-300 shadow-lg shadow-[#FF5E36]/10 hover:shadow-[#FF5E36]/20 active:scale-[0.98] disabled:opacity-50"
          aria-label={isSubmitting ? "Saving Changes" : "Save Changes"}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Grid splits details and sidebar settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Basic info */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">Basic Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Outfit Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ivory Chanderi Silk Co-ord Set"
                  className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">URL Slug *</label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setAutoSlug(!autoSlug)}
                      className={`text-[9px] font-bold tracking-wider uppercase ${autoSlug ? 'text-[#FF5E36]' : 'text-zinc-400'}`}
                    >
                      {autoSlug ? 'Auto' : 'Manual'}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ivory-chanderi-silk-coord"
                  className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors disabled:bg-zinc-50 disabled:text-zinc-400"
                  disabled={autoSlug && !isEdit}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Product Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the silhouette, pattern details, structure, and embellishments..."
                className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors resize-none leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Price (INR) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="16800"
                  className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors"
                  min="0"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Category *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(!isAddingCategory);
                      setNewCategoryInput('');
                    }}
                    className="text-[9px] font-bold tracking-wider uppercase text-[#FF5E36] transition-colors hover:text-[#FF5E36]/80"
                  >
                    {isAddingCategory ? 'Cancel' : '+ New Category'}
                  </button>
                </div>
                
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="e.g. Festival Edit"
                      className="flex-1 px-4 py-3 border border-zinc-200 focus:border-zinc-455 rounded-xl outline-none text-xs font-semibold text-zinc-800 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="bg-zinc-950 text-white hover:bg-zinc-900 px-4 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <Dropdown
                    options={categoryOptions}
                    value={category}
                    onChange={(val) => setCategory(val)}
                    onDeleteOption={handleDeleteCategory}
                    className="w-full"
                    triggerClassName="rounded-xl px-4 py-3.5 border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 hover:bg-white text-left shadow-none focus:border-zinc-400"
                    menuClassName="left-0 right-0 origin-top"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section: Fabric specs */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">Fabric & Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Fabric Composition</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Chanderi Silk with gold zari borders"
                  className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Silhouette & Fit Details</label>
                <input
                  type="text"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  placeholder="e.g. Relaxed, fluid fit. True to size."
                  className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Care Instructions</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Dry clean only. Iron on reverse."
                className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors"
              />
            </div>
          </div>

          {/* Section: Sizing and Color variants */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-zinc-900">Stock & Sizing Variants</h2>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-[#FF5E36] hover:text-[#FF5E36]/80 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase transition-colors"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-end sm:items-center gap-4 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                  <div className="flex-1 w-full grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5 col-span-1.5">
                      <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Shade/Color *</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                        placeholder="e.g. Warm Ivory"
                        className="px-3 py-2 border border-zinc-200 bg-white focus:border-zinc-400 rounded-lg outline-none text-xs font-semibold text-zinc-800"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Size *</label>
                      <Dropdown
                        options={SIZE_OPTIONS}
                        value={variant.size}
                        onChange={(val) => handleVariantChange(idx, 'size', val)}
                        className="w-full"
                        triggerClassName="rounded-lg px-3 py-2 border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 hover:bg-white text-left shadow-none focus:border-zinc-400"
                        menuClassName="left-0 origin-top min-w-[120px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold">Stock *</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                        className="px-3 py-2 border border-zinc-200 bg-white focus:border-zinc-400 rounded-lg outline-none text-xs font-semibold text-zinc-800"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="w-8 h-8 rounded-lg border border-zinc-250 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                    aria-label={`Remove variant ${idx + 1}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Settings & Image Previews */}
        <div className="space-y-6">
          
          {/* Section: Badges & Display Settings */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">List Statuses</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) => setNewArrival(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-zinc-300 text-[#FF5E36] focus:ring-[#FF5E36]/30"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">New Arrival</span>
                  <span className="text-[10px] text-zinc-400 font-light block mt-0.5">Show in the "New Arrivals" section</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group border-t border-zinc-50 pt-4">
                <input
                  type="checkbox"
                  checked={bestseller}
                  onChange={(e) => setBestseller(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-zinc-300 text-[#FF5E36] focus:ring-[#FF5E36]/30"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">Bestseller</span>
                  <span className="text-[10px] text-zinc-400 font-light block mt-0.5">Highlight as a high-performing design</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group border-t border-zinc-50 pt-4">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-zinc-300 text-[#FF5E36] focus:ring-[#FF5E36]/30"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">Featured</span>
                  <span className="text-[10px] text-zinc-400 font-light block mt-0.5">Display on the main boutique homepage</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group border-t border-zinc-50 pt-4">
                <input
                  type="checkbox"
                  checked={isListed}
                  onChange={(e) => setIsListed(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-zinc-300 text-[#FF5E36] focus:ring-[#FF5E36]/30"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">Listed / Store Visibility</span>
                  <span className="text-[10px] text-zinc-400 font-light block mt-0.5">Make this design visible in the customer shop catalogue</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section: Tag tags */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">Outfit Tags</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="silk, minimalist, coord, wedding"
                className="px-4 py-3 border border-zinc-200 focus:border-zinc-400 rounded-xl outline-none text-xs font-semibold text-zinc-800 transition-colors"
              />
              <span className="text-[9px] text-zinc-400 font-light">
                Tags match recommended "Similar Outfits" grids algorithmically.
              </span>
            </div>
          </div>

          {/* Section: Images Gallery urls */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-serif text-base font-bold text-zinc-900">Image Gallery URLs</h3>
              <button
                type="button"
                onClick={handleAddImage}
                className="text-[#FF5E36] hover:text-[#FF5E36]/80 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase transition-colors"
              >
                <Plus size={14} /> Add Image
              </button>
            </div>

            <div className="space-y-4">
              {images.map((image, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 border border-zinc-200 focus:border-zinc-400 rounded-lg outline-none text-[10px] font-semibold text-zinc-800 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="w-8 h-8 rounded-lg border border-zinc-250 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Thumbnail Preview */}
                  {image.trim().startsWith('http') ? (
                    <div className="relative w-full aspect-[4/3] bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shadow-inner group">
                      <img 
                        src={image} 
                        alt={`Preview ${idx + 1}`} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] bg-zinc-50/50 border border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-zinc-300 gap-1.5">
                      <ImageOff size={18} />
                      <span className="text-[9px] uppercase tracking-wider font-bold">No Image Preview</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </form>
  );
}
