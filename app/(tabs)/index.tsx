import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CustomHeader } from '~/components/CustomHeader';
import { DoctorDashboard } from '~/components/DoctorDashboard';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { useFCMToken } from '~/lib/hooks/useFCMToken';

export default function AnaSayfa() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  // FCM Token yönetimi
  const { token: fcmToken, isLoading: fcmLoading, error: fcmError } = useFCMToken();

  useEffect(() => {
    if (user?.id) {
      console.log('🔐 Doktor girişi:', user.email);
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // FCM Token durumunu logla (sadece değişiklik olduğunda)
  useEffect(() => {
    if (fcmToken && user?.id) {
      console.log('🔔 FCM Token hazır:', {
        tokenLength: fcmToken.length,
        userId: user.id,
      });
    }

    if (fcmError) {
      console.log('❌ FCM Token hatası:', fcmError);
    }
  }, [fcmToken, fcmError]);

  const userName = profile ? `Dr. ${profile.name || ''} ${profile.surname || ''}`.trim() : 'Doktor';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <CustomHeader userName={userName} />

      <View style={styles.content}>
        {/* <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
          <Text style={styles.welcomeDescription}>
            Hastalarınızın sağlık verilerini takip edebilir ve onlarla iletişim kurabilirsiniz.
          </Text>
        </View> */}

        <DoctorDashboard />
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
  welcomeSection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
