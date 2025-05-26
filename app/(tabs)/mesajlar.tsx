import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { CustomHeader } from '~/components/CustomHeader';
import { PatientMessageCard } from '~/components/PatientMessageCard';
import { messagesService } from '~/services/messagesService';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { useMessageChecker } from '~/lib/hooks/useMessageChecker';

interface PatientWithMessage {
  id: string;
  name: string | null;
  surname: string | null;
  gender_name: string | null;
  user_id: string | null;
  lastMessage?: {
    content: string;
    created_at: string;
  } | null;
  unreadCount?: number;
}

export default function Mesajlar() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientWithMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  // Mesaj kontrol hook'u - artık kullanılmıyor
  // const { checkMessages } = useMessageChecker({
  //   onNewMessage: () => {
  //     console.log('🔔 [Mesajlar] Yeni mesaj var, lista yenileniyor...');
  //     loadPatientsWithMessages();
  //   }
  // });

  useEffect(() => {
    if (user?.id && !profile) {
      fetchProfile(user.id);
    }
  }, [user?.id, profile, fetchProfile]);

  useEffect(() => {
    if (profile?.id) {
      loadPatientsWithMessages();
    }
  }, [profile?.id]);

  // Sayfa focus olduğunda mesaj kontrolü yap
  useFocusEffect(
    React.useCallback(() => {
      const checkForNewPatientMessages = async () => {
        if (!profile?.id) return;
        
        console.log('👁️ [Mesajlar] Sayfa focus oldu, yeni hasta mesajları kontrol ediliyor...');
        
        try {
          // Sadece hastalardan gelen yeni mesajları kontrol et
          const hasNewMessages = await messagesService.checkForNewPatientMessages(profile.id);
          if (hasNewMessages) {
            console.log('🔔 [Mesajlar] Yeni hasta mesajı var, lista yenileniyor...');
            loadPatientsWithMessages();
          }
        } catch (error) {
          console.error('💥 [Mesajlar] Yeni mesaj kontrolü hatası:', error);
        }
      };

      checkForNewPatientMessages();
    }, [profile?.id])
  );

  const loadPatientsWithMessages = async () => {
    if (!profile?.id) {
      console.log('❌ [Mesajlar] Doktor profili bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [Mesajlar] Hastalar ve mesajlar yükleniyor...', { 
        doctorId: profile.id 
      });

      const patientsData = await messagesService.getDoctorPatientsWithLastMessages(profile.id);
      setPatients(patientsData);

      console.log('✅ [Mesajlar] Hastalar başarıyla yüklendi:', {
        patientCount: patientsData.length
      });

    } catch (error) {
      console.error('💥 [Mesajlar] Hasta listesi yükleme hatası:', error);
      setError(error instanceof Error ? error.message : 'Hasta listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientPress = (patient: PatientWithMessage) => {
    console.log('👆 [Mesajlar] Hasta seçildi:', { 
      patientId: patient.id, 
      patientName: `${patient.name} ${patient.surname}` 
    });
    
    if (patient.user_id) {
      router.push({
        pathname: "/patient-chat",
        params: { 
          patientId: patient.id,
          patientUserId: patient.user_id,
          patientName: `${patient.name || ''} ${patient.surname || ''}`.trim()
        }
      });
    } else {
      console.log('❌ [Mesajlar] Hastanın user_id değeri bulunamadı');
    }
  };

  const renderPatientItem = ({ item }: { item: PatientWithMessage }) => (
    <PatientMessageCard
      patient={item}
      lastMessage={item.lastMessage}
      unreadCount={item.unreadCount}
      onPress={() => handlePatientPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Henüz hasta mesajı bulunmuyor
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Hastalarınızdan mesaj geldiğinde burada görüntülenecek
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <CustomHeader title="Mesajlar" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <CustomHeader title="Mesajlar" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <CustomHeader title="Mesajlar" />
      <View style={styles.content}>
        <FlatList
          data={patients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
