import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Edit, Trash2, Move } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface ResaleField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any[];
  is_required: boolean;
  is_active: boolean;
  display_order: number;
}

export default function ResaleFieldsScreen() {
  const router = useRouter();
  const [fields, setFields] = useState<ResaleField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResaleFields();
  }, []);

  const fetchResaleFields = async () => {
    try {
      const { data, error } = await supabase
        .from('resale_fields')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching resale fields:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل حقول الريسيل');
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldActive = async (fieldId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('resale_fields')
        .update({ is_active: isActive })
        .eq('id', fieldId);

      if (error) throw error;

      setFields(fields.map(field => 
        field.id === fieldId ? { ...field, is_active: isActive } : field
      ));
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث الحقل');
    }
  };

  const deleteField = async (fieldId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الحقل؟ سيتم حذف جميع البيانات المرتبطة به.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('resale_fields')
                .delete()
                .eq('id', fieldId);

              if (error) throw error;

              setFields(fields.filter(field => field.id !== fieldId));
              Alert.alert('نجح', 'تم حذف الحقل بنجاح');
            } catch (error) {
              console.error('Error deleting field:', error);
              Alert.alert('خطأ', 'حدث خطأ في حذف الحقل');
            }
          },
        },
      ]
    );
  };

  const getFieldTypeText = (type: string) => {
    switch (type) {
      case 'text': return 'نص';
      case 'number': return 'رقم';
      case 'phone': return 'رقم هاتف';
      case 'boolean': return 'نعم/لا';
      case 'select': return 'اختيار من قائمة';
      default: return type;
    }
  };

  const renderFieldCard = (field: ResaleField) => (
    <View key={field.id} style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldLabel}>{field.field_label}</Text>
          <Text style={styles.fieldType}>{getFieldTypeText(field.field_type)}</Text>
          {field.field_type === 'select' && field.field_options && (
            <Text style={styles.fieldOptions}>
              الخيارات: {field.field_options.join(', ')}
            </Text>
          )}
        </View>
        <View style={styles.fieldActions}>
          <Switch
            value={field.is_active}
            onValueChange={(value) => toggleFieldActive(field.id, value)}
            trackColor={{ false: '#D1D5DB', true: '#3B619F' }}
            thumbColor={field.is_active ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>
      
      <View style={styles.fieldFooter}>
        <View style={styles.fieldMeta}>
          <Text style={styles.fieldName}>اسم الحقل: {field.field_name}</Text>
          {field.is_required && (
            <Text style={styles.requiredBadge}>مطلوب</Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/settings/add-resale-field?id=${field.id}`)}
          >
            <Edit size={16} color="#3B619F" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteField(field.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="حقول الريسيل" />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.description}>
            إدارة الحقول المخصصة للوحدات المعاد بيعها (ريسيل)
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/settings/add-resale-field')}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>إضافة حقل جديد</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.fieldsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
          ) : fields.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>لا توجد حقول ريسيل</Text>
              <Text style={styles.emptySubtitle}>
                اضغط على "إضافة حقل جديد" لإنشاء حقل مخصص للوحدات المعاد بيعها
              </Text>
            </View>
          ) : (
            fields.map(renderFieldCard)
          )}
        </ScrollView>
      </View>
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
  headerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 16,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#3B619F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fieldsList: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },
  fieldType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  fieldOptions: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    lineHeight: 16,
  },
  fieldActions: {
    marginLeft: 16,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fieldMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#EBF4FF',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
});