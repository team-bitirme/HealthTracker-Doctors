import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CustomHeader } from '~/components/CustomHeader';
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
        userId: user.id
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
            <Text style={styles.welcomeDescription}>
              Hastalarınızın sağlık verilerini takip edebilir ve onlarla iletişim kurabilirsiniz.
            </Text>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            
            <View style={styles.actionGrid}>
              <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>Hastalar</Text>
                <Text style={styles.actionDescription}>Hasta listesini görüntüle</Text>
              </View>
              
              <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>Mesajlar</Text>
                <Text style={styles.actionDescription}>Hasta mesajlarını kontrol et</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 24,
  },
  content: {
    marginTop: 20,
  },
  welcomeSection: {
    marginBottom: 32,
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
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4263eb',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
});
