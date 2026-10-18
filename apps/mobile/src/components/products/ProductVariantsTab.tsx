import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  Trash2,
  Pipette,
  RefreshCw,
  Check,
  Image as ImageIcon,
  Layers,
  Palette,
  Sparkles,
} from 'lucide-react-native';
import { Variant } from '../../types';
import DraggableImageList from '../DraggableImageList';
import {
  isLightColor,
  isValidHex,
  getClosestColorName,
  SIGNATURE_ATELIER_PALETTE,
} from '../../utils/colorThiefHelper';
import styles from '../ProductFormModal.styles';

export interface ProductVariantsTabProps {
  isEditing: boolean;
  addVariantField: () => void;
  formVariants: Variant[];
  extractedPalettes: { [variantIdx: number]: string[] };
  removeVariantField: (idx: number) => void;
  updateVariantField: (idx: number, field: keyof Variant, val: any) => void;
  setColorPickerTargetIdx: (idx: number | null) => void;
  openMediaForVariant: (idx: number) => void;
  removeVariantImage: (variantIdx: number, imageIndex: number) => void;
  handleReorderVariantImages: (variantIdx: number, newImages: string[]) => Promise<void>;
  handleExtractCoverColors: (idx: number, imageUrl: string, force?: boolean) => Promise<void>;
  isExtractingColors: { [variantIdx: number]: boolean };
  reorderingVariantIdx: number | null;
  isUploadingImage: boolean;
  activeVariantIdxForMedia: number | null;
  isReorderingImages: boolean;
  uploadingUris: string[];
  deletingUris: string[];
}

export const ProductVariantsTab: React.FC<ProductVariantsTabProps> = ({
  isEditing,
  addVariantField,
  formVariants,
  extractedPalettes,
  removeVariantField,
  updateVariantField,
  setColorPickerTargetIdx,
  openMediaForVariant,
  removeVariantImage,
  handleReorderVariantImages,
  handleExtractCoverColors,
  isExtractingColors,
  reorderingVariantIdx,
  isUploadingImage,
  activeVariantIdxForMedia,
  isReorderingImages,
  uploadingUris,
  deletingUris,
}) => {
  return (
    <View style={styles.tabContentContainer}>
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
  );
};

export default ProductVariantsTab;
