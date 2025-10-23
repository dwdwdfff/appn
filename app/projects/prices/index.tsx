import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Search, Building, Maximize, TrendingDown, CreditCard, Calendar, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface ProjectPrice {
  id: string;
  name: string;
  description: string | null;
  area_min: number | null;
  area_max: number | null;
  price_min: number | null;
  price_max: number | null;
  down_payment_min: number | null;
  down_payment_max: number | null;
  min_unit_price: number | null;
  min_unit_down_payment: number | null;
  min_unit_installment: number | null;
  min_area: number | null;
  max_area: number | null;
  unit_count: number;
  developers: {
    name: string;
  };
  areas: {
    name: string;
    city: string;
  } | null;
}

export default function ProjectPricesScreen() {
  const [projects, setProjects] = useState<ProjectPrice[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjectPrices();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, projects]);

  const fetchProjectPrices = async () => {
    try {
      // Get projects with their basic info
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          area_min,
          area_max,
          price_min,
          price_max,
          down_payment_min,
          down_payment_max,
          developers (
            name
          ),
          areas (
            name,
            city
          )
        `);

      if (projectsError) throw projectsError;

      // Get unit data for each project
      const projectsWithUnitData = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Get unit count
          const { count: unitCount } = await supabase
            .from('units')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          // Get minimum unit prices and areas
          const { data: unitsData } = await supabase
            .from('units')
            .select('price, down_payment, monthly_installment, area_sqm')
            .eq('project_id', project.id)
            .not('price', 'is', null)
            .order('price', { ascending: true });

          let minUnitPrice = null;
          let minUnitDownPayment = null;
          let minUnitInstallment = null;
          let minArea = null;
          let maxArea = null;

          if (unitsData && unitsData.length > 0) {
            minUnitPrice = unitsData[0].price;
            minUnitDownPayment = unitsData[0].down_payment;
            minUnitInstallment = unitsData[0].monthly_installment;

            // Calculate area range
            const areas = unitsData
              .map(unit => unit.area_sqm)
              .filter(area => area !== null)
              .sort((a, b) => a - b);
            
            if (areas.length > 0) {
              minArea = areas[0];
              maxArea = areas[areas.length - 1];
            }
          }

          return {
            ...project,
            unit_count: unitCount || 0,
            min_unit_price: minUnitPrice,
            min_unit_down_payment: minUnitDownPayment,
            min_unit_installment: minUnitInstallment,
            min_area: minArea || project.area_min,
            max_area: maxArea || project.area_max,
          };
        })
      );

      setProjects(projectsWithUnitData);
    } catch (error) {
      console.error('Error fetching project prices:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل أسعار المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.developers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.areas?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.areas?.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('en-US').format(price) + ' ج.م';
  };

  const formatAreaRange = (min: number | null, max: number | null) => {
    if (!min && !max) return 'غير محدد';
    if (min && max && min !== max) return `${min} - ${max} م²`;
    if (min) return `من ${min} م²`;
    if (max) return `حتى ${max} م²`;
    return 'غير محدد';
  };

  const formatPriceRange = (min: number | null, max: number | null) => {
    if (!min && !max) return 'غير محدد';
    if (min && max && min !== max) {
      return `${new Intl.NumberFormat('en-US').format(min)} - ${new Intl.NumberFormat('en-US').format(max)} ج.م`;
    }
    if (min) return `من ${new Intl.NumberFormat('en-US').format(min)} ج.م`;
    if (max) return `حتى ${new Intl.NumberFormat('en-US').format(max)} ج.م`;
    return 'غير محدد';
  };

  const renderProject = ({ item }: { item: ProjectPrice }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.developerName}>{item.developers?.name}</Text>
          {item.areas && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                {item.areas.name} - {item.areas.city}
              </Text>
              <MapPin size={14} color="#6B7280" />
            </View>
          )}
          <Text style={styles.unitCount}>{item.unit_count} وحدة</Text>
        </View>
        
        <View style={styles.projectIcon}>
          <Building size={32} color="#3B619F" />
        </View>
      </View>

      {item.description && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <Maximize size={18} color="#3B619F" />
            </View>
            <Text style={styles.priceLabel}>المساحات تبدأ من</Text>
            <Text style={styles.priceValue}>
              {formatAreaRange(item.min_area, item.max_area)}
            </Text>
          </View>

          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <TrendingDown size={18} color="#10B981" />
            </View>
            <Text style={styles.priceLabel}>الأسعار تبدأ من</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.min_unit_price || item.price_min)}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <CreditCard size={18} color="#F59E0B" />
            </View>
            <Text style={styles.priceLabel}>أقل مقدم</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.min_unit_down_payment || item.down_payment_min)}
            </Text>
          </View>

          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <Calendar size={18} color="#EF4444" />
            </View>
            <Text style={styles.priceLabel}>أقل قسط شهري</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.min_unit_installment)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="أسعار المشاريع" />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="البحث في المشاريع..."
            placeholderTextColor="#9CA3AF"
          />
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
        </View>

        <FlatList
          data={filteredProjects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchProjectPrices}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Building size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>لا توجد مشاريع</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد مشاريع مع بيانات أسعار'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EEF5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  searchIcon: {
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'right',
  },
  developerName: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  unitCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 2,
  },
  projectIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    width: '48%',
    alignItems: 'center',
  },
  priceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});