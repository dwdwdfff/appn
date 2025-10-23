import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface UnitType {
  id: string;
  name: string;
  created_at: string;
}

export default function UnitTypesManagement() {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<UnitType | null>(null);

  useEffect(() => {
    fetchUnitTypes();
  }, []);

  const fetchUnitTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('unit_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setUnitTypes(data || []);
    } catch (error) {
      console.error('Error fetching unit types:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل أنواع الوحدات');
    } finally {
      setLoading(false);
    }
  };

  const addUnitType = async () => {
    if (!newTypeName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم نوع الوحدة');
      return;
    }

    try {
      const { error } = await supabase
        .from('unit_types')
        .insert([{ name: newTypeName.trim() }]);

      if (error) throw error;

      setNewTypeName('');
      setShowAddForm(false);
      fetchUnitTypes();
      Alert.alert('نجح', 'تم إضافة نوع الوحدة بنجاح');
    } catch (error: any) {
      console.error('Error adding unit type:', error);
      if (error.code === '23505') {
        Alert.alert('خطأ', 'هذا النوع موجود بالفعل');
      } else {
        Alert.alert('خطأ', 'حدث خطأ في إضافة نوع الوحدة');
      }
    }
  };

  const updateUnitType = async () => {
    if (!editingType || !newTypeName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم نوع الوحدة');
      return;
    }

    try {
      const { error } = await supabase
        .from('unit_types')
        .update({ name: newTypeName.trim() })
        .eq('id', editingType.id);

      if (error) throw error;

      setNewTypeName('');
      setEditingType(null);
      fetchUnitTypes();
      Alert.alert('نجح', 'تم تحديث نوع الوحدة بنجاح');
    } catch (error: any) {
      console.error('Error updating unit type:', error);
      if (error.code === '23505') {
        Alert.alert('خطأ', 'هذا النوع موجود بالفعل');
      } else {
        Alert.alert('خطأ', 'حدث خطأ في تحديث نوع الوحدة');
      }
    }
  };

  const deleteUnitType = async (unitType: UnitType) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف نوع الوحدة "${unitType.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('unit_types')
                .delete()
                .eq('id', unitType.id);

              if (error) throw error;

              fetchUnitTypes();
              Alert.alert('نجح', 'تم حذف نوع الوحدة بنجاح');
            } catch (error: any) {
              console.error('Error deleting unit type:', error);
              if (error.code === '23503') {
                Alert.alert('خطأ', 'لا يمكن حذف هذا النوع لأنه مرتبط بوحدات موجودة');
              } else {
                Alert.alert('خطأ', 'حدث خطأ في حذف نوع الوحدة');
              }
            }
          }
        }
      ]
    );
  };

  const startEdit = (unitType: UnitType) => {
    setEditingType(unitType);
    setNewTypeName(unitType.name);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingType(null);
    setNewTypeName('');
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4 p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">إدارة أنواع الوحدات</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowAddForm(true)}
            className="bg-white/20 p-2 rounded-lg"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Add/Edit Form */}
        {showAddForm && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {editingType ? 'تعديل نوع الوحدة' : 'إضافة نوع وحدة جديد'}
            </Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">اسم نوع الوحدة *</Text>
              <TextInput
                value={newTypeName}
                onChangeText={setNewTypeName}
                placeholder="مثال: شقة، فيلا، دوبلكس..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-right"
                style={{ textAlign: 'right' }}
              />
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={editingType ? updateUnitType : addUnitType}
                className="flex-1 bg-blue-600 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  {editingType ? 'تحديث' : 'إضافة'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={cancelEdit}
                className="flex-1 bg-gray-300 py-3 rounded-lg"
              >
                <Text className="text-gray-700 text-center font-semibold">إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Unit Types List */}
        <View className="bg-white rounded-lg shadow-sm border border-gray-200">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-900">
              أنواع الوحدات ({unitTypes.length})
            </Text>
          </View>

          {unitTypes.length === 0 ? (
            <View className="p-8 items-center">
              <Ionicons name="home-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 text-center mt-4">
                لا توجد أنواع وحدات مضافة بعد
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(true)}
                className="bg-blue-600 px-6 py-2 rounded-lg mt-4"
              >
                <Text className="text-white font-semibold">إضافة النوع الأول</Text>
              </TouchableOpacity>
            </View>
          ) : (
            unitTypes.map((unitType, index) => (
              <View
                key={unitType.id}
                className={`p-4 flex-row items-center justify-between ${
                  index < unitTypes.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="flex-1">
                  <Text className="text-gray-900 text-lg font-semibold">
                    {unitType.name}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1">
                    تم الإنشاء: {new Date(unitType.created_at).toLocaleDateString('ar-SA')}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => startEdit(unitType)}
                    className="bg-blue-100 p-2 rounded-lg"
                  >
                    <Ionicons name="pencil" size={16} color="#2563eb" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => deleteUnitType(unitType)}
                    className="bg-red-100 p-2 rounded-lg"
                  >
                    <Ionicons name="trash" size={16} color="#dc2626" />
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