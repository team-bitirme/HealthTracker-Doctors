import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PatientAvatar } from './PatientAvatar';
import { useRouter } from 'expo-router';

interface PatientWithUnreadMessage {
  id: string;
  name: string | null;
  surname: string | null;
  gender_name: string | null;
  user_id: string | null;
  lastMessage: {
    content: string;
    created_at: string;
  };
  unreadCount: number;
}

interface DoctorMessagesOverviewProps {
  messages: PatientWithUnreadMessage[];
  isLoading: boolean;
  onRefresh?: () => void;
  onMessageDismiss?: (patientId: string) => void;
}

export const DoctorMessagesOverview: React.FC<DoctorMessagesOverviewProps> = ({
  messages,
  isLoading,
  onRefresh,
  onMessageDismiss,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const getPatientName = (patient: PatientWithUnreadMessage) => {
    return `${patient.name || ''} ${patient.surname || ''}`.trim() || 'Adsız Hasta';
  };

  const getMessageDate = (dateString: string) => {
    const messageDate = new Date(dateString);
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

  const getMessagePreview = (content: string) => {
    const maxLength = 60;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const handleMessagePress = (patient: PatientWithUnreadMessage) => {
    if (patient.user_id) {
      router.push({
        pathname: '/patient-chat',
        params: {
          patientId: patient.id,
          patientUserId: patient.user_id,
          patientName: getPatientName(patient),
        },
      });
    }
  };

  const handleViewAllPress = () => {
    router.push('/mesajlar');
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const renderMessageCard = (patient: PatientWithUnreadMessage) => {
    return (
      <TouchableOpacity
        key={patient.id}
        style={styles.messageCard}
        onPress={() => handleMessagePress(patient)}
        activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <PatientAvatar gender={patient.gender_name} size="small" style={styles.avatar} />
            <View style={styles.patientDetails}>
              <Text style={styles.patientName}>{getPatientName(patient)}</Text>
              <Text style={styles.messageDate}>
                {getMessageDate(patient.lastMessage.created_at)}
              </Text>
            </View>
          </View>
          <View style={styles.messageActions}>
            {patient.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {patient.unreadCount > 99 ? '99+' : patient.unreadCount}
                </Text>
              </View>
            )}
            {onMessageDismiss && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => onMessageDismiss(patient.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.messageContentContainer}>
          <Text style={styles.messageContent} numberOfLines={2}>
            {getMessagePreview(patient.lastMessage.content)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome name="check-circle" size={32} color="#28a745" />
          <Text style={styles.emptyStateTitle}>Harika! 🎉</Text>
          <Text style={styles.emptyStateText}>Şu anda okunmamış mesajınız bulunmuyor</Text>
        </View>
      );
    }

    return (
      <View style={styles.messagesContainer}>
        {messages.slice(0, 5).map(renderMessageCard)}
        {messages.length > 5 && (
          <TouchableOpacity
            style={styles.viewMoreCard}
            onPress={handleViewAllPress}
            activeOpacity={0.7}>
            <FontAwesome name="plus" size={20} color="#6c757d" />
            <Text style={styles.viewMoreText}>+{messages.length - 5} daha</Text>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome name="envelope" size={16} color="#FF6B35" />
          <Text style={styles.title}>Okunmamış Mesajlar</Text>
          {messages.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{messages.length}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleToggleExpanded}
          activeOpacity={0.7}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#6c757d" />
        </TouchableOpacity>
      </View>

      {expanded && renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandButton: {
    padding: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  messageDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  dismissButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    opacity: 0.8,
  },
  messageContentContainer: {
    flex: 1,
  },
  messageContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    letterSpacing: -0.1,
    fontWeight: '400',
  },
  viewMoreCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
  },
});
