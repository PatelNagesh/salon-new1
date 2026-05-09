import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../../services/supabase';

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeStaff: number;
  newCustomers: number;
  todayBookings: number;
  monthlyRevenue: number;
}

export const OwnerDashboardScreen = () => {
  const { user, salonId, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    activeStaff: 0,
    newCustomers: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [salonId]);

  const loadDashboardData = async () => {
    try {
      if (!salonId) return;

      // Get total bookings
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonId);

      // Get today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: todayBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonId)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('services(price)')
        .eq('salon_id', salonId)
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce(
        (sum, booking: any) => sum + (booking.services?.price || 0),
        0
      ) || 0;

      // Get monthly revenue
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const nextMonth = new Date(thisMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const { data: monthlyData } = await supabase
        .from('bookings')
        .select('services(price)')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('start_time', thisMonth.toISOString())
        .lt('start_time', nextMonth.toISOString());

      const monthlyRevenue = monthlyData?.reduce(
        (sum, booking: any) => sum + (booking.services?.price || 0),
        0
      ) || 0;

      // Get active staff count
      const { count: activeStaff } = await supabase
        .from('staff_members')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonId)
        .eq('is_active', true);

      // Get new customers this month
      const { count: newCustomers } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salonId)
        .eq('role', 'CUSTOMER')
        .gte('created_at', thisMonth.toISOString());

      setStats({
        totalRevenue,
        totalBookings: totalBookings || 0,
        activeStaff: activeStaff || 0,
        newCustomers: newCustomers || 0,
        todayBookings: todayBookings || 0,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.salonNameText}>Your Salon Dashboard</Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            subtitle="Appointments"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toFixed(0)}`}
            subtitle="This month"
          />
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>All-Time Statistics</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(0)}`}
            subtitle="All time"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            subtitle="Completed"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Active Staff"
            value={stats.activeStaff}
            subtitle="Team members"
          />
          <StatCard
            title="New Customers"
            value={stats.newCustomers}
            subtitle="This month"
          />
        </View>
      </View>

      {hasPermission('reports.view') && (
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Detailed Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Manage Staff Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Update Services</Text>
          </TouchableOpacity>
        </View>
      )}
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  salonNameText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  quickActions: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});