import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, MapPin, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface Neighborhood {
  id: string;
  name: string;
  description: string | null;
  area_id: string;
  areas: {
    name: string;
    city: string;
  };
}

export default function NeighborhoodsScreen() {
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    filterNeighborhoods();
  }, [searchQuery, neighborhoods]);

  const fetchNeighborhoods = async () => {
    try {
      const { data, error } = await supabase
        .from('neighborhoods')
        .select(`
          *,
          areas (
            name,
            city
          )
        `)
        .order('name');

      if (error) throw error;
      setNeighborhoods(data || []);
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الأحياء');
    } finally {
      setLoading(false);
    }
  };

  const filterNeighborhoods = () => {
    if (!searchQuery.trim()) {
      setFilteredNeighborhoods(neighborhoods);
      return;
    }

    const filtered = neighborhoods.filter(
      (neighborhood) =>
        neighborhood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        neighborhood.areas?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        neighborhood.areas?.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNeighborhoods(filtered);
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف الحي "${name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('neighborhoods')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchNeighborhoods();
            } catch (error) {
              console.error('Error deleting neighborhood:', error);
              Alert.alert('خطأ', 'حدث خطأ في حذف الحي');
            }
          },
        },
      ]
    );
  };

  const renderNeighborhood = ({ item }: { item: Neighborhood }) => (
    <View style={styles.neighborhoodCard}>
      <View style={styles.neighborhoodHeader}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
        <View style={styles.neighborhoodInfo}>
          <Text style={styles.neighborhoodName}>{item.name}</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              {item.areas?.name} - {item.areas?.city}
            </Text>
            <MapPin size={16} color="#6B7280" />
          </View>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.neighborhoodDescription}>{item.description}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="الأحياء" 
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/neighborhoods/add')}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="البحث في الأحياء..."
            placeholderTextColor="#9CA3AF"
          />
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
        </View>

        <FlatList
          data={filteredNeighborhoods}
          renderItem={renderNeighborhood}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchNeighborhoods}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MapPin size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>لا توجد أحياء</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'لم يتم العثور على نتائج' : 'ابدأ بإضافة حي جديد'}
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
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
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
  neighborhoodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  neighborhoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  neighborhoodInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  neighborhoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  neighborhoodDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
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