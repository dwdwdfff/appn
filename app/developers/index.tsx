import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Dimensions, TextInput, Animated, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Building2, Calendar, Plus, Search, Trash2 } from 'lucide-react-native';
import { supabase, Developer } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CARDS_PER_ROW = 4;
const CARD_WIDTH = (width - (CARD_MARGIN * 2) - (CARD_MARGIN * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

export default function DevelopersScreen() {
  const router = useRouter();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));
  const [countAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadDevelopers();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [searchQuery, developers]);

  useEffect(() => {
    toggleDeveloperCount();
  }, [filteredDevelopers.length]);

  async function loadDevelopers() {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevelopers(data || []);
      setFilteredDevelopers(data || []);
    } catch (error) {
      console.error('Error loading developers:', error);
    } finally {
      setLoading(false);
    }
  }

  const filterDevelopers = () => {
    if (!searchQuery.trim()) {
      setFilteredDevelopers(developers);
      return;
    }

    const filtered = developers.filter(developer =>
      developer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (developer.description && developer.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDevelopers(filtered);
  };

  const toggleDeveloperCount = () => {
    Animated.sequence([
      Animated.timing(countAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(countAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const deleteDeveloper = async (developerId: string, developerName: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف المطور "${developerName}"؟\n\nسيتم حذف جميع المشاريع المرتبطة بهذا المطور أيضاً.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('developers')
                .delete()
                .eq('id', developerId);

              if (error) throw error;

              // Update local state
              setDevelopers(prev => prev.filter(dev => dev.id !== developerId));
              setFilteredDevelopers(prev => prev.filter(dev => dev.id !== developerId));
              
              Alert.alert('نجح', 'تم حذف المطور بنجاح');
            } catch (error) {
              console.error('Error deleting developer:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف المطور');
            }
          }
        }
      ]
    );
  };

  const renderDeveloper = ({ item }: { item: Developer }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => router.push(`/developers/${item.id}` as any)}
        activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          {item.logo_url ? (
            <Image 
              source={{ uri: item.logo_url }} 
              style={styles.developerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Building2 size={32} color="#3b82f6" />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {item.established_date && (
            <Text style={styles.dateText}>
              {new Date(item.established_date).getFullYear()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Delete Button */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteDeveloper(item.id, item.name)}
        activeOpacity={0.7}>
        <Trash2 size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <BackButton />
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>المطورين</Text>
            </View>
            <View style={styles.headerRight}>
            </View>
          </View>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.modernHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>المطورين</Text>
            <Animated.View
              style={[
                styles.countBadge,
                {
                  opacity: countAnim,
                  transform: [{
                    scale: countAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.countText}>{filteredDevelopers.length}</Text>
            </Animated.View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/developers/add')}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Container */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في المطورين..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Header Spacing */}
      <View style={styles.headerSpacing} />

      {filteredDevelopers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2 size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مطورين'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'جرب كلمات بحث أخرى' : 'ابدأ بإضافة أول مطور'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDevelopers}
          renderItem={renderDeveloper}
          keyExtractor={(item) => item.id}
          numColumns={CARDS_PER_ROW}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      )}
    </Animated.View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  // Modern Header Styles
  modernHeader: {
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    flex: 1,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
    marginRight: 10,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#ffffffff',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    padding: CARD_MARGIN,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN / 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginHorizontal: CARD_MARGIN / 2,
    position: 'relative',
  },
  cardTouchable: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    width: CARD_WIDTH - 32,
    height: CARD_WIDTH - 32,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  developerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  headerSpacing: {
    height: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
