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
  Modal,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin,
  DollarSign,
  Filter,
  Edit3,
  Trash2,
  MoreVertical,
  Star,
  Eye,
  EyeOff
} from 'lucide-react-native';
import { supabase, Project, Developer, Area } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 4; // 4 بطاقات في الصف
const CARD_WIDTH = (width - (CARD_MARGIN * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('الكل');
  const [selectedArea, setSelectedArea] = useState('الكل');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showProjectCount, setShowProjectCount] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [countAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    
    // أنيميشن الظهور
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load projects with developer and area info
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(id, name),
          area:areas(id, name, city)
        `)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Load developers for filter
      const { data: developersData, error: developersError } = await supabase
        .from('developers')
        .select('id, name')
        .order('name', { ascending: true });

      if (developersError) throw developersError;
      setDevelopers(developersData || []);

      // Load areas for filter
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('id, name, city')
        .order('name', { ascending: true });

      if (areasError) throw areasError;
      setAreas(areasData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.developer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.area?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDeveloper = selectedDeveloper === 'الكل' || project.developer_id === selectedDeveloper;
    const matchesArea = selectedArea === 'الكل' || project.area_id === selectedArea;
    
    return matchesSearch && matchesDeveloper && matchesArea;
  });

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // تحديث القائمة محلياً
      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteConfirm(null);
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('خطأ', 'حدث خطأ في حذف المشروع');
    }
  };

  const handleEditProject = (projectId: string) => {
    setShowActionMenu(null);
    router.push(`/projects/add?edit=${projectId}` as any);
  };

  const toggleProjectCount = () => {
    const toValue = showProjectCount ? 0 : 1;
    
    Animated.timing(countAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setShowProjectCount(!showProjectCount);
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return 'السعر غير محدد';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} جنيه`;
    }
    if (min) return `من ${min.toLocaleString()} جنيه`;
    if (max) return `حتى ${max.toLocaleString()} جنيه`;
    return 'السعر غير محدد';
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View style={styles.projectCard}>
      {/* صورة المشروع */}
      <TouchableOpacity
        style={styles.projectImageContainer}
        onPress={() => router.push(`/projects/${item.id}` as any)}
        activeOpacity={0.8}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Building2 size={24} color="#3B619F" />
          </View>
        )}
        
        {/* زر القائمة */}
        <TouchableOpacity
          style={styles.actionMenuButton}
          onPress={(e) => {
            e.stopPropagation();
            setShowActionMenu(showActionMenu === item.id ? null : item.id);
          }}>
          <MoreVertical size={16} color="#ffffff" />
        </TouchableOpacity>
        
        {/* قائمة الإجراءات */}
        {showActionMenu === item.id && (
          <View style={styles.actionMenu}>
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => handleEditProject(item.id)}>
              <Edit3 size={14} color="#3b82f6" />
              <Text style={styles.actionMenuText}>تعديل</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionMenuItem, styles.deleteMenuItem]}
              onPress={() => setShowDeleteConfirm(item.id)}>
              <Trash2 size={14} color="#ef4444" />
              <Text style={[styles.actionMenuText, styles.deleteMenuText]}>حذف</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      
      {/* اسم المشروع فقط */}
      <View style={styles.projectNameContainer}>
        <Text style={styles.projectName} numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>المشاريع</Text>
          <View style={styles.headerSpacer} />
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
            <Text style={styles.headerTitle}>المشاريع</Text>
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
              <Text style={styles.countText}>{filteredProjects.length}</Text>
            </Animated.View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.filterDropdown}>
              <Picker
                selectedValue={selectedArea}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedArea(itemValue)}
                dropdownIconColor="#FFFFFF"
              >
                <Picker.Item label="جميع المناطق" value="" />
                {areas.map((area) => (
                  <Picker.Item key={area.id} label={area.name} value={area.id} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/projects/add')}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Container */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="البحث في المشاريع..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>





      {/* Results Count */}
    

      {/* Header Spacing */}
      <View style={styles.headerSpacing} />

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Building2 size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا توجد مشاريع</Text>
          <Text style={styles.emptySubtext}>جرب تغيير معايير البحث</Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.listContainer}
          activeOpacity={1}
          onPress={() => setShowActionMenu(null)}>
          <FlatList
            data={filteredProjects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            numColumns={CARDS_PER_ROW}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
            scrollEnabled={true}
          />
        </TouchableOpacity>
      )}

      {/* Creative Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.creativeModalOverlay}>
          <View style={styles.creativeModalContent}>
            {/* Header with gradient */}
            <View style={styles.creativeModalHeader}>
              <View style={styles.modalIconContainer}>
                <Filter size={24} color="#ffffff" />
              </View>
              <Text style={styles.creativeModalTitle}>فلترة المشاريع</Text>
              <TouchableOpacity
                style={styles.creativeCloseButton}
                onPress={() => setShowFilterModal(false)}>
                <Text style={styles.creativeCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Body with cards */}
            <View style={styles.creativeModalBody}>
              <View style={styles.creativeFilterCard}>
                <View style={styles.filterCardHeader}>
                  <Text style={styles.filterCardTitle}>المطور</Text>
                </View>
                <View style={styles.creativePickerContainer}>
                  <Picker
                    selectedValue={selectedDeveloper}
                    onValueChange={setSelectedDeveloper}
                    style={styles.creativePicker}>
                    <Picker.Item label="الكل" value="الكل" />
                    {developers.map((developer) => (
                      <Picker.Item key={developer.id} label={developer.name} value={developer.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.creativeFilterCard}>
                <View style={styles.filterCardHeader}>
                  <Text style={styles.filterCardTitle}>المنطقة</Text>
                </View>
                <View style={styles.creativePickerContainer}>
                  <Picker
                    selectedValue={selectedArea}
                    onValueChange={setSelectedArea}
                    style={styles.creativePicker}>
                    <Picker.Item label="الكل" value="الكل" />
                    {areas.map((area) => (
                      <Picker.Item key={area.id} label={`${area.name}`} value={area.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Footer with gradient button */}
            <View style={styles.creativeModalFooter}>
              <TouchableOpacity
                style={styles.creativeApplyButton}
                onPress={() => setShowFilterModal(false)}>
                <Text style={styles.creativeApplyText}>تطبيق الفلتر</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* مودال تأكيد الحذف */}
      <Modal
        visible={showDeleteConfirm !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(null)}>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Trash2 size={32} color="#ef4444" />
              <Text style={styles.deleteModalTitle}>تأكيد الحذف</Text>
            </View>
            
            <Text style={styles.deleteModalMessage}>
              هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteConfirm(null)}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={() => showDeleteConfirm && handleDeleteProject(showDeleteConfirm)}>
                <Text style={styles.confirmDeleteButtonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
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
    paddingHorizontal: 16,
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 15,
    marginRight: 10,
  },
  projectCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  eyeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  countBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
    textAlign: 'right',
  },
  // Creative Search Styles
  creativeSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  creativeSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e0f2fe',
  },
  creativeSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'right',
    fontWeight: '500',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  picker: {
    height: 40,
    fontSize: 12,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: CARD_MARGIN,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: CARD_MARGIN / 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  projectImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.7,
    position: 'relative',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenu: {
    position: 'absolute',
    top: 32,
    right: 6,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    minWidth: 100,
    zIndex: 1000,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  deleteMenuItem: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionMenuText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  deleteMenuText: {
    color: '#ef4444',
  },
  projectNameContainer: {
    padding: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
  projectContent: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 22,
  },
  developerContainer: {
    marginBottom: 6,
  },
  projectDeveloper: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'flex-end',
  },
  projectLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  projectPrice: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginRight: 4,
    textAlign: 'right',
  },
  deliveryContainer: {
    alignItems: 'flex-end',
  },
  deliveryText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  // Creative Modal styles
  creativeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  creativeModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  creativeModalHeader: {
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creativeModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  creativeCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creativeCloseText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  creativeModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  creativeFilterCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterCardHeader: {
    marginBottom: 12,
  },
  filterCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
  },
  creativePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  creativePicker: {
    height: 50,
  },
  creativeModalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  creativeApplyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  creativeApplyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
    gap: 12,
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
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacing: {
    height: 5,
  },
});