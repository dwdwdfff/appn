import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any[];
  is_active: boolean;
}

export default function AddDeveloperScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    established_date: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    portfolio: '',
  });
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<{[key: string]: any}>({});

  useEffect(() => {
    fetchDynamicFields();
  }, []);

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
      // Don't show error alert for dynamic fields as they're optional
    }
  };

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderDynamicField = (field: DynamicField) => {
    const value = dynamicFieldValues[field.field_name];

    switch (field.field_type) {
      case 'text':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <TextInput
              style={styles.input}
              value={value || ''}
              onChangeText={(text) => handleDynamicFieldChange(field.field_name, text)}
              placeholder={`أدخل ${field.field_label}`}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        );

      case 'number':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <TextInput
              style={styles.input}
              value={value?.toString() || ''}
              onChangeText={(text) => handleDynamicFieldChange(field.field_name, parseFloat(text) || null)}
              placeholder={`أدخل ${field.field_label}`}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        );

      case 'percentage':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <View style={styles.percentageInputContainer}>
              <TextInput
                style={[styles.input, styles.percentageInput]}
                value={value?.toString() || ''}
                onChangeText={(text) => handleDynamicFieldChange(field.field_name, parseFloat(text) || null)}
                placeholder={`أدخل ${field.field_label}`}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <Text style={styles.percentageSymbol}>%</Text>
            </View>
          </View>
        );

      case 'boolean':
        return (
          <View key={field.id} style={styles.inputGroup}>
            <View style={styles.booleanContainer}>
              <Text style={styles.label}>{field.field_label}</Text>
              <TouchableOpacity
                style={[styles.booleanButton, value && styles.booleanButtonActive]}
                onPress={() => handleDynamicFieldChange(field.field_name, !value)}
              >
                <Text style={[styles.booleanButtonText, value && styles.booleanButtonTextActive]}>
                  {value ? 'نعم' : 'لا'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'select':
        const options = field.field_options || [];
        return (
          <View key={field.id} style={styles.inputGroup}>
            <Text style={styles.label}>{field.field_label}</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  `اختر ${field.field_label}`,
                  '',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'مسح الاختيار', onPress: () => handleDynamicFieldChange(field.field_name, null) },
                    ...options.map((option: any) => ({
                      text: option.label || option,
                      onPress: () => handleDynamicFieldChange(field.field_name, option.value || option),
                    })),
                  ]
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {value || `اختر ${field.field_label}`}
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('خطأ', 'حدث خطأ في اختيار الصورة');
    }
  };

  const uploadLogo = async (uri: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      // حل مبسط: استخدام URI مباشرة بدون رفع (لتخطي المشكلة مؤقتاً)
      console.log('Using local URI without upload');
      return uri;
      
    } catch (error) {
      console.error('Error in uploadLogo:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  async function handleSave() {
    if (!formData.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المطور');
      return;
    }

    console.log('Starting save process...');
    setLoading(true);
    
    try {
      let logoUrl = null;
      
      // Upload logo if selected
      if (logoUri) {
        console.log('Processing logo...');
        logoUrl = await uploadLogo(logoUri);
        console.log('Logo processed:', logoUrl);
      }

      const insertData = {
        name: formData.name,
        established_date: formData.established_date || null,
        description: formData.description || null,
        logo_url: logoUrl,
        contact_info: {
          phone: formData.phone || '',
          email: formData.email || '',
          website: formData.website || '',
        },
        portfolio: formData.portfolio ? [formData.portfolio] : [],
        dynamic_data: dynamicFieldValues,
        projects_count: 0,
        units_count: 0,
        total_units_sold: 0,
        min_price: null,
        max_price: null,
        min_down_payment: null,
        max_down_payment: null,
        min_installment: null,
        max_installment: null,
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('developers')
        .insert(insertData)
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      Alert.alert('نجح', 'تم إضافة المطور بنجاح');
      router.back();
      
    } catch (error: any) {
      console.error('Save error:', error);
      let errorMessage = 'حدث خطأ أثناء حفظ البيانات';
      
      if (error.code === '23505') {
        errorMessage = 'هذا المطور مسجل بالفعل';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header title="إضافة مطور" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Logo Upload Section */}
          <View style={styles.logoSection}>
            <Text style={styles.label}>شعار المطور</Text>
            <TouchableOpacity
              style={styles.logoUploadContainer}
              onPress={pickImage}
              disabled={uploading}
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoPreview} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Upload size={32} color="#9CA3AF" />
                  <Text style={styles.logoPlaceholderText}>
                    {uploading ? 'جاري الرفع...' : 'اضغط لرفع الشعار'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم المطور *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="مثال: شركة التطوير العقاري"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>تاريخ التأسيس</Text>
            <TextInput
              style={styles.input}
              value={formData.established_date}
              onChangeText={(text) => setFormData({ ...formData, established_date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="وصف الشركة ونبذة عنها"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="مثال: +966501234567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="مثال: info@company.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              placeholder="مثال: https://www.company.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>سابقة الأعمال</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.portfolio}
              onChangeText={(text) => setFormData({ ...formData, portfolio: text })}
              placeholder="أمثلة من المشاريع السابقة"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Dynamic Fields */}
          {dynamicFields.length > 0 && (
            <View style={styles.dynamicFieldsContainer}>
              <Text style={styles.dynamicFieldsTitle}>معلومات إضافية</Text>
              {dynamicFields.map(renderDynamicField)}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <Save size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  logoSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoUploadContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  dynamicFieldsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dynamicFieldsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 16,
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  booleanButton: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  booleanButtonActive: {
    backgroundColor: '#3b82f6',
  },
  booleanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  booleanButtonTextActive: {
    color: '#ffffff',
  },
  pickerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'right',
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  percentageInput: {
    paddingRight: 30,
  },
  percentageSymbol: {
    position: 'absolute',
    right: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
});