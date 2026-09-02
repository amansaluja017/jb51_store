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
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView
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
  ChevronRight
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
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
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formVariants, setFormVariants] = useState<Variant[]>([
    { color: '', size: 'M', stock: 10 }
  ]);

  // UX Nav state
  const [activeTab, setActiveTab] = useState<'details' | 'visuals' | 'inventory'>('details');

  // Media Picker overlays
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

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
        
        // Clean out empty strings from initial images if they exist
        const cleanedImgs = initialProduct.images.filter(img => img.trim() !== '');
        setFormImages(cleanedImgs);
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
        setFormImages([]);
        setFormVariants([{ color: 'Emerald Green', size: 'M', stock: 10 }]);
      }
      setShowCategorySelector(false);
      setShowNewCatInput(false);
      setNewCatInput('');
      setActiveTab('details'); // Reset tab state to start
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

  const removeImageField = (idx: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== idx));
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
        setFormImages(prev => [...prev, ...uris]);
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
        setFormImages(prev => [...prev, uri]);
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
        setFormImages(prev => [...prev, ...uris]);
      }
    } catch (error) {
      showAlert('Error picking files', 'An error occurred while accessing the file storage.', 'error');
    } finally {
      setShowMediaOptions(false);
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
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderBtn}>
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
            onPress={() => setActiveTab('visuals')} 
            style={[styles.tabButton, activeTab === 'visuals' && styles.activeTabButton]}
          >
            <ImageIcon size={16} color={activeTab === 'visuals' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'visuals' && styles.activeTabText]}>Visuals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('inventory')} 
            style={[styles.tabButton, activeTab === 'inventory' && styles.activeTabButton]}
          >
            <Layers size={16} color={activeTab === 'inventory' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>Inventory</Text>
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
                    <TextInput 
                      value={formName}
                      onChangeText={handleNameChange}
                      placeholder="e.g. Palace Silk Kurta"
                      style={styles.modalInput}
                      placeholderTextColor="#a1a1aa"
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>SEO URL Slug</Text>
                    <TextInput 
                      value={formSlug}
                      onChangeText={setFormSlug}
                      placeholder="e.g. palace-silk-kurta"
                      style={styles.modalInput}
                      placeholderTextColor="#a1a1aa"
                    />
                  </View>

                  <View style={styles.twoColumnGrid}>
                    {/* Price with Rupee symbol indicator */}
                    <View style={[styles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.fieldLabel}>Atelier Price (INR)</Text>
                      <View style={styles.priceInputWrapper}>
                        <Text style={styles.pricePrefix}>₹</Text>
                        <TextInput 
                          value={formPrice}
                          onChangeText={setFormPrice}
                          placeholder="24500"
                          keyboardType="numeric"
                          style={styles.priceInput}
                          placeholderTextColor="#a1a1aa"
                        />
                      </View>
                    </View>

                    {/* Category Dropdown */}
                    <View style={[styles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.fieldLabel}>Boutique Category</Text>
                      <TouchableOpacity 
                        onPress={() => setShowCategorySelector(prev => !prev)}
                        style={styles.dropdownTrigger}
                      >
                        <Text style={styles.dropdownTriggerText} numberOfLines={1}>{formCategory}</Text>
                        <ChevronDown size={14} color="#71717a" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
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
                </View>

                {/* Technical Specifications Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Material & Styling Specs</Text>
                  
                  <View style={styles.twoColumnGrid}>
                    <View style={[styles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.fieldLabel}>Fabric Details</Text>
                      <TextInput 
                        value={formFabric}
                        onChangeText={setFormFabric}
                        placeholder="e.g. 100% Chanderi Silk"
                        style={styles.modalInput}
                        placeholderTextColor="#a1a1aa"
                      />
                    </View>
                    <View style={[styles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.fieldLabel}>Fit Silhouette</Text>
                      <TextInput 
                        value={formFit}
                        onChangeText={setFormFit}
                        placeholder="e.g. Straight Silhouette"
                        style={styles.modalInput}
                        placeholderTextColor="#a1a1aa"
                      />
                    </View>
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>Care Instructions</Text>
                    <TextInput 
                      value={formCare}
                      onChangeText={setFormCare}
                      placeholder="e.g. Dry Clean only. Store in muslin cloth."
                      style={styles.modalInput}
                      placeholderTextColor="#a1a1aa"
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>Outfit Tags (Comma Separated)</Text>
                    <TextInput 
                      value={formTags}
                      onChangeText={setFormTags}
                      placeholder="e.g. silk, minimalist, wedding, coord"
                      style={styles.modalInput}
                      placeholderTextColor="#a1a1aa"
                    />
                  </View>
                </View>

                {/* Editorial Description Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Editorial Narration</Text>
                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>Editorial Description</Text>
                    <TextInput 
                      value={formDescription}
                      onChangeText={setFormDescription}
                      placeholder="Describe heritage motifs, dupatta styles, embroidery, or weave history..."
                      multiline
                      numberOfLines={4}
                      style={[styles.modalInput, styles.multilineInput]}
                      placeholderTextColor="#a1a1aa"
                    />
                  </View>
                </View>

              </View>
            )}

            {/* -------------------- TAB 2: VISUALS -------------------- */}
            {activeTab === 'visuals' && (
              <View style={styles.tabContentContainer}>
                
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Visual Gallery</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Showcase the garment. Drag and drop, select files from your mobile storage roll, or capture a live outfit picture. Recommended aspect ratio 3:4.
                  </Text>
                  
                  <View style={styles.imageGrid}>
                    {formImages.map((img, idx) => {
                      if (!img || img.trim() === '') return null;
                      return (
                        <View key={idx} style={styles.imageCardContainer}>
                          <Image source={{ uri: img }} style={styles.imagePreview} />
                          <TouchableOpacity 
                            onPress={() => removeImageField(idx)} 
                            style={styles.deleteImageBadge}
                            activeOpacity={0.8}
                          >
                            <X size={10} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                    
                    {/* Add Image Tile */}
                    <TouchableOpacity 
                      onPress={() => setShowMediaOptions(true)} 
                      style={styles.addImageTile}
                      activeOpacity={0.7}
                    >
                      <View style={styles.addImageTileInner}>
                        <Plus size={20} color="#FF5E36" />
                        <Text style={styles.addImageTileText}>Add Media</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  {formImages.length === 0 && (
                    <View style={styles.emptyGalleryBanner}>
                      <ImageIcon size={28} color="#a1a1aa" />
                      <Text style={styles.emptyGalleryText}>No assets added yet.</Text>
                      <Text style={styles.emptyGallerySubtext}>Add photos from device library or live camera.</Text>
                    </View>
                  )}
                </View>

              </View>
            )}

            {/* -------------------- TAB 3: INVENTORY -------------------- */}
            {activeTab === 'inventory' && (
              <View style={styles.tabContentContainer}>
                
                {/* Inventory Table */}
                <View style={styles.sectionCard}>
                  <View style={styles.variantHeaderRow}>
                    <Text style={styles.cardHeaderTitle}>Garment Variants</Text>
                    <TouchableOpacity 
                      onPress={addVariantField} 
                      style={styles.addVariantHeaderBtn}
                      activeOpacity={0.7}
                    >
                      <Plus size={14} color="#FF5E36" />
                      <Text style={styles.addVariantHeaderText}>Add Variant</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardHeaderSubtitle}>Define stock quantity and size measurements for color variants.</Text>

                  {formVariants.map((v, idx) => (
                    <View key={idx} style={styles.variantRowCard}>
                      <View style={{ flex: 2, marginRight: 8 }}>
                        <Text style={styles.variantFieldLabel}>Color Option</Text>
                        <TextInput 
                          placeholder="e.g. Wine Red"
                          value={v.color}
                          onChangeText={(val) => updateVariantField(idx, 'color', val)}
                          style={styles.variantInput}
                          placeholderTextColor="#a1a1aa"
                        />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.variantFieldLabel}>Size</Text>
                        <TextInput 
                          placeholder="e.g. M"
                          value={v.size}
                          onChangeText={(val) => updateVariantField(idx, 'size', val)}
                          style={styles.variantInput}
                          placeholderTextColor="#a1a1aa"
                        />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.variantFieldLabel}>Stock Qty</Text>
                        <TextInput 
                          placeholder="10"
                          value={v.stock.toString()}
                          onChangeText={(val) => updateVariantField(idx, 'stock', val)}
                          keyboardType="numeric"
                          style={styles.variantInput}
                          placeholderTextColor="#a1a1aa"
                        />
                      </View>
                      <TouchableOpacity 
                        onPress={() => removeVariantField(idx)} 
                        style={styles.deleteVariantBtn}
                        disabled={formVariants.length === 1}
                      >
                        <Trash2 size={14} color={formVariants.length === 1 ? '#e4e4e7' : '#ef4444'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Settings Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Boutique Display & Visibility</Text>
                  
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
                if (activeTab === 'inventory') setActiveTab('visuals');
                else if (activeTab === 'visuals') setActiveTab('details');
              }}
              style={styles.secondaryBottomBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBottomBtnText}>Go Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={onClose}
              style={styles.secondaryBottomBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryBottomBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {activeTab !== 'inventory' ? (
            <TouchableOpacity 
              onPress={() => {
                if (activeTab === 'details') setActiveTab('visuals');
                else if (activeTab === 'visuals') setActiveTab('inventory');
              }}
              style={styles.primaryBottomBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBottomBtnText}>Continue</Text>
              <ArrowRight size={14} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.submitBottomBtn}
              activeOpacity={0.8}
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
                    <Text style={styles.optionDescription}>Paste a link from Unsplash or other image hosts</Text>
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
              <Text style={styles.overlaySubtitle}>Paste a link from Unsplash or other photo host</Text>
              
              <TextInput
                placeholder="https://images.unsplash.com/photo-..."
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
                      setFormImages(prev => [...prev, tempUrl.trim()]);
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

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalShell: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
  },
  modalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
  },
  closeHeaderBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#FF5E36',
  },
  tabText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#FF5E36',
  },
  modalBody: {
    flex: 1,
  },
  modalScrollPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContentContainer: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 4,
  },
  cardHeaderSubtitle: {
    fontSize: 10,
    color: '#71717a',
    lineHeight: 14,
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#71717a',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: '#09090b',
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  twoColumnGrid: {
    flexDirection: 'row',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    backgroundColor: '#fafafa',
  },
  pricePrefix: {
    paddingLeft: 12,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#71717a',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 13,
    color: '#09090b',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  dropdownTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  dropdownWrapper: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    padding: 8,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dropdownItemButton: {
    flex: 1,
    paddingVertical: 6,
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#09090b',
    fontWeight: '500',
  },
  deleteCategoryBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  dropdownItemDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 6,
  },
  addNewCatTrigger: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  addNewCatTriggerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  newCatInputBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
  },
  newCatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    backgroundColor: '#fafafa',
  },
  newCatAddBtn: {
    backgroundColor: '#FF5E36',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  newCatAddBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageCardContainer: {
    width: 90,
    height: 120,
    borderRadius: 12,
    position: 'relative',
    overflow: 'visible',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  deleteImageBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addImageTile: {
    width: 90,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FF5E36',
    backgroundColor: '#fff7f5',
  },
  addImageTileInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addImageTileText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  emptyGalleryBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e4e4e7',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    marginTop: 12,
  },
  emptyGalleryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#09090b',
    marginTop: 8,
  },
  emptyGallerySubtext: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 2,
  },
  variantHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addVariantHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff7f5',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 54, 0.2)',
  },
  addVariantHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5E36',
  },
  variantRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  variantFieldLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  variantInput: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11,
    color: '#09090b',
    backgroundColor: '#ffffff',
  },
  deleteVariantBtn: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  switchRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 9,
    color: '#71717a',
    lineHeight: 12,
  },
  bottomNavigationRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  secondaryBottomBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryBottomBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  primaryBottomBtn: {
    flex: 2,
    backgroundColor: '#FF5E36',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBottomBtn: {
    flex: 2,
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBottomBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaOptionsSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  overlayTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#09090b',
    textAlign: 'center',
    marginBottom: 4,
  },
  overlaySubtitle: {
    fontSize: 11,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 20,
  },
  verticalOptionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  verticalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextBox: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#09090b',
  },
  optionDescription: {
    fontSize: 10,
    color: '#71717a',
  },
  cancelOverlayBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
  },
  cancelOverlayBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#09090b',
  },
  overlayContainerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
    padding: 20,
  },
  urlInputCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
  },
  urlTextInput: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: '#09090b',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  urlButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  urlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
