import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ProfileCardProps {
  title: string;
  icon: string;
  iconColor: string;
  value: string;
  subtitle?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  icon,
  iconColor,
  value,
  subtitle,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FontAwesome name={icon as any} size={20} color={iconColor} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    flex: 1,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
}); 