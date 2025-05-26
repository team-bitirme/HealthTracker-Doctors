import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  onInfoPress?: () => void;
}

export function ChatHeader({ title, subtitle, onBackPress, onInfoPress }: ChatHeaderProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <FontAwesome name="arrow-left" size={20} color="#007bff" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        {onInfoPress && (
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={onInfoPress}
            activeOpacity={0.7}
          >
            <FontAwesome name="info-circle" size={20} color="#007bff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 