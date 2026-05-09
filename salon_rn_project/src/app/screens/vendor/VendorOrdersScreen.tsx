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

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  order_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  notes?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const VendorOrdersScreen = () => {
  const { user, salonId } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'ordered' | 'received'>('all');

  useEffect(() => {
    loadOrders();
  }, [salonId, filter]);

  const loadOrders = async () => {
    try {
      if (!salonId || !user?.id) return;

      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          purchase_order_items(
            product_name,
            quantity,
            unit_price
          )
        `)
        .eq('salon_id', salonId)
        .eq('vendor_id', user.id)
        .order('order_date', { ascending: false });

      // Apply filter
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match the interface
      const transformedOrders = data?.map(order => ({
        ...order,
        items: order.purchase_order_items.map((item: any) => ({
          ...item,
          total_price: item.quantity * item.unit_price,
        })),
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };

      if (newStatus === 'received') {
        updateData.received_date = new Date().toISOString();

        // Update inventory when order is received
        const order = orders.find(o => o.id === orderId);
        if (order) {
          for (const item of order.items) {
            await supabase.rpc('update_inventory_on_receipt', {
              p_product_name: item.product_name,
              p_quantity: item.quantity,
              p_salon_id: salonId,
              p_vendor_id: user?.id,
            });
          }
        }
      }

      const { error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      Alert.alert('Success', 'Order status updated');
      loadOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#6c757d';
      case 'approved':
        return '#007bff';
      case 'ordered':
        return '#17a2b8';
      case 'received':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const viewOrderDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading orders...</Text>
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
        <Text style={styles.headerTitle}>Purchase Orders</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'pending', 'approved', 'ordered', 'received'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {orders.filter(o => o.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            ${orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' ? "You haven't created any orders yet" :
             `No ${filter} orders`}
          </Text>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => viewOrderDetails(order)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>#{order.order_number}</Text>
                  <Text style={styles.orderSupplier}>{order.supplier}</Text>
                  <Text style={styles.orderDate}>Ordered: {formatDate(order.order_date)}</Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                >
                  <Text style={styles.statusText}>
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.orderTotal}>${order.total_amount.toFixed(2)}</Text>
                <Text style={styles.itemCount}>{order.items.length} items</Text>
                {order.expected_delivery_date && (
                  <Text style={styles.deliveryDate}>
                    Expected: {formatDate(order.expected_delivery_date)}
                  </Text>
                )}
              </View>

              <View style={styles.orderActions}>
                {order.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleUpdateStatus(order.id, 'approved')}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'approved' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.orderButton]}
                    onPress={() => handleUpdateStatus(order.id, 'ordered')}
                  >
                    <Text style={styles.actionButtonText}>Mark Ordered</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'ordered' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.receiveButton]}
                    onPress={() => handleUpdateStatus(order.id, 'received')}
                  >
                    <Text style={styles.actionButtonText}>Mark Received</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Order Details Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={() => setShowOrderModal(false)}>
              <Text style={styles.modalCloseButton}>Close</Text>
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Order Information</Text>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Order #:</Text>
                  <Text style={styles.detailInfoValue}>#{selectedOrder.order_number}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Supplier:</Text>
                  <Text style={styles.detailInfoValue}>{selectedOrder.supplier}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Status:</Text>
                  <Text style={[styles.detailInfoValue, { color: getStatusColor(selectedOrder.status) }]}>
                    {selectedOrder.status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Order Date:</Text>
                  <Text style={styles.detailInfoValue}>{formatDate(selectedOrder.order_date)}</Text>
                </View>
                {selectedOrder.expected_delivery_date && (
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailInfoLabel}>Expected Delivery:</Text>
                    <Text style={styles.detailInfoValue}>
                      {formatDate(selectedOrder.expected_delivery_date)}
                    </Text>
                  </View>
                )}
                {selectedOrder.received_date && (
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailInfoLabel}>Received Date:</Text>
                    <Text style={styles.detailInfoValue}>{formatDate(selectedOrder.received_date)}</Text>
                  </View>
                )}
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Total Amount:</Text>
                  <Text style={styles.detailInfoValue}>${selectedOrder.total_amount.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Order Items</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} × ${item.unit_price.toFixed(2)}
                    </Text>
                    <Text style={styles.itemTotal}>${item.total_price.toFixed(2)}</Text>
                  </View>
                ))}
              </View>

              {selectedOrder.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedOrder.notes}</Text>
                </View>
              )}
            </ScrollView>
          )}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
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
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderSupplier: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  deliveryDate: {
    fontSize: 12,
    color: '#999',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#007bff',
  },
  orderButton: {
    backgroundColor: '#17a2b8',
  },
  receiveButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
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
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailInfoLabel: {
    fontSize: 16,
    color: '#666',
    width: 140,
  },
  detailInfoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  itemDetails: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  itemTotal: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
});