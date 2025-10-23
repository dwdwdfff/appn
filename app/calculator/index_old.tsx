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
import BackButton from '@/components/BackButton';

type PaymentType = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

export default function PriceCalculatorScreen() {
  const [totalPrice, setTotalPrice] = useState('7000000');
  const [downPayment, setDownPayment] = useState('200000');
  const [paymentType, setPaymentType] = useState<PaymentType>('quarterly');
  const [installmentAmount, setInstallmentAmount] = useState('400000');
  const [years, setYears] = useState('10');

  // Calculated values
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [calculatedInstallment, setCalculatedInstallment] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [interestAmount, setInterestAmount] = useState(0);

  useEffect(() => {
    calculateInstallments();
  }, [totalPrice, downPayment, paymentType, installmentAmount, years]);

  const calculateInstallments = () => {
    const priceNum = parseFloat(totalPrice) || 0;
    const downPaymentNum = parseFloat(downPayment) || 0;
    const installmentNum = parseFloat(installmentAmount) || 0;
    const yearsNum = parseInt(years) || 10;

    const remaining = priceNum - downPaymentNum;
    setRemainingAmount(remaining);

    if (remaining <= 0 || yearsNum <= 0) {
      setTotalInstallments(0);
      setCalculatedInstallment(0);
      setTotalAmountPaid(priceNum);
      setInterestAmount(0);
      return;
    }

    let installmentsPerYear = 1;
    switch (paymentType) {
      case 'monthly':
        installmentsPerYear = 12;
        break;
      case 'quarterly':
        installmentsPerYear = 4;
        break;
      case 'semi-annual':
        installmentsPerYear = 2;
        break;
      case 'annual':
        installmentsPerYear = 1;
        break;
    }

    const totalInstallmentsCount = yearsNum * installmentsPerYear;
    setTotalInstallments(totalInstallmentsCount);

    // Calculate installment based on remaining amount
    const calculatedInstallmentAmount = remaining / totalInstallmentsCount;
    setCalculatedInstallment(calculatedInstallmentAmount);

    // If user entered custom installment amount, calculate based on that
    if (installmentNum > 0) {
      const totalPaid = downPaymentNum + (installmentNum * totalInstallmentsCount);
      setTotalAmountPaid(totalPaid);
      setInterestAmount(totalPaid - priceNum);
    } else {
      setTotalAmountPaid(priceNum);
      setInterestAmount(0);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(price));
  };

  const getPaymentTypeText = (type: PaymentType) => {
    switch (type) {
      case 'monthly':
        return 'شهري';
      case 'quarterly':
        return 'ربع سنوي';
      case 'semi-annual':
        return 'نصف سنوي';
      case 'annual':
        return 'سنوي';
    }
  };

  const getPaymentTypeIcon = (type: PaymentType) => {
    const isSelected = paymentType === type;
    const color = isSelected ? '#ffffff' : '#3B619F';
    
    switch (type) {
      case 'monthly':
        return <Calendar size={20} color={color} />;
      case 'quarterly':
        return <TrendingUp size={20} color={color} />;
      case 'semi-annual':
        return <CreditCard size={20} color={color} />;
      case 'annual':
        return <DollarSign size={20} color={color} />;
    }
  };

  const resetCalculator = () => {
    setTotalPrice('7000000');
    setDownPayment('200000');
    setPaymentType('quarterly');
    setInstallmentAmount('400000');
    setYears('10');
  };

  return (
    <View style={styles.container}>
      <Header title="حاسبة الأسعار" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calculatorCard}>
          <View style={styles.calculatorHeader}>
            <Text style={styles.calculatorTitle}>حاسبة التقسيط</Text>
            <Calculator size={24} color="#3B619F" />
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>إجمالي سعر الوحدة</Text>
              <TextInput
                style={styles.input}
                value={totalPrice}
                onChangeText={setTotalPrice}
                placeholder="7,000,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>المقدم</Text>
              <TextInput
                style={styles.input}
                value={downPayment}
                onChangeText={setDownPayment}
                placeholder="200,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع الدفع</Text>
              <View style={styles.paymentTypeContainer}>
                {(['monthly', 'quarterly', 'semi-annual', 'annual'] as PaymentType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.paymentTypeButton,
                      paymentType === type && styles.paymentTypeButtonActive,
                    ]}
                    onPress={() => setPaymentType(type)}
                  >
                    {getPaymentTypeIcon(type)}
                    <Text
                      style={[
                        styles.paymentTypeText,
                        paymentType === type && styles.paymentTypeTextActive,
                      ]}
                    >
                      {getPaymentTypeText(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>قيمة القسط {getPaymentTypeText(paymentType)}</Text>
              <TextInput
                style={styles.input}
                value={installmentAmount}
                onChangeText={setInstallmentAmount}
                placeholder="400,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>عدد السنوات</Text>
              <TextInput
                style={styles.input}
                value={years}
                onChangeText={setYears}
                placeholder="10"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>نتائج الحساب</Text>
            
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>المبلغ المتبقي</Text>
                <Text style={styles.resultValue}>{formatPrice(remainingAmount)} ج.م</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>عدد الأقساط</Text>
                <Text style={styles.resultValue}>{totalInstallments} قسط</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>القسط المحسوب</Text>
                <Text style={styles.resultValue}>{formatPrice(calculatedInstallment)} ج.م</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>إجمالي المدفوع</Text>
                <Text style={[styles.resultValue, styles.totalAmount]}>
                  {formatPrice(totalAmountPaid)} ج.م
                </Text>
              </View>
            </View>

            {interestAmount > 0 && (
              <View style={styles.interestSection}>
                <Text style={styles.interestLabel}>فوائد إضافية</Text>
                <Text style={styles.interestValue}>
                  +{formatPrice(interestAmount)} ج.م
                </Text>
              </View>
            )}
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>ملخص الدفع</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatPrice(parseFloat(downPayment) || 0)} ج.م</Text>
              <Text style={styles.summaryLabel}>مقدم</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatPrice(parseFloat(installmentAmount) || 0)} ج.م
              </Text>
              <Text style={styles.summaryLabel}>قسط {getPaymentTypeText(paymentType)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{years} سنوات</Text>
              <Text style={styles.summaryLabel}>مدة التقسيط</Text>
            </View>
            <View style={[styles.summaryItem, styles.totalSummary]}>
              <Text style={[styles.summaryValue, styles.totalSummaryValue]}>
                {formatPrice(totalAmountPaid)} ج.م
              </Text>
              <Text style={[styles.summaryLabel, styles.totalSummaryLabel]}>
                إجمالي سعر الوحدة
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
            <Text style={styles.resetButtonText}>إعادة تعيين</Text>
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
  calculatorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calculatorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  inputSection: {
    marginBottom: 24,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    textAlign: 'right',
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B619F',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  paymentTypeButtonActive: {
    backgroundColor: '#3B619F',
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B619F',
    marginLeft: 8,
  },
  paymentTypeTextActive: {
    color: '#ffffff',
  },
  resultsSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3B619F',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B619F',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  totalAmount: {
    color: '#3B619F',
    fontSize: 18,
  },
  interestSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
  },
  interestLabel: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  interestValue: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
  },
  summarySection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalSummary: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#3B619F',
    borderBottomWidth: 0,
  },
  totalSummaryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B619F',
  },
  totalSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B619F',
  },
  resetButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});