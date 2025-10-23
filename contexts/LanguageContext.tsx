import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  ar: {
    // Header
    'app.title': 'عقارات',
    'header.share': 'مشاركة',
    'header.edit': 'تحرير',
    'header.save': 'حفظ',
    
    // Dashboard Cards
    'dashboard.addArea': 'إضافة منطقة',
    'dashboard.addNeighborhood': 'إضافة حي',
    'dashboard.addDeveloper': 'إضافة مطور',
    'dashboard.addProject': 'إضافة مشروع',
    'dashboard.addUnit': 'إضافة وحدة',
    'dashboard.developerPrices': 'أسعار المطورين',
    'dashboard.projectPrices': 'أسعار المشاريع',
    'dashboard.priceCalculator': 'الحاسبة',
    'dashboard.viewProjects': ' المشاريع',
    'dashboard.viewDevelopers': ' المطورين',
    'dashboard.viewAreas': ' المناطق',
    'dashboard.viewNeighborhoods': 'عرض الأحياء',
    'dashboard.viewUnits': ' الوحدات',
    'dashboard.settings': 'الإعدادات',
    'dashboard.compare': 'مقارنة المشاريع',
    'dashboard.editMode': 'اسحب البطاقات لإعادة ترتيبها',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.theme': 'المظهر',
    'settings.arabic': 'العربية',
    'settings.english': 'الإنجليزية',
    'settings.light': 'فاتح',
    'settings.dark': 'داكن',
    'settings.system': 'النظام',
    
    // Comparison
    'comparison.title': 'مقارنة',
    'comparison.selectType': 'اختر نوع المقارنة',
    'comparison.selectTypeDesc': 'اختر ما تريد مقارنته من المشاريع أو الوحدات',
    'comparison.compareProjects': 'مقارنة المشاريع',
    'comparison.compareProjectsDesc': 'قارن بين المشاريع المختلفة من حيث الأسعار والمميزات والمواصفات',
    'comparison.compareUnits': 'مقارنة الوحدات',
    'comparison.compareUnitsDesc': 'قارن بين الوحدات المختلفة من حيث المساحة والسعر والمواصفات',
    'comparison.howItWorks': 'كيف تعمل المقارنة؟',
    'comparison.step1': 'اختر نوع المقارنة (مشاريع أو وحدات)',
    'comparison.step2': 'اختر العناصر التي تريد مقارنتها (حتى 3 عناصر)',
    'comparison.step3': 'شاهد المقارنة التفصيلية بين العناصر المختارة',
    'comparison.projects': 'مشاريع',
    'comparison.units': 'وحدات',
    'comparison.selectItems': 'اختر العناصر للمقارنة',
    'comparison.compare': 'مقارنة',
    'comparison.noItems': 'لا توجد عناصر للمقارنة',
    'comparison.selectAtLeast': 'يرجى اختيار عنصرين على الأقل للمقارنة',
    'comparison.result': 'نتيجة المقارنة',
    'comparison.property': 'الخاصية',
    'comparison.yes': '✓',
    'comparison.no': '✗',
    
    // Calculator
    'calculator.title': 'حاسبة التقسيط',
    'calculator.totalAmount': 'المبلغ الإجمالي',
    'calculator.downPayment': 'المقدم',
    'calculator.installmentType': 'نوع التقسيط',
    'calculator.years': 'عدد السنوات',
    'calculator.monthly': 'شهري',
    'calculator.quarterly': 'ربع سنوي',
    'calculator.semiAnnual': 'نصف سنوي',
    'calculator.annual': 'سنوي',
    'calculator.calculate': 'احسب',
    'calculator.results': 'النتائج',
    'calculator.remainingAmount': 'المبلغ المتبقي',
    'calculator.installmentAmount': 'قيمة القسط',
    'calculator.totalInstallments': 'عدد الأقساط',
    'calculator.totalInterest': 'إجمالي الفوائد',
    'calculator.enterAmount': 'أدخل المبلغ',
    'calculator.enterDownPayment': 'أدخل المقدم',
    'calculator.selectType': 'اختر نوع التقسيط',
    'calculator.enterYears': 'أدخل عدد السنوات',
    
    // Developer Details
    'developer.title': 'تفاصيل المطور',
    'developer.loading': 'جاري التحميل...',
    'developer.notFound': 'لم يتم العثور على المطور',
    'developer.establishedYear': 'سنة التأسيس',
    'developer.projects': 'مشروع',
    'developer.availableProjects': 'مشروع متاح',
    'developer.contactInfo': 'معلومات التواصل',
    'developer.phone': 'الهاتف',
    'developer.email': 'البريد الإلكتروني',
    'developer.website': 'الموقع الإلكتروني',
    'developer.address': 'العنوان',
    'developer.projectsSection': 'المشاريع',
    'developer.callNow': 'اتصل الآن',
    'developer.whatsapp': 'واتساب',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.language': 'اللغة',
    'settings.theme': 'المظهر',
    'settings.arabic': 'العربية',
    'settings.english': 'English',
    'settings.light': 'فاتح',
    'settings.dark': 'داكن',
    'settings.system': 'النظام',
    
    // Common
    'common.back': 'رجوع',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.warning': 'تحذير',
    'common.info': 'معلومات',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
  },
  en: {
    // Header
    'app.title': 'Real Estate',
    'header.share': 'Share',
    'header.edit': 'Edit',
    'header.save': 'Save',
    
    // Dashboard Cards
    'dashboard.addArea': 'Add Area',
    'dashboard.addNeighborhood': 'Add Neighborhood',
    'dashboard.addDeveloper': 'Add Developer',
    'dashboard.addProject': 'Add Project',
    'dashboard.addUnit': 'Add Unit',
    'dashboard.developerPrices': 'Developer Prices',
    'dashboard.projectPrices': 'Project Prices',
    'dashboard.priceCalculator': 'Price Calculator',
    'dashboard.viewProjects': 'View Projects',
    'dashboard.viewDevelopers': 'View Developers',
    'dashboard.viewAreas': 'View Areas',
    'dashboard.viewNeighborhoods': 'View Neighborhoods',
    'dashboard.viewUnits': 'View Units',
    'dashboard.settings': 'Settings',
    'dashboard.compare': 'Compare Projects',
    'dashboard.editMode': 'Drag cards to reorder them',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.arabic': 'العربية',
    'settings.english': 'English',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',
    
    // Calculator
    'calculator.title': 'Installment Calculator',
    'calculator.totalAmount': 'Total Amount',
    'calculator.downPayment': 'Down Payment',
    'calculator.installmentType': 'Installment Type',
    'calculator.years': 'Years',
    'calculator.monthly': 'Monthly',
    'calculator.quarterly': 'Quarterly',
    'calculator.semiAnnual': 'Semi-Annual',
    'calculator.annual': 'Annual',
    'calculator.calculate': 'Calculate',
    'calculator.results': 'Calculation Results',
    'calculator.remainingAmount': 'Remaining Amount',
    'calculator.totalInstallments': 'Total Installments',
    'calculator.installmentAmount': 'Installment Amount',
    
    // Comparison
    'comparison.title': 'Comparison',
    'comparison.selectType': 'Select Comparison Type',
    'comparison.selectTypeDesc': 'Choose what you want to compare from projects or units',
    'comparison.compareProjects': 'Compare Projects',
    'comparison.compareProjectsDesc': 'Compare different projects in terms of prices, features and specifications',
    'comparison.compareUnits': 'Compare Units',
    'comparison.compareUnitsDesc': 'Compare different units in terms of area, price and specifications',
    'comparison.howItWorks': 'How does comparison work?',
    'comparison.step1': 'Choose comparison type (projects or units)',
    'comparison.step2': 'Select items you want to compare (up to 3 items)',
    'comparison.step3': 'View detailed comparison between selected items',
    'comparison.projects': 'Projects',
    'comparison.units': 'Units',
    'comparison.selectItems': 'Select Items to Compare',
    'comparison.compare': 'Compare',
    'comparison.noItems': 'No items to compare',
    'comparison.selectAtLeast': 'Please select at least two items to compare',
    'comparison.result': 'Comparison Result',
    'comparison.property': 'Property',
    'comparison.yes': '✓',
    'comparison.no': '✗',
    
    // Calculator
    'calculator.title': 'Installment Calculator',
    'calculator.totalAmount': 'Total Amount',
    'calculator.downPayment': 'Down Payment',
    'calculator.installmentType': 'Installment Type',
    'calculator.years': 'Number of Years',
    'calculator.monthly': 'Monthly',
    'calculator.quarterly': 'Quarterly',
    'calculator.semiAnnual': 'Semi-Annual',
    'calculator.annual': 'Annual',
    'calculator.calculate': 'Calculate',
    'calculator.results': 'Results',
    'calculator.remainingAmount': 'Remaining Amount',
    'calculator.installmentAmount': 'Installment Amount',
    'calculator.totalInstallments': 'Total Installments',
    'calculator.totalInterest': 'Total Interest',
    'calculator.enterAmount': 'Enter Amount',
    'calculator.enterDownPayment': 'Enter Down Payment',
    'calculator.selectType': 'Select Installment Type',
    'calculator.enterYears': 'Enter Number of Years',
    
    // Developer Details
    'developer.title': 'Developer Details',
    'developer.loading': 'Loading...',
    'developer.notFound': 'Developer not found',
    'developer.establishedYear': 'Established Year',
    'developer.projects': 'Projects',
    'developer.availableProjects': 'Available Projects',
    'developer.contactInfo': 'Contact Information',
    'developer.phone': 'Phone',
    'developer.email': 'Email',
    'developer.website': 'Website',
    'developer.address': 'Address',
    'developer.projectsSection': 'Projects',
    'developer.callNow': 'Call Now',
    'developer.whatsapp': 'WhatsApp',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.arabic': 'العربية',
    'settings.english': 'English',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',
    
    // Common
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};