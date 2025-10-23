import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Save, Plus, X, Tag } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function AddFieldScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    applies_to: 'projects',
  });
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  const fieldTypes = [
    { value: 'text', label: 'نص' },
    { value: 'number', label: 'رقم' },
    { value: 'percentage', label: 'نسبة مئوية (%)' },
    { value: 'boolean', label: 'نعم/لا' },
    { value: 'select', label: 'قائمة اختيار' },
  ];

  const appliesTo = [
    { value: 'projects', label: 'المشاريع' },
    { value: 'developers', label: 'المطورين' },
    { value: 'units', label: 'الوحدات' },
  ];

  const [selectedType, setSelectedType] = useState('text');

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (type !== 'select') {
      setOptions([]);
      setNewOption('');
    }
  };

  const handleSave = async () => {
    if (!formData.field_name.trim() || !formData.field_label.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الحقل والتسمية');
      return;
    }

    // Validate field name (should be alphanumeric and underscores only)
    const fieldNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!fieldNameRegex.test(formData.field_name)) {
      Alert.alert('خطأ', 'اسم الحقل يجب أن يحتوي على أحرف إنجليزية وأرقام و _ فقط');
      return;
    }

    setLoading(true);
    try {
      const fieldData: any = {
        field_name: formData.field_name,
        field_label: formData.field_label,
        field_type: selectedType,
        applies_to: formData.applies_to,
        is_active: true,
        display_order: 0,
      };

      // Add options for select type
      if (selectedType === 'select' && options.length > 0) {
        fieldData.field_options = options;
      }

      const { error } = await supabase
        .from('dynamic_fields')
        .insert(fieldData);

      if (error) throw error;

      Alert.alert('نجح', 'تم إضافة الحقل بنجاح');
      router.back();
    } catch (error: any) {
      console.error('Error adding field:', error);
      if (error.code === '23505') {
        Alert.alert('خطأ', 'اسم الحقل موجود بالفعل');
      } else {
        Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectFieldType = () => {
    Alert.alert(
      'اختر نوع الحقل',
      '',
      fieldTypes.map(fieldType => ({
        text: fieldType.label,
        onPress: () => handleTypeChange(fieldType.value),
      }))
    );
  };

  const selectAppliesTo = () => {
    Alert.alert(
      'يطبق على',
      '',
      appliesTo.map(item => ({
        text: item.label,
        onPress: () => setFormData({ ...formData, applies_to: item.value }),
      }))
    );
  };

  return (
    <View style={styles.container}>
      <Header title="إضافة حقل جديد" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الحقل (بالإنجليزية) *</Text>
            <TextInput
              style={styles.input}
              value={formData.field_name}
              onChangeText={(text) => setFormData({ ...formData, field_name: text })}
              placeholder="مثال: club_house"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
            <Text style={styles.helpText}>
              يستخدم في قاعدة البيانات (أحرف إنجليزية وأرقام و _ فقط)
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>تسمية الحقل (للعرض) *</Text>
            <TextInput
              style={styles.input}
              value={formData.field_label}
              onChangeText={(text) => setFormData({ ...formData, field_label: text })}
              placeholder="مثال: نادي صحي"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helpText}>
              النص الذي سيظهر للمستخدم
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الحقل *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={selectFieldType}
            >
              <Text style={styles.selectButtonText}>
                {fieldTypes.find(type => type.value === selectedType)?.label || 'اختر النوع'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>يطبق على *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={selectAppliesTo}
            >
              <Text style={styles.selectButtonText}>
                {appliesTo.find(item => item.value === formData.applies_to)?.label || 'اختر التطبيق'}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedType === 'select' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>خيارات الاختيار</Text>
              
              {/* Add New Option */}
              <View style={styles.addOptionContainer}>
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
                  disabled={!newOption.trim()}
                >
                  <Plus size={20} color={newOption.trim() ? "#FFFFFF" : "#9CA3AF"} />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              {options.length > 0 && (
                <View style={styles.optionsContainer}>
                  <Text style={styles.optionsTitle}>الخيارات المضافة:</Text>
                  {options.map((option, index) => (
                    <View key={index} style={styles.optionItem}>
                      <View style={styles.optionContent}>
                        <Tag size={16} color="#3B82F6" />
                        <Text style={styles.optionText}>{option}</Text>
                      </View>
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

              <Text style={styles.helpText}>
                اضغط على زر + لإضافة خيار جديد
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {loading ? 'جاري الحفظ...' : 'حفظ الحقل'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1E293B',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Options Management Styles
  addOptionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  addOptionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  optionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  removeOptionButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    padding: 6,
    marginLeft: 8,
  },
});