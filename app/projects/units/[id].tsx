import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Home, 
  Search, 
  Filter,
  Bed,
  Bath,
  Square,
  DollarSign,
  Building2
} from 'lucide-react-native';
import { supabase, Project, Unit } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 4;
const CARD_WIDTH = (width - (CARD_MARGIN * 2) - (CARD_MARGIN * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

export default function ProjectUnitsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');

  const unitTypes = ['الكل', 'فيلا', 'شقة', 'دوبلكس', 'بنتهاوس', 'استوديو', 'محل تجاري', 'مكتب'];
  const statusOptions = ['الكل', 'متاح', 'محجوز', 'مباع'];

  useEffect(() => {
    if (id) {
      loadProjectAndUnits();
    }
  }, [id]);

  const loadProjectAndUnits = async () => {
    try {
      setLoading(true);
      
      // Load project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(id, name),
          area:areas(id, name, city)
        `)
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Load units for this project
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (unitsError) throw unitsError;
      setUnits(unitsData || []);

    } catch (error) {
      console.error('Error loading project and units:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unit_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.unit_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedUnitType === 'الكل' || unit.unit_type === selectedUnitType;
    const matchesStatus = selectedStatus === 'الكل' || unit.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderUnit = ({ item }: { item: Unit }) => (
    <TouchableOpacity
      style={styles.unitCard}
      activeOpacity={0.7}>
      <View style={styles.unitImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.unitImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Home size={20} color="#10b981" />
          </View>
        )}
      </View>
      
      <View style={styles.statusBadge}>
        <Text style={[
          styles.statusText,
          item.status === 'متاح' && styles.availableStatus,
          item.status === 'محجوز' && styles.reservedStatus,
          item.status === 'مباع' && styles.soldStatus,
        ]}>
          {item.status || 'متاح'}
        </Text>
      </View>

      <View style={styles.unitContent}>
        <Text style={styles.unitType} numberOfLines={1}>
          {item.unit_type}
        </Text>
        
        {item.unit_number && (
          <Text style={styles.unitNumber}>
            رقم {item.unit_number}
          </Text>
        )}

        <View style={styles.unitDetails}>
          {item.area && (
            <View style={styles.detailItem}>
              <Square size={10} color="#64748b" />
              <Text style={styles.detailText}>{item.area} م²</Text>
            </View>
          )}
          
          {item.bedrooms && (
            <View style={styles.detailItem}>
              <Bed size={10} color="#64748b" />
              <Text style={styles.detailText}>{item.bedrooms}</Text>
            </View>
          )}
          
          {item.bathrooms && (
            <View style={styles.detailItem}>
              <Bath size={10} color="#64748b" />
              <Text style={styles.detailText}>{item.bathrooms}</Text>
            </View>
          )}
        </View>

        {item.price && (
          <Text style={styles.unitPrice}>
            {item.price.toLocaleString()} ج.م
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>وحدات المشروع</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>وحدات المشروع</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>لم يتم العثور على المشروع</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{project.name}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push(`/units/add?project_id=${project.id}` as any)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Project Info */}
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Building2 size={20} color="#3b82f6" />
          <Text style={styles.projectName}>{project.name}</Text>
        </View>
        {project.developer && (
          <Text style={styles.projectDeveloper}>
            المطور: {project.developer.name}
          </Text>
        )}
        {project.area && (
          <Text style={styles.projectLocation}>
            الموقع: {project.area.name} - {project.area.city}
          </Text>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في الوحدات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>نوع الوحدة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedUnitType}
                onValueChange={setSelectedUnitType}
                style={styles.picker}>
                {unitTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>الحالة</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedStatus}
                onValueChange={setSelectedStatus}
                style={styles.picker}>
                {statusOptions.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredUnits.length} وحدة
        </Text>
      </View>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Home size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا توجد وحدات</Text>
          <Text style={styles.emptySubtext}>جرب تغيير معايير البحث</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUnits}
          renderItem={renderUnit}
          keyExtractor={(item) => item.id}
          numColumns={CARDS_PER_ROW}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  projectInfo: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  projectDeveloper: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: CARD_MARGIN,
    paddingHorizontal: CARD_MARGIN / 2,
  },
  unitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: CARD_MARGIN / 2,
    position: 'relative',
  },
  unitImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.5,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  unitImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
  },
  availableStatus: {
    color: '#10b981',
  },
  reservedStatus: {
    color: '#f59e0b',
  },
  soldStatus: {
    color: '#ef4444',
  },
  unitContent: {
    alignItems: 'center',
  },
  unitType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  unitNumber: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 6,
  },
  unitDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailText: {
    fontSize: 8,
    color: '#64748b',
  },
  unitPrice: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});