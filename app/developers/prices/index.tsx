import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Search, Building2, TrendingDown, CreditCard, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface DeveloperPrice {
  id: string;
  name: string;
  logo_url: string | null;
  min_price: number | null;
  min_down_payment: number | null;
  min_installment: number | null;
  project_count: number;
  min_unit_price: number | null;
  min_unit_down_payment: number | null;
  min_unit_installment: number | null;
}

export default function DeveloperPricesScreen() {
  const [developers, setDevelopers] = useState<DeveloperPrice[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<DeveloperPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDeveloperPrices();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [searchQuery, developers]);

  const fetchDeveloperPrices = async () => {
    try {
      // First get developers with their project counts
      const { data: developersData, error: developersError } = await supabase
        .from('developers')
        .select(`
          id,
          name,
          logo_url,
          min_price,
          min_down_payment,
          min_installment
        `);

      if (developersError) throw developersError;

      // Get project counts and minimum prices from units
      const developersWithPrices = await Promise.all(
        (developersData || []).map(async (developer) => {
          // Get project count
          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('developer_id', developer.id);

          // Get minimum unit prices for this developer
          const { data: unitsData } = await supabase
            .from('units')
            .select(`
              price,
              down_payment,
              monthly_installment,
              projects!inner(developer_id)
            `)
            .eq('projects.developer_id', developer.id)
            .not('price', 'is', null)
            .order('price', { ascending: true })
            .limit(1);

          const minUnitData = unitsData?.[0];

          return {
            ...developer,
            project_count: projectCount || 0,
            min_unit_price: minUnitData?.price || null,
            min_unit_down_payment: minUnitData?.down_payment || null,
            min_unit_installment: minUnitData?.monthly_installment || null,
          };
        })
      );

      setDevelopers(developersWithPrices);
    } catch (error) {
      console.error('Error fetching developer prices:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل أسعار المطورين');
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    if (!searchQuery.trim()) {
      setFilteredDevelopers(developers);
      return;
    }

    const filtered = developers.filter((developer) =>
      developer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDevelopers(filtered);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('en-US').format(price) + ' ج.م';
  };

  const renderDeveloper = ({ item }: { item: DeveloperPrice }) => (
    <View style={styles.developerCard}>
      <View style={styles.developerHeader}>
        <View style={styles.developerInfo}>
          <Text style={styles.developerName}>{item.name}</Text>
          <Text style={styles.projectCount}>{item.project_count} مشروع</Text>
        </View>
        
        {item.logo_url ? (
          <Image source={{ uri: item.logo_url }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Building2 size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.sectionTitle}>أسعار الوحدات</Text>
        
        <View style={styles.priceGrid}>
          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <TrendingDown size={20} color="#3B619F" />
            </View>
            <Text style={styles.priceLabel}>أقل سعر يبدأ من</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.min_unit_price || item.min_price)}
            </Text>
          </View>

          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <CreditCard size={20} color="#10B981" />
            </View>
            <Text style={styles.priceLabel}>أقل مقدم</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.min_unit_down_payment || item.min_down_payment)}
            </Text>
          </View>

          <View style={styles.priceItem}>
            <View style={styles.priceIconContainer}>
              <Calendar size={20} color="#F59E0B" />
            </View>
            <Text style={styles.priceLabel}>أقل قسط شهري</Text>
            <Text style={styles.priceValue}>
              {formatPrice(item.min_unit_installment || item.min_installment)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="أسعار المطورين" />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="البحث في المطورين..."
            placeholderTextColor="#9CA3AF"
          />
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
        </View>

        <FlatList
          data={filteredDevelopers}
          renderItem={renderDeveloper}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchDeveloperPrices}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Building2 size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>لا توجد بيانات أسعار</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد مطورين مع بيانات أسعار'}
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
  developerCard: {
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
  developerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  developerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  developerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'right',
  },
  projectCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 16,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    marginBottom: 16,
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  priceItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 14,
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