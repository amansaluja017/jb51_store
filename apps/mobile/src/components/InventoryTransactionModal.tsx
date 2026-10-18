import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Plus,
  Minus,
  TrendingDown,
  TrendingUp,
  User,
  AlertCircle,
  Package,
  ChevronDown,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Product, Variant } from '../types';

export interface TransactionFormValues {
  type: 'sale' | 'purchase';
  name: string;
  phoneNumber: string;
  email: string;
  notes: string;
  quantity: string;
  unitPrice: string;
}

interface InventoryTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  initialVariantIndex?: number;
  onSubmitTransaction: (data: {
    productId: string;
    productVariantId?: string | null;
    type: 'sale' | 'purchase';
    quantity: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    notes?: string;
    unitPrice?: number;
    totalAmount?: number;
  }) => Promise<void>;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm') => void;
}

export default function InventoryTransactionModal({
  visible,
  onClose,
  products,
  initialProduct,
  initialVariantIndex = 0,
  onSubmitTransaction,
  showAlert,
}: InventoryTransactionModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [txType, setTxType] = useState<'sale' | 'purchase'>('sale');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  // Sync selected product when modal opens or initialProduct changes
  useEffect(() => {
    if (visible) {
      const prod = initialProduct || (products.length > 0 ? products[0] : null);
      setSelectedProduct(prod);
      setSelectedVariantIdx(initialVariantIndex >= 0 ? initialVariantIndex : 0);
      setTxType('sale');
      reset({
        type: 'sale',
        name: '',
        phoneNumber: '',
        email: '',
        notes: '',
        quantity: '1',
        unitPrice: prod ? String(prod.sellingPrice ?? prod.price ?? '') : '',
      });
    }
  }, [visible, initialProduct, initialVariantIndex, products]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      type: 'sale',
      name: '',
      phoneNumber: '',
      email: '',
      notes: '',
      quantity: '1',
      unitPrice: '',
    },
  });

  const watchQuantity = watch('quantity');
  const watchUnitPrice = watch('unitPrice');

  const currentVariant: Variant | undefined = useMemo(() => {
    if (!selectedProduct?.variants || selectedProduct.variants.length === 0) {
      return undefined;
    }
    return selectedProduct.variants[selectedVariantIdx] || selectedProduct.variants[0];
  }, [selectedProduct, selectedVariantIdx]);

  const availableStock = useMemo(() => {
    if (currentVariant) {
      return Number(currentVariant.stock) || 0;
    }
    if (selectedProduct?.variants && selectedProduct.variants.length > 0) {
      return selectedProduct.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return 0;
  }, [currentVariant, selectedProduct]);

  // Update default price when product or type changes
  const handleTypeChange = (newType: 'sale' | 'purchase') => {
    setTxType(newType);
    setValue('type', newType);
    if (selectedProduct) {
      const defaultPrice = newType === 'sale'
        ? (selectedProduct.sellingPrice ?? selectedProduct.price ?? '')
        : (selectedProduct.mrp ?? selectedProduct.price ?? '');
      setValue('unitPrice', String(defaultPrice));
    }
  };

  const parsedQty = parseInt(watchQuantity || '1', 10) || 1;
  const parsedPrice = parseFloat(watchUnitPrice || '0') || 0;
  const calculatedTotal = parsedQty * parsedPrice;

  const handleAdjustQty = (delta: number) => {
    const nextVal = Math.max(1, parsedQty + delta);
    if (txType === 'sale' && nextVal > availableStock && availableStock > 0) {
      showAlert('Stock Notice', `Only ${availableStock} items are currently available in stock.`, 'info');
      setValue('quantity', String(availableStock));
      return;
    }
    setValue('quantity', String(nextVal));
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedVariantIdx(0);
    setProductPickerOpen(false);
    const defaultPrice = txType === 'sale'
      ? (prod.sellingPrice ?? prod.price ?? '')
      : (prod.mrp ?? prod.price ?? '');
    setValue('unitPrice', String(defaultPrice));
  };

  const onFormSubmit = async (values: TransactionFormValues) => {
    if (!selectedProduct) {
      showAlert('Product Required', 'Please select a product for this transaction.', 'error');
      return;
    }

    const qty = parseInt(values.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      showAlert('Invalid Quantity', 'Please enter a valid quantity of 1 or more.', 'error');
      return;
    }

    if (txType === 'sale' && qty > availableStock) {
      showAlert(
        'Insufficient Stock',
        `Cannot sell ${qty} units. Only ${availableStock} units available in stock.`,
        'error'
      );
      return;
    }

    const partyName = values.name.trim();
    if (!partyName) {
      showAlert(
        'Name Required',
        txType === 'sale' ? 'Please enter customer name.' : 'Please enter seller / vendor name.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitTransaction({
        productId: selectedProduct.id,
        productVariantId: (currentVariant as any)?.id || null,
        type: txType,
        quantity: qty,
        name: partyName,
        phoneNumber: values.phoneNumber?.trim() || undefined,
        email: values.email?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        unitPrice: parsedPrice > 0 ? parsedPrice : undefined,
        totalAmount: calculatedTotal > 0 ? calculatedTotal : undefined,
      });

      onClose();
    } catch (err: any) {
      showAlert('Transaction Failed', err.message || 'Could not complete inventory transaction.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawImage = selectedProduct?.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Inventory Transaction</Text>
                <Text style={styles.headerSubtitle}>
                  {txType === 'sale' ? 'Record Customer Sale & Deduct Stock' : 'Record Supplier Purchase & Stock In'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Type Selector (Sell vs Purchase) */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                onPress={() => handleTypeChange('sale')}
                style={[styles.typeBtn, txType === 'sale' && styles.typeBtnSaleActive]}
                activeOpacity={0.8}
              >
                <TrendingDown size={16} color={txType === 'sale' ? '#ffffff' : '#ef4444'} />
                <Text style={[styles.typeBtnText, txType === 'sale' && styles.typeBtnTextActive]}>
                  Sell (Customer Sale)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleTypeChange('purchase')}
                style={[styles.typeBtn, txType === 'purchase' && styles.typeBtnPurchaseActive]}
                activeOpacity={0.8}
              >
                <TrendingUp size={16} color={txType === 'purchase' ? '#ffffff' : '#10b981'} />
                <Text style={[styles.typeBtnText, txType === 'purchase' && styles.typeBtnTextActive]}>
                  Purchase (Stock In)
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
              {/* Product Card / Selector */}
              <View style={styles.sectionBox}>
                <View style={styles.sectionHeaderRow}>
                  <Package size={14} color="#FF5E36" />
                  <Text style={styles.sectionLabel}>SELECTED PRODUCT</Text>
                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => setProductPickerOpen(!productPickerOpen)} style={styles.changeProductBtn}>
                      <Text style={styles.changeProductBtnText}>
                        {productPickerOpen ? 'Hide Picker' : 'Change Product'}
                      </Text>
                      <ChevronDown size={12} color="#FF5E36" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Product Dropdown if toggled */}
                {productPickerOpen && (
                  <View style={styles.pickerDropdown}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                      {products.map(p => (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => handleSelectProduct(p)}
                          style={[styles.pickerItem, selectedProduct?.id === p.id && styles.pickerItemActive]}
                        >
                          <Text style={[styles.pickerItemText, selectedProduct?.id === p.id && styles.pickerItemTextActive]} numberOfLines={1}>
                            {p.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {selectedProduct ? (
                  <View style={styles.selectedProductCard}>
                    {rawImage ? (
                      <Image source={{ uri: rawImage }} style={styles.productThumb} resizeMode="cover" />
                    ) : (
                      <View style={[styles.productThumb, styles.noThumb]}>
                        <Package size={20} color="#a1a1aa" />
                      </View>
                    )}
                    <View style={styles.productMetaCol}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {selectedProduct.name}
                      </Text>
                      <Text style={styles.productCat}>{selectedProduct.category || 'General'}</Text>
                      <View style={styles.stockRow}>
                        <View style={[styles.stockDot, availableStock > 0 ? styles.stockDotIn : styles.stockDotOut]} />
                        <Text style={styles.stockLabel}>
                          {availableStock} units available in stock
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noProductText}>No product selected</Text>
                )}

                {/* Variant Chips if product has variants */}
                {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
                  <View style={styles.variantsPickerSection}>
                    <Text style={styles.variantsPickerTitle}>SELECT VARIANT</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsChipScroll}>
                      {selectedProduct.variants.map((variant, vIdx) => {
                        const isSelected = selectedVariantIdx === vIdx;
                        return (
                          <TouchableOpacity
                            key={`v_${vIdx}`}
                            onPress={() => setSelectedVariantIdx(vIdx)}
                            style={[styles.variantChip, isSelected && styles.variantChipActive]}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.variantColorSwatch,
                                { backgroundColor: variant.hexCode || '#18181b' },
                              ]}
                            />
                            <Text style={[styles.variantChipText, isSelected && styles.variantChipTextActive]}>
                              {variant.color || `Variant ${vIdx + 1}`}
                            </Text>
                            <View style={[styles.variantStockBadge, isSelected && styles.variantStockBadgeActive]}>
                              <Text style={[styles.variantStockBadgeText, isSelected && styles.variantStockBadgeTextActive]}>
                                {variant.stock ?? 0}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Quantity and Pricing Row */}
              <View style={styles.sectionBox}>
                <View style={styles.dualCols}>
                  {/* Quantity Stepper */}
                  <View style={styles.stepperCol}>
                    <Text style={styles.sectionLabel}>QUANTITY</Text>
                    <View style={styles.stepperWrap}>
                      <TouchableOpacity
                        onPress={() => handleAdjustQty(-1)}
                        style={[styles.stepperBtn, parsedQty <= 1 && styles.stepperBtnDisabled]}
                        disabled={parsedQty <= 1}
                      >
                        <Minus size={14} color={parsedQty <= 1 ? '#a1a1aa' : '#18181b'} />
                      </TouchableOpacity>

                      <Controller
                        control={control}
                        name="quantity"
                        rules={{ required: 'Required' }}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={styles.qtyInput}
                            keyboardType="number-pad"
                            value={String(value)}
                            onChangeText={val => {
                              const clean = val.replace(/[^0-9]/g, '');
                              onChange(clean);
                            }}
                            selectTextOnFocus
                          />
                        )}
                      />

                      <TouchableOpacity onPress={() => handleAdjustQty(1)} style={[styles.stepperBtn, styles.stepperBtnAdd]}>
                        <Plus size={14} color="#FF5E36" />
                      </TouchableOpacity>
                    </View>

                    {/* Shortcut pills */}
                    <View style={styles.qtyPillsRow}>
                      {[1, 5, 10].map(amt => (
                        <TouchableOpacity
                          key={amt}
                          onPress={() => {
                            if (txType === 'sale' && amt > availableStock && availableStock > 0) {
                              setValue('quantity', String(availableStock));
                            } else {
                              setValue('quantity', String(amt));
                            }
                          }}
                          style={styles.qtyPill}
                        >
                          <Text style={styles.qtyPillText}>+{amt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Unit Price */}
                  <View style={styles.priceCol}>
                    <Text style={styles.sectionLabel}>UNIT PRICE (₹)</Text>
                    <Controller
                      control={control}
                      name="unitPrice"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.priceInputWrapper}>
                          <Text style={styles.priceCurrency}>₹</Text>
                          <TextInput
                            style={styles.priceInput}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#a1a1aa"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                          />
                        </View>
                      )}
                    />
                    <Text style={styles.totalCalcText}>
                      Total: ₹{calculatedTotal.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Over-stock warning for sales */}
                {txType === 'sale' && parsedQty > availableStock && (
                  <View style={styles.warningBox}>
                    <AlertCircle size={14} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={styles.warningText}>
                      Requested {parsedQty} exceeds available stock ({availableStock}).
                    </Text>
                  </View>
                )}
              </View>

              {/* Party Details (Customer for Sell, Supplier for Purchase) */}
              <View style={styles.sectionBox}>
                <View style={styles.sectionHeaderRow}>
                  <User size={14} color="#FF5E36" />
                  <Text style={styles.sectionLabel}>
                    {txType === 'sale' ? 'CUSTOMER DETAILS' : 'SUPPLIER / SELLER DETAILS'}
                  </Text>
                </View>

                {/* Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputTitle}>
                    {txType === 'sale' ? 'Customer Name *' : 'Seller / Supplier Name *'}
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: txType === 'sale' ? 'Customer name is required' : 'Supplier name is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.textInput, errors.name && styles.textInputError]}
                        placeholder={txType === 'sale' ? 'e.g. Priya Sharma' : 'e.g. Surat Textiles Co.'}
                        placeholderTextColor="#a1a1aa"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.name && <Text style={styles.fieldErrorText}>{errors.name.message}</Text>}
                </View>

                {/* Phone & Email Row */}
                <View style={styles.fieldGroupRow}>
                  <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputTitle}>Phone Number</Text>
                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.textInput}
                          placeholder="+91 98765 43210"
                          placeholderTextColor="#a1a1aa"
                          keyboardType="phone-pad"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.inputTitle}>Email Address</Text>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.textInput}
                          placeholder="client@mail.com"
                          placeholderTextColor="#a1a1aa"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Notes / Order Reference */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputTitle}>Notes / Reference</Text>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.textInput, styles.textAreaInput]}
                        placeholder={txType === 'sale' ? 'In-store sale, bill #102...' : 'Batch receipt, invoice #908...'}
                        placeholderTextColor="#a1a1aa"
                        multiline
                        numberOfLines={2}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit(onFormSubmit)}
                disabled={isSubmitting || (txType === 'sale' && parsedQty > availableStock)}
                style={[
                  styles.submitBtn,
                  txType === 'sale' ? styles.submitBtnSale : styles.submitBtnPurchase,
                  (isSubmitting || (txType === 'sale' && parsedQty > availableStock)) && { opacity: 0.6 },
                ]}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    {txType === 'sale' ? (
                      <TrendingDown size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    ) : (
                      <TrendingUp size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.submitBtnText}>
                      {txType === 'sale'
                        ? `Complete Sale (${parsedQty} unit${parsedQty > 1 ? 's' : ''})`
                        : `Receive Stock (${parsedQty} unit${parsedQty > 1 ? 's' : ''})`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  typeBtnSaleActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeBtnPurchaseActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525b',
  },
  typeBtnTextActive: {
    color: '#ffffff',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  sectionBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 0.5,
  },
  changeProductBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeProductBtnText: {
    fontSize: 11,
    color: '#FF5E36',
    fontWeight: '600',
  },
  pickerDropdown: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 10,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  pickerItemActive: {
    backgroundColor: '#fff1ed',
  },
  pickerItemText: {
    fontSize: 13,
    color: '#18181b',
  },
  pickerItemTextActive: {
    color: '#FF5E36',
    fontWeight: '600',
  },
  selectedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
  },
  noThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productMetaCol: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
  },
  productCat: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 1,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stockDotIn: {
    backgroundColor: '#10b981',
  },
  stockDotOut: {
    backgroundColor: '#ef4444',
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#52525b',
  },
  noProductText: {
    fontSize: 13,
    color: '#a1a1aa',
    fontStyle: 'italic',
  },
  variantsPickerSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  variantsPickerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a1a1aa',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  variantsChipScroll: {
    gap: 8,
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  variantChipActive: {
    borderColor: '#FF5E36',
    backgroundColor: '#fff1ed',
  },
  variantColorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  variantChipText: {
    fontSize: 12,
    color: '#52525b',
    fontWeight: '500',
  },
  variantChipTextActive: {
    color: '#FF5E36',
    fontWeight: '600',
  },
  variantStockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
  },
  variantStockBadgeActive: {
    backgroundColor: '#FF5E36',
  },
  variantStockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
  },
  variantStockBadgeTextActive: {
    color: '#ffffff',
  },
  dualCols: {
    flexDirection: 'row',
    gap: 14,
  },
  stepperCol: {
    flex: 1,
  },
  priceCol: {
    flex: 1,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f5',
  },
  stepperBtnAdd: {
    backgroundColor: '#fff1ed',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  qtyInput: {
    flex: 1,
    height: 38,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
    backgroundColor: '#ffffff',
  },
  qtyPillsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  qtyPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
  },
  qtyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#52525b',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    backgroundColor: '#ffffff',
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  totalCalcText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  warningText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  fieldGroupRow: {
    flexDirection: 'row',
  },
  inputTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3f3f46',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#18181b',
    backgroundColor: '#fafafa',
  },
  textInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  textAreaInput: {
    minHeight: 52,
    textAlignVertical: 'top',
  },
  fieldErrorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnSale: {
    backgroundColor: '#ef4444',
  },
  submitBtnPurchase: {
    backgroundColor: '#10b981',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
