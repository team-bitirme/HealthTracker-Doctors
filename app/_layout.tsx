import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { firebaseService } from '../lib/firebase';

export default function RootLayout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize Firebase and authentication state on app start
    const initializeApp = async () => {
      try {
        console.log('🚀 Uygulama başlatılıyor...');
        
        // Firebase'i başlat
        await firebaseService.initialize();
        
        // Firebase mesaj dinleyicilerini ayarla
        const unsubscribeForeground = firebaseService.setupForegroundMessageListener();
        const unsubscribeNotificationOpened = firebaseService.setupNotificationOpenedListener();
        
        // Auth durumunu başlat
        await initialize();
        
        console.log('✅ Uygulama başarıyla başlatıldı');
        
        // Cleanup function
        return () => {
          unsubscribeForeground();
          unsubscribeNotificationOpened();
        };
      } catch (error) {
        console.error('❌ Uygulama başlatma hatası:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="patient" options={{ headerShown: false }} />
    </Stack>
  );
}
