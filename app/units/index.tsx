import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Search, 
  Home, 
  Trash2, 
  Bed, 
  Bath, 
  Filter, 
  Eye, 
  EyeOff,
  Edit3,
  MoreVertical,
  Star,
  MapPin
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import BackButton from '@/components/BackButton';
import { Picker } from '@react-native-picker/picker';

interface Unit {
  id: string;
  unit_type: string;
  area_sqm: number | null;
  bedrooms: number;
  bathrooms: number;
  price: number;
  down_payment: number | null;
  monthly_installment: number | null;
  quarterly_installment: number | null;
  semi_annual_installment: number | null;
  annual_installment: number | null;
  installment_years: number;
  floor_number: number | null;
  unit_number: string | null;
  status: string;
  image_url?: string;
  projects: {
    name: string;
    developers: {
      name: string;
    };
  };
}

interface UnitType {
  id: string;
  name: string;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 4; // 4 بطاقات في الصف
const CARD_WIDTH = (width - (CARD_MARGIN * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

export default function UnitsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState<string>('الكل');
  const [showCount, setShowCount] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [countAnim] = useState(new Animated.Value(0));
  
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 60) / 4; // 4 cards per row with margins

  useEffect(() => {
    fetchUnits();
    fetchUnitTypes();
    
    // أنيميشن الظهور
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterUnits();
  }, [searchQuery, selectedUnitType, units]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          projects (
            name,
            developers (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الوحدات');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setUnitTypes(data || []);
    } catch (error) {
      console.error('Error fetching unit types:', error);
    }
  };

  const filterUnits = () => {
    let filtered = units;

    // Filter by unit type
    if (selectedUnitType !== 'الكل') {
      filtered = filtered.filter(unit => unit.unit_type === selectedUnitType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (unit) =>
          unit.unit_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.projects?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.projects?.developers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          unit.unit_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUnits(filtered);
  };

  const handleDelete = async (id: string, unitInfo: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف الوحدة "${unitInfo}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('units')
                .delete()
                .eq('id', id);

              if (error) throw error;
              fetchUnits();
            } catch (error) {
              console.error('Error deleting unit:', error);
              Alert.alert('خطأ', 'حدث خطأ في حذف الوحدة');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'reserved':
        return '#F59E0B';
      case 'sold':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'reserved':
        return 'محجوزة';
      case 'sold':
        return 'مباعة';
      default:
        return status;
    }
  };

  const renderUnit = ({ item }: { item: Unit }) => (
    <TouchableOpacity 
      style={[styles.unitCard, { width: CARD_WIDTH }]}
      onPress={() => router.push(`/units/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.unitImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Home size={32} color="#9CA3AF" />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        
        {/* Options Button */}
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => {
            setSelectedUnit(item);
            setShowOptionsModal(true);
          }}
        >
          <MoreVertical size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.unitInfo}>
        <Text style={styles.unitType} numberOfLines={1}>{item.unit_type}</Text>
        <Text style={styles.projectName} numberOfLines={1}>{item.projects?.name}</Text>
        
        <View style={styles.unitSpecs}>
          <View style={styles.specItem}>
            <Bed size={12} color="#6B7280" />
            <Text style={styles.specText}>{item.bedrooms}</Text>
          </View>
          <View style={styles.specItem}>
            <Bath size={12} color="#6B7280" />
            <Text style={styles.specText}>{item.bathrooms}</Text>
          </View>
          {item.area_sqm && (
            <Text style={styles.areaText}>{item.area_sqm}م²</Text>
          )}
        </View>
        
        <Text style={styles.price}>{formatPrice(item.price)} ج.م</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.modernHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BackButton />
            <Text style={styles.headerTitle}>الوحدات</Text>
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
              <Text style={styles.countText}>{filteredUnits.length}</Text>
            </Animated.View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                const toValue = showCount ? 0 : 1;
                Animated.timing(countAnim, {
                  toValue,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                setShowCount(!showCount);
              }}
            >
              {showCount ? (
                <EyeOff size={20} color="#FFFFFF" />
              ) : (
                <Eye size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/units/add')}
            >
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="البحث في الوحدات..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>جاري تحميل الوحدات...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUnits}
            renderItem={renderUnit}
            keyExtractor={(item) => item.id}
            numColumns={CARDS_PER_ROW}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Home size={64} color="#9CA3AF" />
                <Text style={[styles.emptyText, { color: colors.text }]}>لا توجد وحدات</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>تصفية الوحدات</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>نوع الوحدة</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
                <Picker
                  selectedValue={selectedUnitType}
                  onValueChange={setSelectedUnitType}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="الكل" value="الكل" />
                  {unitTypes.map((type) => (
                    <Picker.Item key={type.id} label={type.name} value={type.name} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>تطبيق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={[styles.optionsModal, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                if (selectedUnit) {
                  router.push(`/units/edit/${selectedUnit.id}`);
                }
              }}
            >
              <Edit3 size={20} color="#3B82F6" />
              <Text style={[styles.optionText, { color: colors.text }]}>تعديل</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                if (selectedUnit) {
                  handleDelete(selectedUnit.id, selectedUnit.unit_type);
                }
              }}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={[styles.optionText, { color: '#EF4444' }]}>حذف</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modernHeader: {
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 10,
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: CARD_MARGIN / 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  unitImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionsButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitInfo: {
    padding: 12,
  },
  unitType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  unitSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  specText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  areaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  picker: {
    height: 50,
  },
  applyButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsModal: {
    borderRadius: 16,
    padding: 8,
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});