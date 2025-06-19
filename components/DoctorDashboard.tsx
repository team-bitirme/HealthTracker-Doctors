import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { DoctorMessagesOverview } from './DoctorMessagesOverview';
import { DoctorComplaintsOverview } from './DoctorComplaintsOverview';
import { messagesService } from '~/services/messagesService';
import { useProfileStore } from '~/store/profileStore';
import { useComplaintsStore } from '~/store/complaintsStore';

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

  // Şikayet store'u
  const {
    doctorPatientComplaints,
    isLoading: complaintsLoading,
    fetchDoctorPatientComplaints,
  } = useComplaintsStore();

  useEffect(() => {
    if (profile?.id) {
      loadUnreadMessages();
      loadDoctorComplaints();
    }
  }, [profile?.id]);

  const loadUnreadMessages = async () => {
    if (!profile?.id) return;

    try {
      const patientsData = await messagesService.getDoctorPatientsWithLastMessages(profile.id);

      // Sadece okunmamış mesajı olan hastaları filtrele
      const patientsWithUnread = patientsData
        .filter(
          (patient) =>
            patient.unreadCount &&
            patient.unreadCount > 0 &&
            patient.lastMessage &&
            !dismissedMessages.has(patient.id)
        )
        .map((patient) => ({
          id: patient.id,
          name: patient.name,
          surname: patient.surname,
          gender_name: patient.gender_name,
          user_id: patient.user_id,
          lastMessage: patient.lastMessage!,
          unreadCount: patient.unreadCount!,
        }))
        .sort(
          (a, b) =>
            new Date(b.lastMessage.created_at).getTime() -
            new Date(a.lastMessage.created_at).getTime()
        );

      setUnreadMessages(patientsWithUnread);
    } catch (error) {
      console.error('Dashboard mesajları yüklenirken hata:', error);
    }
  };

  const loadDoctorComplaints = async () => {
    if (!profile?.id) return;

    try {
      await fetchDoctorPatientComplaints(profile.id);
    } catch (error) {
      console.error('Dashboard şikayetleri yüklenirken hata:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUnreadMessages();
    await loadDoctorComplaints();
    if (onRefresh) {
      onRefresh();
    }
    setRefreshing(false);
  };

  const handleMessageDismiss = (patientId: string) => {
    setDismissedMessages((prev) => new Set(prev).add(patientId));
    setUnreadMessages((prev) => prev.filter((msg) => msg.id !== patientId));
  };

  const handleComplaintsRefresh = async () => {
    await loadDoctorComplaints();
  };

  const handleMessagesRefresh = async () => {
    await loadUnreadMessages();
  };

  const renderMessagesSection = () => {
    return (
      <DoctorMessagesOverview
        messages={unreadMessages}
        isLoading={false}
        onMessageDismiss={handleMessageDismiss}
      />
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
      }>
      <View style={styles.content}>
        {renderMessagesSection()}

        {/* Şikayetler Bölümü */}
        <DoctorComplaintsOverview
          complaints={doctorPatientComplaints}
          isLoading={complaintsLoading}
        />

        {/* Gelecekte eklenecek diğer dashboard bileşenleri */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Diğer güncellemeler buraya eklenecek...</Text>
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
