import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Calculator, DollarSign, Calendar, TrendingUp } from 'lucide-react-native';

export default function InstallmentCalculator() {
  const [downPayment, setDownPayment] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [years, setYears] = useState(1);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const paymentOptions = [
    { key: 'monthly', label: 'شهري', multiplier: 12 },
    { key: 'quarterly', label: 'ربع سنوي', multiplier: 4 },
    { key: 'semiannual', label: 'نصف سنوي', multiplier: 2 },
    { key: 'annual', label: 'سنوي', multiplier: 1 },
  ];

  const yearOptions = Array.from({ length: 15 }, (_, i) => i + 1);

  const calculateTotal = () => {
    const downPaymentNum = parseFloat(downPayment) || 0;
    const installmentNum = parseFloat(installmentAmount) || 0;
    const discountNum = parseFloat(discountPercentage) || 0;
    const selectedOption = paymentOptions.find(option => option.key === paymentFrequency);
    const totalInstallments = years * (selectedOption?.multiplier || 12);
    const totalInstallmentAmount = installmentNum * totalInstallments;
    const subtotal = downPaymentNum + totalInstallmentAmount;
    const discountAmount = (subtotal * discountNum) / 100;
    const total = subtotal - discountAmount;
    setTotalPrice(total);
  };

  useEffect(() => {
    calculateTotal();
  }, [downPayment, installmentAmount, paymentFrequency, years, discountPercentage]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return `${formatNumber(num)} ج.م.`;
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Calculator size={28} color="#ffffff" />
          <Text style={styles.headerTitle}>حاسبة التقسيط</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Down Payment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#3B619F" />
            <Text style={styles.sectionTitle}>المقدم</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="أدخل قيمة المقدم"
              value={downPayment}
              onChangeText={setDownPayment}
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.currency}>جنيه</Text>
          </View>
        </View>

        {/* Installment Amount Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#3B619F" />
            <Text style={styles.sectionTitle}>قيمة القسط</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="أدخل قيمة القسط"
              value={installmentAmount}
              onChangeText={setInstallmentAmount}
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.currency}>جنيه</Text>
          </View>
        </View>

        {/* Discount Percentage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#3B619F" />
            <Text style={styles.sectionTitle}>نسبة الخصم</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="أدخل نسبة الخصم"
              value={discountPercentage}
              onChangeText={setDiscountPercentage}
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.currency}>%</Text>
          </View>
        </View>

        {/* Payment Frequency Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#3B619F" />
            <Text style={styles.sectionTitle}>نوع التقسيط</Text>
          </View>
          <View style={styles.optionsGrid}>
            {paymentOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  paymentFrequency === option.key && styles.selectedOption,
                ]}
                onPress={() => setPaymentFrequency(option.key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    paymentFrequency === option.key && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Years Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#3B619F" />
            <Text style={styles.sectionTitle}>عدد سنين التقسيط</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearsContainer}>
            {yearOptions.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  years === year && styles.selectedYear,
                ]}
                onPress={() => setYears(year)}
              >
                <Text
                  style={[
                    styles.yearText,
                    years === year && styles.selectedYearText,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Total Price Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalHeader}>
            <TrendingUp size={24} color="#ffffff" />
            <Text style={styles.totalTitle}>إجمالي السعر</Text>
          </View>
          <Text style={styles.totalAmount}>{formatCurrency(totalPrice)}</Text>
          
          {/* Breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>المقدم:</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency(parseFloat(downPayment) || 0)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>إجمالي الأقساط:</Text>
              <Text style={styles.breakdownValue}>
                {formatCurrency((parseFloat(installmentAmount) || 0) * years * (paymentOptions.find(opt => opt.key === paymentFrequency)?.multiplier || 12))}
              </Text>
            </View>
            {parseFloat(discountPercentage) > 0 && (
              <>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>المجموع قبل الخصم:</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency((parseFloat(downPayment) || 0) + (parseFloat(installmentAmount) || 0) * years * (paymentOptions.find(opt => opt.key === paymentFrequency)?.multiplier || 12))}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, {color: '#10B981'}]}>الخصم ({discountPercentage}%):</Text>
                  <Text style={[styles.breakdownValue, {color: '#10B981'}]}>
                    -{formatCurrency(((parseFloat(downPayment) || 0) + (parseFloat(installmentAmount) || 0) * years * (paymentOptions.find(opt => opt.key === paymentFrequency)?.multiplier || 12)) * (parseFloat(discountPercentage) || 0) / 100)}
                  </Text>
                </View>
              </>
            )}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>عدد الأقساط:</Text>
              <Text style={styles.breakdownValue}>
                {formatNumber(years * (paymentOptions.find(opt => opt.key === paymentFrequency)?.multiplier || 12))} قسط
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3B619F',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#1E293B',
    textAlign: 'right',
  },
  currency: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedOption: {
    backgroundColor: '#3B619F',
    borderColor: '#3B619F',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  yearsContainer: {
    flexDirection: 'row',
  },
  yearButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedYear: {
    backgroundColor: '#3B619F',
    borderColor: '#3B619F',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedYearText: {
    color: '#ffffff',
  },
  totalSection: {
    backgroundColor: '#3B619F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  totalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  breakdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  spacer: {
    height: 20,
  },
});