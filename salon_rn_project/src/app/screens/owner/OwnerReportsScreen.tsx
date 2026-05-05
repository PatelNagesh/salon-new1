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
import { LineChart, BarChart } from 'react-native-chart-kit';

interface ReportData {
  revenueByMonth: { month: string; revenue: number }[];
  topServices: { name: string; count: number; revenue: number }[];
  staffPerformance: { name: string; appointments: number; revenue: number }[];
  todayStats: {
    totalAppointments: number;
    completedAppointments: number;
    revenue: number;
    noShows: number;
  };
}

export const OwnerReportsScreen = () => {
  const { salonId, hasPermission } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    revenueByMonth: [],
    topServices: [],
    staffPerformance: [],
    todayStats: {
      totalAppointments: 0,
      completedAppointments: 0,
      revenue: 0,
      noShows: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadReportData();
  }, [salonId, selectedPeriod]);

  const loadReportData = async () => {
    try {
      if (!salonId) return;

      // Load today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('status, services(price)')
        .eq('salon_id', salonId)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      const todayStats = {
        totalAppointments: todayBookings?.length || 0,
        completedAppointments: todayBookings?.filter(b => b.status === 'completed').length || 0,
        revenue: todayBookings
          ?.filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.services?.price || 0), 0) || 0,
        noShows: todayBookings?.filter(b => b.status === 'no-show').length || 0,
      };

      // Load revenue by month
      const monthsBack = selectedPeriod === 'week' ? 4 : selectedPeriod === 'month' ? 12 : 24;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      const { data: monthlyData } = await supabase
        .from('bookings')
        .select('start_time, services(price)')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('start_time', startDate.toISOString());

      const revenueByMonth = processMonthlyRevenue(monthlyData || []);

      // Load top services
      const { data: serviceData } = await supabase
        .from('bookings')
        .select('services(name, price)')
        .eq('salon_id', salonId)
        .eq('status', 'completed');

      const topServices = processTopServices(serviceData || []);

      // Load staff performance
      const { data: staffData } = await supabase
        .from('bookings')
        .select(`
          services(price),
          staff_members(profiles(first_name, last_name))
        `)
        .eq('salon_id', salonId)
        .eq('status', 'completed');

      const staffPerformance = processStaffPerformance(staffData || []);

      setReportData({
        revenueByMonth,
        topServices,
        staffPerformance,
        todayStats,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyRevenue = (data: any[]) => {
    const monthMap: { [key: string]: number } = {};

    data.forEach(booking => {
      const month = new Date(booking.start_time).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthMap[month] = (monthMap[month] || 0) + (booking.services?.price || 0);
    });

    return Object.entries(monthMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-12);
  };

  const processTopServices = (data: any[]) => {
    const serviceMap: { [key: string]: { count: number; revenue: number } } = {};

    data.forEach(booking => {
      const serviceName = booking.services?.name || 'Unknown';
      const price = booking.services?.price || 0;

      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { count: 0, revenue: 0 };
      }
      serviceMap[serviceName].count++;
      serviceMap[serviceName].revenue += price;
    });

    return Object.entries(serviceMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processStaffPerformance = (data: any[]) => {
    const staffMap: { [key: string]: { appointments: number; revenue: number; name: string } } = {};

    data.forEach(booking => {
      const staffName = booking.staff_members?.profiles
        ? `${booking.staff_members.profiles.first_name} ${booking.staff_members.profiles.last_name}`
        : 'Unassigned';
      const price = booking.services?.price || 0;

      if (!staffMap[staffName]) {
        staffMap[staffName] = { appointments: 0, revenue: 0, name: staffName };
      }
      staffMap[staffName].appointments++;
      staffMap[staffName].revenue += price;
    });

    return Object.values(staffMap)
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 10);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, color }: { title: string; value: string | number; subtitle?: string; color?: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color || '#007bff' }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading reports...</Text>
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
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Performance</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Appointments"
            value={reportData.todayStats.totalAppointments}
            color="#007bff"
          />
          <StatCard
            title="Completed"
            value={reportData.todayStats.completedAppointments}
            subtitle={`${((reportData.todayStats.completedAppointments / Math.max(reportData.todayStats.totalAppointments, 1)) * 100).toFixed(0)}%`}
            color="#28a745"
          />
          <StatCard
            title="Revenue"
            value={`$${reportData.todayStats.revenue.toFixed(0)}`}
            color="#6f42c1"
          />
          <StatCard
            title="No Shows"
            value={reportData.todayStats.noShows}
            color="#dc3545"
          />
        </View>
      </View>

      {/* Revenue Chart */}
      {hasPermission('reports.financial') && reportData.revenueByMonth.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: reportData.revenueByMonth.map(m => m.month),
                datasets: [{
                  data: reportData.revenueByMonth.map(m => m.revenue),
                }],
              }}
              width={350}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Top Services */}
      {reportData.topServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Services</Text>
          <View style={styles.rankedList}>
            {reportData.topServices.map((service, index) => (
              <View key={service.name} style={styles.rankItem}>
                <View style={styles.rankNumber}>
                  <Text style={styles.rankNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{service.name}</Text>
                  <Text style={styles.rankDetails}>
                    {service.count} appointments • ${service.revenue.toFixed(0)} total
                  </Text>
                </View>
                <Text style={styles.rankValue}>${(service.revenue / service.count).toFixed(0)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Staff Performance */}
      {hasPermission('reports.staff') && reportData.staffPerformance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Performance</Text>
          <View style={styles.rankedList}>
            {reportData.staffPerformance.map((staff, index) => (
              <View key={staff.name} style={styles.rankItem}>
                <View style={styles.rankNumber}>
                  <Text style={styles.rankNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{staff.name}</Text>
                  <Text style={styles.rankDetails}>
                    {staff.appointments} appointments • ${staff.revenue.toFixed(0)} total
                  </Text>
                </View>
                <Text style={styles.rankValue}>${(staff.revenue / staff.appointments).toFixed(0)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Export Options */}
      {hasPermission('reports.export') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Reports</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Download PDF Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export to Excel</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#007bff',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  chart: {
    borderRadius: 16,
  },
  rankedList: {
    gap: 12,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  rankDetails: {
    fontSize: 14,
    color: '#666',
  },
  rankValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  exportButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});