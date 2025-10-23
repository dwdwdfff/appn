import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Building2, 
  Home, 
  Search, 
  Filter,
  ArrowLeft,
  BarChart3,
  TrendingUp
} from 'lucide-react-native';
import { supabase, Developer, Project, Unit } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARDS_PER_ROW = 4;
const CARD_WIDTH = (width - (CARD_MARGIN * 2) - (CARD_MARGIN * (CARDS_PER_ROW - 1))) / CARDS_PER_ROW;

interface DeveloperStats {
  totalProjects: number;
  totalUnits: number;
  projectsByType: { [key: string]: number };
  unitsByType: { [key: string]: number };
}

export default function DeveloperStatsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<DeveloperStats>({
    totalProjects: 0,
    totalUnits: 0,
    projectsByType: {},
    unitsByType: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('الكل');
  const [selectedUnitType, setSelectedUnitType] = useState('الكل');
  const [activeTab, setActiveTab] = useState<'projects' | 'units'>('projects');

  const projectTypes = ['الكل', 'سكني', 'تجاري', 'إداري', 'طبي', 'تعليمي', 'ترفيهي'];
  const unitTypes = ['الكل', 'فيلا', 'شقة', 'دوبلكس', 'بنتهاوس', 'استوديو', 'محل تجاري', 'مكتب'];

  useEffect(() => {
    if (id) {
      fetchDeveloperData();
    }
  }, [id]);

  useEffect(() => {
    calculateStats();
  }, [projects, units]);

  const fetchDeveloperData = async () => {
    try {
      setLoading(true);
      
      // Fetch developer details
      const { data: developerData, error: developerError } = await supabase
        .from('developers')
        .select('*')
        .eq('id', id)
        .single();

      if (developerError) throw developerError;
      setDeveloper(developerData);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('developer_id', id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch units for all projects
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('*, project:projects(name)')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        if (unitsError) throw unitsError;
        setUnits(unitsData || []);
      }
    } catch (error) {
      console.error('Error fetching developer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const projectsByType: { [key: string]: number } = {};
    const unitsByType: { [key: string]: number } = {};

    projects.forEach(project => {
      const type = project.project_type || 'سكني';
      projectsByType[type] = (projectsByType[type] || 0) + 1;
    });

    units.forEach(unit => {
      const type = unit.unit_type;
      unitsByType[type] = (unitsByType[type] || 0) + 1;
    });

    setStats({
      totalProjects: projects.length,
      totalUnits: units.length,
      projectsByType,
      unitsByType
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedProjectType === 'الكل' || project.project_type === selectedProjectType;
    return matchesSearch && matchesType;
  });

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         unit.unit_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedUnitType === 'الكل' || unit.unit_type === selectedUnitType;
    return matchesSearch && matchesType;
  });

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/projects/${item.id}` as any)}
      activeOpacity={0.7}>
      <View style={styles.projectImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Building2 size={24} color="#3b82f6" />
          </View>
        )}
      </View>
      <View style={styles.projectContent}>
        <Text style={styles.projectTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.projectType}>
          {item.project_type || 'سكني'}
        </Text>
        {item.price_min && (
          <Text style={styles.projectPrice}>
            من {item.price_min.toLocaleString()} ج.م
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

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
            <Home size={24} color="#10b981" />
          </View>
        )}
      </View>
      <View style={styles.unitContent}>
        <Text style={styles.unitType} numberOfLines={1}>
          {item.unit_type}
        </Text>
        <Text style={styles.unitProject} numberOfLines={1}>
          {item.project?.name}
        </Text>
        {item.area && (
          <Text style={styles.unitArea}>
            {item.area} م²
          </Text>
        )}
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
          <Text style={styles.headerTitle}>إحصائيات المطور</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (!developer) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>إحصائيات المطور</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>لم يتم العثور على المطور</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{developer.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Building2 size={32} color="#3b82f6" />
            <Text style={styles.statValue}>{stats.totalProjects}</Text>
            <Text style={styles.statLabel}>مشروع</Text>
          </View>
          <View style={styles.statCard}>
            <Home size={32} color="#10b981" />
            <Text style={styles.statValue}>{stats.totalUnits}</Text>
            <Text style={styles.statLabel}>وحدة</Text>
          </View>
          <View style={styles.statCard}>
            <BarChart3 size={32} color="#f59e0b" />
            <Text style={styles.statValue}>{Object.keys(stats.projectsByType).length}</Text>
            <Text style={styles.statLabel}>نوع مشروع</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={32} color="#ef4444" />
            <Text style={styles.statValue}>{Object.keys(stats.unitsByType).length}</Text>
            <Text style={styles.statLabel}>نوع وحدة</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
            onPress={() => setActiveTab('projects')}>
            <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
              المشاريع ({filteredProjects.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'units' && styles.activeTab]}
            onPress={() => setActiveTab('units')}>
            <Text style={[styles.tabText, activeTab === 'units' && styles.activeTabText]}>
              الوحدات ({filteredUnits.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.filterContainer}>
            <Filter size={16} color="#64748b" />
            <Picker
              selectedValue={activeTab === 'projects' ? selectedProjectType : selectedUnitType}
              onValueChange={(value) => {
                if (activeTab === 'projects') {
                  setSelectedProjectType(value);
                } else {
                  setSelectedUnitType(value);
                }
              }}
              style={styles.picker}>
              {(activeTab === 'projects' ? projectTypes : unitTypes).map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Content */}
        {activeTab === 'projects' ? (
          filteredProjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Building2 size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>لا توجد مشاريع</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProjects}
              renderItem={renderProject}
              keyExtractor={(item) => item.id}
              numColumns={CARDS_PER_ROW}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          )
        ) : (
          filteredUnits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Home size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>لا توجد وحدات</Text>
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
              scrollEnabled={false}
            />
          )
        )}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
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
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    width: 120,
    height: 48,
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
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: CARD_MARGIN / 2,
  },
  projectImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  projectImage: {
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
  projectContent: {
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  projectType: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  projectPrice: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  unitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: CARD_MARGIN / 2,
  },
  unitImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  unitImage: {
    width: '100%',
    height: '100%',
  },
  unitContent: {
    alignItems: 'center',
  },
  unitType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  unitProject: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  unitArea: {
    fontSize: 10,
    color: '#8b5cf6',
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: 10,
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
});