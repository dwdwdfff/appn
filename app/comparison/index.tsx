import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Home, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ComparisonTypeScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();

  const comparisonTypes = [
    {
      id: 'projects',
      title: 'مقارنة المشاريع',
      titleKey: 'comparison.compareProjects',
      description: 'قارن بين المشاريع المختلفة من حيث الأسعار والمميزات والمواصفات',
      descriptionKey: 'comparison.compareProjectsDesc',
      icon: Building2,
      route: '/comparison/projects',
      color: '#3B82F6',
    },
    {
      id: 'units',
      title: 'مقارنة الوحدات',
      titleKey: 'comparison.compareUnits',
      description: 'قارن بين الوحدات المختلفة من حيث المساحة والسعر والمواصفات',
      descriptionKey: 'comparison.compareUnitsDesc',
      icon: Home,
      route: '/comparison/units',
      color: '#10B981',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          {isRTL ? (
            <ArrowRight size={24} color="#FFFFFF" />
          ) : (
            <ArrowLeft size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('comparison.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            {t('comparison.selectType')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('comparison.selectTypeDesc')}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {comparisonTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => router.push(type.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
                <type.icon size={40} color={type.color} strokeWidth={2} />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t(type.titleKey)}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {t(type.descriptionKey)}
                </Text>
              </View>

              <View style={styles.arrowContainer}>
                {isRTL ? (
                  <ArrowLeft size={24} color={colors.textSecondary} />
                ) : (
                  <ArrowRight size={24} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {t('comparison.howItWorks')}
            </Text>
            <View style={styles.stepsList}>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                  {t('comparison.step1')}
                </Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                  {t('comparison.step2')}
                </Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                  {t('comparison.step3')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 16,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsList: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});