import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { DataCategoryItem } from './DataCategoryItem';

export interface DataCategory {
  id: string;
  title: string;
  iconName: string;
  latestValue?: string;
  measurementTypeId?: number;
  unit?: string;
}

interface DataCategoryListProps {
  categories: DataCategory[];
  onSelectCategory?: (category: DataCategory) => void;
  title?: string;
}

export function DataCategoryList({ categories, onSelectCategory, title }: DataCategoryListProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.listContainer}>
        {categories.map((category) => (
          <DataCategoryItem
            key={category.id}
            title={category.title}
            latestValue={category.latestValue}
            iconName={category.iconName as any}
            onPress={() => onSelectCategory?.(category)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
    paddingHorizontal: 4,
  },
  listContainer: {
    width: '100%',
  },
});
