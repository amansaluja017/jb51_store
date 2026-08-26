import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { X, Plus, Trash2, Tag } from 'lucide-react-native';
import { Product } from '../types';

interface CategoryManagerModalProps {
  visible: boolean;
  categories: string[];
  products: Product[];
  onClose: () => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
}

export default function CategoryManagerModal({
  visible,
  categories,
  products,
  onClose,
  onAddCategory,
  onDeleteCategory,
  showAlert
}: CategoryManagerModalProps) {
  const [newCatInput, setNewCatInput] = useState('');

  const handleAdd = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showAlert('Duplicate Category', 'This category already exists.', 'error');
      return;
    }
    onAddCategory(trimmed);
    setNewCatInput('');
    showAlert('Category Created', `"${trimmed}" has been added to categories.`, 'success');
  };

  const handleDelete = (cat: string) => {
    const count = products.filter(p => p.category === cat).length;
    let message = `Are you sure you want to delete the category "${cat}"?`;
    if (count > 0) {
      message = `The category "${cat}" is currently assigned to ${count} outfit(s). Deleting it will reassign these outfits to "Uncategorized". Proceed?`;
    }
    
    showAlert(
      'Delete Category',
      message,
      'confirm',
      () => {
        onDeleteCategory(cat);
        showAlert('Category Deleted', `"${cat}" has been deleted.`, 'success');
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalShell}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.titleWrapper}>
            <Tag size={18} color="#FF5E36" />
            <Text style={styles.modalTitle}>Taxonomy Categories</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#09090b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} contentContainerStyle={styles.scrollPadding}>
          {/* Create Category Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Add New Category</Text>
            <Text style={styles.sectionSubtitle}>Create a new collection category to group garments and outfits.</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                placeholder="e.g. Linen Co-ords"
                value={newCatInput}
                onChangeText={setNewCatInput}
                style={styles.textInput}
                placeholderTextColor="#a1a1aa"
              />
              <TouchableOpacity onPress={handleAdd} style={styles.addBtn} activeOpacity={0.8}>
                <Plus size={16} color="#ffffff" />
                <Text style={styles.addBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories List Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Catalog Categories</Text>
            <Text style={styles.sectionSubtitle}>Existing categories currently defined in the atelier database.</Text>
            
            <View style={styles.categoriesList}>
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat).length;
                return (
                  <View key={cat} style={styles.categoryItemRow}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryNameText}>{cat}</Text>
                      <Text style={styles.productCountText}>{count} outfit{count !== 1 ? 's' : ''} active</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => handleDelete(cat)} 
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {categories.length === 0 && (
                <Text style={styles.emptyText}>No categories defined yet.</Text>
              )}
            </View>
          </View>
        </ScrollView>
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
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
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
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#71717a',
    lineHeight: 14,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#09090b',
    backgroundColor: '#fafafa',
  },
  addBtn: {
    backgroundColor: '#FF5E36',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
    gap: 4,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesList: {
    gap: 8,
  },
  categoryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 12,
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryNameText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#09090b',
  },
  productCountText: {
    fontSize: 10,
    color: '#71717a',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  emptyText: {
    fontSize: 11,
    color: '#71717a',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
