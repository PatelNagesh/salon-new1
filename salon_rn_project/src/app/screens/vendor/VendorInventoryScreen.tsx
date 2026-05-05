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
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface InventoryItem {
  id: string;
  product_name: string;
  sku: string;
  description?: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_cost: number;
  selling_price: number;
  category: string;
  supplier?: string;
  last_updated: string;
}

export const VendorInventoryScreen = () => {
  const { user, salonId } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    description: '',
    quantity_on_hand: '',
    reorder_level: '',
    unit_cost: '',
    selling_price: '',
    category: 'General',
    supplier: '',
  });

  useEffect(() => {
    loadInventory();
  }, [salonId]);

  const loadInventory = async () => {
    try {
      if (!salonId || !user?.id) return;

      const { data, error } = await supabase
        .from('vendor_inventory')
        .select('*')
        .eq('salon_id', salonId)
        .eq('vendor_id', user.id)
        .order('product_name');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const handleAddItem = async () => {
    if (!formData.product_name || !formData.sku) {
      Alert.alert('Error', 'Product name and SKU are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('vendor_inventory')
        .insert({
          salon_id: salonId,
          vendor_id: user?.id,
          product_name: formData.product_name,
          sku: formData.sku,
          description: formData.description,
          quantity_on_hand: parseInt(formData.quantity_on_hand) || 0,
          reorder_level: parseInt(formData.reorder_level) || 0,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          selling_price: parseFloat(formData.selling_price) || 0,
          category: formData.category,
          supplier: formData.supplier,
        });

      if (error) throw error;

      Alert.alert('Success', 'Item added successfully');
      setShowAddModal(false);
      resetForm();
      loadInventory();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('vendor_inventory')
        .update({
          product_name: formData.product_name,
          sku: formData.sku,
          description: formData.description,
          quantity_on_hand: parseInt(formData.quantity_on_hand) || 0,
          reorder_level: parseInt(formData.reorder_level) || 0,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          selling_price: parseFloat(formData.selling_price) || 0,
          category: formData.category,
          supplier: formData.supplier,
          last_updated: new Date().toISOString(),
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      Alert.alert('Success', 'Item updated successfully');
      setEditingItem(null);
      resetForm();
      loadInventory();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.product_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('vendor_inventory')
                .delete()
                .eq('id', item.id);

              Alert.alert('Success', 'Item deleted successfully');
              loadInventory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      sku: '',
      description: '',
      quantity_on_hand: '',
      reorder_level: '',
      unit_cost: '',
      selling_price: '',
      category: 'General',
      supplier: '',
    });
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      product_name: item.product_name,
      sku: item.sku,
      description: item.description || '',
      quantity_on_hand: item.quantity_on_hand.toString(),
      reorder_level: item.reorder_level.toString(),
      unit_cost: item.unit_cost.toString(),
      selling_price: item.selling_price.toString(),
      category: item.category,
      supplier: item.supplier || '',
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_on_hand === 0) return { status: 'Out of Stock', color: '#dc3545' };
    if (item.quantity_on_hand <= item.reorder_level) return { status: 'Low Stock', color: '#ffc107' };
    return { status: 'In Stock', color: '#28a745' };
  };

  const categories = ['General', 'Hair Products', 'Skin Care', 'Nail Supplies', 'Equipment', 'Cleaning', 'Other'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
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
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inventory.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {inventory.filter(item => item.quantity_on_hand === 0).length}
          </Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {inventory.filter(item => item.quantity_on_hand <= item.reorder_level).length}
          </Text>
          <Text style={styles.statLabel}>Need Reorder</Text>
        </View>
      </View>

      {inventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inventory items</Text>
          <Text style={styles.emptySubtext}>Add your first product to get started</Text>
        </View>
      ) : (
        <View style={styles.inventoryList}>
          {inventory.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <View key={item.id} style={styles.inventoryCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                    {item.supplier && (
                      <Text style={styles.itemSupplier}>Supplier: {item.supplier}</Text>
                    )}
                  </View>
                  <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                    <Text style={styles.stockBadgeText}>{stockStatus.status}</Text>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{item.category}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity:</Text>
                    <Text style={styles.detailValue}>{item.quantity_on_hand} units</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reorder at:</Text>
                    <Text style={styles.detailValue}>{item.reorder_level} units</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Unit Cost:</Text>
                    <Text style={styles.detailValue}>${item.unit_cost.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Selling Price:</Text>
                    <Text style={styles.detailValue}>${item.selling_price.toFixed(2)}</Text>
                  </View>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Add/Edit Item Modal */}
      <Modal
        visible={showAddModal || editingItem !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setEditingItem(null);
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
                value={formData.product_name}
                onChangeText={(text) => setFormData({ ...formData, product_name: text })}
                placeholder="e.g., Premium Shampoo"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SKU *</Text>
              <TextInput
                style={styles.input}
                value={formData.sku}
                onChangeText={(text) => setFormData({ ...formData, sku: text })}
                placeholder="e.g., SHM-001"
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.category === category && styles.categoryChipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === category && styles.categoryChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Quantity on Hand</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity_on_hand}
                  onChangeText={(text) => setFormData({ ...formData, quantity_on_hand: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Reorder Level</Text>
                <TextInput
                  style={styles.input}
                  value={formData.reorder_level}
                  onChangeText={(text) => setFormData({ ...formData, reorder_level: text })}
                  placeholder="10"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Unit Cost ($)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit_cost}
                  onChangeText={(text) => setFormData({ ...formData, unit_cost: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Selling Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.selling_price}
                  onChangeText={(text) => setFormData({ ...formData, selling_price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Supplier</Text>
              <TextInput
                style={styles.input}
                value={formData.supplier}
                onChangeText={(text) => setFormData({ ...formData, supplier: text })}
                placeholder="Supplier name"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingItem ? handleUpdateItem : handleAddItem}
            >
              <Text style={styles.saveButtonText}>
                {editingItem ? 'Update Item' : 'Add Item'}
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
  },
  inventoryList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemSupplier: {
    fontSize: 14,
    color: '#666',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  itemActions: {
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
  categoryScroll: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  categoryChipActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
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