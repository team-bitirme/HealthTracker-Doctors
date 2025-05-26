import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PatientAvatar } from './PatientAvatar';

interface UnreadMessageCardProps {
  patient: {
    id: string;
    name: string | null;
    surname: string | null;
    gender_name: string | null;
    user_id: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
  };
  unreadCount: number;
  onPress: () => void;
  onDismiss: () => void;
}

export const UnreadMessageCard: React.FC<UnreadMessageCardProps> = ({
  patient,
  lastMessage,
  unreadCount,
  onPress,
  onDismiss,
}) => {
  const getPatientName = () => {
    return `${patient.name || ''} ${patient.surname || ''}`.trim() || 'Adsız Hasta';
  };

  const getMessageDate = () => {
    const messageDate = new Date(lastMessage.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
      return `${diffInMinutes} dk önce`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

  const getMessagePreview = () => {
    const maxLength = 60;
    return lastMessage.content.length > maxLength 
      ? lastMessage.content.substring(0, maxLength) + '...'
      : lastMessage.content;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="mail-unread-outline" size={16} color="#FF6B35" />
          <Text style={styles.title}>Yeni Mesaj</Text>
        </View>
        <TouchableOpacity 
          style={styles.dismissButton} 
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.patientInfo}>
          <PatientAvatar 
            gender={patient.gender_name} 
            size="small"
            style={styles.avatar}
          />
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{getPatientName()}</Text>
            <Text style={styles.messageDate}>{getMessageDate()}</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.messageContent} numberOfLines={2}>
          {getMessagePreview()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  dismissButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  messageDate: {
    fontSize: 12,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  messageContent: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 20,
  },
}); 