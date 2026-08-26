import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Search, Plus, Tag } from 'lucide-react-native';
import CatalogItem from '../components/CatalogItem';
import { Product } from '../types';

interface CatalogScreenProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isLoading: boolean;
  onAddProduct: () => void;
  onManageCategories: () => void;
  onToggleStock: (product: Product) => void;
  onUpdateVisibility: (product: Product, status: boolean) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (slug: string, name: string) => void;
}

export default function CatalogScreen({
  products,
  searchQuery,
  setSearchQuery,
  isLoading,
  onAddProduct,
  onManageCategories,
  onToggleStock,
  onUpdateVisibility,
  onEditProduct,
  onDeleteProduct
}: CatalogScreenProps) {
  
  const filteredCatalogue = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <View style={styles.tabContent}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={14} color="#a1a1aa" />
          <TextInput 
            placeholder="Search products or categories..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onManageCategories} style={styles.categoriesButton}>
            <Tag size={13} color="#09090b" />
            <Text style={styles.categoriesButtonText}>Manage Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddProduct} style={styles.addButton}>
            <Plus size={13} color="#fff" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF5E36" style={styles.loader} />
        ) : filteredCatalogue.length === 0 ? (
          <Text style={styles.emptyLabel}>No products matching query.</Text>
        ) : (
          filteredCatalogue.map(product => (
            <CatalogItem 
              key={product.id}
              product={product}
              onToggleStock={onToggleStock}
              onUpdateVisibility={onUpdateVisibility}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#09090b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoriesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    height: 36,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  categoriesButtonText: {
    color: '#09090b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#FF5E36',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyLabel: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  loader: {
    marginTop: 40,
  },
});
