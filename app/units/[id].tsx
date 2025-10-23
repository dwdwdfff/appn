import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Home, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Calendar,
  MapPin,
  Building2,
  Share2,
  Phone,
  MessageCircle,
  FileText
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { generateUnitPDF } from '@/lib/pdfGenerator';

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
  dynamic_data?: any;
  projects: {
    id: string;
    name: string;
    developers: {
      name: string;
      phone?: string;
      email?: string;
    };
    area: {
      name: string;
      city: string;
    };
  };
}

export default function UnitDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [dynamicFields, setDynamicFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUnitDetails();
      loadDynamicFields();
    }
  }, [id]);

  const loadUnitDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          projects (
            id,
            name,
            developers (
              name,
              phone,
              email
            ),
            area:areas (
              name,
              city
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setUnit(data);
    } catch (error) {
      console.error('Error loading unit:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل بيانات الوحدة');
    } finally {
      setLoading(false);
    }
  };

  const loadDynamicFields = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .eq('applies_to', 'units')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setDynamicFields(data || []);
    } catch (error) {
      console.error('Error loading dynamic fields:', error);
    }
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

  const handleShare = async () => {
    if (!unit) return;
    
    const message = `
🏠 ${unit.unit_type}
📍 ${unit.projects.name} - ${unit.projects.area.name}
📐 المساحة: ${unit.area_sqm} م²
🛏️ ${unit.bedrooms} غرف نوم
🚿 ${unit.bathrooms} حمام
💰 السعر: ${formatPrice(unit.price)} ج.م
${unit.down_payment ? `💳 المقدم: ${formatPrice(unit.down_payment)} ج.م` : ''}
${unit.monthly_installment ? `📅 القسط الشهري: ${formatPrice(unit.monthly_installment)} ج.م` : ''}
    `.trim();

    try {
      await Share.share({
        message,
        title: `وحدة ${unit.unit_type} - ${unit.projects.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleWhatsAppShare = () => {
    if (!unit) return;
    
    const message = `
🏠 *${unit.unit_type}*
📍 ${unit.projects.name} - ${unit.projects.area.name}
📐 المساحة: ${unit.area_sqm} م²
🛏️ ${unit.bedrooms} غرف نوم
🚿 ${unit.bathrooms} حمام
💰 السعر: ${formatPrice(unit.price)} ج.م
${unit.down_payment ? `💳 المقدم: ${formatPrice(unit.down_payment)} ج.م` : ''}
${unit.monthly_installment ? `📅 القسط الشهري: ${formatPrice(unit.monthly_installment)} ج.م` : ''}

للاستفسار والحجز، تواصل معنا الآن!
    `.trim();

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    // In a real app, you would use Linking.openURL(whatsappUrl)
    Alert.alert('مشاركة WhatsApp', 'سيتم فتح WhatsApp لمشاركة تفاصيل الوحدة');
  };

  const handleGeneratePDF = async () => {
    if (!unit) return;
    
    try {
      Alert.alert('إنشاء PDF', 'جاري إنشاء ملف PDF...');
      
      // In a real app, this would generate the actual PDF
      const pdfPath = await generateUnitPDF(unit);
      
      Alert.alert(
        'تم إنشاء PDF بنجاح',
        'تم إنشاء ملف PDF احترافي للوحدة',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'مشاركة', onPress: () => handleShare() }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في إنشاء ملف PDF');
    }
  };

  if (loading || !unit) {
    return (
      <View style={styles.container}>
        <Header title="تفاصيل الوحدة" />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={`${unit.unit_type} - ${unit.projects.name}`} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Unit Header */}
        <View style={styles.unitHeader}>
          <View style={styles.unitMainInfo}>
            <Text style={styles.unitType}>{unit.unit_type}</Text>
            <Text style={styles.projectName}>{unit.projects.name}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.locationText}>
                {unit.projects.area.name}, {unit.projects.area.city}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(unit.status) }]}>
            <Text style={styles.statusText}>{getStatusText(unit.status)}</Text>
          </View>
        </View>

        {/* Unit Specifications */}
        <View style={styles.specificationsSection}>
          <Text style={styles.sectionTitle}>مواصفات الوحدة</Text>
          <View style={styles.specificationsGrid}>
            {unit.area_sqm && (
              <View style={styles.specItem}>
                <Square size={24} color="#3B619F" />
                <Text style={styles.specValue}>{unit.area_sqm}</Text>
                <Text style={styles.specLabel}>م²</Text>
              </View>
            )}
            
            <View style={styles.specItem}>
              <Bed size={24} color="#3B619F" />
              <Text style={styles.specValue}>{unit.bedrooms}</Text>
              <Text style={styles.specLabel}>غرف نوم</Text>
            </View>
            
            <View style={styles.specItem}>
              <Bath size={24} color="#3B619F" />
              <Text style={styles.specValue}>{unit.bathrooms}</Text>
              <Text style={styles.specLabel}>حمام</Text>
            </View>
            
            {unit.floor_number && (
              <View style={styles.specItem}>
                <Building2 size={24} color="#3B619F" />
                <Text style={styles.specValue}>{unit.floor_number}</Text>
                <Text style={styles.specLabel}>الطابق</Text>
              </View>
            )}
          </View>
          
          {unit.unit_number && (
            <View style={styles.unitNumberContainer}>
              <Text style={styles.unitNumberLabel}>رقم الوحدة:</Text>
              <Text style={styles.unitNumberValue}>{unit.unit_number}</Text>
            </View>
          )}
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>تفاصيل السعر</Text>
          
          <View style={styles.mainPriceContainer}>
            <DollarSign size={24} color="#059669" />
            <Text style={styles.mainPrice}>{formatPrice(unit.price)} ج.م</Text>
            {unit.area_sqm && (
              <Text style={styles.pricePerMeter}>
                {formatPrice(Math.round(unit.price / unit.area_sqm))} ج.م/م²
              </Text>
            )}
          </View>

          {unit.down_payment && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>المقدم:</Text>
              <Text style={styles.paymentValue}>{formatPrice(unit.down_payment)} ج.م</Text>
            </View>
          )}

          {unit.monthly_installment && (
            <View style={styles.installmentSection}>
              <Text style={styles.installmentTitle}>خيارات التقسيط:</Text>
              <View style={styles.installmentGrid}>
                <View style={styles.installmentItem}>
                  <Text style={styles.installmentLabel}>شهري</Text>
                  <Text style={styles.installmentValue}>{formatPrice(unit.monthly_installment)} ج.م</Text>
                </View>
                
                {unit.quarterly_installment && (
                  <View style={styles.installmentItem}>
                    <Text style={styles.installmentLabel}>ربع سنوي</Text>
                    <Text style={styles.installmentValue}>{formatPrice(unit.quarterly_installment)} ج.م</Text>
                  </View>
                )}
                
                {unit.semi_annual_installment && (
                  <View style={styles.installmentItem}>
                    <Text style={styles.installmentLabel}>نصف سنوي</Text>
                    <Text style={styles.installmentValue}>{formatPrice(unit.semi_annual_installment)} ج.م</Text>
                  </View>
                )}
                
                {unit.annual_installment && (
                  <View style={styles.installmentItem}>
                    <Text style={styles.installmentLabel}>سنوي</Text>
                    <Text style={styles.installmentValue}>{formatPrice(unit.annual_installment)} ج.م</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.installmentYearsContainer}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.installmentYears}>لمدة {unit.installment_years} سنوات</Text>
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Fields */}
        {unit.dynamic_data && Object.keys(unit.dynamic_data).length > 0 && (
          <View style={styles.dynamicFieldsSection}>
            <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
            <View style={styles.dynamicFieldsGrid}>
              {dynamicFields.map((field) => {
                const value = unit.dynamic_data[field.field_name];
                if (value === undefined || value === null) return null;
                
                return (
                  <View key={field.id} style={styles.dynamicFieldItem}>
                    <Text style={styles.dynamicFieldLabel}>{field.field_label || field.field_name}</Text>
                    <Text style={styles.dynamicFieldValue}>
                      {typeof value === 'boolean' ? (value ? 'نعم' : 'لا') : String(value)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Developer Info */}
        <View style={styles.developerSection}>
          <Text style={styles.sectionTitle}>معلومات المطور</Text>
          <View style={styles.developerInfo}>
            <Building2 size={20} color="#3B619F" />
            <Text style={styles.developerName}>{unit.projects.developers.name}</Text>
          </View>
          
          {unit.projects.developers.phone && (
            <TouchableOpacity style={styles.contactItem}>
              <Phone size={16} color="#10B981" />
              <Text style={styles.contactText}>{unit.projects.developers.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={18} color="#3B619F" />
          <Text style={styles.shareButtonText}>مشاركة</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF}>
          <FileText size={18} color="#FFFFFF" />
          <Text style={styles.pdfButtonText}>PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppShare}>
          <MessageCircle size={18} color="#FFFFFF" />
          <Text style={styles.whatsappButtonText}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton}>
          <Phone size={18} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>اتصل</Text>
        </TouchableOpacity>
      </View>
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
  unitHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  unitMainInfo: {
    flex: 1,
    marginRight: 16,
  },
  unitType: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  specificationsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  specificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  specItem: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    minWidth: (width - 80) / 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  specLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  unitNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unitNumberLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  unitNumberValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },
  pricingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  mainPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  mainPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 8,
    flex: 1,
  },
  pricePerMeter: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  installmentSection: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  installmentGrid: {
    gap: 8,
    marginBottom: 12,
  },
  installmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  installmentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  installmentValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  installmentYearsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  installmentYears: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dynamicFieldsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  dynamicFieldsGrid: {
    gap: 8,
  },
  dynamicFieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dynamicFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  dynamicFieldValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    textAlign: 'right',
  },
  developerSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    gap: 6,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});