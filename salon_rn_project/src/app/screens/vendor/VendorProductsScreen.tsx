import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface VendorProduct {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  category: string;
  wholesale_price: number;
  suggested_retail_price: number;
  min_order_quantity: number;
  unit_of_measure: string;
  in_stock: boolean;
  lead_time_days: number;
  tags: string[];
  created_at: string;
}

export const VendorProductsScreen = () => {
  const { user, salonId } = useAuth();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    category: 'General',
    wholesale_price: '',
    suggested_retail_price: '',
    min_order_quantity: '',
    unit_of_measure: 'piece',
    lead_time_days: '',
    tags: '',
  });

  useEffect(() => {
    loadProducts();
  }, [salonId, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      if (!salonId || !user?.id) return;

      let query = supabase
        .from('vendor_products')
        .select('*')
        .eq('salon_id', salonId)
        .eq('vendor_id', user.id)
        .order('name');

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      let productsList = data || [];

      // Apply search filter
      if (searchQuery) {
        productsList = productsList.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setProducts(productsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.wholesale_price) {
      Alert.alert('Error', 'Product name and wholesale price are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('vendor_products')
        .insert({
          salon_id: salonId,
          vendor_id: user?.id,
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          category: formData.category,
          wholesale_price: parseFloat(formData.wholesale_price),
          suggested_retail_price: parseFloat(formData.suggested_retail_price) || 0,
          min_order_quantity: parseInt(formData.min_order_quantity) || 1,
          unit_of_measure: formData.unit_of_measure,
          in_stock: true,
          lead_time_days: parseInt(formData.lead_time_days) || 0,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        });

      if (error) throw error;

      Alert.alert('Success', 'Product added successfully');
      setShowAddModal(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('vendor_products')
        .update({
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          category: formData.category,
          wholesale_price: parseFloat(formData.wholesale_price),
          suggested_retail_price: parseFloat(formData.suggested_retail_price) || 0,
          min_order_quantity: parseInt(formData.min_order_quantity) || 1,
          unit_of_measure: formData.unit_of_measure,
          lead_time_days: parseInt(formData.lead_time_days) || 0,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      Alert.alert('Success', 'Product updated successfully');
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteProduct = (product: VendorProduct) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('vendor_products')
                .delete()
                .eq('id', product.id);

              Alert.alert('Success', 'Product deleted successfully');
              loadProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      category: 'General',
      wholesale_price: '',
      suggested_retail_price: '',
      min_order_quantity: '',
      unit_of_measure: 'piece',
      lead_time_days: '',
      tags: '',
    });
  };

  const openEditModal = (product: VendorProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || '',
      description: product.description || '',
      category: product.category,
      wholesale_price: product.wholesale_price.toString(),
      suggested_retail_price: product.suggested_retail_price.toString(),
      min_order_quantity: product.min_order_quantity.toString(),
      unit_of_measure: product.unit_of_measure,
      lead_time_days: product.lead_time_days.toString(),
      tags: product.tags.join(', '),
    });
  };

  const getCategories = () => {
    const categories = products.map(p => p.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Catalog</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getCategories().map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {products.filter(p => p.in_stock).length}
          </Text>
          <Text style={styles.statLabel}>In Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${Math.min(...products.map(p => p.wholesale_price), 0).toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Min Price</Text>
        </View>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory !== 'all' ? 'No products found' : 'No products yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first product to get started'}
          </Text>
        </View>
      ) : (
        <View style={styles.productsList}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.brand && (
                    <Text style={styles.productBrand}>{product.brand}</Text>
                  )}
                  <View style={styles.productMeta}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <View style={[styles.stockBadge, product.in_stock ? styles.inStock : styles.outOfStock]}>
                      <Text style={styles.stockBadgeText}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Image
                  source={require('../../../assets/default-product.png')}
                  style={styles.productImage}
                />
              </View>

              {product.description && (
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
              )}

              <View style={styles.productDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Wholesale:</Text>
                  <Text style={styles.wholesalePrice}>${product.wholesale_price.toFixed(2)}</Text>
                </View>
                {product.suggested_retail_price > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Retail:</Text>
                    <Text style={styles.retailPrice}>${product.suggested_retail_price.toFixed(2)}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Min Order:</Text>
                  <Text style={styles.detailValue}>
                    {product.min_order_quantity} {product.unit_of_measure}
                  </Text>
                </View>
                {product.lead_time_days > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lead Time:</Text>
                    <Text style={styles.detailValue}>{product.lead_time_days} days</Text>
                  </View>
                )}
              </View>

              {product.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
                  {product.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{product.tags.length - 3} more</Text>
                  )}
                </View>
              )}

              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(product)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteProduct(product)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        visible={showAddModal || editingProduct !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Professional Shampoo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="e.g., L'Oréal"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Product description..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="e.g., Hair Care"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Wholesale Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wholesale_price}
                  onChangeText={(text) => setFormData({ ...formData, wholesale_price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Suggested Retail</Text>
                <TextInput
                  style={styles.input}
                  value={formData.suggested_retail_price}
                  onChangeText={(text) => setFormData({ ...formData, suggested_retail_price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Min Order Qty</Text>
                <TextInput
                  style={styles.input}
                  value={formData.min_order_quantity}
                  onChangeText={(text) => setFormData({ ...formData, min_order_quantity: text })}
                  placeholder="1"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Unit of Measure</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit_of_measure}
                  onChangeText={(text) => setFormData({ ...formData, unit_of_measure: text })}
                  placeholder="piece, bottle, etc."
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lead Time (days)</Text>
              <TextInput
                style={styles.input}
                value={formData.lead_time_days}
                onChangeText={(text) => setFormData({ ...formData, lead_time_days: text })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(text) => setFormData({ ...formData, tags: text })}
                placeholder="organic, vegan, professional"
              />
              <Text style={styles.inputHint}>Separate tags with commas</Text>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
            >
              <Text style={styles.saveButtonText}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  categoryFilter: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inStock: {
    backgroundColor: '#28a745',
  },
  outOfStock: {
    backgroundColor: '#dc3545',
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  wholesalePrice: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    flex: 1,
  },
  retailPrice: {
    fontSize: 14,
    color: '#28a745',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagChipText: {
    fontSize: 12,
    color: '#495057',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#007bff',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});