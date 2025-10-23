import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Calculator, CreditCard, Calendar, TrendingUp, DollarSign, RotateCcw, ArrowRight } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import BackButton from '@/components/BackButton';

type PaymentType = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

const { width } = Dimensions.get('window');

export default function PriceCalculatorScreen() {
  const { t, language, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();
  
  const [totalPrice, setTotalPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [installmentYears, setInstallmentYears] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('monthly');
  const [results, setResults] = useState<any>(null);

  const paymentTypes = [
    { key: 'monthly', label: t('calculator.monthly'), multiplier: 12, icon: Calendar },
    { key: 'quarterly', label: t('calculator.quarterly'), multiplier: 4, icon: Calendar },
    { key: 'semi-annual', label: t('calculator.semiAnnual'), multiplier: 2, icon: Calendar },
    { key: 'annual', label: t('calculator.annual'), multiplier: 1, icon: Calendar },
  ];

  // Format number with English digits and commas
  const formatNumber = (num: number | string): string => {
    const numStr = num.toString().replace(/[^0-9]/g, (d) => '0123456789'.indexOf(d).toString());
    return parseFloat(numStr.replace(/,/g, '')).toLocaleString('en-US');
  };

  // Parse input removing commas and converting Arabic digits
  const parseNumber = (str: string): number => {
    const englishStr = str.replace(/[^0-9]/g, (d) => '0123456789'.indexOf(d).toString());
    return parseFloat(englishStr.replace(/,/g, '')) || 0;
  };

  // Handle input with formatting
  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = formatNumber(numericValue);
      setter(formatted);
    } else {
      setter('');
    }
  };

  const calculateInstallments = () => {
    const total = parseNumber(totalPrice);
    const down = parseNumber(downPayment);
    const years = parseNumber(installmentYears);

    if (!total || !down || !years) {
      setResults(null);
      return;
    }

    if (down >= total) {
      Alert.alert('خطأ', 'المقدم لا يمكن أن يكون أكبر من أو يساوي السعر الإجمالي');
      return;
    }

    const remainingAmount = total - down;
    const selectedType = paymentTypes.find(type => type.key === paymentType);
    const installmentsPerYear = selectedType?.multiplier || 12;
    const totalInstallments = years * installmentsPerYear;
    const installmentAmount = remainingAmount / totalInstallments;

    setResults({
      totalPrice: total,
      downPayment: down,
      remainingAmount,
      installmentAmount,
      totalInstallments,
      paymentType: selectedType?.label,
      years,
    });
  };

  const resetCalculator = () => {
    setTotalPrice('');
    setDownPayment('');
    setInstallmentYears('');
    setPaymentType('monthly');
    setResults(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <View style={[styles.modernHeader, { backgroundColor: colors.primary }]}>
        <BackButton color="#FFFFFF" />
        <View style={styles.headerContent}>
          <Calculator size={24} color="#FFFFFF" />
          <Text style={styles.headerTitle}>{t('calculator.title')}</Text>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
          <RotateCcw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {language === 'ar' ? 'بيانات العقار' : 'Property Details'}
          </Text>
          
          {/* Total Price */}
          <View style={styles.modernInputGroup}>
            <View style={styles.inputHeader}>
              <DollarSign size={20} color={colors.primary} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('calculator.totalAmount')}
              </Text>
            </View>
            <TextInput
              style={[styles.modernInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
                textAlign: isRTL ? 'right' : 'left'
              }]}
              value={totalPrice}
              onChangeText={(value) => handleNumberInput(value, setTotalPrice)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>
              {language === 'ar' ? 'جنيه مصري' : 'EGP'}
            </Text>
          </View>

          {/* Down Payment */}
          <View style={styles.modernInputGroup}>
            <View style={styles.inputHeader}>
              <CreditCard size={20} color={colors.secondary} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('calculator.downPayment')}
              </Text>
            </View>
            <TextInput
              style={[styles.modernInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
                textAlign: isRTL ? 'right' : 'left'
              }]}
              value={downPayment}
              onChangeText={(value) => handleNumberInput(value, setDownPayment)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>
              {language === 'ar' ? 'جنيه مصري' : 'EGP'}
            </Text>
          </View>

          {/* Payment Type */}
          <View style={styles.modernInputGroup}>
            <View style={styles.inputHeader}>
              <Calendar size={20} color={colors.warning} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('calculator.installmentType')}
              </Text>
            </View>
            <View style={styles.paymentTypeGrid}>
              {paymentTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.paymentTypeButton,
                    { 
                      backgroundColor: paymentType === type.key ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setPaymentType(type.key as PaymentType)}
                >
                  <type.icon 
                    size={16} 
                    color={paymentType === type.key ? "#FFFFFF" : colors.primary} 
                  />
                  <Text style={[
                    styles.paymentTypeText,
                    { 
                      color: paymentType === type.key ? "#FFFFFF" : colors.text
                    }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Years */}
          <View style={styles.modernInputGroup}>
            <View style={styles.inputHeader}>
              <TrendingUp size={20} color={colors.warning} />
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('calculator.years')}
              </Text>
            </View>
            <TextInput
              style={[styles.modernInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
                textAlign: isRTL ? 'right' : 'left'
              }]}
              value={installmentYears}
              onChangeText={(value) => handleNumberInput(value, setInstallmentYears)}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>
              {language === 'ar' ? 'سنة' : 'Years'}
            </Text>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity 
            style={[styles.calculateButton, { backgroundColor: colors.primary }]} 
            onPress={calculateInstallments}
          >
            <Calculator size={20} color="#FFFFFF" />
            <Text style={styles.calculateButtonText}>
              {t('calculator.calculate')}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {results && (
          <View style={[styles.resultsSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('calculator.results')}
            </Text>
            
            <View style={[styles.resultCard, { backgroundColor: colors.background }]}>
              <View style={styles.resultHeader}>
                <CreditCard size={24} color={colors.primary} />
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  {language === 'ar' ? 'تفاصيل التقسيط' : 'Installment Details'}
                </Text>
              </View>

              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('calculator.totalAmount')}
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatNumber(results.totalPrice)} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('calculator.downPayment')}
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatNumber(results.downPayment)} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('calculator.remainingAmount')}
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatNumber(results.remainingAmount)} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('calculator.installmentType')}
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {results.paymentType}
                  </Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('calculator.totalInstallments')}
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatNumber(results.totalInstallments)} {language === 'ar' ? 'قسط' : 'Installments'}
                  </Text>
                </View>

                <View style={[styles.resultItem, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.resultLabelHighlight, { color: colors.primary }]}>
                    {t('calculator.installmentAmount')}
                  </Text>
                  <Text style={[styles.resultValueHighlight, { color: colors.primary }]}>
                    {formatNumber(Math.round(results.installmentAmount))} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  content: {
    flex: 1,
  },

  // Input Section
  inputSection: {
    padding: 20,
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Modern Input Group
  modernInputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modernInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputUnit: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Payment Type Grid
  paymentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
    minWidth: (width - 80) / 2,
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Calculate Button
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calculateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Results Section
  resultsSection: {
    borderRadius: 16,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultGrid: {
    gap: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultLabelHighlight: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultValueHighlight: {
    fontSize: 18,
    fontWeight: '700',
  },
});