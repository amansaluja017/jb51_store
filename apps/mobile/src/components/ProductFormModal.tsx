import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Trash2,
  ChevronDown,
  Camera,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  Check,
  FileText,
  Layers,
  Link as LinkIcon,
  FolderOpen,
  ChevronRight,
  Eye,
  Sparkles,
  RefreshCw,
  Pipette,
  Palette,
  AlertTriangle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Product, Variant } from '../types';
import DraggableImageList from './DraggableImageList';
import ColorPickerModal from './ColorPickerModal';
import MediaSelectionModal from './products/MediaSelectionModal';
import UrlInputModal from './products/UrlInputModal';
import ProductDetailsTab from './products/ProductDetailsTab';
import ProductVariantsTab from './products/ProductVariantsTab';
import ProductVisibilityTab from './products/ProductVisibilityTab';


import SimpleTextEditor from './SimpleTextEditor';
import styles from './ProductFormModal.styles';
import {
  extractColorsFromCoverImage,
  getClosestColorName,
  isValidHex,
  isLightColor,
  SIGNATURE_ATELIER_PALETTE,
} from '../utils/colorThiefHelper';
import { uploadProductImage, deleteProductImageByUrl, reorderProductImagesApi } from '../services/api';
import { countWords } from '../utils/text';
import { useForm, Controller } from 'react-hook-form';

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  mrp: string;
  sellingPrice: string;
  category: string;
  fabric: string;
  fit: string;
  careInstructions: string;
  tags: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  isListed: boolean;
  images: string[];
  variants: Variant[];
}

interface ProductFormModalProps {
  visible: boolean;
  isEditing: boolean;
  editingSlug: string | null;
  initialProduct: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (product: Product) => void;
  onReorderImages?: (newImages: string[]) => Promise<string[] | void>;
  onDeleteCategory: (categoryToDelete: string, targetCategory: string) => void;
  onAddNewCategory: (newCategory: string) => void;
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
  apiHost?: string;
  token?: string | null;
}

