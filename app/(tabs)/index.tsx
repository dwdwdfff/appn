import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Building2, MapPin, Plus, List, Users, Navigation, Home, Calculator, Settings, GitCompare, Edit3, Save, X, GripVertical } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [longPressedCard, setLongPressedCard] = useState<string | null>(null);
  const [cardAnimations, setCardAnimations] = useState<{[key: string]: Animated.Value}>({});

  const getDefaultCards = () => [
    // الأزرار الأساسية للعرض
    {
      id: 'view-projects',
      titleKey: 'dashboard.viewProjects',
      icon: List,
      route: '/(tabs)/projects',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
    },
    {
      id: 'view-developers',
      titleKey: 'dashboard.viewDevelopers',
      icon: Users,
      route: '/developers',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
    },
    {
      id: 'view-areas',
      titleKey: 'dashboard.viewAreas',
      icon: Navigation,
      route: '/areas',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
    },
    // الحاسبة
    {
      id: 'price-calculator',
      titleKey: 'dashboard.priceCalculator',
      icon: Calculator,
      route: '/(tabs)/calculator',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
    },
    {
      id: 'view-units',
      titleKey: 'dashboard.viewUnits',
      icon: Home,
      route: '/units',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
    },


    // الإعدادات
    {
      id: 'settings',
      titleKey: 'dashboard.settings',
      icon: Settings,
      route: '/settings',
      color: '#3B82F6',
      bgColor: '#FFFFFF',
    },
  ];

  useEffect(() => {
    loadCardOrder();
    // إنشاء أنيميشن للبطاقات عند التحميل
    const animations = {};
    getDefaultCards().forEach((card, index) => {
      const animValue = new Animated.Value(0);
      animations[card.id] = animValue;
      
      // تأخير الأنيميشن لكل بطاقة
      setTimeout(() => {
        Animated.spring(animValue, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, index * 100);
    });
    setCardAnimations(animations);
  }, []);



  const loadCardOrder = async () => {
    try {
      const defaultCards = getDefaultCards();
      const savedOrder = await AsyncStorage.getItem('cardOrder');
      if (savedOrder) {
        const orderIds = JSON.parse(savedOrder);
        const orderedCards = orderIds.map((id: string) => 
          defaultCards.find(card => card.id === id)
        ).filter(Boolean);
        
        const newCards = defaultCards.filter(card => 
          !orderIds.includes(card.id)
        );
        
        setCards([...orderedCards, ...newCards]);
      } else {
        setCards(defaultCards);
      }
    } catch (error) {
      console.error('Error loading card order:', error);
      setCards(getDefaultCards());
    }
  };

  const saveCardOrder = async (newCards: any[]) => {
    try {
      const orderIds = newCards.map(card => card.id);
      await AsyncStorage.setItem('cardOrder', JSON.stringify(orderIds));
    } catch (error) {
      console.error('Error saving card order:', error);
    }
  };

  const moveCardUp = (index: number) => {
    if (index === 0) return; // لا يمكن تحريك أول عنصر لأعلى
    
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[index - 1];
    newCards[index - 1] = temp;
    
    setCards(newCards);
    saveCardOrder(newCards);
  };

  const moveCardDown = (index: number) => {
    if (index === cards.length - 1) return; // لا يمكن تحريك آخر عنصر لأسفل
    
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[index + 1];
    newCards[index + 1] = temp;
    
    setCards(newCards);
    saveCardOrder(newCards);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setLongPressedCard(null);
  };

  const resetCardOrder = async () => {
    Alert.alert(
      t('dashboard.resetOrder'),
      t('dashboard.resetOrderConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('cardOrder');
            setCards(getDefaultCards());
          },
        },
      ]
    );
  };



  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 50) / 3;



  const handleCardPress = (route: string, cardId: string) => {
    if (isEditMode) return;
    
    const animation = cardAnimations[cardId];
    if (animation) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.85,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(animation, {
          toValue: 1.05,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.push(route as any);
      });
    } else {
      router.push(route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.modernHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
          {isEditMode ? (
            <Save size={20} color="#FFFFFF" />
          ) : (
            <Edit3 size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('app.title')}
        </Text>
        
        <View style={styles.headerActions}>
          {isEditMode ? (
            <TouchableOpacity style={styles.resetButton} onPress={resetCardOrder}>
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.compareButton} onPress={() => router.push('/comparison')}>
              <GitCompare size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isEditMode && (
        <View style={[styles.editModeNotice, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.editModeText, { color: colors.text }]}>
            {t('dashboard.editMode')}
          </Text>
          <Text style={[styles.editModeSubtext, { color: colors.textSecondary }]}>
            {t('dashboard.editInstructionsSimple')}
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.modernGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {cards.map((card, index) => {
            const animationValue = cardAnimations[card.id] || new Animated.Value(1);
            return (
              <Animated.View 
                key={card.id} 
                style={[
                  styles.modernCardWrapper, 
                  { 
                    width: cardWidth,
                    opacity: animationValue,
                    transform: [
                      {
                        scale: animationValue.interpolate({
                          inputRange: [0, 0.8, 1],
                          outputRange: [0.3, 0.95, 1],
                        }),
                      },
                      {
                        translateY: animationValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }
                ]}>
                <TouchableOpacity
                  style={[
                    styles.modernCard, 
                    { 
                      borderColor: isEditMode ? '#3B82F6' : '#E2E8F0',
                      borderWidth: 2,
                      shadowColor: '#3B82F6',
                    }
                  ]}
                  onPress={() => handleCardPress(card.route, card.id)}
                  activeOpacity={0.8}
                  disabled={isEditMode}>
                  <View style={[styles.modernIconContainer, { backgroundColor: '#3B82F6' + '15' }]}>
                    <card.icon size={36} color="#3B82F6" strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.modernCardTitle, { color: '#1E293B' }]}>
                    {t(card.titleKey)}
                  </Text>
                
                {isEditMode && (
                  <View style={styles.moveButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.moveButton, styles.moveUpButton]}
                      onPress={() => moveCardUp(index)}
                      disabled={index === 0}>
                      <Text style={styles.moveButtonText}>↑</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.moveButton, styles.moveDownButton]}
                      onPress={() => moveCardDown(index)}
                      disabled={index === cards.length - 1}>
                      <Text style={styles.moveButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 16,
  },
  editModeNotice: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
  },
  editModeText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  editModeSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  modernGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  modernCardWrapper: {
    marginBottom: 16,
  },
  modernCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    backgroundColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  modernIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modernCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  moveButtonsContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'column',
    gap: 4,
  },
  moveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  moveUpButton: {
    opacity: 0.8,
  },
  moveDownButton: {
    opacity: 0.8,
  },
  moveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});