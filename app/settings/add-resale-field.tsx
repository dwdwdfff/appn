import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface ResaleField {
  id?: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: string[];
  is_required: boolean;
  is_active: boolean;
  display_order: number;
}

export default function AddResaleFieldScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'نص' },
    { value: 'number', label: 'رقم' },
    { value: 'phone', label: 'رقم هاتف' },
    { value: 'boolean', label: 'نعم/لا' },
    { value: 'select', label: 'اختيار من قائمة' },
  ];

  useEffect(() => {
    if (isEditing) {
      fetchField();
    }
  }, [id]);

  const fetchField = async () => {
    try {
      const { data, error } = await supabase
        .from('resale_fields')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFieldName(data.field_name);
        setFieldLabel(data.field_label);
        setFieldType(data.field_type);
        setFieldOptions(data.field_options || []);
        setIsRequired(data.is_required);
        setIsActive(data.is_active);
      }
    } catch (error) {
      console.error('Error fetching field:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل بيانات الحقل');
      router.back();
    }
  };

  const generateFieldName = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleFieldLabelChange = (text: string) => {
    setFieldLabel(text);
    if (!isEditing && !fieldName) {
      setFieldName(generateFieldName(text));
    }
  };

  const addOption = () => {
    if (newOption.trim() && !fieldOptions.includes(newOption.trim())) {
      setFieldOptions([...fieldOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFieldOptions(fieldOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!fieldName.trim() || !fieldLabel.trim()) {
      Alert.alert('خطأ', 'يرجى ملء اسم الحقل والتسمية');
      return;
    }

    if (fieldType === 'select' && fieldOptions.length === 0) {
      Alert.alert('خطأ', 'يرجى إضافة خيار واحد على الأقل للحقول من نوع "اختيار من قائمة"');
      return;
    }

    setLoading(true);

    try {
      const fieldData = {
        field_name: fieldName.trim(),
        field_label: fieldLabel.trim(),
        field_type: fieldType,
        field_options: fieldType === 'select' ? fieldOptions : null,
        is_required: isRequired,
        is_active: isActive,
        display_order: 0, // Will be updated based on existing fields
      };

      if (isEditing) {
        const { error } = await supabase
          .from('resale_fields')
          .update(fieldData)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Get the next display order
        const { data: maxOrderData } = await supabase
          .from('resale_fields')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);

        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? maxOrderData[0].display_order + 1 
          : 1;

        const { error } = await supabase
          .from('resale_fields')
          .insert([{ ...fieldData, display_order: nextOrder }]);

        if (error) throw error;
      }

      Alert.alert(
        'نجح',
        isEditing ? 'تم تحديث الحقل بنجاح' : 'تم إضافة الحقل بنجاح',
        [
          {
            text: 'موافق',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving field:', error);
      
      if (error.code === '23505') {
        Alert.alert('خطأ', 'اسم الحقل موجود بالفعل. يرجى اختيار اسم آخر.');
      } else {
        Alert.alert('خطأ', 'حدث خطأ في حفظ الحقل');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={isEditing ? 'تعديل حقل ريسيل' : 'إضافة حقل ريسيل جديد'} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>تسمية الحقل *</Text>
            <TextInput
              style={styles.input}
              value={fieldLabel}
              onChangeText={handleFieldLabelChange}
              placeholder="مثال: رقم هاتف المالك السابق"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الحقل (تقني) *</Text>
            <TextInput
              style={[styles.input, isEditing && styles.inputDisabled]}
              value={fieldName}
              onChangeText={setFieldName}
              placeholder="previous_owner_phone"
              placeholderTextColor="#9CA3AF"
              editable={!isEditing}
            />
            <Text style={styles.helpText}>
              يستخدم في قاعدة البيانات. يُنشأ تلقائياً من التسمية.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الحقل *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'اختر نوع الحقل',
                  '',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    ...fieldTypes.map((type) => ({
                      text: type.label,
                      onPress: () => {
                        setFieldType(type.value);
                        if (type.value !== 'select') {
                          setFieldOptions([]);
                        }
                      },
                    })),
                  ]
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {fieldTypes.find(t => t.value === fieldType)?.label || 'اختر نوع الحقل'}
              </Text>
            </TouchableOpacity>
          </View>

          {fieldType === 'select' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>خيارات الاختيار</Text>
              
              <View style={styles.optionInputContainer}>
                <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={newOption}
                  onChangeText={setNewOption}
                  placeholder="أدخل خيار جديد"
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={addOption}
                />
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={addOption}
                >
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {fieldOptions.length > 0 && (
                <View style={styles.optionsList}>
                  {fieldOptions.map((option, index) => (
                    <View key={index} style={styles.optionItem}>
                      <Text style={styles.optionText}>{option}</Text>
                      <TouchableOpacity
                        style={styles.removeOptionButton}
                        onPress={() => removeOption(index)}
                      >
                        <X size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.switchGroup}>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>حقل مطلوب</Text>
              <Switch
                value={isRequired}
                onValueChange={setIsRequired}
                trackColor={{ false: '#D1D5DB', true: '#3B619F' }}
                thumbColor={isRequired ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>حقل نشط</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#D1D5DB', true: '#3B619F' }}
                thumbColor={isActive ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading 
                ? (isEditing ? 'جاري التحديث...' : 'جاري الإضافة...') 
                : (isEditing ? 'تحديث الحقل' : 'إضافة الحقل')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EEF5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    textAlign: 'right',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  optionInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
  },
  addOptionButton: {
    backgroundColor: '#3B619F',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  removeOptionButton: {
    padding: 4,
  },
  switchGroup: {
    gap: 16,
    marginBottom: 20,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3B619F',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});