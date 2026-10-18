import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  X,
  ChevronDown,
  UserPlus,
  Search,
  Check,
  Plus,
  Trash2,
  User,
  ShoppingBag,
} from 'lucide-react-native';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Customer, Product, Variant } from '../../types';
import { InvoiceItem, InvoiceFormValues } from '../../screens/InvoiceScreen';
import styles from '../../screens/InvoiceScreen.styles';

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
  onOpenAddCustomerModal: () => void;
  selectedProduct: Product | null;
  selectedVariant: Variant | null;
  setSelectedVariant: (v: Variant | null) => void;
  productSearchQuery: string;
  setProductSearchQuery: (val: string) => void;
  showProductDropdown: boolean;
  setShowProductDropdown: (val: boolean | ((prev: boolean) => boolean)) => void;
  filteredProducts: Product[];
  onSelectProduct: (prod: Product) => void;
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
  onCloseForm: () => void;
  onPreview: () => void;
}

export const InvoiceFormView: React.FC<InvoiceFormViewProps> = ({
  control,
  errors,
  formValues,
  setValue,
  setSelectedCustomerId,
  customerSearchQuery,
  setCustomerSearchQuery,
  showCustomerDropdown,
  setShowCustomerDropdown,
  filteredCustomers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenAddCustomerModal,
  selectedProduct,
  selectedVariant,
  setSelectedVariant,
  productSearchQuery,
  setProductSearchQuery,
  showProductDropdown,
  setShowProductDropdown,
  filteredProducts,
  onSelectProduct,
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
}) => {
  return (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
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
            <Text style={styles.formTitle}>New Invoice</Text>
          </View>

          {/* Customer Selection Section */}
          <Text style={styles.sectionHeader}>Customer Details</Text>

          <View style={styles.card}>
            {/* Customer Dropdown Trigger */}
            <View style={[styles.inputGroup, !showCustomerDropdown && { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Choose Existing Customer</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomerDropdown(!showCustomerDropdown);
                  setShowProductDropdown(false);
                }}
                style={styles.dropdownTrigger}
                accessibilityLabel="Select customer dropdown"
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
                      : 'Select from database...'}
                  </Text>
                </View>
                {formValues.clientName ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedCustomerId(null);
                      setValue('clientName', '', { shouldDirty: true });
                      setValue('clientPhone', '', { shouldDirty: true });
                      setValue('clientEmail', '', { shouldDirty: true });
                      setValue('clientAddress', '', { shouldDirty: true });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginRight: 6 }}
                  >
                    <X size={14} color="#a1a1aa" />
                  </TouchableOpacity>
                ) : null}
                <ChevronDown size={14} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Expanded Customer Picker */}
            {showCustomerDropdown && (
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
                  {filteredCustomers.length === 0 ? (
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
          </View>

          {/* Product & Variant Selection Section */}
          <Text style={styles.sectionHeader}>Select & Add Items</Text>
          <View style={styles.card}>
            {/* Product Picker Trigger */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose Product *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowProductDropdown(!showProductDropdown);
                  setShowCustomerDropdown(false);
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
                      : 'Select a product from catalog...'}
                  </Text>
                </View>
                <ChevronDown size={14} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Expanded Product Picker */}
            {showProductDropdown && (
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
                  {filteredProducts.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.dropdownOption}
                      onPress={() => onSelectProduct(p)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dropdownOptionText}>{p.name}</Text>
                        <Text style={styles.dropdownOptionMeta}>
                          {p.category} {p.variants?.length ? `• ${p.variants.length} variant(s)` : ''}
                        </Text>
                      </View>
                      <Text style={styles.dropdownOptionPrice}>
                        &#8377;{(p.sellingPrice || p.price).toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setSelectedVariant(v)}
                        style={[
                          styles.variantChip,
                          isSelected && styles.variantChipActive,
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
                          ]}
                        >
                          {v.color} ({v.stock} in stock)
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Price & Quantity Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Rate / Price (&#8377;)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={itemPrice}
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
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>GST / Tax %</Text>
                <Controller
                  control={control}
                  name="taxRate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="numeric"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={styles.textInput}
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
                      onChangeText={onChange}
                      style={styles.textInput}
                    />
                  )}
                />
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
              </View>
            </View>

            {/* Notes */}
            <View style={[styles.inputGroup, { marginTop: 4 }]}>
              <Text style={styles.inputLabel}>Special Instructions / Notes</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="e.g. Alterations requested, paid advance..."
                    placeholderTextColor="#a1a1aa"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                    style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
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
              <Text style={styles.generateButtonText}>Preview & Create Invoice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

  );
};

export default InvoiceFormView;
