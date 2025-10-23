import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Home, Plus, X, MapPin, Building2, Bed, Bath, Square, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

interface Unit {
  id: string;
  project_id: string;
  unit_type: string;
  unit_category?: string;
  area_sqm: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  down_payment: number;
  monthly_installment: number;
  quarterly_installment: number;
  semi_annual_installment: number;
  annual_installment: number;
  installment_years: number;
  floor_number: number;
  unit_number: string;
  status: string;
  features: string[];
  images: string[];
  dynamic_data?: {[key: string]: any} | null;
  resale_data?: {[key: string]: any} | null;
  project?: {
    name: string;
    developer?: {
      name: string;
    };
    area?: {
      name: string;
      city: string;
    };
  };
}

export default function UnitComparisonScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
  const [showUnitList, setShowUnitList] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<{[key: string]: string}>({});
  const [resaleFields, setResaleFields] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
    fetchFields();
  }, []);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          project:projects(
            name,
            developer:developers(name),
            area:areas(name, city)
          )
        `)
        .eq('status', 'available')
        .order('price');

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الوحدات');
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      // Fetch dynamic fields
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('dynamic_fields')
        .select('field_key, field_name');

      if (dynamicError) throw dynamicError;

      const dynamicFieldsMap: {[key: string]: string} = {};
      dynamicData?.forEach(field => {
        dynamicFieldsMap[field.field_key] = field.field_name;
      });
      setDynamicFields(dynamicFieldsMap);

      // Fetch resale fields
      const { data: resaleData, error: resaleError } = await supabase
        .from('resale_fields')
        .select('field_key, field_name');

      if (resaleError) throw resaleError;

      const resaleFieldsMap: {[key: string]: string} = {};
      resaleData?.forEach(field => {
        resaleFieldsMap[field.field_key] = field.field_name;
      });
      setResaleFields(resaleFieldsMap);

      console.log('Dynamic fields loaded:', dynamicFieldsMap);
      console.log('Resale fields loaded:', resaleFieldsMap);

    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const addUnit = (unit: Unit) => {
    if (selectedUnits.length >= 3) {
      Alert.alert('تنبيه', 'يمكنك مقارنة 3 وحدات كحد أقصى');
      return;
    }
    
    if (selectedUnits.find(u => u.id === unit.id)) {
      Alert.alert('تنبيه', 'هذه الوحدة مضافة بالفعل للمقارنة');
      return;
    }

    setSelectedUnits([...selectedUnits, unit]);
    setShowUnitList(false);
  };

  const removeUnit = (unitId: string) => {
    setSelectedUnits(selectedUnits.filter(u => u.id !== unitId));
  };

  const formatPrice = (price: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getUnitTypeText = (type: string) => {
    switch (type) {
      case 'apartment': return 'شقة';
      case 'villa': return 'فيلا';
      case 'studio': return 'استوديو';
      case 'duplex': return 'دوبلكس';
      case 'penthouse': return 'بنتهاوس';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'reserved': return 'محجوز';
      case 'sold': return 'مباع';
      default: return status;
    }
  };

  const renderUnitCard = ({ item }: { item: Unit }) => (
    <TouchableOpacity
      style={[styles.unitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => addUnit(item)}
    >
      <View style={styles.unitCardHeader}>
        <View style={styles.unitInfo}>
          <Text style={[styles.unitTitle, { color: colors.text }]}>
            {getUnitTypeText(item.unit_type)} - {item.unit_number}
          </Text>
          <Text style={[styles.projectName, { color: colors.textSecondary }]}>
            {item.project?.name}
          </Text>
          <Text style={[styles.locationText, { color: colors.textSecondary }]}>
            <MapPin size={10} color={colors.textSecondary} /> 
            {item.project?.area?.name}, {item.project?.area?.city}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => addUnit(item)}
        >
          <Plus size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.unitDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Square size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.area_sqm} م²
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Bed size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.bedrooms}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Bath size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.bathrooms}
            </Text>
          </View>
        </View>
        <Text style={[styles.priceText, { color: colors.text }]}>
          {formatPrice(item.price)} جنيه
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderComparisonTable = () => {
    if (selectedUnits.length === 0) {
      return (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Home size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            لم تختر أي وحدات للمقارنة
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            اضغط على "إضافة وحدة" لبدء المقارنة
          </Text>
        </View>
      );
    }

    // Collect all dynamic fields from selected units
    const allDynamicFields = new Set<string>();
    selectedUnits.forEach(unit => {
      if (unit.dynamic_data) {
        Object.keys(unit.dynamic_data).forEach(key => allDynamicFields.add(key));
      }
    });

    // Collect all resale fields from selected units
    const allResaleFields = new Set<string>();
    selectedUnits.forEach(unit => {
      if (unit.resale_data) {
        Object.keys(unit.resale_data).forEach(key => allResaleFields.add(key));
      }
    });

    const comparisonRows = [
      { key: 'unit_info', label: 'معلومات الوحدة', type: 'unit_info' },
      { key: 'project', label: 'المشروع', type: 'project' },
      { key: 'location', label: 'الموقع', type: 'location' },
      { key: 'unit_type', label: 'نوع الوحدة', type: 'unit_type' },
      { key: 'unit_category', label: 'فئة الوحدة', type: 'unit_category' },
      { key: 'area_sqm', label: 'المساحة (م²)', type: 'number' },
      { key: 'bedrooms', label: 'الغرف', type: 'number' },
      { key: 'bathrooms', label: 'الحمامات', type: 'number' },
      { key: 'floor_number', label: 'الطابق', type: 'number' },
      { key: 'price', label: 'السعر الإجمالي', type: 'price' },
      { key: 'down_payment', label: 'المقدم', type: 'price' },
      { key: 'installment_years', label: 'سنوات التقسيط', type: 'years' },
      { key: 'monthly_installment', label: 'القسط الشهري', type: 'price' },
      { key: 'status', label: 'الحالة', type: 'status' },
      { key: 'features', label: 'المميزات', type: 'array' },
      // Add dynamic fields
      ...Array.from(allDynamicFields).map(fieldKey => ({
        key: `dynamic_${fieldKey}`,
        label: dynamicFields[fieldKey] || fieldKey,
        type: 'dynamic'
      })),
      // Add resale fields
      ...Array.from(allResaleFields).map(fieldKey => {
        const fieldName = resaleFields[fieldKey] || fieldKey;
        console.log(`Resale field: ${fieldKey} -> ${fieldName}`);
        return {
          key: `resale_${fieldKey}`,
          label: fieldName,
          type: 'resale'
        };
      })
    ];

    return (
      <View style={styles.tableContainer}>
        <View style={styles.table}>
          {/* Header Row - RTL */}
          <View style={styles.headerRow}>
            <View style={[styles.labelColumn, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.headerText, { color: colors.text }]}>المواصفات</Text>
            </View>
            {selectedUnits.map((unit, index) => (
              <View key={unit.id} style={[styles.unitColumn, { backgroundColor: colors.surface }]}>
                <View style={styles.unitHeader}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeUnit(unit.id)}
                  >
                    <X size={14} color={colors.error} />
                  </TouchableOpacity>
                  <Text style={[styles.unitHeaderText, { color: colors.text }]} numberOfLines={2}>
                    {getUnitTypeText(unit.unit_type)} - {unit.unit_number}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Data Rows - RTL */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {comparisonRows.map((row, rowIndex) => (
              <View key={row.key} style={[
                styles.dataRow,
                { 
                  backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#E3F2FD',
                  minHeight: 28,
                  paddingVertical: 4
                }
              ]}>
                <View style={styles.labelColumn}>
                  <Text style={[styles.labelText, { color: '#000000' }]}>{row.label}</Text>
                </View>
                {selectedUnits.map((unit) => (
                  <View key={unit.id} style={styles.unitColumn}>
                    {renderCellContent(unit, row.key, row.type)}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCellContent = (unit: Unit, key: string, type: string) => {
    const value = renderCellValue(unit, key, type);
    
    // Check if it's a boolean value
    if (value === '✓') {
      return (
        <Text style={[styles.dataText, { color: '#22C55E', fontWeight: 'bold' }]} numberOfLines={2}>
          ✓
        </Text>
      );
    } else if (value === '✗') {
      return (
        <Text style={[styles.dataText, { color: '#EF4444', fontWeight: 'bold' }]} numberOfLines={2}>
          ✗
        </Text>
      );
    }
    
    // Regular text
    return (
      <Text style={[styles.dataText, { color: '#000000' }]} numberOfLines={2}>
        {value}
      </Text>
    );
  };

  const renderCellValue = (unit: Unit, key: string, type: string) => {
    switch (key) {
      case 'unit_info':
        return `${getUnitTypeText(unit.unit_type)} - ${unit.unit_number}`;
      case 'project':
        return unit.project?.name || '-';
      case 'location':
        return `${unit.project?.area?.name || ''}, ${unit.project?.area?.city || ''}`;
      case 'unit_type':
        return getUnitTypeText(unit.unit_type);
      case 'unit_category':
        return unit.unit_category === 'resale' ? 'ريسيل' : 'أساسية';
      case 'area_sqm':
        return unit.area_sqm ? `${unit.area_sqm} م²` : '-';
      case 'bedrooms':
        return unit.bedrooms?.toString() || '-';
      case 'bathrooms':
        return unit.bathrooms?.toString() || '-';
      case 'floor_number':
        return unit.floor_number?.toString() || '-';
      case 'price':
        return formatPrice(unit.price);
      case 'down_payment':
        return formatPrice(unit.down_payment);
      case 'installment_years':
        return unit.installment_years ? `${unit.installment_years} سنة` : '-';
      case 'monthly_installment':
        return formatPrice(unit.monthly_installment);
      case 'status':
        return getStatusText(unit.status);
      case 'features':
        return Array.isArray(unit.features) ? unit.features.slice(0, 2).join(', ') : '-'; // Limit features
      default:
        // Handle dynamic fields
        if (key.startsWith('dynamic_')) {
          const fieldKey = key.replace('dynamic_', '');
          const dynamicValue = unit.dynamic_data?.[fieldKey];
          
          if (dynamicValue === null || dynamicValue === undefined) {
            return '-';
          }
          
          // Handle boolean values
          if (typeof dynamicValue === 'boolean') {
            return dynamicValue ? '✓' : '✗';
          }
          
          // Handle arrays
          if (Array.isArray(dynamicValue)) {
            return dynamicValue.slice(0, 2).join(', '); // Limit array items
          }
          
          // Handle other types
          return dynamicValue.toString();
        }
        
        // Handle resale fields
        if (key.startsWith('resale_')) {
          const fieldKey = key.replace('resale_', '');
          const resaleValue = unit.resale_data?.[fieldKey];
          
          if (resaleValue === null || resaleValue === undefined) {
            return '-';
          }
          
          // Handle boolean values
          if (typeof resaleValue === 'boolean') {
            return resaleValue ? '✓' : '✗';
          }
          
          // Handle arrays
          if (Array.isArray(resaleValue)) {
            return resaleValue.slice(0, 2).join(', '); // Limit array items
          }
          
          // Handle other types
          return resaleValue.toString();
        }
        
        return '-';
    }
  };

  if (showUnitList) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => setShowUnitList(false)}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { textAlign: 'right' }]}>
            اختر الوحدات للمقارنة
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={units}
          renderItem={renderUnitCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.unitsList}
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
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: 'right' }]}>
          مقارنة الوحدات
        </Text>
        <TouchableOpacity
          style={styles.addUnitButton}
          onPress={() => setShowUnitList(true)}
        >
          <Plus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Selected Units Count */}
      {selectedUnits.length > 0 && (
        <View style={[styles.countContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.countText, { color: colors.text }]}>
            الوحدات المختارة: {selectedUnits.length} من 3
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
    flexDirection: 'row-reverse', // RTL
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 12,
  },
  addUnitButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  unitsList: {
    padding: 16,
    gap: 10,
  },
  unitCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  unitCardHeader: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  unitInfo: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'right',
  },
  projectName: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'right',
  },
  locationText: {
    fontSize: 11,
    flexDirection: 'row-reverse', // RTL
    alignItems: 'center',
    textAlign: 'right',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row-reverse', // RTL
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row-reverse', // RTL
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
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
    padding: 30,
    margin: 16,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    width: '100%',
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: 'row-reverse', // RTL
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 40, // Smaller
  },
  dataRow: {
    flexDirection: 'row-reverse', // RTL
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  labelColumn: {
    width: 80, // Smaller
    padding: 4, // Smaller
    justifyContent: 'center',
    borderLeftWidth: 1, // RTL - border on left
    borderLeftColor: '#E5E7EB',
  },
  unitColumn: {
    flex: 1,
    padding: 2,
    justifyContent: 'center',
    borderLeftWidth: 1, // RTL - border on left
    borderLeftColor: '#E5E7EB',
    minHeight: 28,
  },
  headerText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unitHeader: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 2,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    left: -6, // RTL - on left side
    width: 20, // Smaller
    height: 20, // Smaller
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  unitHeaderText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 6,
  },
  labelText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 10,
  },
});