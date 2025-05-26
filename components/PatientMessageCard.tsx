import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { PatientAvatar } from './PatientAvatar';

interface PatientMessageCardProps {
  patient: {
    id: string;
    name: string | null;
    surname: string | null;
    gender_name: string | null;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  } | null;
  onPress?: () => void;
}

export const PatientMessageCard: React.FC<PatientMessageCardProps> = ({
  patient,
  lastMessage,
  onPress,
}) => {
  const getPatientName = () => {
    return `${patient.name || ''} ${patient.surname || ''}`.trim() || 'Adsız Hasta';
  };

  const getLastMessageDate = () => {
    if (!lastMessage?.created_at) return '';
    
    const messageDate = new Date(lastMessage.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getLastMessagePreview = () => {
    if (!lastMessage?.content) {
      return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    }
    
    const maxLength = 40;
    return lastMessage.content.length > maxLength 
      ? lastMessage.content.substring(0, maxLength) + '...'
      : lastMessage.content;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Sol taraf - Avatar */}
        <View style={styles.avatarContainer}>
          <PatientAvatar 
            gender={patient.gender_name} 
            size="medium"
          />
        </View>

        {/* Orta kısım - Hasta adı ve son mesaj */}
        <View style={styles.messageContent}>
          <Text style={styles.patientName}>{getPatientName()}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {getLastMessagePreview()}
          </Text>
        </View>

        {/* Sağ taraf - Tarih */}
        <View style={styles.dateContainer}>
          <Text style={styles.messageDate}>{getLastMessageDate()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    marginRight: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },  messageDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
