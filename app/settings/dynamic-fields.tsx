import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_active: boolean;
  created_at: string;
}

export default function DynamicFieldsScreen() {
  const router = useRouter();
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_fields')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldStatus = async (fieldId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('dynamic_fields')
        .update({ is_active: !currentStatus })
        .eq('id', fieldId);

      if (error) throw error;

      setFields(fields.map(field => 
        field.id === fieldId 
          ? { ...field, is_active: !currentStatus }
          : field
      ));
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث الحقل');
    }
  };

  const deleteField = async (fieldId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الحقل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('dynamic_fields')
                .delete()
                .eq('id', fieldId);

              if (error) throw error;

              setFields(fields.filter(field => field.id !== fieldId));
              Alert.alert('نجح', 'تم حذف الحقل بنجاح');
            } catch (error) {
              console.error('Error deleting field:', error);
              Alert.alert('خطأ', 'حدث خطأ في حذف الحقل');
            }
          }
        }
      ]
    );
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'نص';
      case 'number': return 'رقم';
      case 'percentage': return 'نسبة مئوية (%)';
      case 'boolean': return 'نعم/لا';
      case 'select': return 'اختيار';
      default: return type;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="الحقول الديناميكية" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="الحقول الديناميكية" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الحقول المخصصة</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/settings/add-field' as any)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>إضافة حقل</Text>
            </TouchableOpacity>
          </View>

          {fields.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد حقول مخصصة</Text>
              <Text style={styles.emptyStateSubtext}>
                اضغط على "إضافة حقل" لإنشاء حقل جديد
              </Text>
            </View>
          ) : (
            fields.map((field) => (
              <View key={field.id} style={styles.fieldCard}>
                <View style={styles.fieldHeader}>
                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldLabel}>{field.field_label}</Text>
                    <Text style={styles.fieldName}>({field.field_name})</Text>
                    <Text style={styles.fieldType}>
                      النوع: {getFieldTypeLabel(field.field_type)}
                    </Text>
                  </View>
                  
                  <View style={styles.fieldActions}>
                    <Switch
                      value={field.is_active}
                      onValueChange={() => toggleFieldStatus(field.id, field.is_active)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor={field.is_active ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                </View>

                <View style={styles.fieldFooter}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/settings/edit-field/${field.id}` as any)}
                  >
                    <Edit size={16} color="#3B82F6" />
                    <Text style={styles.editButtonText}>تعديل</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteField(field.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  fieldName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  fieldActions: {
    marginLeft: 16,
  },
  fieldFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});