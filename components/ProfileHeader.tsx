import React from 'react';
import { StyleSheet, Text, View, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export interface ProfileHeaderProps {
  title: string;
}

export function ProfileHeader({ title }: ProfileHeaderProps) {
  const router = useRouter();

  // Get status bar height for proper padding
  const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 20 }]}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f9f9f9',
    minHeight: 150,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
});
