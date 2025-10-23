import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { Colors, Theme } from '@/constants/Colors';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function Header({ 
  title, 
  showBackButton = true, 
  onBackPress,
  rightComponent 
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {rightComponent}
      </View>
      
      <View style={styles.centerSection}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {showBackButton && (
          <BackButton onPress={onBackPress} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.xl,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Colors.surface,
    textAlign: 'center',
  },
});