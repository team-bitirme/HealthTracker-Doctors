import React from 'react';
import { StyleSheet, Text, View, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DetailHeaderProps {
  title: string;
  onBackPress: () => void;
}

export function DetailHeader({ title, onBackPress }: DetailHeaderProps) {
  // Get status bar height for proper padding
  const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 20 }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="chevron-back" size={28} color="#333" />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    minHeight: 150,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
});

export { DetailHeader as DataEntryHeader }; 