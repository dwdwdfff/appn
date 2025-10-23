import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
// Using TouchableOpacity with modal for picker functionality
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

interface Area {
  id: string;
  name: string;
  city: string;
}

export default function AddNeighborhoodScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل المناطق');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الحي');
      return;
    }

    if (!selectedAreaId) {
      Alert.alert('خطأ', 'يرجى اختيار المنطقة');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('neighborhoods')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            area_id: selectedAreaId,
          },
        ]);

      if (error) throw error;

      Alert.alert('نجح', 'تم إضافة الحي بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error adding neighborhood:', error);
      Alert.alert('خطأ', 'حدث خطأ في إضافة الحي');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="إضافة حي جديد" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الحي *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="أدخل اسم الحي"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المنطقة *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                Alert.alert(
                  'اختر المنطقة',
                  '',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    ...areas.map((area) => ({
                      text: `${area.name} - ${area.city}`,
                      onPress: () => setSelectedAreaId(area.id),
                    })),
                  ]
                );
              }}
            >
              <Text style={styles.pickerButtonText}>
                {selectedAreaId
                  ? areas.find((a) => a.id === selectedAreaId)?.name + ' - ' + areas.find((a) => a.id === selectedAreaId)?.city
                  : 'اختر المنطقة'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="أدخل وصف الحي (اختياري)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'جاري الإضافة...' : 'إضافة الحي'}
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
  textArea: {
    height: 100,
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