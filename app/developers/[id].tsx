import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  Building2, 
  Star, 
  Calendar,
  Award
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

const { width } = Dimensions.get('window');

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any[];
  is_active: boolean;
}

interface Developer {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  established_date?: string;
  total_projects?: number;
  rating?: number;
  specialization?: string;
  dynamic_data?: any;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  image_url?: string;
  location?: string;
  price_range?: string;
  status?: string;
  area?: string;
  developer_id?: string;
}

interface DeveloperPrice {
  min_down_payment: number;
  min_monthly_installment: number;
  min_price: number;
  max_price: number;
}

export default function DeveloperDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [prices, setPrices] = useState<DeveloperPrice[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeveloperDetails();
      fetchDeveloperProjects();
      fetchDeveloperPrices();
      fetchDynamicFields();
    }
  }, [id]);

  const fetchDynamicFields = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .eq('applies_to', 'developers')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setDynamicFields(data || []);
    } catch (error) {
      console.error('Error fetching dynamic fields:', error);
    }
  };

  const fetchDeveloperDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDeveloper(data);
    } catch (error) {
      console.error('Error fetching developer:', error);
    }
  };

  const fetchDeveloperProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, image_url, location, price_range, status, area')
        .eq('developer_id', id)
        .limit(10);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDeveloperPrices = async () => {
    try {
      console.log('Fetching prices for developer:', id);
      
      // First get all projects for this developer
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('developer_id', id);

      if (projectsError) throw projectsError;
      console.log('Projects found:', projectsData?.length || 0);

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        console.log('Project IDs:', projectIds);
        
        // Then get units for these projects
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('down_payment, monthly_installment, price')
          .in('project_id', projectIds)
          .not('down_payment', 'is', null)
          .not('monthly_installment', 'is', null)
          .not('price', 'is', null);

        if (unitsError) throw unitsError;
        console.log('Units found:', unitsData?.length || 0);
        
        if (unitsData && unitsData.length > 0) {
          const validDownPayments = unitsData.map(unit => unit.down_payment).filter(Boolean);
          const validMonthlyInstallments = unitsData.map(unit => unit.monthly_installment).filter(Boolean);
          const validPrices = unitsData.map(unit => unit.price).filter(Boolean);
          
          console.log('Valid data counts:', {
            downPayments: validDownPayments.length,
            installments: validMonthlyInstallments.length,
            prices: validPrices.length
          });
          
          if (validDownPayments.length > 0 && validMonthlyInstallments.length > 0 && validPrices.length > 0) {
            const priceData = {
              min_down_payment: Math.min(...validDownPayments),
              min_monthly_installment: Math.min(...validMonthlyInstallments),
              min_price: Math.min(...validPrices),
              max_price: Math.max(...validPrices)
            };
            console.log('Price data:', priceData);
            setPrices([priceData]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };



  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          color={i <= rating ? "#F59E0B" : "#E5E7EB"}
          fill={i <= rating ? "#F59E0B" : "transparent"}
        />
      );
    }
    return stars;
  };

  const renderDynamicField = (field: DynamicField, value: any) => {
    if (!value && value !== false && value !== 0) return null;

    let displayValue = value;
    
    switch (field.field_type) {
      case 'boolean':
        displayValue = value ? 'نعم' : 'لا';
        break;
      case 'select':
        // If it's a select field, try to find the label for the value
        if (field.field_options) {
          const option = field.field_options.find((opt: any) => 
            (opt.value || opt) === value
          );
          displayValue = option?.label || option || value;
        }
        break;
      case 'number':
        displayValue = value.toString();
        break;
      case 'percentage':
        displayValue = `${value}%`;
        break;
      default:
        displayValue = value.toString();
    }

    return (
      <View key={field.id} style={styles.dynamicFieldRow}>
        <Text style={styles.dynamicFieldLabel}>{field.field_label}:</Text>
        <Text style={styles.dynamicFieldValue}>{displayValue}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.modernHeader}>
          <BackButton />
          <Text style={styles.headerTitle}>تفاصيل المطور</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  if (!developer) {
    return (
      <View style={styles.container}>
        <View style={styles.modernHeader}>
          <BackButton />
          <Text style={styles.headerTitle}>تفاصيل المطور</Text>
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
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <BackButton />
        <Text style={styles.headerTitle}>تفاصيل المطور</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Developer Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {developer.logo_url ? (
              <Image source={{ uri: developer.logo_url }} style={styles.developerLogo} />
            ) : (
              <View style={styles.placeholderLogo}>
                <Building2 size={40} color="#3B82F6" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.developerName}>{developer.name}</Text>
              {developer.rating && (
                <View style={styles.ratingContainer}>
                  {renderStars(developer.rating)}
                  <Text style={styles.ratingText}>({developer.rating})</Text>
                </View>
              )}
              {developer.specialization && (
                <Text style={styles.specialization}>{developer.specialization}</Text>
              )}
            </View>
          </View>

          {developer.description && (
            <Text style={styles.description}>{developer.description}</Text>
          )}

          {/* Dynamic Fields */}
          {developer.dynamic_data && dynamicFields.length > 0 && (
            <View style={styles.dynamicFieldsContainer}>
              <Text style={styles.dynamicFieldsTitle}>معلومات إضافية</Text>
              {dynamicFields.map(field => 
                renderDynamicField(field, developer.dynamic_data[field.field_name])
              )}
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {developer.established_date && (
            <View style={styles.statCard}>
              <Calendar size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{new Date(developer.established_date).getFullYear()}</Text>
              <Text style={styles.statLabel}>سنة التأسيس</Text>
            </View>
          )}
          
          {developer.total_projects && (
            <View style={styles.statCard}>
              <Building2 size={24} color="#10B981" />
              <Text style={styles.statValue}>{developer.total_projects}</Text>
              <Text style={styles.statLabel}>مشروع</Text>
            </View>
          )}

          <View style={styles.statCard}>
            <Award size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{projects.length}</Text>
            <Text style={styles.statLabel}>مشروع متاح</Text>
          </View>
        </View>

        {/* Developer Prices */}
        <View style={styles.pricesSection}>
          <Text style={styles.sectionTitle}>أسعار المطور</Text>
          {prices.length > 0 ? (
            prices.map((price, index) => (
              <View key={index} style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>المقدم يبدأ من:</Text>
                  <Text style={styles.priceValue}>{price.min_down_payment.toLocaleString()} ج.م</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>أقل قسط شهري:</Text>
                  <Text style={styles.priceValue}>{price.min_monthly_installment.toLocaleString()} ج.م</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>نطاق الأسعار:</Text>
                  <Text style={styles.priceValue}>
                    {price.min_price.toLocaleString()} - {price.max_price.toLocaleString()} ج.م
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.priceCard}>
              <Text style={styles.noPricesText}>لا توجد بيانات أسعار متاحة حالياً</Text>
            </View>
          )}
        </View>

        {/* Projects Portfolio */}
        {projects.length > 0 && (
          <View style={styles.portfolioSection}>
            <Text style={styles.sectionTitle}>سابقة الأعمال</Text>
            <View style={styles.projectsGrid}>
              {projects.map((project) => (
                <TouchableOpacity 
                  key={project.id} 
                  style={styles.projectCard}
                  onPress={() => {/* Navigate to project details */}}
                >
                  {project.image_url ? (
                    <Image source={{ uri: project.image_url }} style={styles.projectImage} />
                  ) : (
                    <View style={styles.placeholderProjectImage}>
                      <Building2 size={24} color="#64748B" />
                    </View>
                  )}
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName} numberOfLines={2}>{project.name}</Text>
                    {project.location && (
                      <Text style={styles.projectLocation} numberOfLines={1}>{project.location}</Text>
                    )}
                    {project.status && (
                      <View style={[styles.statusBadge, { 
                        backgroundColor: project.status === 'متاح' ? '#10B981' : '#F59E0B' 
                      }]}>
                        <Text style={styles.statusText}>{project.status}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  // Modern Header
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
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
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },

  content: {
    flex: 1,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  developerLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  placeholderLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Contact Section
  pricesSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  priceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  noPricesText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },


  // Projects Section
  portfolioSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  projectCard: {
    width: (width - 84) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: 100,
  },
  placeholderProjectImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    padding: 12,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  projectPrice: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dynamicFieldsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dynamicFieldsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 12,
  },
  dynamicFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  dynamicFieldLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    flex: 1,
  },
  dynamicFieldValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
});