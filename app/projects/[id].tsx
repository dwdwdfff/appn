import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Building2, MapPin, DollarSign, Calendar, Users, Star, Search, Filter, Phone, Mail, Globe, Share2, MessageCircle, FileText } from 'lucide-react-native';
import { supabase, Project } from '@/lib/supabase';
import Header from '@/components/Header';
import { generateProjectPDF, sharePDF } from '@/lib/pdfGenerator';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (id) {
      loadProjectDetails();
      loadProjectUnits();
      loadDynamicFields();
    }
  }, [id]);

  useEffect(() => {
    filterUnits();
  }, [searchQuery, selectedFilter, units]);

  const loadProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          developer:developers(*),
          area:areas(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل بيانات المشروع');
    }
  };

  const [dynamicFields, setDynamicFields] = useState<any[]>([]);

  const loadDynamicFields = async () => {
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
      console.error('Error loading dynamic fields:', error);
    }
  };

  const loadProjectUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('project_id', id)
        .order('area_sqm', { ascending: true });

      if (error) throw error;
      setUnits(data || []);
      setFilteredUnits(data || []);
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    let filtered = units;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(unit =>
        unit.area_sqm?.toString().includes(searchQuery) ||
        unit.price?.toString().includes(searchQuery) ||
        unit.unit_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(unit => unit.unit_type === selectedFilter);
    }

    setFilteredUnits(filtered);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getUnitTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'شقة';
      case 'villa': return 'فيلا';
      case 'duplex': return 'دوبلكس';
      case 'penthouse': return 'بنتهاوس';
      case 'studio': return 'استوديو';
      default: return type;
    }
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

  const filterOptions = [
    { key: 'all', label: 'الكل' },
    { key: 'apartment', label: 'شقة' },
    { key: 'villa', label: 'فيلا' },
    { key: 'duplex', label: 'دوبلكس' },
    { key: 'penthouse', label: 'بنتهاوس' },
    { key: 'studio', label: 'استوديو' },
  ];

  const handleShare = async () => {
    if (!project) return;
    
    const message = `
🏢 ${project.name}
🏗️ ${project.developer?.name || 'غير محدد'}
📍 ${project.area?.name || 'غير محدد'}, ${project.area?.city || ''}
${project.project_type ? `🏠 النوع: ${project.project_type}` : ''}
${project.price_min ? `💰 الأسعار تبدأ من: ${formatPrice(project.price_min)}` : ''}
${project.delivery_date ? `📅 تاريخ التسليم: ${project.delivery_date}` : ''}
${project.description ? `📝 ${project.description}` : ''}
    `.trim();

    try {
      await Share.share({
        message,
        title: `مشروع ${project.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWhatsAppShare = () => {
    if (!project) return;
    
    const message = `
🏢 *${project.name}*
🏗️ ${project.developer?.name || 'غير محدد'}
📍 ${project.area?.name || 'غير محدد'}, ${project.area?.city || ''}
${project.project_type ? `🏠 النوع: ${project.project_type}` : ''}
${project.price_min ? `💰 الأسعار تبدأ من: ${formatPrice(project.price_min)}` : ''}
${project.delivery_date ? `📅 تاريخ التسليم: ${project.delivery_date}` : ''}

للاستفسار والحجز، تواصل معنا الآن!
    `.trim();

    // In a real app, you would use Linking.openURL
    Alert.alert('مشاركة WhatsApp', 'سيتم فتح WhatsApp لمشاركة تفاصيل المشروع');
  };

  const handleGeneratePDF = async () => {
    if (!project) return;
    
    try {
      Alert.alert('إنشاء PDF', 'جاري إنشاء ملف PDF...');
      
      const pdfPath = await generateProjectPDF(project);
      
      Alert.alert(
        'تم إنشاء PDF بنجاح',
        'تم إنشاء ملف PDF احترافي للمشروع',
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'مشاركة', 
            onPress: () => sharePDF(pdfPath, `مشروع ${project.name}`)
          }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في إنشاء ملف PDF');
    }
  };

  if (loading || !project) {
    return (
      <View style={styles.container}>
        <Header title="تفاصيل المشروع" />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={project.name} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
          >
            {project.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.projectImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Project Info */}
        <View style={styles.projectInfo}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>

          {/* Developer & Location */}
          <View style={styles.infoSection}>
            {project.developer && (
              <View style={styles.infoRow}>
                <Building2 size={18} color="#3B82F6" />
                <Text style={styles.infoText}>{project.developer.name}</Text>
              </View>
            )}

            {project.area && (
              <View style={styles.infoRow}>
                <MapPin size={18} color="#EF4444" />
                <Text style={styles.infoText}>{project.area.name}, {project.area.city}</Text>
              </View>
            )}

            {project.delivery_date && (
              <View style={styles.infoRow}>
                <Calendar size={18} color="#10B981" />
                <Text style={styles.infoText}>تاريخ التسليم: {project.delivery_date}</Text>
              </View>
            )}
          </View>

          {/* Price Range */}
          {(project.price_min || project.price_max) && (
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>نطاق الأسعار</Text>
              <View style={styles.priceRange}>
                <Text style={styles.priceText}>
                  {project.price_min && project.price_max
                    ? `${formatPrice(project.price_min)} - ${formatPrice(project.price_max)}`
                    : formatPrice(project.price_min || project.price_max)}
                </Text>
              </View>
            </View>
          )}



          {/* Dynamic Fields */}
          {dynamicFields.length > 0 && (
            <View style={styles.dynamicFieldsSection}>
              <Text style={styles.sectionTitle}>تفاصيل المشروع</Text>
              <View style={styles.dynamicFieldsGrid}>
                {dynamicFields.map((field) => {
                  const value = project.dynamic_fields ? project.dynamic_fields[field.field_name] : null;
                  
                  // عرض الحقل حتى لو كان فارغاً مع قيمة افتراضية
                  let displayValue = 'غير محدد';
                  
                  if (value !== undefined && value !== null && value !== '') {
                    if (typeof value === 'boolean') {
                      displayValue = value ? 'نعم' : 'لا';
                    } else if (field.field_type === 'percentage') {
                      displayValue = `${value}%`;
                    } else {
                      displayValue = String(value);
                    }
                  }
                  
                  return (
                    <View key={field.id} style={styles.dynamicFieldItem}>
                      <Text style={styles.dynamicFieldLabel}>{field.field_label || field.field_name}</Text>
                      <Text style={[
                        styles.dynamicFieldValue,
                        displayValue === 'غير محدد' && styles.dynamicFieldValueEmpty
                      ]}>
                        {displayValue}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          {project.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>وصف المشروع</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          )}

          {/* Master Plan */}
          {project.master_plan_url && (
            <View style={styles.masterPlanSection}>
              <Text style={styles.sectionTitle}>الماستر بلان</Text>
              <TouchableOpacity 
                style={styles.masterPlanButton}
                onPress={() => {
                  // In a real app, you would open the PDF/image viewer
                  Alert.alert('الماستر بلان', 'سيتم فتح الماستر بلان');
                }}>
                <FileText size={20} color="#3B82F6" />
                <Text style={styles.masterPlanButtonText}>عرض الماستر بلان</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>


      </ScrollView>


    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
  },
  imageSlider: {
    height: 250,
  },
  projectImage: {
    width: width,
    height: 250,
  },
  projectInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  projectName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#64748B',
    flex: 1,
  },
  priceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  priceRange: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  contactSection: {
    marginBottom: 20,
  },
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  unitsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  filterContainer: {
    marginBottom: 20,
    marginHorizontal: -4,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyUnits: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  unitsList: {
    gap: 12,
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  unitArea: {
    fontSize: 12,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  unitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  unitPricePerMeter: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unitPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  unitFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  viewUnitText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    borderWidth: 1,
    borderColor: '#3B619F',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B619F',
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    gap: 6,
  },
  pdfButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#25D366',
    gap: 6,
  },
  whatsappButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3B619F',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dynamicFieldsSection: {
    marginBottom: 24,
  },
  dynamicFieldsGrid: {
    gap: 12,
  },
  dynamicFieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dynamicFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  dynamicFieldValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    textAlign: 'right',
  },
  dynamicFieldValueEmpty: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  masterPlanSection: {
    marginBottom: 20,
  },
  masterPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  masterPlanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});