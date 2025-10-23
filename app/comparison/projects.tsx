import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Building2, Plus, X, Check, MapPin, Calendar, DollarSign, Home, Users, Zap, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  name: string;
  developer_id: string;
  area_id: string;
  description: string;
  price_min: number;
  price_max: number;
  down_payment_min: number;
  down_payment_max: number;
  installment_years: number;
  has_clubhouse: boolean;
  amenities: string[];
  unit_types: string[];
  delivery_date: string;
  status: string;
  images: string[];
  area_min: number;
  area_max: number;
  dynamic_data: any;
  developer?: {
    name: string;
    logo_url?: string;
  };
  area?: {
    name: string;
    city: string;
  };
  neighborhood?: {
    name: string;
  };
}

interface DynamicField {
  id: string;
  name: string;
  field_name: string;
  label: string;
  field_label: string;
  field_type: string;
  field_options: string[];
  options: string[];
  display_order: number;
}

export default function ProjectComparisonScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [showProjectList, setShowProjectList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchDynamicFields();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(name, logo_url),
          area:areas(name, city),
          neighborhood:neighborhoods(name)
        `)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل المشاريع');
    } finally {
      setLoading(false);
    }
  };

  const fetchDynamicFields = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .eq('applies_to', 'projects')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setDynamicFields(data || []);
    } catch (error) {
      console.error('Error fetching dynamic fields:', error);
    }
  };

  const addProject = (project: Project) => {
    if (selectedProjects.length >= 3) {
      Alert.alert('تنبيه', 'يمكنك مقارنة 3 مشاريع كحد أقصى');
      return;
    }
    
    if (selectedProjects.find(p => p.id === project.id)) {
      Alert.alert('تنبيه', 'هذا المشروع مضاف بالفعل للمقارنة');
      return;
    }

    setSelectedProjects([...selectedProjects, project]);
    setShowProjectList(false);
  };

  const removeProject = (projectId: string) => {
    setSelectedProjects(selectedProjects.filter(p => p.id !== projectId));
  };

  const formatPrice = (price: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US').format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const renderProjectCard = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => addProject(item)}
    >
      <View style={styles.projectCardHeader}>
        <View style={styles.projectInfo}>
          <Text style={[styles.projectName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.developerName, { color: colors.textSecondary }]}>
            {item.developer?.name}
          </Text>
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            <MapPin size={12} color={colors.textSecondary} /> {item.area?.name}, {item.area?.city}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => addProject(item)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.projectDetails}>
        <Text style={[styles.priceText, { color: colors.text }]}>
          {formatPrice(item.price_min)} - {formatPrice(item.price_max)} جنيه
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderComparisonTable = () => {
    if (selectedProjects.length === 0) {
      return (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Building2 size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            لم تختر أي مشاريع للمقارنة
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            اضغط على "إضافة مشروع" لبدء المقارنة
          </Text>
        </View>
      );
    }

    const comparisonRows = [
      { key: 'name', label: 'اسم المشروع', type: 'text' },
      { key: 'developer', label: 'المطور', type: 'developer' },
      { key: 'location', label: 'الموقع', type: 'location' },
      { key: 'price_range', label: 'نطاق الأسعار', type: 'price_range' },
      { key: 'down_payment', label: 'المقدم', type: 'down_payment' },
      { key: 'installment_years', label: 'سنوات التقسيط', type: 'number' },
      { key: 'area_range', label: 'نطاق المساحات', type: 'area_range' },
      { key: 'delivery_date', label: 'تاريخ التسليم', type: 'date' },
      { key: 'status', label: 'حالة المشروع', type: 'status' },
      { key: 'has_clubhouse', label: 'نادي صحي', type: 'boolean' },
      { key: 'unit_types', label: 'أنواع الوحدات', type: 'array' },
      { key: 'amenities', label: 'المرافق', type: 'array' },
    ];

    // Add dynamic fields
    dynamicFields.forEach(field => {
      comparisonRows.push({
        key: field.name || field.field_name,
        label: field.field_label || field.label || field.name || field.field_name,
        type: field.field_type
      });
    });

    return (
      <View style={styles.tableContainer}>
        <View style={styles.table}>
          {/* Header Row - Reversed order for RTL */}
          <View style={styles.headerRow}>
            <View style={[styles.labelColumn, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.headerText, { color: colors.text }]}>المواصفات</Text>
            </View>
            {selectedProjects.map((project, index) => (
              <View key={project.id} style={[styles.projectColumn, { backgroundColor: colors.surface }]}>
                <View style={styles.projectHeader}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeProject(project.id)}
                  >
                    <X size={16} color={colors.error} />
                  </TouchableOpacity>
                  <Text style={[styles.projectHeaderText, { color: colors.text }]} numberOfLines={2}>
                    {project.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Data Rows - Reversed order for RTL */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {comparisonRows.map((row, rowIndex) => (
              <View key={row.key} style={[
                styles.dataRow,
                { backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#E3F2FD' }
              ]}>
                <View style={styles.labelColumn}>
                  <Text style={[styles.labelText, { color: '#000000' }]}>{row.label}</Text>
                </View>
                {selectedProjects.map((project) => (
                  <View key={project.id} style={styles.projectColumn}>
                    {renderCellContent(project, row.key, row.type)}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCellContent = (project: Project, key: string, type: string) => {
    const value = renderCellValue(project, key, type);
    
    // Check if it's a boolean value
    if (value === '✓') {
      return (
        <Text style={[styles.dataText, { color: '#22C55E', fontWeight: 'bold' }]} numberOfLines={3}>
          ✓
        </Text>
      );
    } else if (value === '✗') {
      return (
        <Text style={[styles.dataText, { color: '#EF4444', fontWeight: 'bold' }]} numberOfLines={3}>
          ✗
        </Text>
      );
    }
    
    // Regular text
    return (
      <Text style={[styles.dataText, { color: '#000000' }]} numberOfLines={3}>
        {value}
      </Text>
    );
  };

  const renderCellValue = (project: Project, key: string, type: string) => {
    switch (key) {
      case 'name':
        return project.name;
      case 'developer':
        return project.developer?.name || '-';
      case 'location':
        return `${project.area?.name || ''}, ${project.area?.city || ''}`;
      case 'price_range':
        return `${formatPrice(project.price_min)} - ${formatPrice(project.price_max)}`;
      case 'down_payment':
        return `${formatPrice(project.down_payment_min)} - ${formatPrice(project.down_payment_max)}`;
      case 'area_range':
        return project.area_min && project.area_max 
          ? `${project.area_min} - ${project.area_max} م²`
          : '-';
      case 'delivery_date':
        return formatDate(project.delivery_date);
      case 'status':
        return getStatusText(project.status);
      case 'has_clubhouse':
        return project.has_clubhouse ? '✓' : '✗';
      case 'unit_types':
        return Array.isArray(project.unit_types) ? project.unit_types.join(', ') : '-';
      case 'amenities':
        return Array.isArray(project.amenities) ? project.amenities.join(', ') : '-';
      case 'installment_years':
        return project.installment_years ? `${project.installment_years} سنة` : '-';
      default:
        // Dynamic field
        if (project.dynamic_data && project.dynamic_data[key] !== undefined) {
          const value = project.dynamic_data[key];
          if (type === 'boolean') {
            return value ? '✓' : '✗';
          }
          return value.toString();
        }
        return '-';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'تحت التخطيط';
      case 'under_construction': return 'تحت الإنشاء';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  if (showProjectList) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => setShowProjectList(false)}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { textAlign: 'right' }]}>
            اختر المشاريع للمقارنة
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.projectsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: 'right' }]}>
          مقارنة المشاريع
        </Text>
        <TouchableOpacity
          style={styles.addProjectButton}
          onPress={() => setShowProjectList(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Selected Projects Count */}
      {selectedProjects.length > 0 && (
        <View style={[styles.countContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.countText, { color: colors.text }]}>
            المشاريع المختارة: {selectedProjects.length} من 3
          </Text>
        </View>
      )}

      {/* Comparison Table */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderComparisonTable()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 16,
  },
  addProjectButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  projectsList: {
    padding: 20,
    gap: 12,
  },
  projectCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  developerName: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'right',
  },
  locationText: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'right',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectDetails: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 20,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    width: '100%',
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: 'row-reverse', // RTL direction
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  dataRow: {
    flexDirection: 'row-reverse', // RTL direction
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 40, // Smaller height
    alignItems: 'center',
  },
  labelColumn: {
    width: 90, // Smaller width
    padding: 6, // Smaller padding
    justifyContent: 'center',
    borderLeftWidth: 1, // Changed to left border for RTL
    borderLeftColor: '#E5E7EB',
  },
  projectColumn: {
    flex: 1,
    padding: 4, // Smaller padding
    justifyContent: 'center',
    borderLeftWidth: 1, // Changed to left border for RTL
    borderLeftColor: '#E5E7EB',
    minHeight: 40, // Smaller height
  },
  headerText: {
    fontSize: 13, // Smaller font
    fontWeight: 'bold',
    textAlign: 'center',
  },
  projectHeader: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    left: -6, // Changed to left for RTL
    width: 20, // Smaller
    height: 20, // Smaller
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  projectHeaderText: {
    fontSize: 12, // Smaller font
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 6,
  },
  labelText: {
    fontSize: 12, // Smaller font
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataText: {
    fontSize: 11, // Smaller font
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14, // Smaller line height
  },
});