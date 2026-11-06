import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  Trash2,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { Control, Controller } from 'react-hook-form';
import SimpleTextEditor from '../SimpleTextEditor';
import { ProductFormData } from '../ProductFormModal';
import styles from '../ProductFormModal.styles';
import { countWords } from '../../utils/text';

export interface ProductDetailsTabProps {
  control: Control<ProductFormData>;
  categories: string[];
  formMrp: string;
  setFormMrp: (val: string) => void;
  formSellingPrice: string;
  setFormSellingPrice: (val: string) => void;
  setFormFabric: (val: string) => void;
  setFormFit: (val: string) => void;
  setFormCare: (val: string) => void;
  setFormTags: (val: string) => void;
  setFormDescription: (val: string) => void;
  formSlug?: string;
  setFormSlug?: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  showCategorySelector: boolean;
  setShowCategorySelector: (val: boolean | ((prev: boolean) => boolean)) => void;
  showNewCatInput: boolean;
  setShowNewCatInput: (val: boolean | ((prev: boolean) => boolean)) => void;
  newCatInput: string;
  setNewCatInput: (val: string) => void;
  handleCreateCategory: () => void;
  handleDeleteCategoryClick: (cat: string) => void;
  handleNameChange: (val: string) => void;
  onOpenAiDescription?: () => void;
}

export const ProductDetailsTab: React.FC<ProductDetailsTabProps> = ({
  control,
  categories,
  formMrp,
  setFormMrp,
  formSellingPrice,
  setFormSellingPrice,
  setFormFabric,
  setFormFit,
  setFormCare,
  setFormTags,
  setFormDescription,
  formCategory,
  setFormCategory,
  showCategorySelector,
  setShowCategorySelector,
  showNewCatInput,
  setShowNewCatInput,
  newCatInput,
  setNewCatInput,
  handleCreateCategory,
  handleDeleteCategoryClick,
  handleNameChange,
  onOpenAiDescription,
}) => {
  return (
    <View style={styles.tabContentContainer}>
      {/* Basic Card */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeaderTitle}>Basic Garment Info</Text>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.fieldLabel}>Design Name</Text>
                    <Controller
                      control={control}
                      name="name"
                      rules={{
                        required: 'Design name is required',
                        validate: (val) => {
                          if (!val || !val.trim()) return 'Design name cannot be empty';
                          if (val.trim().length < 3) return 'Design name must be at least 3 characters';
                          return true;
                        },
                      }}
                      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                        <View>
                          <TextInput
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(val) => {
                              onChange(val);
                              handleNameChange(val);
                            }}
                            placeholder="e.g. Palace Silk Kurta"
                            style={[styles.modalInput, error && styles.inputErrorBorder]}
                            placeholderTextColor="#a1a1aa"
                          />
                          {error?.message && (
                            <Text style={styles.inlineFieldError}>{error.message}</Text>
                          )}
                        </View>
                      )}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={styles.fieldLabel}>SEO URL Slug</Text>
                      <View style={{ backgroundColor: '#f4f4f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#e4e4e7' }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: '#71717a' }}>AUTO-GENERATED</Text>
                      </View>
                    </View>
                    <Controller
                      control={control}
                      name="slug"
                      render={({ field: { value } }) => (
                        <TextInput
                          value={value}
                          editable={false}
                          placeholder="Auto-generated from design name"
                          style={[styles.modalInput, { backgroundColor: '#f4f4f5', color: '#71717a', borderColor: '#e4e4e7' }]}
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
                      <Controller
                        control={control}
                        name="mrp"
                        rules={{
                          required: 'MRP is required',
                          validate: (val) => {
                            const num = parseFloat(val);
                            if (isNaN(num) || num <= 0) return 'MRP must be greater than 0';
                            return true;
                          },
                        }}
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                          <View>
                            <View style={[styles.priceInputWrapper, error && styles.inputErrorBorder]}>
                              <Text style={styles.pricePrefix}>₹</Text>
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
                            </View>
                            {error?.message && (
                              <Text style={styles.inlineFieldError}>{error.message}</Text>
                            )}
                          </View>
                        )}
                      />
                    </View>

                    {/* Selling Price with Rupee symbol */}
                    <View style={[styles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.fieldLabel}>Selling Price (INR) *</Text>
                      <Controller
                        control={control}
                        name="sellingPrice"
                        rules={{
                          required: 'Selling price is required',
                          validate: (val) => {
                            const num = parseFloat(val);
                            if (isNaN(num) || num <= 0) return 'Selling price must be greater than 0';
                            const mrpNum = parseFloat(formMrp);
                            if (!isNaN(mrpNum) && num > mrpNum) return 'Selling price cannot exceed MRP';
                            return true;
                          },
                        }}
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                          <View>
                            <View style={[styles.priceInputWrapper, error && styles.inputErrorBorder]}>
                              <Text style={styles.pricePrefix}>₹</Text>
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
                            </View>
                            {error?.message && (
                              <Text style={styles.inlineFieldError}>{error.message}</Text>
                            )}
                          </View>
                        )}
                      />
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
                        sectionType="fabric"
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
                        sectionType="fit"
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
                        sectionType="care"
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
                        sectionType="tags"
                      />
                    )}
                  />
                </View>

                {/* Editorial Description Card */}
                <View style={styles.sectionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.cardHeaderTitle}>Editorial Narration</Text>
                      <Text style={[styles.cardHeaderSubtitle, { marginBottom: 0 }]}>
                        Heritage storytelling & styling notes
                      </Text>
                    </View>
                    {onOpenAiDescription && (
                      <TouchableOpacity
                        onPress={onOpenAiDescription}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                          backgroundColor: '#faf5ff',
                          paddingHorizontal: 11,
                          paddingVertical: 6,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: '#e9d5ff',
                        }}
                        activeOpacity={0.8}
                      >
                        <Sparkles size={12} color="#9333ea" />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#7e22ce' }}>AI Studio</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Controller
                    control={control}
                    name="description"
                    rules={{
                      required: 'Description is required',
                      validate: (val) => {
                        const words = countWords(val || '');
                        if (words < 100) return `Description must be at least 100 words (${words}/100)`;
                        return true;
                      },
                    }}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                      const words = countWords(value);
                      const isRequirementMet = words >= 100;
                      return (
                        <View>
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
                            minWords={100}
                          />
                          {error?.message && (
                            <Text style={styles.inlineFieldError}>{error.message}</Text>
                          )}

                          {/* Live 100-word validation status message */}
                          <View
                            style={{
                              marginTop: 4,
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 10,
                              backgroundColor: isRequirementMet ? '#F0FDF4' : '#FFF1F2',
                              borderWidth: 1,
                              borderColor: isRequirementMet ? '#BBF7D0' : '#FECDD3',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                              {isRequirementMet ? (
                                <CheckCircle2 size={15} color="#16A34A" style={{ marginRight: 6 }} />
                              ) : (
                                <AlertCircle size={15} color="#E11D48" style={{ marginRight: 6 }} />
                              )}
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: isRequirementMet ? '#166534' : '#9F1239',
                                  fontWeight: '500',
                                }}
                              >
                                {isRequirementMet
                                  ? 'Length requirement met (100+ words)'
                                  : `Minimum 100 words required (${100 - words} more needed)`}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: isRequirementMet ? '#DCFCE7' : '#FFE4E6',
                                paddingHorizontal: 7,
                                paddingVertical: 2.5,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '700',
                                  color: isRequirementMet ? '#15803D' : '#BE123C',
                                }}
                              >
                                {words}/100
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    }}
                  />
                </View>

    </View>
  );
};

export default ProductDetailsTab;
