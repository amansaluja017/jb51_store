import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Switch, 
  SafeAreaView, 
  Alert,
  Platform 
} from 'react-native';
import { X, Trash2, ChevronDown, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, Variant } from '../types';

interface ProductFormModalProps {
  visible: boolean;
  isEditing: boolean;
  editingSlug: string | null;
  initialProduct: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (payload: any) => void;
  onAddNewCategory: (newCat: string) => void;
  onDeleteCategory: (category: string) => void;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
}

export default function ProductFormModal({
  visible,
  isEditing,
  initialProduct,
  categories,
  onClose,
  onSave,
  onAddNewCategory,
  onDeleteCategory,
  showAlert
}: ProductFormModalProps) {
  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formFabric, setFormFabric] = useState('');
  const [formFit, setFormFit] = useState('');
  const [formCare, setFormCare] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);
  const [formBestseller, setFormBestseller] = useState(false);
  const [formIsListed, setFormIsListed] = useState(true);
  const [formImages, setFormImages] = useState<string[]>(['']);
  const [formVariants, setFormVariants] = useState<Variant[]>([
    { color: '', size: 'M', stock: 10 }
  ]);

  // Dropdown states
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (visible) {
      if (isEditing && initialProduct) {
        setFormName(initialProduct.name);
        setFormSlug(initialProduct.slug);
        setFormDescription(initialProduct.description || '');
        setFormPrice(initialProduct.price.toString());
        setFormCategory(initialProduct.category);
        setFormFabric(initialProduct.fabric || '');
        setFormFit(initialProduct.fit || '');
        setFormCare(initialProduct.careInstructions || '');
        setFormTags(initialProduct.tags?.join(', ') || '');
        setFormFeatured(initialProduct.featured || false);
        setFormNewArrival(initialProduct.newArrival || false);
        setFormBestseller(initialProduct.bestseller || false);
        setFormIsListed(initialProduct.isListed !== false);
        setFormImages(initialProduct.images.length > 0 ? initialProduct.images : ['']);
        setFormVariants(initialProduct.variants.length > 0 ? initialProduct.variants : [{ color: '', size: 'M', stock: 10 }]);
      } else {
        setFormName('');
        setFormSlug('');
        setFormDescription('');
        setFormPrice('');
        setFormCategory(categories[0] || 'Uncategorized');
        setFormFabric('');
        setFormFit('');
        setFormCare('');
        setFormTags('');
        setFormFeatured(false);
        setFormNewArrival(false);
        setFormBestseller(false);
        setFormIsListed(true);
        setFormImages(['']);
        setFormVariants([{ color: 'Emerald Green', size: 'M', stock: 10 }]);
      }
      setShowCategorySelector(false);
      setShowNewCatInput(false);
      setNewCatInput('');
    }
  }, [visible, isEditing, initialProduct, categories]);

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

  const addImageField = () => setFormImages(prev => [...prev, '']);
  const updateImageField = (idx: number, val: string) => {
    const updated = [...formImages];
    updated[idx] = val;
    setFormImages(updated);
  };
  const removeImageField = (idx: number) => {
    if (formImages.length === 1) return;
    setFormImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'We need photo library permissions to upload images.', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setFormImages(prev => {
          if (prev.length === 1 && prev[0] === '') {
            return [uri];
          }
          return [...prev, uri];
        });
      }
    } catch (error) {
      showAlert('Error picking image', 'An error occurred while accessing the photo gallery.', 'error');
    }
  };

  const handleDeleteCategoryClick = (cat: string) => {
    showAlert(
      'Delete Category',
      `Are you sure you want to delete the category "${cat}"?`,
      'confirm',
      () => {
        onDeleteCategory(cat);
        if (formCategory === cat) {
          const remaining = categories.filter(c => c !== cat);
          setFormCategory(remaining[0] || 'Uncategorized');
        }
      }
    );
  };

  const addVariantField = () => setFormVariants(prev => [...prev, { color: '', size: 'M', stock: 10 }]);
  const updateVariantField = (idx: number, field: keyof Variant, val: string | number) => {
    const updated = [...formVariants];
    updated[idx] = { ...updated[idx], [field]: val } as Variant;
    setFormVariants(updated);
  };
  const removeVariantField = (idx: number) => {
    if (formVariants.length === 1) return;
    setFormVariants(prev => prev.filter((_, i) => i !== idx));
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

  const handleSave = () => {
    if (!formName.trim() || !formPrice.trim() || !formSlug.trim()) {
      showAlert('Required Fields', 'Please enter a Name, Slug, and Price.', 'error');
      return;
    }

    const priceNum = Number(formPrice);
    if (isNaN(priceNum)) {
      showAlert('Invalid Price', 'Please enter a numeric price.', 'error');
      return;
    }

    const cleanedImages = formImages.map(img => img.trim()).filter(img => img !== '');
    const cleanedVariants = formVariants.map(v => ({
      color: v.color.trim() || 'Default Color',
      size: v.size,
      stock: Number(v.stock) || 0
    }));

    const tags = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t !== '');

    onSave({
      id: initialProduct?.id || Math.random().toString(36).substring(2, 9),
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim(),
      price: priceNum,
      category: formCategory,
      images: cleanedImages.length > 0 ? cleanedImages : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'],
      fabric: formFabric.trim(),
      fit: formFit.trim(),
      careInstructions: formCare.trim(),
      variants: cleanedVariants,
      featured: formFeatured,
      newArrival: formNewArrival,
      bestseller: formBestseller,
      isListed: formIsListed,
      tags
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalShell}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{isEditing ? 'Modify Outfit' : 'Create New Outfit'}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="#09090b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalScrollPadding}>
          {/* Name */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>Design Name</Text>
            <TextInput 
              value={formName}
              onChangeText={handleNameChange}
              placeholder="e.g. Palace Silk Kurta"
              style={styles.modalInput}
            />
          </View>

          {/* Slug */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>SEO URL Slug</Text>
            <TextInput 
              value={formSlug}
              onChangeText={setFormSlug}
              placeholder="e.g. palace-silk-kurta"
              style={styles.modalInput}
            />
          </View>

          {/* Category Dropdown */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>Boutique Category</Text>
            <TouchableOpacity 
              onPress={() => setShowCategorySelector(prev => !prev)}
              style={styles.dropdownTrigger}
            >
              <Text style={styles.dropdownTriggerText}>{formCategory}</Text>
              <ChevronDown size={14} color="#71717a" />
            </TouchableOpacity>

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
                      <Trash2 size={10} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {/* Inline custom addition */}
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
                    />
                    <TouchableOpacity onPress={handleCreateCategory} style={styles.newCatAddBtn}>
                      <Text style={styles.newCatAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>Atelier Price (INR)</Text>
            <TextInput 
              value={formPrice}
              onChangeText={setFormPrice}
              placeholder="e.g. 24500"
              keyboardType="numeric"
              style={styles.modalInput}
            />
          </View>

          {/* Description */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>Editorial Description</Text>
            <TextInput 
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="Describe fabric weaving, heritage motifs, dupatta styles..."
              multiline
              numberOfLines={3}
              style={[styles.modalInput, styles.multilineInput]}
            />
          </View>

          {/* Details Grid */}
          <View style={styles.twoColumnGrid}>
            <View style={[styles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.fieldLabel}>Fabric details</Text>
              <TextInput 
                value={formFabric}
                onChangeText={setFormFabric}
                placeholder="e.g. 100% Chanderi Silk"
                style={styles.modalInput}
              />
            </View>
            <View style={[styles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>Fit Type</Text>
              <TextInput 
                value={formFit}
                onChangeText={setFormFit}
                placeholder="e.g. Tailored Straight Fit"
                style={styles.modalInput}
              />
            </View>
          </View>

          {/* Care instructions */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>Care Instructions</Text>
            <TextInput 
              value={formCare}
              onChangeText={setFormCare}
              placeholder="Dry Clean recommended..."
              style={styles.modalInput}
            />
          </View>

          {/* Tags */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.fieldLabel}>Outfit Search Tags (Comma Separated)</Text>
            <TextInput 
              value={formTags}
              onChangeText={setFormTags}
              placeholder="silk, minimalist, wedding, coord"
              style={styles.modalInput}
            />
          </View>

          {/* Images Manager */}
          <View style={styles.managerBlock}>
            <View style={styles.managerHeader}>
              <Text style={styles.fieldLabel}>Design Images</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={handlePickImage} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Upload size={12} color="#FF5E36" />
                  <Text style={styles.managerActionText}>Pick from Device</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addImageField}>
                  <Text style={styles.managerActionText}>+ Add URL</Text>
                </TouchableOpacity>
              </View>
            </View>
            {formImages.map((img, idx) => (
              <View key={idx} style={styles.managerRow}>
                <TextInput 
                  value={img}
                  onChangeText={(val) => updateImageField(idx, val)}
                  placeholder="Paste Unsplash or image URL..."
                  style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                />
                <TouchableOpacity onPress={() => removeImageField(idx)}>
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Sizing Variants */}
          <View style={styles.managerBlock}>
            <View style={styles.managerHeader}>
              <Text style={styles.fieldLabel}>Inventory Variants</Text>
              <TouchableOpacity onPress={addVariantField}>
                <Text style={styles.managerActionText}>+ Add Variant</Text>
              </TouchableOpacity>
            </View>
            {formVariants.map((v, idx) => (
              <View key={idx} style={styles.variantManagerRow}>
                <TextInput 
                  placeholder="Color"
                  value={v.color}
                  onChangeText={(val) => updateVariantField(idx, 'color', val)}
                  style={[styles.modalInput, { flex: 2, marginRight: 4 }]}
                />
                <TextInput 
                  placeholder="Size"
                  value={v.size}
                  onChangeText={(val) => updateVariantField(idx, 'size', val)}
                  style={[styles.modalInput, { flex: 1, marginRight: 4 }]}
                />
                <TextInput 
                  placeholder="Qty"
                  value={v.stock.toString()}
                  onChangeText={(val) => updateVariantField(idx, 'stock', val)}
                  keyboardType="numeric"
                  style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                />
                <TouchableOpacity onPress={() => removeVariantField(idx)}>
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Switches Group */}
          <View style={styles.switchesGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Store Visibility (Listed)</Text>
              <Switch 
                value={formIsListed}
                onValueChange={setFormIsListed}
                trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Featured on Home Screen</Text>
              <Switch 
                value={formFeatured}
                onValueChange={setFormFeatured}
                trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>New Arrival collection</Text>
              <Switch 
                value={formNewArrival}
                onValueChange={setFormNewArrival}
                trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Bestseller label</Text>
              <Switch 
                value={formBestseller}
                onValueChange={setFormBestseller}
                trackColor={{ false: '#e4e4e7', true: '#FF5E36' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          {/* Save Action */}
          <View style={styles.formActions}>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Outfit Configuration</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalShell: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
  },
  modalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
  },
  modalBody: {
    flex: 1,
  },
  modalScrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#71717a',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 11,
    fontWeight: 'medium',
    color: '#09090b',
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  twoColumnGrid: {
    flexDirection: 'row',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  dropdownTriggerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  dropdownWrapper: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    marginTop: 4,
    padding: 6,
    gap: 2,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dropdownItemButton: {
    flex: 1,
    paddingVertical: 4,
  },
  deleteCategoryBtn: {
    padding: 6,
    borderRadius: 4,
  },
  dropdownItemText: {
    fontSize: 11,
    color: '#09090b',
    fontWeight: 'semibold',
  },
  dropdownItemDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 4,
  },
  addNewCatTrigger: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  addNewCatTriggerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  newCatInputBox: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
  },
  newCatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
  },
  newCatAddBtn: {
    backgroundColor: '#FF5E36',
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  newCatAddBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  managerBlock: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fcfcfc',
  },
  managerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  managerActionText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF5E36',
    textTransform: 'uppercase',
  },
  managerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantManagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchesGroup: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fcfcfc',
    marginBottom: 24,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 10,
    fontWeight: 'semibold',
    color: '#09090b',
  },
  formActions: {
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