export default function ProductFormModal({
  visible,
  isEditing,
  editingSlug,
  initialProduct,
  categories,
  onClose,
  onSave,
  onReorderImages,
  onDeleteCategory,
  onAddNewCategory,
  showAlert,
  apiHost,
  token,
}: ProductFormModalProps) {
  // Form State managed by react-hook-form
  const getInitialFormValues = (): ProductFormData => {
    if (isEditing && initialProduct) {
      const cleanedImgs = (initialProduct.images || []).filter(img => img.trim() !== '');
      return {
        name: initialProduct.name || '',
        slug: initialProduct.slug || '',
        description: initialProduct.description || '',
        mrp: initialProduct.mrp !== undefined && initialProduct.mrp !== null ? initialProduct.mrp.toString() : (initialProduct.price ? initialProduct.price.toString() : ''),
        sellingPrice: initialProduct.sellingPrice !== undefined && initialProduct.sellingPrice !== null ? initialProduct.sellingPrice.toString() : (initialProduct.discountPrice ? initialProduct.discountPrice.toString() : (initialProduct.price ? initialProduct.price.toString() : '')),
        category: initialProduct.category || categories[0] || 'Uncategorized',
        fabric: initialProduct.fabric || '',
        fit: initialProduct.fit || '',
        careInstructions: initialProduct.careInstructions || '',
        tags: initialProduct.tags?.join(', ') || '',
        featured: initialProduct.featured || false,
        newArrival: initialProduct.newArrival || false,
        bestseller: initialProduct.bestseller || false,
        isListed: initialProduct.isListed !== false,
        images: cleanedImgs,
        variants: initialProduct.variants && initialProduct.variants.length > 0
          ? initialProduct.variants.map(({ color, hexCode, stock, reservedStock, images }) => ({
            color,
            hexCode: hexCode || '',
            stock,
            reservedStock: reservedStock || 0,
            images: (images && images.length > 0) ? images : cleanedImgs
          }))
          : [{ color: '', hexCode: '', stock: '' as any, reservedStock: 0, images: cleanedImgs }]
      };
    }
    return {
      name: '',
      slug: '',
      description: '',
      mrp: '',
      sellingPrice: '',
      category: categories[0] || 'Uncategorized',
      fabric: '',
      fit: '',
      careInstructions: '',
      tags: '',
      featured: false,
      newArrival: false,
      bestseller: false,
      isListed: true,
      images: [],
      variants: [{ color: '', hexCode: '', stock: '' as any, reservedStock: 0, images: [] }],
    };
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: getInitialFormValues(),
  });

  const formValues = watch();

  const formName = formValues.name;
  const formSlug = formValues.slug;
  const formDescription = formValues.description;
  const formMrp = formValues.mrp;
  const formSellingPrice = formValues.sellingPrice;
  const formCategory = formValues.category;
  const formFabric = formValues.fabric;
  const formFit = formValues.fit;
  const formCare = formValues.careInstructions;
  const formTags = formValues.tags;
  const formFeatured = formValues.featured;
  const formNewArrival = formValues.newArrival;
  const formBestseller = formValues.bestseller;
  const formIsListed = formValues.isListed;
  const formImages = formValues.images || [];
  const formVariants = formValues.variants || [];

  const setFormName = (val: string | ((prev: string) => string)) => {
    setValue('name', typeof val === 'function' ? val(getValues('name')) : val, { shouldDirty: true });
  };
  const setFormSlug = (val: string | ((prev: string) => string)) => {
    setValue('slug', typeof val === 'function' ? val(getValues('slug')) : val, { shouldDirty: true });
  };
  const setFormDescription = (val: string | ((prev: string) => string)) => {
    setValue('description', typeof val === 'function' ? val(getValues('description')) : val, { shouldDirty: true });
  };
  const setFormMrp = (val: string | ((prev: string) => string)) => {
    setValue('mrp', typeof val === 'function' ? val(getValues('mrp')) : val, { shouldDirty: true });
  };
  const setFormSellingPrice = (val: string | ((prev: string) => string)) => {
    setValue('sellingPrice', typeof val === 'function' ? val(getValues('sellingPrice')) : val, { shouldDirty: true });
  };
  const setFormCategory = (val: string | ((prev: string) => string)) => {
    setValue('category', typeof val === 'function' ? val(getValues('category')) : val, { shouldDirty: true });
  };
  const setFormFabric = (val: string | ((prev: string) => string)) => {
    setValue('fabric', typeof val === 'function' ? val(getValues('fabric')) : val, { shouldDirty: true });
  };
  const setFormFit = (val: string | ((prev: string) => string)) => {
    setValue('fit', typeof val === 'function' ? val(getValues('fit')) : val, { shouldDirty: true });
  };
  const setFormCare = (val: string | ((prev: string) => string)) => {
    setValue('careInstructions', typeof val === 'function' ? val(getValues('careInstructions')) : val, { shouldDirty: true });
  };
  const setFormTags = (val: string | ((prev: string) => string)) => {
    setValue('tags', typeof val === 'function' ? val(getValues('tags')) : val, { shouldDirty: true });
  };
  const setFormFeatured = (val: boolean | ((prev: boolean) => boolean)) => {
    setValue('featured', typeof val === 'function' ? val(getValues('featured')) : val, { shouldDirty: true });
  };
  const setFormNewArrival = (val: boolean | ((prev: boolean) => boolean)) => {
    setValue('newArrival', typeof val === 'function' ? val(getValues('newArrival')) : val, { shouldDirty: true });
  };
  const setFormBestseller = (val: boolean | ((prev: boolean) => boolean)) => {
    setValue('bestseller', typeof val === 'function' ? val(getValues('bestseller')) : val, { shouldDirty: true });
  };
  const setFormIsListed = (val: boolean | ((prev: boolean) => boolean)) => {
    setValue('isListed', typeof val === 'function' ? val(getValues('isListed')) : val, { shouldDirty: true });
  };
  const setFormImages = (val: string[] | ((prev: string[]) => string[])) => {
    setValue('images', typeof val === 'function' ? val(getValues('images') || []) : val, { shouldDirty: true });
  };
  const setFormVariants = (val: Variant[] | ((prev: Variant[]) => Variant[])) => {
    setValue('variants', typeof val === 'function' ? val(getValues('variants') || []) : val, { shouldDirty: true });
  };

  // Color Thief palette state per variant
  const [extractedPalettes, setExtractedPalettes] = useState<{ [variantIdx: number]: string[] }>({});
  const [isExtractingColors, setIsExtractingColors] = useState<{ [variantIdx: number]: boolean }>({});
  const [colorPickerTargetIdx, setColorPickerTargetIdx] = useState<number | null>(null);
  const prevCoverImagesRef = React.useRef<{ [variantIdx: number]: string }>({});

  // UX Nav state
  const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'visibility'>('details');

  // Media Picker overlays
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingUris, setUploadingUris] = useState<string[]>([]);
  const [deletingUris, setDeletingUris] = useState<string[]>([]);
  const [activeVariantIdxForMedia, setActiveVariantIdxForMedia] = useState<number | null>(null);
  const [isReorderingImages, setIsReorderingImages] = useState(false);
  const [reorderingVariantIdx, setReorderingVariantIdx] = useState<number | null>(null);

  // Dropdown states
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  // Discard alert state
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  // Reset form state to initial values
  const resetFormState = () => {
    reset(getInitialFormValues());
    setShowCategorySelector(false);
    setShowNewCatInput(false);
    setNewCatInput('');
    setActiveVariantIdxForMedia(null);
    setIsUploadingImage(false);
    setUploadingUris([]);
    setDeletingUris([]);
    setIsReorderingImages(false);
    setReorderingVariantIdx(null);
    setActiveTab('details');
    setExtractedPalettes({});
    setIsExtractingColors({});
    setColorPickerTargetIdx(null);
    prevCoverImagesRef.current = {};
    setShowDiscardAlert(false);
  };

  // Check if user has entered data or modified fields
  const hasUnsavedChanges = (): boolean => {
    if (!isEditing || !initialProduct) {
      // In Create mode: check if any field was filled
      if (formName.trim() !== '') return true;
      if (formSlug.trim() !== '') return true;
      if (formDescription.trim() !== '') return true;
      if (formMrp.trim() !== '') return true;
      if (formSellingPrice.trim() !== '') return true;
      if (formFabric.trim() !== '') return true;
      if (formFit.trim() !== '') return true;
      if (formCare.trim() !== '') return true;
      if (formTags.trim() !== '') return true;
      if (formFeatured !== false) return true;
      if (formNewArrival !== false) return true;
      if (formBestseller !== false) return true;
      if (formIsListed !== true) return true;
      if (formImages.length > 0) return true;

      const defaultCat = categories[0] || 'Uncategorized';
      if (formCategory && formCategory !== defaultCat) return true;

      if (formVariants.length > 1) return true;
      if (formVariants.length === 1) {
        const v = formVariants[0];
        if (v.color.trim() !== '') return true;
        if ((v.hexCode || '').trim() !== '') return true;
        if (String(v.stock).trim() !== '') return true;
        if (Number(v.reservedStock || 0) > 0) return true;
        if (v.images && v.images.length > 0) return true;
      }
      return false;
    }

    // In Edit mode: compare against initialProduct values
    const initName = initialProduct.name || '';
    const initSlug = initialProduct.slug || '';
    const initDesc = initialProduct.description || '';
    const initMrp = initialProduct.mrp !== undefined && initialProduct.mrp !== null
      ? initialProduct.mrp.toString()
      : (initialProduct.price ? initialProduct.price.toString() : '');
    const initSellingPrice = initialProduct.sellingPrice !== undefined && initialProduct.sellingPrice !== null
      ? initialProduct.sellingPrice.toString()
      : (initialProduct.discountPrice ? initialProduct.discountPrice.toString() : (initialProduct.price ? initialProduct.price.toString() : ''));
    const initCat = initialProduct.category || '';
    const initFabric = initialProduct.fabric || '';
    const initFit = initialProduct.fit || '';
    const initCare = initialProduct.careInstructions || '';
    const initTags = initialProduct.tags?.join(', ') || '';
    const initFeatured = !!initialProduct.featured;
    const initNewArrival = !!initialProduct.newArrival;
    const initBestseller = !!initialProduct.bestseller;
    const initIsListed = initialProduct.isListed !== false;
    const initImages = (initialProduct.images || []).filter(img => img.trim() !== '');

    if (formName.trim() !== initName.trim()) return true;
    if (formSlug.trim() !== initSlug.trim()) return true;
    if (formDescription.trim() !== initDesc.trim()) return true;
    if (formMrp.trim() !== initMrp.trim()) return true;
    if (formSellingPrice.trim() !== initSellingPrice.trim()) return true;
    if (formCategory !== initCat) return true;
    if (formFabric.trim() !== initFabric.trim()) return true;
    if (formFit.trim() !== initFit.trim()) return true;
    if (formCare.trim() !== initCare.trim()) return true;
    if (formTags.trim() !== initTags.trim()) return true;
    if (formFeatured !== initFeatured) return true;
    if (formNewArrival !== initNewArrival) return true;
    if (formBestseller !== initBestseller) return true;
    if (formIsListed !== initIsListed) return true;

    // Compare images
    if (formImages.length !== initImages.length) return true;
    for (let i = 0; i < formImages.length; i++) {
      if (formImages[i] !== initImages[i]) return true;
    }

    // Compare variants
    const initVariants = initialProduct.variants || [];
    if (formVariants.length !== initVariants.length) return true;
    for (let i = 0; i < formVariants.length; i++) {
      const fv = formVariants[i];
      const iv = initVariants[i];
      if (!iv) return true;
      if (fv.color.trim() !== (iv.color || '').trim()) return true;
      if ((fv.hexCode || '').trim() !== (iv.hexCode || '').trim()) return true;
      if (String(fv.stock).trim() !== String(iv.stock).trim()) return true;
      if (Number(fv.reservedStock || 0) !== Number(iv.reservedStock || 0)) return true;
      const fvImgs = fv.images || [];
      const ivImgs = iv.images || [];
      if (fvImgs.length !== ivImgs.length) return true;
      for (let j = 0; j < fvImgs.length; j++) {
        if (fvImgs[j] !== ivImgs[j]) return true;
      }
    }

    return false;
  };

  // Close attempt handler: prompts if form is dirty
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardAlert(true);
    } else {
      onClose();
    }
  };

  // Discard all changes and close
  const handleConfirmDiscard = () => {
    resetFormState();
    onClose();
  };

  // Continue editing without discarding
  const handleCancelDiscard = () => {
    setShowDiscardAlert(false);
  };

  const lastOpenedRef = React.useRef<{ visible: boolean; slug: string | null }>({ visible: false, slug: null });

  // Sync form state ONLY when modal opens or when editing a different product
  useEffect(() => {
    const wasVisible = lastOpenedRef.current.visible;
    const prevSlug = lastOpenedRef.current.slug;
    const currentSlug = editingSlug || null;

    if (visible && (!wasVisible || prevSlug !== currentSlug)) {
      resetFormState();
    }
    lastOpenedRef.current = { visible, slug: currentSlug };
  }, [visible, editingSlug]);

  const handleExtractCoverColors = async (variantIdx: number, coverUri: string, force = false) => {
    if (!coverUri) return;
    if (!force && extractedPalettes[variantIdx] && extractedPalettes[variantIdx].length > 0) {
      return;
    }

    setIsExtractingColors(prev => ({ ...prev, [variantIdx]: true }));
    try {
      const colors = await extractColorsFromCoverImage(coverUri, 6);
      if (colors && colors.length > 0) {
        setExtractedPalettes(prev => ({ ...prev, [variantIdx]: colors }));

        // Auto-select dominant color if variant does not have a hexCode yet
        setFormVariants(prevVariants => {
          const updated = [...prevVariants];
          if (updated[variantIdx] && !updated[variantIdx].hexCode) {
            const dominant = colors[0];
            const suggested = getClosestColorName(dominant);
            updated[variantIdx] = {
              ...updated[variantIdx],
              hexCode: dominant,
              color: (!updated[variantIdx].color.trim() || updated[variantIdx].color.trim() === 'Standard') 
                ? suggested 
                : updated[variantIdx].color,
            };
          }
          return updated;
        });
      }
    } catch (err) {
      console.warn('[Color Thief Extraction Notice]:', err);
    } finally {
      setIsExtractingColors(prev => ({ ...prev, [variantIdx]: false }));
    }
  };

  // Watch for changes to cover images (images[0]) and automatically extract colors with Color Thief (create mode only)
  useEffect(() => {
    if (!visible || isEditing) return;
    formVariants.forEach((v, idx) => {
      const cover = (v.images && v.images.length > 0) ? v.images[0] : null;
      if (cover) {
        if (prevCoverImagesRef.current[idx] !== cover) {
          prevCoverImagesRef.current[idx] = cover;
          handleExtractCoverColors(idx, cover, false);
        }
      } else {
        if (prevCoverImagesRef.current[idx]) {
          delete prevCoverImagesRef.current[idx];
        }
      }
    });
  }, [formVariants, visible, isEditing]);

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(generated);
    }
  };

  const isCloudinaryUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    return (
      url.includes('cloudinary.com') ||
      url.includes('res.cloudinary') ||
      url.includes('/image/upload/') ||
      url.includes('jb51_store/products') ||
      (url.startsWith('http://') || url.startsWith('https://'))
    );
  };


  const addImageUris = async (uris: string[]) => {
    if (!uris || uris.length === 0) return;
    const variantIdx = activeVariantIdxForMedia !== null && activeVariantIdxForMedia !== undefined
      ? activeVariantIdxForMedia
      : null;

    // Immediately display newly selected images so the UI is instantaneous
    if (variantIdx !== null && variantIdx !== undefined) {
      setFormVariants(prev => {
        const updated = [...prev];
        const existingImages = updated[variantIdx]?.images || [];
        if (updated[variantIdx]) {
          updated[variantIdx] = {
            ...updated[variantIdx],
            images: [...existingImages, ...uris]
          };
        }
        return updated;
      });
      // Also sync to product images list
      setFormImages(prev => Array.from(new Set([...prev, ...uris])));
    } else {
      setFormImages(prev => Array.from(new Set([...prev, ...uris])));
    }

    // Filter for local images that need Cloudinary upload
    const localUris = uris.filter(
      u => !u.startsWith('http://') && !u.startsWith('https://')
    );

    if (localUris.length > 0) {
      setIsUploadingImage(true);
      setUploadingUris(prev => Array.from(new Set([...prev, ...localUris])));

      for (let i = 0; i < localUris.length; i++) {
        const localUri = localUris[i];

        try {
          const res = await uploadProductImage(localUri, {
            productId: initialProduct?.id,
            apiHost,
            token,
          });

          const cloudUrl = res.url;
          if (variantIdx !== null && variantIdx !== undefined) {
            setFormVariants(prev => {
              const updated = [...prev];
              if (updated[variantIdx]) {
                const currentImgs = updated[variantIdx].images || [];
                updated[variantIdx] = {
                  ...updated[variantIdx],
                  images: currentImgs.map(img => img === localUri ? cloudUrl : img),
                };
              }
              return updated;
            });
            // Update product images list with Cloudinary URL
            setFormImages(prev => prev.map(img => img === localUri ? cloudUrl : img));
          } else {
            setFormImages(prev => prev.map(img => img === localUri ? cloudUrl : img));
          }
        } catch (uploadErr: any) {
          console.error('[Cloudinary Upload Failed]:', uploadErr);
          showAlert('Upload Notice', `Could not upload photo to Cloudinary: ${uploadErr.message || 'Server error'}.`, 'error');
          // If image failed to upload, don't add to the image list
          if (variantIdx !== null && variantIdx !== undefined) {
            setFormVariants(prev => {
              const updated = [...prev];
              if (updated[variantIdx]) {
                const currentImgs = updated[variantIdx].images || [];
                updated[variantIdx] = {
                  ...updated[variantIdx],
                  images: currentImgs.filter(img => img !== localUri),
                };
              }
              return updated;
            });
            setFormImages(prev => prev.filter(img => img !== localUri));
          } else {
            setFormImages(prev => prev.filter(img => img !== localUri));
          }
        } finally {
          setUploadingUris(prev => prev.filter(u => u !== localUri));
        }
      }

      setIsUploadingImage(false);
      setUploadingUris(prev => prev.filter(u => !localUris.includes(u)));
    }
  };


  const openMediaForVariant = (variantIdx: number) => {
    setActiveVariantIdxForMedia(variantIdx);
    setShowMediaOptions(true);
  };

  const removeVariantImage = async (variantIdx: number, imgIdx: number) => {
    // Read the exact URL synchronously before updating state
    const urlToRemove = formVariants[variantIdx]?.images?.[imgIdx];
    if (!urlToRemove) return;

    // Avoid duplicate delete triggers on the same image
    if (deletingUris.includes(urlToRemove)) return;

    if (isCloudinaryUrl(urlToRemove)) {
      setDeletingUris(prev => [...prev, urlToRemove]);
      try {
        console.log('[Cloudinary Delete] Deleting variant image from Cloudinary:', urlToRemove);
        await deleteProductImageByUrl(urlToRemove, { apiHost, token });
        console.log('[Cloudinary Delete Success]:', urlToRemove);
      } catch (e: any) {
        console.warn('[Cloudinary remote delete warning]:', e?.message || e);
      } finally {
        setDeletingUris(prev => prev.filter(u => u !== urlToRemove));
        setFormVariants(prev => {
          const updated = [...prev];
          if (!updated[variantIdx]) return prev;
          const existing = updated[variantIdx].images || [];
          updated[variantIdx] = {
            ...updated[variantIdx],
            images: existing.filter(img => img !== urlToRemove)
          };
          return updated;
        });
        setFormImages(prev => prev.filter(img => img !== urlToRemove));
        setUploadingUris(prev => prev.filter(u => u !== urlToRemove));
      }
    } else {
      // Local image not on Cloudinary
      setFormVariants(prev => {
        const updated = [...prev];
        if (!updated[variantIdx]) return prev;
        const existing = updated[variantIdx].images || [];
        updated[variantIdx] = {
          ...updated[variantIdx],
          images: existing.filter((_, i) => i !== imgIdx)
        };
        return updated;
      });
      setFormImages(prev => prev.filter(img => img !== urlToRemove));
      setUploadingUris(prev => prev.filter(u => u !== urlToRemove));
    }
  };

  const handleReorderVariantImages = async (variantIdx: number, newImages: string[]) => {
    setIsReorderingImages(true);
    setReorderingVariantIdx(variantIdx);
    let mergedImages: string[] = [];

    // Immediately update local form state so UI responds instantly
    setFormVariants(prev => {
      const updated = [...prev];
      if (updated[variantIdx]) {
        updated[variantIdx] = {
          ...updated[variantIdx],
          images: newImages,
        };
      }
      mergedImages = Array.from(new Set([
        ...newImages,
        ...updated.flatMap(v => v.images || []),
      ])).filter(Boolean);
      return updated;
    });

    setFormImages(mergedImages);

    const targetSlug = editingSlug || initialProduct?.slug;
    if (isEditing && targetSlug) {
      const imagesToSync = mergedImages.length > 0 ? mergedImages : newImages;
      try {
        let finalImages = imagesToSync;
        if (onReorderImages) {
          const res = await onReorderImages(imagesToSync);
          if (Array.isArray(res) && res.length > 0) finalImages = res;
        } else {
          const res = await reorderProductImagesApi(targetSlug, imagesToSync, { apiHost, token });
          if (Array.isArray(res?.images) && res.images.length > 0) finalImages = res.images;
        }

        // Keep form in sync with confirmed server order
        setFormVariants(prev => {
          const updated = [...prev];
          if (updated[variantIdx]) {
            updated[variantIdx] = {
              ...updated[variantIdx],
              images: newImages,
            };
          }
          return updated;
        });
        setFormImages(finalImages);
      } catch (err: any) {
        console.error('[handleReorderVariantImages Error]:', err);
        showAlert('Reorder Failed', err?.message || 'Failed to update image order on server.', 'error');
      } finally {
        setIsReorderingImages(false);
        setReorderingVariantIdx(null);
      }
    } else {
      setIsReorderingImages(false);
      setReorderingVariantIdx(null);
    }
  };

  // Launch photo library (Gallery) with Android legacy support to access all storage folders
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'We need photo library permissions to upload images.', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        // legacy: true allows Android users to pick from native files and other folders
        legacy: Platform.OS === 'android' ? true : false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map(asset => asset.uri);
        addImageUris(uris);
      }
    } catch (error) {
      showAlert('Error picking image', 'An error occurred while accessing the photo gallery.', 'error');
    } finally {
      setShowMediaOptions(false);
    }
  };

  // Launch Camera directly
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'We need camera permissions to take product photos.', 'error');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        addImageUris([uri]);
      }
    } catch (error) {
      showAlert('Error taking photo', 'An error occurred while launching the camera.', 'error');
    } finally {
      setShowMediaOptions(false);
    }
  };

  // Launch Document Picker for local file system access (DCIM, Downloads, device files)
  const handlePickFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map(asset => asset.uri);
        addImageUris(uris);
      }
    } catch (error) {
      showAlert('Error picking files', 'An error occurred while accessing the file storage.', 'error');
    } finally {
      setShowMediaOptions(false);
    }
  };

  const handleDeleteCategoryClick = (cat: string) => {
    const targetCat = categories.find(c => c !== cat) || 'Uncategorized';
    showAlert(
      'Delete Category',
      `Are you sure you want to delete the category "${cat}"? Products in "${cat}" will be reassigned to "${targetCat}".`,
      'confirm',
      () => {
        onDeleteCategory(cat, targetCat);
        if (formCategory === cat) {
          setFormCategory(targetCat);
        }
      }
    );
  };

  const addVariantField = () => setFormVariants(prev => [...prev, { color: '', hexCode: '', stock: '' as any, reservedStock: 0, images: [] }]);
  const updateVariantField = (idx: number, field: keyof Variant, val: string | number) => {
    const updated = [...formVariants];
    updated[idx] = { ...updated[idx], [field]: val } as Variant;
    setFormVariants(updated);
  };
  const removeVariantField = (idx: number) => {
    if (formVariants.length === 1) return;
    setFormVariants(prev => prev.filter((_, i) => i !== idx));
    setExtractedPalettes(prev => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const handleCreateCategory = () => {
    if (!newCatInput.trim()) return;
    if (categories.includes(newCatInput.trim())) {
      showAlert('Category Exists', 'This category already exists.', 'error');
      return;
    }
    onAddNewCategory(newCatInput.trim());
    setFormCategory(newCatInput.trim());
    setNewCatInput('');
    setShowNewCatInput(false);
  };

  const handleSave = async () => {
    if (isUploadingImage || deletingUris.length > 0) {
      showAlert('Operation in Progress', 'Please wait until image upload/removal finishes.', 'error');
      return;
    }

    if (!formName.trim()) {
      showAlert('Product Name Required', 'Product title cannot be empty.', 'error');
      setActiveTab('details');
      return;
    }

    const mrpNum = parseFloat(formMrp);
    const sellingPriceNum = parseFloat(formSellingPrice);

    if (isNaN(mrpNum) || mrpNum <= 0) {
      showAlert('Invalid MRP', 'Please enter a valid MRP (Maximum Retail Price) greater than 0.', 'error');
      setActiveTab('details');
      return;
    }
    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      showAlert('Invalid Selling Price', 'Please enter a valid Selling Price greater than 0.', 'error');
      setActiveTab('details');
      return;
    }
    if (sellingPriceNum > mrpNum) {
      showAlert('Price Check', 'Selling Price cannot exceed MRP.', 'error');
      setActiveTab('details');
      return;
    }
    if (!formCategory) {
      showAlert('Category Required', 'Please assign a category to this product.', 'error');
      setActiveTab('details');
      return;
    }

    const descWords = countWords(formDescription);
    if (descWords < 100) {
      const remaining = 100 - descWords;
      showAlert(
        'Description Too Short',
        `Product description must be at least 100 words (currently contains ${descWords} word${descWords === 1 ? '' : 's'}). Please add at least ${remaining} more word${remaining === 1 ? '' : 's'}.`,
        'error'
      );
      setActiveTab('details');
      return;
    }

    // Auto-sync any local images that might still be un-uploaded before saving
    let currentFormImages = [...formImages];
    let currentVariants = [...formVariants];

    const pendingUploads: { uri: string; isVariant: boolean; variantIdx?: number }[] = [];
    currentFormImages.forEach(img => {
      if (!img.startsWith('http://') && !img.startsWith('https://')) {
        pendingUploads.push({ uri: img, isVariant: false });
      }
    });

    currentVariants.forEach((v, vIdx) => {
      (v.images || []).forEach(img => {
        if (!img.startsWith('http://') && !img.startsWith('https://')) {
          pendingUploads.push({ uri: img, isVariant: true, variantIdx: vIdx });
        }
      });
    });

    if (pendingUploads.length > 0) {
      setIsUploadingImage(true);
      setUploadingUris(pendingUploads.map(p => p.uri));

      try {
        for (let i = 0; i < pendingUploads.length; i++) {
          const item = pendingUploads[i];
          try {
            const res = await uploadProductImage(item.uri, {
              productId: initialProduct?.id,
              apiHost,
              token,
            });
            const cloudUrl = res.url;
            if (!item.isVariant) {
              currentFormImages = currentFormImages.map(img => img === item.uri ? cloudUrl : img);
            } else if (item.variantIdx !== undefined) {
              currentVariants[item.variantIdx] = {
                ...currentVariants[item.variantIdx],
                images: (currentVariants[item.variantIdx].images || []).map(img => img === item.uri ? cloudUrl : img),
              };
            }
          } catch (uploadErr: any) {
            console.error('[Cloudinary Auto-upload Failed]:', uploadErr);
            if (!item.isVariant) {
              currentFormImages = currentFormImages.filter(img => img !== item.uri);
            } else if (item.variantIdx !== undefined && currentVariants[item.variantIdx]) {
              currentVariants[item.variantIdx] = {
                ...currentVariants[item.variantIdx],
                images: (currentVariants[item.variantIdx].images || []).filter(img => img !== item.uri),
              };
            }
          }
        }
      } finally {
        setIsUploadingImage(false);
        setUploadingUris([]);
      }
    }

    const cleanedImages = currentFormImages.map(img => img.trim()).filter(img => img !== '');
    const cleanedVariants = (currentVariants.length > 0 ? currentVariants : []).map(v => ({
      color: v.color.trim(),
      hexCode: (v.hexCode || '').trim() || undefined,
      stock: Number(v.stock) || 0,
      reservedStock: Number(v.reservedStock) || 0,
      images: (v.images || []).map(img => img.trim()).filter(img => img !== '')
    }));

    if (!isEditing) {
      // Validate: color is mandatory for each variant
      const missingColorIdx = cleanedVariants.findIndex(v => !v.color);
      if (missingColorIdx !== -1) {
        showAlert(
          'Color Required',
          `Variant #${missingColorIdx + 1} is missing a color. Color is mandatory for every variant.`,
          'error'
        );
        setActiveTab('variants');
        return;
      }

      // Validate: stock must be greater than 0 for each variant
      const invalidStockIdx = cleanedVariants.findIndex(v => isNaN(v.stock) || v.stock <= 0);
      if (invalidStockIdx !== -1) {
        showAlert(
          'Stock Required',
          `Variant #${invalidStockIdx + 1} stock must be greater than 0.`,
          'error'
        );
        setActiveTab('variants');
        return;
      }
    }

    const allVariantImages = cleanedVariants.flatMap(v => v.images || []);
    const finalProductImages = Array.from(new Set([
      ...cleanedImages,
      ...allVariantImages,
    ]));

    if (finalProductImages.length < 2) {
      showAlert('At Least 2 Images Required', 'At least 2 product images are mandatory.', 'error');
      return;
    }

    const tags = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== '');

    const savePayload: any = {
      id: initialProduct?.id || Math.random().toString(36).substring(2, 9),
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim(),
      price: sellingPriceNum,
      mrp: mrpNum,
      sellingPrice: sellingPriceNum,
      discountPrice: mrpNum > sellingPriceNum ? sellingPriceNum : undefined,
      category: formCategory,
      images: finalProductImages,
      fabric: formFabric.trim(),
      fit: formFit.trim(),
      careInstructions: formCare.trim(),
      featured: formFeatured,
      newArrival: formNewArrival,
      bestseller: formBestseller,
      isListed: formIsListed,
      tags
    };

    if (!isEditing) {
      savePayload.variants = cleanedVariants;
    }

    onSave(savePayload);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleCloseAttempt}>
      <SafeAreaView style={styles.modalShell}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isEditing ? 'Modify Outfit' : 'Create New Outfit'}</Text>
          <TouchableOpacity onPress={handleCloseAttempt} style={styles.closeHeaderBtn}>
            <X size={20} color="#09090b" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('details')}
            style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
          >
            <FileText size={16} color={activeTab === 'details' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('variants')}
            style={[styles.tabButton, activeTab === 'variants' && styles.activeTabButton]}
          >
            <Layers size={16} color={activeTab === 'variants' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'variants' && styles.activeTabText]}>Variants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('visibility')}
            style={[styles.tabButton, activeTab === 'visibility' && styles.activeTabButton]}
          >
            <Eye size={16} color={activeTab === 'visibility' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'visibility' && styles.activeTabText]}>Visibility</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalScrollPadding}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {activeTab === 'details' && (
              <ProductDetailsTab
                control={control}
                categories={categories}
                formMrp={formMrp}
                setFormMrp={setFormMrp}
                formSellingPrice={formSellingPrice}
                setFormSellingPrice={setFormSellingPrice}
                setFormFabric={setFormFabric}
                setFormFit={setFormFit}
                setFormCare={setFormCare}
                setFormTags={setFormTags}
                setFormDescription={setFormDescription}
                formSlug={formSlug}
                setFormSlug={setFormSlug}
                formCategory={formCategory}
                setFormCategory={setFormCategory}
                showCategorySelector={showCategorySelector}
                setShowCategorySelector={setShowCategorySelector}
                showNewCatInput={showNewCatInput}
                setShowNewCatInput={setShowNewCatInput}
                newCatInput={newCatInput}
                setNewCatInput={setNewCatInput}
                handleCreateCategory={handleCreateCategory}
                handleDeleteCategoryClick={handleDeleteCategoryClick}
                handleNameChange={handleNameChange}
              />
            )}

            {activeTab === 'variants' && (
              <ProductVariantsTab
                isEditing={isEditing}
                addVariantField={addVariantField}
                formVariants={formVariants}
                extractedPalettes={extractedPalettes}
                removeVariantField={removeVariantField}
                updateVariantField={updateVariantField}
                setColorPickerTargetIdx={setColorPickerTargetIdx}
                openMediaForVariant={openMediaForVariant}
                removeVariantImage={removeVariantImage}
                handleReorderVariantImages={handleReorderVariantImages}
                handleExtractCoverColors={handleExtractCoverColors}
                isExtractingColors={isExtractingColors}
                reorderingVariantIdx={reorderingVariantIdx}
                isUploadingImage={isUploadingImage}
                activeVariantIdxForMedia={activeVariantIdxForMedia}
                isReorderingImages={isReorderingImages}
                uploadingUris={uploadingUris}
                deletingUris={deletingUris}
              />
            )}

            {activeTab === 'visibility' && (
              <ProductVisibilityTab
                isListed={formIsListed}
                setIsListed={setFormIsListed}
                featured={formFeatured}
                setFeatured={setFormFeatured}
                newArrival={formNewArrival}
                setNewArrival={setFormNewArrival}
                bestseller={formBestseller}
                setBestseller={setFormBestseller}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer controls */}
        <View style={styles.bottomNavigationRow}>
          {activeTab !== 'details' ? (
            <TouchableOpacity
              onPress={() => {
                if (activeTab === 'visibility') {
                  setActiveTab('variants');
                } else if (activeTab === 'variants') {
                  setActiveTab('details');
                }
              }}
              style={styles.secondaryBottomBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBottomBtnText}>Go Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleCloseAttempt}
              style={styles.secondaryBottomBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBottomBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {activeTab !== 'visibility' ? (
            <TouchableOpacity
              onPress={() => {
                if (activeTab === 'details') {
                  setActiveTab('variants');
                } else if (activeTab === 'variants') {
                  setActiveTab('visibility');
                }
              }}
              style={styles.primaryBottomBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBottomBtnText}>Continue</Text>
              <ArrowRight size={14} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit(() => handleSave())}
              style={[styles.submitBottomBtn, (isUploadingImage || deletingUris.length > 0) && { opacity: 0.6 }]}
              activeOpacity={0.8}
              disabled={isUploadingImage || deletingUris.length > 0}
            >
              <Text style={styles.primaryBottomBtnText}>{isEditing ? 'Save Outfit' : 'Publish Outfit'}</Text>
              <Check size={14} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Media Selection Sheet */}
        <MediaSelectionModal
          visible={showMediaOptions}
          onClose={() => setShowMediaOptions(false)}
          onPickImage={handlePickImage}
          onTakePhoto={handleTakePhoto}
          onPickDocument={handlePickFromFiles}
          onOpenUrlInput={() => {
            setShowMediaOptions(false);
            setTimeout(() => setShowUrlInput(true), 350);
          }}
        />

        {/* URL Input Modal */}
        <UrlInputModal
          visible={showUrlInput}
          url={tempUrl}
          setUrl={setTempUrl}
          onClose={() => {
            setShowUrlInput(false);
            setTempUrl('');
          }}
          onSubmit={() => {
            if (tempUrl.trim()) {
              addImageUris([tempUrl.trim()]);
              setTempUrl('');
              setShowUrlInput(false);
            }
          }}
        />

        {/* Color Picker Modal */}
        {colorPickerTargetIdx !== null && (
          <ColorPickerModal
            visible={colorPickerTargetIdx !== null}
            initialHex={formVariants[colorPickerTargetIdx]?.hexCode || '#FF5E36'}
            onClose={() => setColorPickerTargetIdx(null)}
            onSelectColor={(hex, suggestedName) => {
              if (colorPickerTargetIdx !== null) {
                updateVariantField(colorPickerTargetIdx, 'hexCode', hex);
                const currentV = formVariants[colorPickerTargetIdx];
                if (!currentV?.color?.trim() || currentV.color.trim() === 'Standard') {
                  updateVariantField(colorPickerTargetIdx, 'color', suggestedName);
                }
              }
            }}
          />
        )}

        {/* Unsaved Changes Discard Alert */}
        {showDiscardAlert && (
          <View style={styles.discardAlertBackdrop}>
            <View style={styles.discardAlertBox}>
              <View style={styles.discardIconContainer}>
                <AlertTriangle size={28} color="#FF5E36" />
              </View>
              <Text style={styles.discardAlertTitle}>Discard Changes?</Text>
              <Text style={styles.discardAlertMessage}>
                You have unsaved changes. Are you sure you want to discard them? All entered data and modifications will be lost.
              </Text>
              <View style={styles.discardActionsContainer}>
                <TouchableOpacity
                  onPress={handleCancelDiscard}
                  style={[styles.discardBtn, styles.discardBtnContinue]}
                  activeOpacity={0.7}
                  accessibilityLabel="Continue editing"
                >
                  <Text style={styles.discardBtnContinueText}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmDiscard}
                  style={[styles.discardBtn, styles.discardBtnDiscard]}
                  activeOpacity={0.7}
                  accessibilityLabel="Discard all changes"
                >
                  <Text style={styles.discardBtnDiscardText}>Discard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

      </SafeAreaView>
    </Modal>
  );
}

