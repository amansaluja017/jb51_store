import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  X,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Search,
  Check,
  Plus,
  Trash2,
  User,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Globe,
  Store,
} from 'lucide-react-native';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Customer, Product, Variant, isProductInStock, isProductDiscontinued } from '../../types';
import { InvoiceItem, InvoiceFormValues } from '../../screens/InvoiceScreen';
import styles from '../../screens/InvoiceScreen.styles';
import { CalendarPickerModal } from '../CalendarPickerModal';

export interface InvoiceFormViewProps {
  control: Control<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  formValues: InvoiceFormValues;
  setValue: UseFormSetValue<InvoiceFormValues>;
  setSelectedCustomerId: (id: string | null) => void;
  customerSearchQuery: string;
  setCustomerSearchQuery: (val: string) => void;
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (val: boolean | ((prev: boolean) => boolean)) => void;
  filteredCustomers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (cust: Customer) => void;
  onNavigateToSelectCustomer?: () => void;
  onOpenAddCustomerModal: () => void;
  onFetchCustomers?: () => Promise<void>;
  isLoadingCustomers?: boolean;
  selectedProduct: Product | null;
  selectedVariant: Variant | null;
  setSelectedVariant: (v: Variant | null) => void;
  productSearchQuery: string;
  setProductSearchQuery: (val: string) => void;
  showProductDropdown: boolean;
  setShowProductDropdown: (val: boolean | ((prev: boolean) => boolean)) => void;
  filteredProducts: Product[];
  onSelectProduct: (prod: Product) => void;
  onNavigateToSelectProduct?: () => void;
  onFetchProducts?: () => Promise<void>;
  isLoadingProducts?: boolean;
  itemPrice: string;
  setItemPrice: (val: string) => void;
  itemQuantity: string;
  setItemQuantity: (val: string) => void;
  onAddProduct: () => void;
  invoiceItems: InvoiceItem[];
  onRemoveItem: (id: string) => void;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  taxRate: string;
  isEditing?: boolean;
  onCloseForm: () => void;
  onPreview: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const InvoiceFormView: React.FC<InvoiceFormViewProps> = ({
  control,
  errors,
  formValues,
  setValue,
  isEditing,
  setSelectedCustomerId,
  customerSearchQuery,
  setCustomerSearchQuery,
  showCustomerDropdown,
  setShowCustomerDropdown,
  filteredCustomers,
  selectedCustomerId,
  onSelectCustomer,
  onNavigateToSelectCustomer,
  onOpenAddCustomerModal,
  onFetchCustomers,
  isLoadingCustomers,
  selectedProduct,
  selectedVariant,
  setSelectedVariant,
  productSearchQuery,
  setProductSearchQuery,
  showProductDropdown,
  setShowProductDropdown,
  filteredProducts,
  onSelectProduct,
  onNavigateToSelectProduct,
  onFetchProducts,
  isLoadingProducts,
  itemPrice,
  setItemPrice,
  itemQuantity,
  setItemQuantity,
  onAddProduct,
  invoiceItems,
  onRemoveItem,
  subtotal,
  taxAmount,
  discountAmount,
  totalAmount,
  taxRate,
  onCloseForm,
  onPreview,
  refreshing,
  onRefresh,
}) => {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'dueDate' | 'paymentDate' | null>(null);
  const today = useMemo(() => new Date(), []);
  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<{ [key: string]: number }>({});
  const activeFieldRef = useRef<{ key: string; offset: number } | null>(null);

  const handleToggleCustomerDropdown = async () => {
    const nextState = !showCustomerDropdown;
    setShowCustomerDropdown(nextState);
    setShowProductDropdown(false);
    if (nextState && onFetchCustomers && filteredCustomers.length === 0) {
      setIsFetchingCustomers(true);
      try {
        await onFetchCustomers();
      } finally {
        setIsFetchingCustomers(false);
      }
    }
  };

  const handleToggleProductDropdown = async () => {
    const nextState = !showProductDropdown;
    setShowProductDropdown(nextState);
    setShowCustomerDropdown(false);
    if (nextState && onFetchProducts && filteredProducts.length === 0) {
      setIsFetchingProducts(true);
      try {
        await onFetchProducts();
      } finally {
        setIsFetchingProducts(false);
      }
    }
  };

  const calculateTargetY = (key: string, offset = 0) => {
    if (key === 'notes') {
      const cardY = fieldOffsets.current['adjustments'] || 0;
      const noteLocalY = fieldOffsets.current['notes_local'] || 220;
      return Math.max(0, cardY + noteLocalY - 30);
    }
    return Math.max(0, (fieldOffsets.current[key] || 0) + offset);
  };

  const handleFieldFocus = (key: string, extraOffset = 0) => {
    activeFieldRef.current = { key, offset: extraOffset };
    const doScroll = () => {
      const targetY = calculateTargetY(key, extraOffset);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    };

    setTimeout(doScroll, 80);
    setTimeout(doScroll, 250);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        if (activeFieldRef.current) {
          const { key, offset } = activeFieldRef.current;
          setTimeout(() => {
            const targetY = calculateTargetY(key, offset);
            scrollRef.current?.scrollTo({ y: targetY, animated: true });
          }, 150);
        }
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 200 : 80 }
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#FF5E36"
            colors={['#FF5E36']}
          />
        ) : undefined
      }
    >
      {/* Form Header */}
      <View style={styles.formHeader}>
        <TouchableOpacity
          onPress={() => onCloseForm()}
          style={styles.formBackButton}
          accessibilityLabel="Cancel invoice creation"
          accessibilityRole="button"
        >
          <X size={18} color="#71717a" />
          <Text style={styles.formBackButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>{isEditing ? 'Edit Invoice' : 'New Invoice'}</Text>
      </View>

      {/* Customer Selection Section */}
      <Text style={styles.sectionHeader}>Customer Details</Text>

      <View style={styles.card}>
        {/* Customer Dropdown Trigger */}
        <View style={[styles.inputGroup, (!showCustomerDropdown || onNavigateToSelectCustomer) && !formValues.clientName && { marginBottom: 0 }]}>
          <Text style={styles.inputLabel}>Choose Existing Customer</Text>
          <TouchableOpacity
            onPress={() => {
              if (onNavigateToSelectCustomer) {
                onNavigateToSelectCustomer();
              } else {
                handleToggleCustomerDropdown();
              }
            }}
            style={styles.dropdownTrigger}
            accessibilityLabel="Select customer"
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <User size={15} color={selectedCustomerId ? '#FF5E36' : '#a1a1aa'} style={{ marginRight: 8 }} />
              <Text
                style={[
                  styles.dropdownValue,
                  !formValues.clientName && { color: '#a1a1aa' },
                ]}
                numberOfLines={1}
              >
                {formValues.clientName
                  ? `${formValues.clientName} ${formValues.clientPhone ? `(${formValues.clientPhone})` : ''}`
                  : 'Browse & select customer...'}
              </Text>
            </View>
            {(isFetchingCustomers || isLoadingCustomers) && (
              <ActivityIndicator size="small" color="#FF5E36" style={{ marginRight: 6 }} />
            )}
            {formValues.clientName ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedCustomerId(null);
                  setValue('clientName', '', { shouldDirty: true });
                  setValue('clientPhone', '', { shouldDirty: true });
                  setValue('clientEmail', '', { shouldDirty: true });
                  setValue('clientAddress', '', { shouldDirty: true });
                  setIsEditingDetails(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginRight: 6 }}
              >
                <X size={14} color="#a1a1aa" />
              </TouchableOpacity>
            ) : null}
            {onNavigateToSelectCustomer ? (
              <ChevronRight size={15} color="#71717a" />
            ) : (
              <ChevronDown size={14} color="#71717a" />
            )}
          </TouchableOpacity>
        </View>

        {/* Expanded Customer Picker */}
        {showCustomerDropdown && !onNavigateToSelectCustomer && (
          <View style={styles.dropdownContainer}>
            {/* Search input */}
            <View style={styles.dropdownSearchBox}>
              <Search size={13} color="#a1a1aa" style={{ marginRight: 6 }} />
              <TextInput
                placeholder="Search name, phone, or email..."
                placeholderTextColor="#a1a1aa"
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
                style={styles.dropdownSearchInput}
              />
              {customerSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCustomerSearchQuery('')}>
                  <X size={12} color="#a1a1aa" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
              {(isFetchingCustomers || isLoadingCustomers) ? (
                <View style={[styles.dropdownEmpty, { paddingVertical: 24, alignItems: 'center' }]}>
                  <ActivityIndicator size="small" color="#FF5E36" />
                  <Text style={[styles.dropdownEmptyText, { marginTop: 8 }]}>
                    Loading customers...
                  </Text>
                </View>
              ) : filteredCustomers.length === 0 ? (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>
                    No customers found.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCustomerDropdown(false);
                      onOpenAddCustomerModal();
                    }}
                  >
                    <Text style={styles.dropdownEmptyAction}>
                      Click to add manually
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomerId === cust.id;
                    return (
                      <TouchableOpacity
                        key={cust.id}
                        style={[
                          styles.dropdownOption,
                          isSelected && styles.dropdownOptionSelected,
                        ]}
                        onPress={() => onSelectCustomer(cust)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dropdownOptionText}>
                            {cust.name}
                          </Text>
                          <Text style={styles.dropdownOptionMeta}>
                            {[cust.phoneNumber, cust.email]
                              .filter(Boolean)
                              .join(' | ') || 'No contact details'}
                          </Text>
                        </View>
                        {isSelected && <Check size={14} color="#FF5E36" />}
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={[styles.dropdownEmpty, { paddingTop: 10, paddingBottom: 14 }]}
                    onPress={() => {
                      setShowCustomerDropdown(false);
                      onOpenAddCustomerModal();
                    }}
                  >
                    <Text style={styles.dropdownEmptyAction}>
                      Click to add manually
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        )}

        {/* Selected Customer Details Section */}
        {Boolean(formValues.clientName && !showCustomerDropdown) && (
          <View
            style={styles.selectedCustomerBox}
            onLayout={(e) => { fieldOffsets.current['customer'] = e.nativeEvent.layout.y; }}
          >
            <View style={styles.selectedCustomerHeader}>
              <View style={styles.selectedCustomerHeaderLeft}>
                <View style={styles.selectedCustomerAvatar}>
                  <User size={16} color="#FF5E36" />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.selectedCustomerName} numberOfLines={1}>
                    {formValues.clientName}
                  </Text>
                  <Text style={styles.selectedCustomerSubtitle}>
                    Customer Details
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingDetails(!isEditingDetails)}
                style={styles.selectedCustomerEditBtn}
                accessibilityRole="button"
                accessibilityLabel={isEditingDetails ? 'Done editing customer details' : 'Edit customer details'}
              >
                <Text style={styles.selectedCustomerEditBtnText}>
                  {isEditingDetails ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.selectedCustomerDivider} />

            {isEditingDetails ? (
              <View style={styles.selectedCustomerEditForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <Controller
                    control={control}
                    name="clientPhone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="phone-pad"
                        value={value}
                        onBlur={onBlur}
                        onFocus={() => handleFieldFocus('customer', 40)}
                        onChangeText={onChange}
                        placeholder="Customer phone..."
                        placeholderTextColor="#a1a1aa"
                        style={styles.textInput}
                      />
                    )}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <Controller
                    control={control}
                    name="clientEmail"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onBlur={onBlur}
                        onFocus={() => handleFieldFocus('customer', 90)}
                        onChangeText={onChange}
                        placeholder="Customer email..."
                        placeholderTextColor="#a1a1aa"
                        style={styles.textInput}
                      />
                    )}
                  />
                </View>
                <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                  <Text style={styles.inputLabel}>Billing / Shipping Address</Text>
                  <Controller
                    control={control}
                    name="clientAddress"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        multiline
                        numberOfLines={2}
                        value={value}
                        onBlur={onBlur}
                        onFocus={() => handleFieldFocus('customer', 140)}
                        onChangeText={onChange}
                        placeholder="Customer address..."
                        placeholderTextColor="#a1a1aa"
                        style={[styles.textInput, { height: 54, textAlignVertical: 'top' }]}
                      />
                    )}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.selectedCustomerInfoGrid}>
                <View style={styles.selectedCustomerInfoRow}>
                  <View style={styles.selectedCustomerIconWrapper}>
                    <Phone size={12} color="#FF5E36" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCustomerInfoLabel}>Phone</Text>
                    <Text style={styles.selectedCustomerInfoValue}>
                      {formValues.clientPhone || 'Not provided'}
                    </Text>
                  </View>
                </View>

                <View style={styles.selectedCustomerInfoRow}>
                  <View style={styles.selectedCustomerIconWrapper}>
                    <Mail size={12} color="#FF5E36" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCustomerInfoLabel}>Email</Text>
                    <Text style={styles.selectedCustomerInfoValue}>
                      {formValues.clientEmail || 'Not provided'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.selectedCustomerInfoRow, { marginBottom: 0 }]}>
                  <View style={styles.selectedCustomerIconWrapper}>
                    <MapPin size={12} color="#FF5E36" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCustomerInfoLabel}>Address</Text>
                    <Text style={styles.selectedCustomerInfoValue}>
                      {formValues.clientAddress || 'Not provided'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Product & Variant Selection Section */}
      <Text style={styles.sectionHeader}>Select & Add Items</Text>
      <View style={styles.card}>
        {/* Product Picker Trigger */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Choose Product *</Text>
          <TouchableOpacity
            onPress={() => {
              if (onNavigateToSelectProduct) {
                onNavigateToSelectProduct();
              } else {
                handleToggleProductDropdown();
              }
            }}
            style={styles.dropdownTrigger}
            accessibilityLabel="Select product from catalog"
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ShoppingBag
                size={15}
                color={selectedProduct ? '#FF5E36' : '#a1a1aa'}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.dropdownValue,
                  !selectedProduct && { color: '#a1a1aa' },
                ]}
                numberOfLines={1}
              >
                {selectedProduct
                  ? `${selectedProduct.name} - ₹${(selectedProduct.sellingPrice || selectedProduct.price).toLocaleString('en-IN')}`
                  : 'Browse & select product from catalog...'}
              </Text>
            </View>
            {(isFetchingProducts || isLoadingProducts) && (
              <ActivityIndicator size="small" color="#FF5E36" style={{ marginRight: 6 }} />
            )}
            {onNavigateToSelectProduct ? (
              <ChevronRight size={15} color="#71717a" />
            ) : (
              <ChevronDown size={14} color="#71717a" />
            )}
          </TouchableOpacity>
        </View>

        {/* Expanded Product Picker */}
        {showProductDropdown && !onNavigateToSelectProduct && (
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownSearchBox}>
              <Search size={13} color="#a1a1aa" style={{ marginRight: 6 }} />
              <TextInput
                placeholder="Search product name..."
                placeholderTextColor="#a1a1aa"
                value={productSearchQuery}
                onChangeText={setProductSearchQuery}
                style={styles.dropdownSearchInput}
              />
            </View>

            <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
              {(isFetchingProducts || isLoadingProducts) ? (
                <View style={[styles.dropdownEmpty, { paddingVertical: 24, alignItems: 'center' }]}>
                  <ActivityIndicator size="small" color="#FF5E36" />
                  <Text style={[styles.dropdownEmptyText, { marginTop: 8 }]}>
                    Loading products...
                  </Text>
                </View>
              ) : filteredProducts.length === 0 ? (
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>No products found.</Text>
                </View>
              ) : (
                filteredProducts
                  .filter((p) => !isProductDiscontinued(p))
                  .map((p) => {
                    const inStock = isProductInStock(p);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.dropdownOption,
                          !inStock && { opacity: 0.5, backgroundColor: '#f4f4f5' },
                        ]}
                        disabled={!inStock}
                        onPress={() => inStock && onSelectProduct(p)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dropdownOptionText, !inStock && { color: '#a1a1aa' }]}>
                            {p.name}
                          </Text>
                          <Text style={styles.dropdownOptionMeta}>
                            {p.category} {p.variants?.length ? `• ${p.variants.length} variant(s)` : ''} • {inStock ? 'In Stock' : 'Out of Stock (Disabled)'}
                          </Text>
                        </View>
                        <Text style={[styles.dropdownOptionPrice, !inStock && { color: '#a1a1aa' }]}>
                          &#8377;{(p.sellingPrice || p.price).toLocaleString('en-IN')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
              )}
            </ScrollView>
          </View>
        )}

        {/* Variant Selector (if product has variants) */}
        {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Color / Variant</Text>
            <View style={styles.variantChipsContainer}>
              {selectedProduct.variants.map((v, i) => {
                const isSelected = selectedVariant?.color === v.color;
                const isVariantInStock = (Number(v.stock) || 0) > 0;
                return (
                  <TouchableOpacity
                    key={i}
                    disabled={!isVariantInStock}
                    onPress={() => isVariantInStock && setSelectedVariant(v)}
                    style={[
                      styles.variantChip,
                      isSelected && styles.variantChipActive,
                      !isVariantInStock && {
                        opacity: 0.45,
                        backgroundColor: '#f4f4f5',
                        borderColor: '#e4e4e7',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.variantDot,
                        { backgroundColor: v.hexCode || '#18181b' },
                      ]}
                    />
                    <Text
                      style={[
                        styles.variantChipText,
                        isSelected && styles.variantChipTextActive,
                        !isVariantInStock && {
                          color: '#a1a1aa',
                        },
                      ]}
                    >
                      {v.color} ({v.stock} in stock){!isVariantInStock ? ' - Out of Stock' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Price & Quantity Row */}
        <View
          style={styles.row}
          onLayout={(e) => { fieldOffsets.current['pricing'] = e.nativeEvent.layout.y; }}
        >
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Rate / Price (&#8377;)</Text>
            <TextInput
              keyboardType="numeric"
              value={itemPrice}
              onFocus={() => handleFieldFocus('pricing')}
              onChangeText={setItemPrice}
              placeholder="Price"
              placeholderTextColor="#a1a1aa"
              style={styles.textInput}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              keyboardType="number-pad"
              value={itemQuantity}
              onFocus={() => handleFieldFocus('pricing')}
              onChangeText={setItemQuantity}
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity
            onPress={onAddProduct}
            style={styles.addButton}
            accessibilityLabel="Add chosen item to invoice"
            accessibilityRole="button"
          >
            <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Line Items List */}
      {invoiceItems.length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>
            Line Items ({invoiceItems.length})
          </Text>
          {invoiceItems.map((item) => (
            <View key={item.id} style={styles.invoiceItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invoiceItemName}>{item.name}</Text>
                <Text style={styles.invoiceItemSub}>
                  {item.quantity} x &#8377;{item.price.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.invoiceItemRight}>
                <Text style={styles.invoiceItemTotal}>
                  &#8377;{item.total.toLocaleString('en-IN')}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveItem(item.id)}
                  style={styles.deleteBtn}
                  accessibilityLabel={`Delete ${item.name}`}
                  accessibilityRole="button"
                >
                  <Trash2 size={13} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Taxes, Discounts & Payment */}
      <Text style={styles.sectionHeader}>Adjustments & Payment</Text>
      <View
        style={styles.card}
        onLayout={(e) => { fieldOffsets.current['adjustments'] = e.nativeEvent.layout.y; }}
      >
        <View style={styles.adjustmentsRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>GST / Tax %</Text>
            <Controller
              control={control}
              name="taxRate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="numeric"
                  value={value}
                  onBlur={onBlur}
                  onFocus={() => handleFieldFocus('adjustments')}
                  onChangeText={onChange}
                  style={[styles.textInput, { height: 40 }]}
                />
              )}
            />
            {/* GST Presets */}
            <View style={styles.presetsRow}>
              {['0', '5', '12', '18'].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setValue('taxRate', preset, { shouldDirty: true })}
                  style={[
                    styles.presetChip,
                    formValues.taxRate === preset && styles.presetChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      formValues.taxRate === preset && styles.presetChipTextActive,
                    ]}
                  >
                    {preset}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Discount (Flat &#8377;)</Text>
            <Controller
              control={control}
              name="discount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="numeric"
                  value={value}
                  onBlur={onBlur}
                  onFocus={() => handleFieldFocus('adjustments')}
                  onChangeText={onChange}
                  style={[styles.textInput, { height: 40 }]}
                />
              )}
            />
          </View>
        </View>

        {/* Order Channel / Type Selector for Conversion Tracking */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Order Type (Traffic Conversion)</Text>
          <Text style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>
            Categorize this order to accurately calculate online catalog conversion vs in-store walk-in sales.
          </Text>
          <View style={styles.paymentSelector}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                (formValues.orderType || 'offline') === 'online' &&
                  styles.paymentOptionActive,
              ]}
              onPress={() =>
                setValue('orderType', 'online', { shouldDirty: true })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Globe
                  size={14}
                  color={
                    (formValues.orderType || 'offline') === 'online'
                      ? '#2563eb'
                      : '#71717a'
                  }
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    (formValues.orderType || 'offline') === 'online' &&
                      styles.paymentOptionTextActive,
                  ]}
                >
                  Online Order
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                (formValues.orderType || 'offline') === 'offline' &&
                  styles.paymentOptionActive,
              ]}
              onPress={() =>
                setValue('orderType', 'offline', { shouldDirty: true })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Store
                  size={14}
                  color={
                    (formValues.orderType || 'offline') === 'offline'
                      ? '#FF5E36'
                      : '#71717a'
                  }
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    (formValues.orderType || 'offline') === 'offline' &&
                      styles.paymentOptionTextActive,
                  ]}
                >
                  Offline / In-Store
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Payment Method</Text>
          <View style={styles.paymentSelector}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                formValues.paymentMethod === 'Online' &&
                styles.paymentOptionActive,
              ]}
              onPress={() =>
                setValue('paymentMethod', 'Online', { shouldDirty: true })
              }
            >
              <Text
                style={[
                  styles.paymentOptionText,
                  formValues.paymentMethod === 'Online' &&
                  styles.paymentOptionTextActive,
                ]}
              >
                Online Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                formValues.paymentMethod === 'Cash' &&
                styles.paymentOptionActive,
              ]}
              onPress={() =>
                setValue('paymentMethod', 'Cash', { shouldDirty: true })
              }
            >
              <Text
                style={[
                  styles.paymentOptionText,
                  formValues.paymentMethod === 'Cash' &&
                  styles.paymentOptionTextActive,
                ]}
              >
                Cash Payment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                formValues.paymentMethod === 'Credit' &&
                styles.paymentOptionActive,
              ]}
              onPress={() =>
                setValue('paymentMethod', 'Credit', { shouldDirty: true })
              }
            >
              <Text
                style={[
                  styles.paymentOptionText,
                  formValues.paymentMethod === 'Credit' &&
                  styles.paymentOptionTextActive,
                ]}
              >
                Credit / Udhar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Date Selection */}
        <View style={[styles.inputGroup, { marginTop: 12 }]}>
          <Text style={styles.inputLabel}>Payment Date</Text>
          <TouchableOpacity
            onPress={() => setActiveDatePicker('paymentDate')}
            style={styles.datePickerTrigger}
            accessibilityLabel="Select payment date"
            accessibilityRole="button"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Calendar size={16} color="#FF5E36" style={{ marginRight: 8 }} />
              <Text style={styles.datePickerTriggerText}>
                {formValues.paymentDate
                  ? new Date(formValues.paymentDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Select Payment Date'}
              </Text>
            </View>
            <Text style={styles.datePickerHelperBadge}>Select Date</Text>
          </TouchableOpacity>
        </View>

        {/* Credit / Udhar Details Form */}
        {formValues.paymentMethod === 'Credit' && (
          <View style={styles.creditDetailsContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <CreditCard size={16} color="#c2410c" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#c2410c' }}>
                Customer Credit Terms (Udhar)
              </Text>
            </View>

            <View style={styles.inputRow}>
              {/* Paid Amount */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Advance Paid (₹)</Text>
                <Controller
                  control={control}
                  name="paidAmount"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="0"
                      placeholderTextColor="#a1a1aa"
                      keyboardType="numeric"
                      value={value}
                      onBlur={onBlur}
                      onFocus={() => handleFieldFocus('adjustments', 120)}
                      onChangeText={onChange}
                      style={[styles.textInput, { height: 42 }]}
                    />
                  )}
                />
              </View>

              {/* Calculated Due Balance */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Balance Due (₹)</Text>
                <View style={styles.dueAmountCard}>
                  <Text style={styles.dueAmountText}>
                    ₹{Math.max(0, totalAmount - (parseFloat(formValues.paidAmount) || 0)).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Advance Payment Mode (Cash vs Online) when advance is paid */}
            {parseFloat(formValues.paidAmount) > 0 && (
              <View style={[styles.inputGroup, { marginTop: 4, marginBottom: 12 }]}>
                <Text style={styles.inputLabel}>Advance Payment Mode *</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      { flex: 1, paddingVertical: 8 },
                      (formValues.advancePaymentMode || 'Cash') === 'Cash' && styles.paymentOptionActive,
                    ]}
                    onPress={() => setValue('advancePaymentMode', 'Cash', { shouldDirty: true })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.paymentOptionText,
                        { fontSize: 12 },
                        (formValues.advancePaymentMode || 'Cash') === 'Cash' && styles.paymentOptionTextActive,
                      ]}
                    >
                      Cash Payment
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentOption,
                      { flex: 1, paddingVertical: 8 },
                      formValues.advancePaymentMode === 'Online' && styles.paymentOptionActive,
                    ]}
                    onPress={() => setValue('advancePaymentMode', 'Online', { shouldDirty: true })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.paymentOptionText,
                        { fontSize: 12 },
                        formValues.advancePaymentMode === 'Online' && styles.paymentOptionTextActive,
                      ]}
                    >
                      Online Payment
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Due Date & Presets */}
            <View style={[styles.inputGroup, { marginTop: 4 }]}>
              <Text style={styles.inputLabel}>Payment Due Date</Text>
              <View style={styles.presetsRow}>
                {[
                  { label: '7 Days', days: 7 },
                  { label: '15 Days', days: 15 },
                  { label: '30 Days', days: 30 },
                  { label: '60 Days', days: 60 },
                ].map((p) => {
                  const target = new Date();
                  target.setDate(target.getDate() + p.days);
                  const targetStr = target.toISOString().split('T')[0];
                  const isSelected = formValues.dueDate === targetStr;
                  return (
                    <TouchableOpacity
                      key={p.days}
                      onPress={() => setValue('dueDate', targetStr, { shouldDirty: true })}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Calendar Trigger for Due Date */}
              <TouchableOpacity
                onPress={() => setActiveDatePicker('dueDate')}
                style={[styles.datePickerTrigger, { marginTop: 8, borderColor: '#fdba74' }]}
                accessibilityLabel="Open calendar to pick due date"
                accessibilityRole="button"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Calendar size={16} color="#c2410c" style={{ marginRight: 8 }} />
                  <Text style={[styles.datePickerTriggerText, { color: '#9a3412', fontWeight: '600' }]}>
                    {formValues.dueDate
                      ? new Date(formValues.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Choose Due Date'}
                  </Text>
                </View>
                <Text style={[styles.datePickerHelperBadge, { color: '#c2410c', borderColor: '#fed7aa', backgroundColor: '#fff7ed' }]}>
                  Open Calendar
                </Text>
              </TouchableOpacity>

              {formValues.dueDate ? (
                <Text style={styles.dueDateHelperText}>
                  Due deadline: {new Date(formValues.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {/* Notes */}
        <View
          style={[styles.inputGroup, { marginTop: 4 }]}
          onLayout={(e) => {
            fieldOffsets.current['notes_local'] = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.inputLabel}>Special Instructions / Notes</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="e.g. Alterations requested, paid advance..."
                placeholderTextColor="#a1a1aa"
                value={value}
                onBlur={() => {
                  onBlur();
                  activeFieldRef.current = null;
                }}
                onFocus={() => handleFieldFocus('notes')}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
              />
            )}
          />
        </View>

        {/* Live Calculation Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              &#8377;{subtotal.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              GST ({formValues.taxRate}%)
            </Text>
            <Text style={styles.summaryValue}>
              &#8377;{taxAmount.toLocaleString('en-IN')}
            </Text>
          </View>
          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                - &#8377;{discountAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>
              &#8377;{totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={() => {
            onPreview();
          }}
          style={styles.generateButton}
          accessibilityLabel="Preview and generate invoice button"
          accessibilityRole="button"
        >
          <Text style={styles.generateButtonText}>
            {isEditing ? 'Preview & Update Invoice' : 'Preview & Create Invoice'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Picker Modal */}
      <CalendarPickerModal
        visible={activeDatePicker !== null}
        onClose={() => setActiveDatePicker(null)}
        onSelectDate={(dateStr) => {
          if (activeDatePicker === 'dueDate') {
            setValue('dueDate', dateStr, { shouldDirty: true });
          } else if (activeDatePicker === 'paymentDate') {
            setValue('paymentDate', dateStr, { shouldDirty: true });
          }
        }}
        initialDate={
          activeDatePicker === 'dueDate'
            ? formValues.dueDate
            : formValues.paymentDate
        }
        title={
          activeDatePicker === 'dueDate'
            ? 'Select Payment Due Date'
            : 'Select Payment Date'
        }
        minDate={activeDatePicker === 'dueDate' ? today : null}
        maxDate={activeDatePicker === 'paymentDate' ? today : null}
        validationMessage={
          activeDatePicker === 'dueDate'
            ? 'Payment due date cannot be in the past (today or later).'
            : 'Payment date cannot be in the future (today or earlier).'
        }
      />
    </ScrollView>
  );
};

export default InvoiceFormView;
