import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface DataCategoryItemProps {
  title: string;
  latestValue?: string;
  iconName: React.ComponentProps<typeof FontAwesome>['name'];
  onPress?: () => void;
}

export function DataCategoryItem({ title, latestValue, iconName, onPress }: DataCategoryItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <FontAwesome name={iconName} size={24} color="#ff6b6b" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {latestValue && <Text style={styles.value}>{latestValue}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
});
