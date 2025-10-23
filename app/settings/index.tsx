import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Globe, 
  Moon, 
  Sun, 
  Monitor,
  ChevronRight,
  Check,
  Settings,
  Plus
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import BackButton from '@/components/BackButton';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { colors, theme, setTheme, isDark } = useTheme();

  const languageOptions = [
    { key: 'ar', label: t('settings.arabic'), flag: '🇸🇦' },
    { key: 'en', label: t('settings.english'), flag: '🇺🇸' },
  ];

  const themeOptions = [
    { key: 'light', label: t('settings.light'), icon: Sun },
    { key: 'dark', label: t('settings.dark'), icon: Moon },
    { key: 'system', label: t('settings.system'), icon: Monitor },
  ];

  const settingsOptions = [
    {
      id: 'unit-types',
      title: language === 'ar' ? 'أنواع الوحدات' : 'Unit Types',
      subtitle: language === 'ar' ? 'إدارة أنواع الوحدات المتاحة' : 'Manage available unit types',
      icon: Settings,
      route: '/settings/unit-types',
    },
    {
      id: 'dynamic-fields',
      title: language === 'ar' ? 'الحقول الديناميكية' : 'Dynamic Fields',
      subtitle: language === 'ar' ? 'إدارة الحقول المخصصة للمشاريع' : 'Manage custom project fields',
      icon: Plus,
      route: '/settings/dynamic-fields',
    },
    {
      id: 'resale-fields',
      title: language === 'ar' ? 'حقول الريسيل' : 'Resale Fields',
      subtitle: language === 'ar' ? 'إدارة الحقول المخصصة للوحدات المعاد بيعها' : 'Manage custom resale unit fields',
      icon: Settings,
      route: '/settings/resale-fields',
    },
    {
      id: 'project-fields',
      title: language === 'ar' ? 'حقول المشاريع' : 'Project Fields',
      subtitle: language === 'ar' ? 'تخصيص الحقول المعروضة في المشاريع' : 'Customize displayed project fields',
      icon: Settings,
      route: '/settings/project-fields',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <View style={[styles.modernHeader, { backgroundColor: colors.primary }]}>
        <BackButton color="#FFFFFF" />
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.language')}
            </Text>
          </View>

          {languageOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionItem,
                { borderBottomColor: colors.border }
              ]}
              onPress={() => setLanguage(option.key as 'ar' | 'en')}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.flagEmoji}>{option.flag}</Text>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
              </View>
              {language === option.key && (
                <Check size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            {isDark ? (
              <Moon size={24} color={colors.primary} />
            ) : (
              <Sun size={24} color={colors.primary} />
            )}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('settings.theme')}
            </Text>
          </View>

          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionItem,
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => setTheme(option.key as 'light' | 'dark' | 'system')}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.themeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <IconComponent size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                </View>
                {theme === option.key && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* App Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Settings size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {language === 'ar' ? 'إعدادات التطبيق' : 'App Settings'}
            </Text>
          </View>
          
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push(option.route as any)}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.themeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <option.icon size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.appInfo}>
            <Text style={[styles.appName, { color: colors.text }]}>
              {t('app.title')}
            </Text>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
              {language === 'ar' ? 'الإصدار 1.0.0' : 'Version 1.0.0'}
            </Text>
            <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
              {language === 'ar' 
                ? 'تطبيق إدارة العقارات الشامل'
                : 'Comprehensive Real Estate Management App'
              }
            </Text>
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

  // Modern Header
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  // Section Styles
  section: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Option Item Styles
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 24,
  },
  themeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // App Info Styles
  appInfo: {
    alignItems: 'center',
    padding: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});