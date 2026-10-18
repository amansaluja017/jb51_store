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

            {/* -------------------- TAB 1: DETAILS -------------------- */}
            {activeTab === 'details' && (
              <View style={styles.tabContentContainer}>

                {/* Basic Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Basic Garment Info</Text>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>Design Name</Text>
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: 'Product name is required' }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          value={value}
                          onBlur={onBlur}
                          onChangeText={(val) => {
                            onChange(val);
                            handleNameChange(val);
                          }}
                          placeholder="e.g. Palace Silk Kurta"
                          style={styles.modalInput}
                          placeholderTextColor="#a1a1aa"
                        />
                      )}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>SEO URL Slug</Text>
                    <Controller
                      control={control}
                      name="slug"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          value={value}
                          onBlur={onBlur}
                          onChangeText={(val) => {
                            onChange(val);
                            setFormSlug(val);
                          }}
                          placeholder="e.g. palace-silk-kurta"
                          style={styles.modalInput}
                          placeholderTextColor="#a1a1aa"
                        />
                      )}
                    />
                  </View>

                  {/* Category Dropdown */}
                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>Boutique Category</Text>
                    <TouchableOpacity
                      onPress={() => setShowCategorySelector(prev => !prev)}
                      style={styles.dropdownTrigger}
                    >
                      <Text style={styles.dropdownTriggerText} numberOfLines={1}>{formCategory}</Text>
                      <ChevronDown size={14} color="#71717a" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>

                  {showCategorySelector && (
                    <View style={styles.dropdownWrapper}>
                      {categories.map(cat => (
                        <View key={cat} style={styles.dropdownItemRow}>
                          <TouchableOpacity
                            onPress={() => { setFormCategory(cat); setShowCategorySelector(false); }}
                            style={styles.dropdownItemButton}
                          >
                            <Text style={styles.dropdownItemText}>{cat}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteCategoryClick(cat)}
                            style={styles.deleteCategoryBtn}
                          >
                            <Trash2 size={12} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ))}

                      <View style={styles.dropdownItemDivider} />
                      {!showNewCatInput ? (
                        <TouchableOpacity
                          onPress={() => setShowNewCatInput(true)}
                          style={styles.addNewCatTrigger}
                        >
                          <Text style={styles.addNewCatTriggerText}>+ Create New Category</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.newCatInputBox}>
                          <TextInput
                            placeholder="Type category..."
                            value={newCatInput}
                            onChangeText={setNewCatInput}
                            style={styles.newCatTextInput}
                            placeholderTextColor="#a1a1aa"
                          />
                          <TouchableOpacity onPress={handleCreateCategory} style={styles.newCatAddBtn}>
                            <Text style={styles.newCatAddBtnText}>Add</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Pricing Inputs: MRP & Selling Price */}
                  <View style={styles.twoColumnGrid}>
                    {/* MRP with Rupee symbol */}
                    <View style={[styles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.fieldLabel}>MRP (INR) *</Text>
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.pricePrefix}>₹</Text>
                        <Controller
                          control={control}
                          name="mrp"
                          rules={{ required: 'MRP is required' }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              value={value}
                              onBlur={onBlur}
                              onChangeText={(val) => {
                                onChange(val);
                                setFormMrp(val);
                              }}
                              placeholder="2999"
                              keyboardType="numeric"
                              style={styles.priceInput}
                              placeholderTextColor="#a1a1aa"
                            />
                          )}
                        />
                      </View>
                    </View>

                    {/* Selling Price with Rupee symbol */}
                    <View style={[styles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.fieldLabel}>Selling Price (INR) *</Text>
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.pricePrefix}>₹</Text>
                        <Controller
                          control={control}
                          name="sellingPrice"
                          rules={{ required: 'Selling price is required' }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              value={value}
                              onBlur={onBlur}
                              onChangeText={(val) => {
                                onChange(val);
                                setFormSellingPrice(val);
                              }}
                              placeholder="1999"
                              keyboardType="numeric"
                              style={styles.priceInput}
                              placeholderTextColor="#a1a1aa"
                            />
                          )}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Live Discount Indicator */}
                  {Boolean(Number(formMrp) > 0 && Number(formSellingPrice) > 0) && (
                    <View style={styles.discountPreviewContainer}>
                      {Number(formSellingPrice) <= Number(formMrp) ? (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            {Number(formMrp) > Number(formSellingPrice)
                              ? `${Math.round(((Number(formMrp) - Number(formSellingPrice)) / Number(formMrp)) * 100)}% OFF • Customer saves ₹${(Number(formMrp) - Number(formSellingPrice)).toLocaleString('en-IN')}`
                              : 'No discount (Selling at MRP)'}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.discountErrorText}>⚠️ Selling price cannot exceed MRP</Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Technical Specifications Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Material & Styling Specs</Text>

                  {/* Fabric Details */}
                  <Controller
                    control={control}
                    name="fabric"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <SimpleTextEditor
                        label="Fabric Details"
                        value={value || ''}
                        onBlur={onBlur}
                        onChangeText={(val) => {
                          onChange(val);
                          setFormFabric(val);
                        }}
                        placeholder="e.g. 100% Chanderi Silk with Zari borders"
                        multiline
                        numberOfLines={2}
                      />
                    )}
                  />

                  {/* Fit Silhouette */}
                  <Controller
                    control={control}
                    name="fit"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <SimpleTextEditor
                        label="Fit Silhouette"
                        value={value || ''}
                        onBlur={onBlur}
                        onChangeText={(val) => {
                          onChange(val);
                          setFormFit(val);
                        }}
                        placeholder="e.g. Straight Silhouette with comfort ease"
                        multiline
                        numberOfLines={2}
                      />
                    )}
                  />

                  {/* Care Instructions */}
                  <Controller
                    control={control}
                    name="careInstructions"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <SimpleTextEditor
                        label="Care Instructions"
                        value={value || ''}
                        onBlur={onBlur}
                        onChangeText={(val) => {
                          onChange(val);
                          setFormCare(val);
                        }}
                        placeholder="e.g. Dry Clean only. Store in muslin cloth."
                        multiline
                        numberOfLines={2}
                      />
                    )}
                  />

                  {/* Outfit Tags */}
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <SimpleTextEditor
                        label="Outfit Tags (Comma Separated)"
                        value={value || ''}
                        onBlur={onBlur}
                        onChangeText={(val) => {
                          onChange(val);
                          setFormTags(val);
                        }}
                        placeholder="e.g. silk, minimalist, wedding, coord"
                      />
                    )}
                  />
                </View>

                {/* Editorial Description Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Editorial Narration</Text>

                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <SimpleTextEditor
                        label="Editorial Description"
                        value={value || ''}
                        onBlur={onBlur}
                        onChangeText={(val) => {
                          onChange(val);
                          setFormDescription(val);
                        }}
                        placeholder="Describe heritage motifs, dupatta styles, embroidery, or weave history..."
                        multiline
                        numberOfLines={5}
                      />
                    )}
                  />
                </View>

              </View>
            )}

            {/* -------------------- TAB 2: VARIANTS -------------------- */}
            {activeTab === 'variants' && (
              <View style={styles.tabContentContainer}>

                {/* Variants Overview & Action Banner Card */}
                <View style={styles.variantsHeaderCard}>
                  <View style={styles.variantHeaderMainRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.variantsTitleText}>Variant Collections</Text>
                      <Text style={styles.variantsSubtextText}>
                        {isEditing
                          ? 'View garment shades, photos, and current inventory allocation.'
                          : 'Configure colors, stock counts, and dedicated images per variant.'}
                      </Text>
                    </View>
                    {!isEditing && (
                      <TouchableOpacity
                        onPress={addVariantField}
                        style={styles.addVariantPrimaryBtn}
                        activeOpacity={0.8}
                      >
                        <Plus size={14} color="#ffffff" />
                        <Text style={styles.addVariantPrimaryBtnText}>Add Variant</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Summary Stat Pills */}
                  <View style={styles.variantSummaryPillsRow}>
                    <View style={styles.summaryPill}>
                      <Text style={styles.summaryPillLabel}>Variants</Text>
                      <Text style={styles.summaryPillValue}>{formVariants.length}</Text>
                    </View>
                    <View style={styles.summaryPill}>
                      <Text style={styles.summaryPillLabel}>Available</Text>
                      <Text style={[styles.summaryPillValue, { color: '#16a34a' }]}>
                        {formVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)}
                      </Text>
                    </View>
                    <View style={styles.summaryPill}>
                      <Text style={styles.summaryPillLabel}>Reserved</Text>
                      <Text style={[styles.summaryPillValue, { color: '#d97706' }]}>
                        {formVariants.reduce((sum, v) => sum + (Number(v.reservedStock) || 0), 0)}
                      </Text>
                    </View>
                    <View style={styles.summaryPill}>
                      <Text style={styles.summaryPillLabel}>Total Stock</Text>
                      <Text style={[styles.summaryPillValue, { color: '#FF5E36' }]}>
                        {formVariants.reduce((sum, v) => sum + (Number(v.stock) || 0) + (Number(v.reservedStock) || 0), 0)} pcs
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Variant Cards List */}
                {formVariants.map((v, idx) => {
                  const avail = Number(v.stock) || 0;
                  const res = Number(v.reservedStock) || 0;
                  const total = avail + res;
                  const coverImg = v.images && v.images.length > 0 ? v.images[0] : null;
                  const variantPalette = extractedPalettes[idx] || [];

                  return (
                    <View key={idx} style={styles.redesignedVariantCard}>
                      {/* Card Header Tag & Delete Action */}
                      <View style={styles.variantCardHeaderBar}>
                        <View style={styles.variantCardBadge}>
                          <View style={[styles.colorDot, { backgroundColor: (v.hexCode && isValidHex(v.hexCode)) ? v.hexCode : (v.color.trim() ? '#FF5E36' : '#a1a1aa') }]} />
                          <Text style={styles.variantCardBadgeText}>
                            VARIANT #{idx + 1} {v.color.trim() ? `• ${v.color.trim()}` : ''} {v.hexCode ? `• ${v.hexCode}` : ''} • {total} Total
                          </Text>
                        </View>
                        {!isEditing && (
                          <TouchableOpacity
                            onPress={() => removeVariantField(idx)}
                            style={styles.deleteVariantIconCardBtn}
                            disabled={formVariants.length === 1}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={14} color={formVariants.length === 1 ? '#d4d4d8' : '#ef4444'} />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* 1. IMAGE SELECTION FIRST (Top Section) */}
                      <View style={styles.variantImageFirstSection}>
                        <View style={styles.variantGalleryHeader}>
                          <Text style={styles.variantGalleryTitle}>STEP 1: VARIANT IMAGES • DRAG TO REORDER</Text>
                          <Text style={styles.variantGalleryCount}>{(v.images || []).length} photos</Text>
                        </View>

                        <DraggableImageList
                          images={v.images || []}
                          uploadingUris={uploadingUris}
                          deletingUris={deletingUris}
                          isUploading={isUploadingImage && (activeVariantIdxForMedia === idx || activeVariantIdxForMedia === null)}
                          isReordering={isReorderingImages && reorderingVariantIdx === idx}
                          onReorder={(newImages: string[]) => handleReorderVariantImages(idx, newImages)}
                          onRemove={(imgIdx: number) => removeVariantImage(idx, imgIdx)}
                          onAddPress={() => openMediaForVariant(idx)}
                        />
                      </View>

                      {/* STEP 2: REDESIGNED COLOR & TONE STUDIO */}
                      <View style={styles.colorStudioSection}>
                        <View style={styles.colorStudioHeaderRow}>
                          <View style={styles.colorStudioTitleBadge}>
                            <Palette size={13} color="#FF5E36" style={{ marginRight: 5 }} />
                            <Text style={styles.colorStudioHeaderTitle}>STEP 2: COLOR IDENTITY & SHADE</Text>
                          </View>
                          {v.hexCode && isValidHex(v.hexCode) ? (
                            <View style={styles.colorReadyBadge}>
                              <Check size={10} color="#16a34a" style={{ marginRight: 3 }} />
                              <Text style={styles.colorReadyText}>CONFIGURED</Text>
                            </View>
                          ) : (
                            <View style={styles.colorPendingBadge}>
                              <Text style={styles.colorPendingText}>REQUIRED</Text>
                            </View>
                          )}
                        </View>

                        {/* Active Color Master Card / Live Hero Display */}
                        <View style={styles.activeColorHeroCard}>
                          <View style={styles.heroLeftSection}>
                            {/* Color Swatch Circle with Gloss */}
                            <View
                              style={[
                                styles.heroColorSwatch,
                                {
                                  backgroundColor:
                                    v.hexCode && isValidHex(v.hexCode)
                                      ? v.hexCode
                                      : v.color.trim()
                                      ? '#f4f4f5'
                                      : '#fafafa',
                                  borderColor:
                                    v.hexCode && isValidHex(v.hexCode)
                                      ? 'rgba(0,0,0,0.1)'
                                      : '#e4e4e7',
                                },
                              ]}
                            >
                              {!(v.hexCode && isValidHex(v.hexCode)) && (
                                <Palette size={18} color="#a1a1aa" />
                              )}
                              <View style={styles.swatchGlossHighlight} />
                            </View>

                            {/* Color Info Texts */}
                            <View style={styles.heroColorInfo}>
                              <Text style={styles.heroColorNameText} numberOfLines={1}>
                                {v.color.trim() || 'Select / Name Shade'}
                              </Text>
                              <View style={styles.heroHexRow}>
                                <View
                                  style={[
                                    styles.heroHexPill,
                                    v.hexCode && isValidHex(v.hexCode) && styles.heroHexPillActive,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.heroHexText,
                                      v.hexCode && isValidHex(v.hexCode) && styles.heroHexTextActive,
                                    ]}
                                  >
                                    {v.hexCode && isValidHex(v.hexCode)
                                      ? v.hexCode.toUpperCase()
                                      : 'No Hex Assigned'}
                                  </Text>
                                </View>
                                {v.hexCode && isValidHex(v.hexCode) && (
                                  <Text style={styles.heroSuggestedTag} numberOfLines={1}>
                                    • {getClosestColorName(v.hexCode)}
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Action Button: Launch High-Precision Color Picker Modal */}
                          <TouchableOpacity
                            onPress={() => setColorPickerTargetIdx(idx)}
                            style={styles.heroPickerActionBtn}
                            activeOpacity={0.8}
                          >
                            <Pipette size={14} color="#FF5E36" style={{ marginRight: 4 }} />
                            <Text style={styles.heroPickerActionText}>Picker</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Palettes Container */}
                        <View style={styles.palettesContainer}>
                          {/* 1. Cover Photo AI Extracted Palette */}
                          <View style={styles.paletteSourceBox}>
                            <View style={styles.paletteSourceHeaderRow}>
                              <View style={styles.paletteSourceHeaderLeft}>
                                <Sparkles size={12} color="#FF5E36" style={{ marginRight: 4 }} />
                                <Text style={styles.paletteSourceTitle}>
                                  FROM COVER PHOTO (AI EXTRACTED)
                                </Text>
                              </View>
                              {coverImg ? (
                                <TouchableOpacity
                                  onPress={() => handleExtractCoverColors(idx, coverImg, true)}
                                  disabled={isExtractingColors[idx]}
                                  style={styles.reExtractBtn}
                                  activeOpacity={0.7}
                                >
                                  <RefreshCw
                                    size={10}
                                    color={isExtractingColors[idx] ? '#FF5E36' : '#71717a'}
                                    style={{ marginRight: 3 }}
                                  />
                                  <Text style={styles.reExtractBtnText}>
                                    {isExtractingColors[idx] ? 'Extracting...' : 'Re-extract'}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>

                            {isExtractingColors[idx] ? (
                              <View style={styles.extractionLoadingBox}>
                                <ActivityIndicator size="small" color="#FF5E36" style={{ marginRight: 8 }} />
                                <Text style={styles.extractionLoadingText}>
                                  Detecting dominant garment tones with Color Thief...
                                </Text>
                              </View>
                            ) : coverImg ? (
                              variantPalette.length > 0 ? (
                                <ScrollView
                                  horizontal
                                  showsHorizontalScrollIndicator={false}
                                  contentContainerStyle={styles.extractedColorsScroll}
                                >
                                  {variantPalette.map((hex, cIdx) => {
                                    const isSelected = (v.hexCode || '').toUpperCase() === hex.toUpperCase();
                                    const light = isLightColor(hex);
                                    const suggestedName = getClosestColorName(hex);
                                    return (
                                      <TouchableOpacity
                                        key={cIdx}
                                        onPress={() => {
                                          updateVariantField(idx, 'hexCode', hex);
                                          if (!v.color.trim() || v.color.trim() === 'Standard') {
                                            updateVariantField(idx, 'color', suggestedName);
                                          }
                                        }}
                                        style={[
                                          styles.paletteChipCard,
                                          isSelected && styles.paletteChipCardSelected,
                                        ]}
                                        activeOpacity={0.75}
                                      >
                                        <View
                                          style={[
                                            styles.paletteChipSwatch,
                                            { backgroundColor: hex },
                                            isSelected && styles.paletteChipSwatchSelected,
                                          ]}
                                        >
                                          {isSelected && (
                                            <Check
                                              size={13}
                                              color={light ? '#000000' : '#ffffff'}
                                              strokeWidth={2.5}
                                            />
                                          )}
                                        </View>
                                        <Text
                                          style={[
                                            styles.paletteChipHex,
                                            isSelected && styles.paletteChipHexSelected,
                                          ]}
                                          numberOfLines={1}
                                        >
                                          {hex}
                                        </Text>
                                        <Text
                                          style={[
                                            styles.paletteChipName,
                                            isSelected && styles.paletteChipNameSelected,
                                          ]}
                                          numberOfLines={1}
                                        >
                                          {suggestedName}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </ScrollView>
                              ) : (
                                <View style={styles.paletteNoticeBox}>
                                  <Text style={styles.paletteNoticeText}>
                                    Colors not yet extracted. Tap "Re-extract" or pick from signature shades below.
                                  </Text>
                                </View>
                              )
                            ) : (
                              <View style={styles.paletteNoticeBox}>
                                <ImageIcon size={13} color="#94a3b8" style={{ marginRight: 6 }} />
                                <Text style={styles.paletteNoticeText}>
                                  Add a cover photo above to auto-detect colors, or select a curated shade below.
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* 2. Curated Signature Atelier Palette */}
                          <View style={styles.signatureSectionBox}>
                            <Text style={styles.signatureSectionTitle}>
                              SIGNATURE ATELIER SHADES
                            </Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.signatureScrollContent}
                            >
                              {SIGNATURE_ATELIER_PALETTE.map((preset, pIdx) => {
                                const isSelected =
                                  (v.hexCode || '').toUpperCase() === preset.hex.toUpperCase();
                                const light = isLightColor(preset.hex);
                                return (
                                  <TouchableOpacity
                                    key={pIdx}
                                    onPress={() => {
                                      updateVariantField(idx, 'hexCode', preset.hex);
                                      updateVariantField(idx, 'color', preset.name);
                                    }}
                                    style={[
                                      styles.signatureChipBtn,
                                      isSelected && styles.signatureChipBtnSelected,
                                    ]}
                                    activeOpacity={0.75}
                                  >
                                    <View
                                      style={[
                                        styles.signatureCircleSwatch,
                                        { backgroundColor: preset.hex },
                                        isSelected && styles.signatureCircleSwatchSelected,
                                      ]}
                                    >
                                      {isSelected && (
                                        <Check
                                          size={11}
                                          color={light ? '#000000' : '#ffffff'}
                                          strokeWidth={2.5}
                                        />
                                      )}
                                    </View>
                                    <Text
                                      style={[
                                        styles.signatureChipLabel,
                                        isSelected && styles.signatureChipLabelSelected,
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {preset.name}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </ScrollView>
                          </View>
                        </View>

                        {/* Dedicated Color Input Fields */}
                        <View style={styles.colorInputsContainer}>
                          <View style={styles.colorInputsRow}>
                            {/* Color Name Input */}
                            <View style={styles.colorNameInputCol}>
                              <Text style={styles.stylishFieldLabel}>
                                COLOR / SHADE NAME <Text style={{ color: '#ef4444' }}>*</Text>
                              </Text>
                              <TextInput
                                placeholder="e.g. Royal Wine, Champagne"
                                value={v.color}
                                onChangeText={(val) => updateVariantField(idx, 'color', val)}
                                style={[
                                  styles.stylishVariantInput,
                                  !v.color.trim() && { borderColor: '#fca5a5' },
                                ]}
                                placeholderTextColor="#a1a1aa"
                              />
                              {/* Quick Suggestion Tag if Hex is set and differs */}
                              {Boolean(v.hexCode &&
                                isValidHex(v.hexCode) &&
                                getClosestColorName(v.hexCode!) !== v.color.trim()) && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      updateVariantField(idx, 'color', getClosestColorName(v.hexCode!))
                                    }
                                    style={styles.suggestionPillBtn}
                                    activeOpacity={0.7}
                                  >
                                    <Sparkles size={10} color="#FF5E36" style={{ marginRight: 3 }} />
                                    <Text style={styles.suggestionPillText} numberOfLines={1}>
                                      Suggested: "{getClosestColorName(v.hexCode!)}" (tap to apply)
                                    </Text>
                                  </TouchableOpacity>
                                )}
                            </View>

                            {/* Hex Code Input */}
                            <View style={styles.hexInputCol}>
                              <Text style={styles.stylishFieldLabel}>HEX CODE</Text>
                              <View style={styles.hexFieldWrapper}>
                                <View
                                  style={[
                                    styles.hexIndicatorDot,
                                    {
                                      backgroundColor:
                                        v.hexCode && isValidHex(v.hexCode) ? v.hexCode : '#cbd5e1',
                                    },
                                  ]}
                                />
                                <TextInput
                                  placeholder="#RRGGBB"
                                  value={v.hexCode || ''}
                                  maxLength={7}
                                  autoCapitalize="characters"
                                  onChangeText={(val) => {
                                    let formatted = val.toUpperCase().replace(/[^0-9A-F#]/g, '');
                                    if (!formatted.startsWith('#') && formatted.length > 0)
                                      formatted = '#' + formatted;
                                    updateVariantField(idx, 'hexCode', formatted);
                                    if (
                                      isValidHex(formatted) &&
                                      (!v.color.trim() || v.color.trim() === 'Standard')
                                    ) {
                                      updateVariantField(idx, 'color', getClosestColorName(formatted));
                                    }
                                  }}
                                  style={styles.hexInlineInput}
                                  placeholderTextColor="#a1a1aa"
                                />
                                <TouchableOpacity
                                  onPress={() => setColorPickerTargetIdx(idx)}
                                  style={styles.openPickerSmallBtn}
                                  activeOpacity={0.8}
                                >
                                  <Pipette size={13} color="#FF5E36" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* STEP 3: DEDICATED INVENTORY & STOCK ALLOCATION */}
                      <View style={styles.inventoryAllocationSection}>
                        <View style={styles.inventoryHeaderRow}>
                          <View style={styles.inventoryHeaderLeft}>
                            <Layers size={13} color="#71717a" style={{ marginRight: 5 }} />
                            <Text style={styles.inventoryHeaderTitle}>
                              STEP 3: INVENTORY & STOCK ALLOCATION
                            </Text>
                          </View>
                          <View style={styles.totalPillSmallBadge}>
                            <Text style={styles.totalPillSmallBadgeText}>{total} pcs total</Text>
                          </View>
                        </View>

                        {isEditing ? (
                          <View style={styles.readOnlyInventoryBanner}>
                            <View style={styles.readOnlyStockStatsRow}>
                              <View style={styles.readOnlyStatItem}>
                                <Text style={styles.readOnlyStatLabel}>AVAILABLE</Text>
                                <Text style={[styles.readOnlyStatVal, { color: '#16a34a' }]}>{avail} pcs</Text>
                              </View>
                              <View style={styles.readOnlyStatDivider} />
                              <View style={styles.readOnlyStatItem}>
                                <Text style={styles.readOnlyStatLabel}>RESERVED</Text>
                                <Text style={[styles.readOnlyStatVal, { color: '#d97706' }]}>{res} pcs</Text>
                              </View>
                              <View style={styles.readOnlyStatDivider} />
                              <View style={styles.readOnlyStatItem}>
                                <Text style={styles.readOnlyStatLabel}>TOTAL</Text>
                                <Text style={[styles.readOnlyStatVal, { color: '#09090b' }]}>{total} pcs</Text>
                              </View>
                            </View>
                            <Text style={styles.readOnlyInventoryHint}>
                              🔒 Inventory editing is disabled in this form. Manage stock quantities and adjustments from the Inventory screen.
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.stockAllocationRow}>
                            <View style={styles.stockColItem}>
                              <Text style={styles.stylishFieldLabel}>
                                AVAILABLE <Text style={{ color: '#ef4444' }}>*</Text>
                              </Text>
                              <TextInput
                                placeholder="Min 1"
                                value={
                                  v.stock !== undefined && v.stock !== null && (v.stock as any) !== ''
                                    ? String(v.stock)
                                    : ''
                                }
                                onChangeText={(val) =>
                                  updateVariantField(idx, 'stock', val.replace(/[^0-9]/g, ''))
                                }
                                keyboardType="numeric"
                                style={[
                                  styles.stylishVariantInput,
                                  (Number(v.stock) <= 0 || (v.stock as any) === '') && {
                                    borderColor: '#fca5a5',
                                  },
                                ]}
                                placeholderTextColor="#a1a1aa"
                              />
                            </View>

                            <View style={styles.stockColItem}>
                              <Text style={styles.stylishFieldLabel}>RESERVED</Text>
                              <TextInput
                                placeholder="0"
                                value={
                                  v.reservedStock !== undefined &&
                                  v.reservedStock !== null &&
                                  (v.reservedStock as any) !== '' &&
                                  v.reservedStock !== 0
                                    ? String(v.reservedStock)
                                    : v.reservedStock === 0
                                    ? '0'
                                    : ''
                                }
                                onChangeText={(val) =>
                                  updateVariantField(idx, 'reservedStock', val.replace(/[^0-9]/g, ''))
                                }
                                keyboardType="numeric"
                                style={styles.stylishVariantInput}
                                placeholderTextColor="#a1a1aa"
                              />
                            </View>

                            <View style={styles.stockColItem}>
                              <Text style={styles.stylishFieldLabel}>TOTAL UNITS</Text>
                              <View style={styles.readOnlyTotalBox}>
                                <Text style={styles.readOnlyTotalText}>{total} pcs</Text>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}

              </View>
            )}

            {/* -------------------- TAB 3: VISIBILITY -------------------- */}
            {activeTab === 'visibility' && (
              <View style={styles.tabContentContainer}>

                {/* Settings Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Boutique Display & Visibility</Text>
                  <Text style={styles.cardHeaderSubtitle}>Configure storefront visibility and promotional tagging.</Text>

                  <View style={styles.switchRowCard}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={styles.switchTitle}>Visibility listed</Text>
                      <Text style={styles.switchDesc}>Outfit is active and visible to client browsing.</Text>
                    </View>
                    <Switch
                      value={formIsListed}
                      onValueChange={setFormIsListed}
                      trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  <View style={styles.switchRowCard}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={styles.switchTitle}>Featured on Homepage</Text>
                      <Text style={styles.switchDesc}>Include this outfit in the home landing carousel.</Text>
                    </View>
                    <Switch
                      value={formFeatured}
                      onValueChange={setFormFeatured}
                      trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  <View style={styles.switchRowCard}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={styles.switchTitle}>New Arrivals Edit</Text>
                      <Text style={styles.switchDesc}>Display tag and group in the New Collection list.</Text>
                    </View>
                    <Switch
                      value={formNewArrival}
                      onValueChange={setFormNewArrival}
                      trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  <View style={styles.switchRowCard}>
                    <View style={styles.switchLabelContainer}>
                      <Text style={styles.switchTitle}>Bestseller Label</Text>
                      <Text style={styles.switchDesc}>Label with high popularity indicator flag.</Text>
                    </View>
                    <Switch
                      value={formBestseller}
                      onValueChange={setFormBestseller}
                      trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>

              </View>
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

        {/* Media Selection Sheet (Modal) */}
        <Modal
          visible={showMediaOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMediaOptions(false)}
        >
          <View style={styles.overlayContainer}>
            <TouchableOpacity
              style={styles.overlayBackground}
              activeOpacity={1}
              onPress={() => setShowMediaOptions(false)}
            />
            <View style={styles.mediaOptionsSheet}>
              <Text style={styles.overlayTitle}>Add Garment Media</Text>
              <Text style={styles.overlaySubtitle}>Select how you want to access and select outfit photos</Text>

              <View style={styles.verticalOptionsContainer}>
                <TouchableOpacity
                  style={styles.verticalOptionRow}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: '#e0f2fe' }]}>
                    <ImageIcon size={20} color="#0284c7" />
                  </View>
                  <View style={styles.optionTextBox}>
                    <Text style={styles.optionTitle}>Photo Gallery</Text>
                    <Text style={styles.optionDescription}>Pick images from your device photo library</Text>
                  </View>
                  <ChevronRight size={16} color="#71717a" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.verticalOptionRow}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: '#ecfdf5' }]}>
                    <Camera size={20} color="#059669" />
                  </View>
                  <View style={styles.optionTextBox}>
                    <Text style={styles.optionTitle}>Device Camera</Text>
                    <Text style={styles.optionDescription}>Take a live photo of the product</Text>
                  </View>
                  <ChevronRight size={16} color="#71717a" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.verticalOptionRow}
                  onPress={handlePickFromFiles}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: '#f4f4f5' }]}>
                    <FolderOpen size={20} color="#52525b" />
                  </View>
                  <View style={styles.optionTextBox}>
                    <Text style={styles.optionTitle}>Local Files (Storage)</Text>
                    <Text style={styles.optionDescription}>Browse internal storage, DCIM, and downloads</Text>
                  </View>
                  <ChevronRight size={16} color="#71717a" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.verticalOptionRow}
                  onPress={() => {
                    setShowMediaOptions(false);
                    setTimeout(() => setShowUrlInput(true), 350);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: '#fef3c7' }]}>
                    <LinkIcon size={20} color="#d97706" />
                  </View>
                  <View style={styles.optionTextBox}>
                    <Text style={styles.optionTitle}>Web Image URL</Text>
                    <Text style={styles.optionDescription}>Paste a direct image link</Text>
                  </View>
                  <ChevronRight size={16} color="#71717a" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelOverlayBtn}
                onPress={() => setShowMediaOptions(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelOverlayBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* URL Input Modal */}
        <Modal
          visible={showUrlInput}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUrlInput(false)}
        >
          <View style={styles.overlayContainerCenter}>
            <TouchableOpacity
              style={styles.overlayBackground}
              activeOpacity={1}
              onPress={() => setShowUrlInput(false)}
            />
            <View style={styles.urlInputCard}>
              <Text style={styles.overlayTitle}>Import Web Image</Text>
              <Text style={styles.overlaySubtitle}>Paste a direct web image link</Text>

              <TextInput
                placeholder="https://example.com/image.jpg"
                value={tempUrl}
                onChangeText={setTempUrl}
                autoFocus
                style={styles.urlTextInput}
                placeholderTextColor="#a1a1aa"
              />

              <View style={styles.urlButtonsRow}>
                <TouchableOpacity
                  style={[styles.urlButton, { backgroundColor: '#f4f4f5' }]}
                  onPress={() => {
                    setShowUrlInput(false);
                    setTempUrl('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.urlButtonText, { color: '#09090b' }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.urlButton, { backgroundColor: '#FF5E36' }]}
                  onPress={() => {
                    if (tempUrl.trim()) {
                      addImageUris([tempUrl.trim()]);
                      setTempUrl('');
                      setShowUrlInput(false);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.urlButtonText, { color: '#ffffff' }]}>Add Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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

