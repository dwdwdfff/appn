import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { MapPin, Plus } from 'lucide-react-native';
import { supabase, Area } from '@/lib/supabase';
import BackButton from '@/components/BackButton';

export default function AreasScreen() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [countAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(countAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(countAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [areas.length]);

  async function loadAreas() {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  }

  const { width } = Dimensions.get('window');
  const CARD_MARGIN = 8;
  const CARDS_PER_ROW = 4;
  const CARD_WIDTH = (width - (CARD_MARGIN * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

  const renderArea = ({ item }: { item: Area }) => (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }]}
      onPress={() => {
        // Navigate to area details if needed
        console.log('Area selected:', item.name);
      }}
      activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MapPin size={24} color="#3b82f6" />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        {item.city && (
          <Text style={styles.cityText} numberOfLines={1}>
            {item.city}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <BackButton />
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>المناطق</Text>
            </View>
            <View style={styles.headerRight}>
            </View>
          </View>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.modernHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BackButton />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>المناطق</Text>
            <Animated.View
              style={[
                styles.countBadge,
                {
                  opacity: countAnim,
                  transform: [{
                    scale: countAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.countText}>{areas.length}</Text>
            </Animated.View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/areas/add')}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Header Spacing */}
      <View style={styles.headerSpacing} />

      {areas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا توجد مناطق</Text>
          <Text style={styles.emptySubtext}>ابدأ بإضافة أول منطقة</Text>
        </View>
      ) : (
        <FlatList
          data={areas}
          renderItem={renderArea}
          keyExtractor={(item) => item.id}
          numColumns={CARDS_PER_ROW}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: CARD_MARGIN }} />}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  modernHeader: {
    backgroundColor: '#3b82f6',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    flex: 1,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  headerSpacing: {
    height: 30,
  },
  listContainer: {
    padding: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
    minHeight: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});
