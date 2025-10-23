import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Building2, MapPin, Home, TrendingUp } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

type Stats = {
  totalProjects: number;
  totalDevelopers: number;
  totalAreas: number;
  projectsByStatus: {
    planning: number;
    under_construction: number;
    completed: number;
  };
};

export default function DashboardScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [projectsRes, developersRes, areasRes] = await Promise.all([
        supabase.from('projects').select('status'),
        supabase.from('developers').select('id', { count: 'exact' }),
        supabase.from('areas').select('id', { count: 'exact' }),
      ]);

      const projects = projectsRes.data || [];
      const projectsByStatus = {
        planning: projects.filter((p) => p.status === 'planning').length,
        under_construction: projects.filter((p) => p.status === 'under_construction').length,
        completed: projects.filter((p) => p.status === 'completed').length,
      };

      setStats({
        totalProjects: projects.length,
        totalDevelopers: developersRes.count || 0,
        totalAreas: areasRes.count || 0,
        projectsByStatus,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإحصائيات</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.statGradient}>
              <View style={styles.statIcon}>
                <Home size={28} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>{stats?.totalProjects || 0}</Text>
              <Text style={styles.statLabel}>إجمالي المشاريع</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.statGradient}>
              <View style={styles.statIcon}>
                <Building2 size={28} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>{stats?.totalDevelopers || 0}</Text>
              <Text style={styles.statLabel}>المطورين</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.statGradient}>
              <View style={styles.statIcon}>
                <MapPin size={28} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>{stats?.totalAreas || 0}</Text>
              <Text style={styles.statLabel}>المناطق</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statGradient}>
              <View style={styles.statIcon}>
                <TrendingUp size={28} color="#ffffff" />
              </View>
              <Text style={styles.statValue}>{stats?.projectsByStatus.completed || 0}</Text>
              <Text style={styles.statLabel}>مشاريع مكتملة</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة المشاريع</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View style={[styles.statusDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.statusLabel}>تخطيط</Text>
              </View>
              <Text style={styles.statusValue}>{stats?.projectsByStatus.planning || 0}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.statusLabel}>قيد الإنشاء</Text>
              </View>
              <Text style={styles.statusValue}>{stats?.projectsByStatus.under_construction || 0}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.statusLabel}>مكتمل</Text>
              </View>
              <Text style={styles.statusValue}>{stats?.projectsByStatus.completed || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>التقدم الإجمالي</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressBar}>
              {stats && stats.totalProjects > 0 && (
                <>
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        width: `${(stats.projectsByStatus.planning / stats.totalProjects) * 100}%`,
                        backgroundColor: '#06b6d4',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        width: `${(stats.projectsByStatus.under_construction / stats.totalProjects) * 100}%`,
                        backgroundColor: '#f59e0b',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressSegment,
                      {
                        width: `${(stats.projectsByStatus.completed / stats.totalProjects) * 100}%`,
                        backgroundColor: '#10b981',
                      },
                    ]}
                  />
                </>
              )}
            </View>

            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
                <Text style={styles.legendText}>
                  {stats && stats.totalProjects > 0
                    ? Math.round((stats.projectsByStatus.planning / stats.totalProjects) * 100)
                    : 0}% تخطيط
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.legendText}>
                  {stats && stats.totalProjects > 0
                    ? Math.round((stats.projectsByStatus.under_construction / stats.totalProjects) * 100)
                    : 0}% قيد الإنشاء
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>
                  {stats && stats.totalProjects > 0
                    ? Math.round((stats.projectsByStatus.completed / stats.totalProjects) * 100)
                    : 0}% مكتمل
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    width: '47%',
    aspectRatio: 1,
  },
  statGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 16,
    color: '#475569',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressSection: {
    padding: 16,
    paddingTop: 0,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressBar: {
    height: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressSegment: {
    height: '100%',
  },
  progressLegend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#64748b',
  },
});
