import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { UnreadMessageCard } from './UnreadMessageCard';
import { messagesService } from '~/services/messagesService';
import { useProfileStore } from '~/store/profileStore';

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

interface DoctorDashboardProps {
  onRefresh?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onRefresh }) => {
  const router = useRouter();
  const { profile } = useProfileStore();
  const [unreadMessages, setUnreadMessages] = useState<PatientWithUnreadMessage[]>([]);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadUnreadMessages();
    }
  }, [profile?.id]);

  const loadUnreadMessages = async () => {
    if (!profile?.id) return;

    try {
      const patientsData = await messagesService.getDoctorPatientsWithLastMessages(profile.id);
      
      // Sadece okunmamış mesajı olan hastaları filtrele
      const patientsWithUnread = patientsData
        .filter(patient => 
          patient.unreadCount && 
          patient.unreadCount > 0 && 
          patient.lastMessage &&
          !dismissedMessages.has(patient.id)
        )
        .map(patient => ({
          id: patient.id,
          name: patient.name,
          surname: patient.surname,
          gender_name: patient.gender_name,
          user_id: patient.user_id,
          lastMessage: patient.lastMessage!,
          unreadCount: patient.unreadCount!,
        }))
        .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

      setUnreadMessages(patientsWithUnread);
    } catch (error) {
      console.error('Dashboard mesajları yüklenirken hata:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUnreadMessages();
    if (onRefresh) {
      onRefresh();
    }
    setRefreshing(false);
  };

  const handleMessagePress = (patient: PatientWithUnreadMessage) => {
    if (patient.user_id) {
      router.push({
        pathname: "/patient-chat",
        params: { 
          patientId: patient.id,
          patientUserId: patient.user_id,
          patientName: `${patient.name || ''} ${patient.surname || ''}`.trim()
        }
      });
    }
  };

  const handleMessageDismiss = (patientId: string) => {
    setDismissedMessages(prev => new Set(prev).add(patientId));
    setUnreadMessages(prev => prev.filter(msg => msg.id !== patientId));
  };

  const renderContent = () => {
    if (unreadMessages.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Harika! 🎉</Text>
          <Text style={styles.emptyStateText}>
            Şu anda okunmamış mesajınız bulunmuyor
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Okunmamış Mesajlar</Text>
          <Text style={styles.sectionSubtitle}>
            {unreadMessages.length} hasta mesaj gönderdi
          </Text>
        </View>
        
        {unreadMessages.map((patient) => (
          <UnreadMessageCard
            key={patient.id}
            patient={patient}
            lastMessage={patient.lastMessage}
            unreadCount={patient.unreadCount}
            onPress={() => handleMessagePress(patient)}
            onDismiss={() => handleMessageDismiss(patient.id)}
          />
        ))}
      </>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#4263eb']}
          tintColor="#4263eb"
        />
      }
    >
      <View style={styles.content}>
        {renderContent()}
        
        {/* Gelecekte eklenecek diğer dashboard bileşenleri */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Diğer güncellemeler buraya eklenecek...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholder: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
}); 