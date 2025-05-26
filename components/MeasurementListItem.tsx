import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MeasurementRecord } from '~/services/patientDetailService';

interface MeasurementListItemProps {
  measurement: MeasurementRecord;
  onPress: (measurement: MeasurementRecord) => void;
}

export function MeasurementListItem({ measurement, onPress }: MeasurementListItemProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return `Bugün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 2) {
        return `Dün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays <= 7) {
        return `${diffDays - 1} gün önce`;
      } else {
        return date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      return 'Tarih bilinmiyor';
    }
  };

  const formatValue = (value: number, unit: string) => {
    return `${value} ${unit}`;
  };

  const getMethodIcon = (method: string | null) => {
    if (method === 'manual') return 'create-outline';
    if (method === 'photo') return 'camera-outline';
    if (method === 'device') return 'hardware-chip-outline';
    return 'help-outline';
  };

  const getMethodColor = (method: string | null) => {
    if (method === 'manual') return '#17a2b8';
    if (method === 'photo') return '#fd7e14';
    if (method === 'device') return '#28a745';
    return '#6c757d';
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(measurement)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>
            {formatValue(measurement.value, measurement.measurement_types.unit)}
          </Text>
          <Text style={styles.date}>
            {formatDate(measurement.measured_at)}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <View style={styles.methodContainer}>
          <Ionicons 
            name={getMethodIcon(measurement.method)} 
            size={16} 
            color={getMethodColor(measurement.method)} 
          />
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'column',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodContainer: {
    marginRight: 8,
  },
}); 