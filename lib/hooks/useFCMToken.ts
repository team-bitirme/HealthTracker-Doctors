import { useEffect, useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import messaging, { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import * as Device from 'expo-device';
import { useAuthStore } from '~/store/authStore';

export function useFCMToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, saveFCMToken } = useAuthStore();
  
  // Tekrar eden çağrıları önlemek için ref'ler
  const isTokenBeingSaved = useRef(false);
  const lastSavedToken = useRef<string | null>(null);
  const messagingInstance = useRef<any>(null);

  // Messaging instance'ını al
  const getMessagingInstance = useCallback(() => {
    if (!messagingInstance.current) {
      try {
        const app = getApp();
        messagingInstance.current = getMessaging(app);
      } catch (error) {
        // Fallback to default messaging
        messagingInstance.current = messaging();
      }
    }
    return messagingInstance.current;
  }, []);

  // FCM token'ı al
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📱 FCM Token alınıyor...');

      // Fiziksel cihaz kontrolü
      if (!Device.isDevice) {
        console.log('⚠️ Emülatörde FCM token alınamaz');
        setError('Emülatörde bildirimler desteklenmez');
        return null;
      }

      const messagingService = getMessagingInstance();

      // Bildirim izinlerini kontrol et ve iste
      const authStatus = await messagingService.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ Bildirim izni reddedildi');
        setError('Bildirim izni gerekli');
        return null;
      }

      // FCM token'ı al
      const fcmToken = await messagingService.getToken();
      
      if (!fcmToken) {
        console.log('❌ FCM Token alınamadı');
        setError('Token alınamadı');
        return null;
      }

      console.log('✅ FCM Token alındı:', {
        tokenLength: fcmToken.length,
        platform: Platform.OS
      });

      setToken(fcmToken);
      return fcmToken;

    } catch (error) {
      console.error('❌ FCM Token alma hatası:', error);
      setError('Token alınamadı');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getMessagingInstance]);

  // Token'ı veritabanına kaydet (tekrar eden çağrıları önle)
  const saveToken = useCallback(async (fcmToken?: string) => {
    try {
      const tokenToSave = fcmToken || token;
      
      if (!tokenToSave) {
        console.log('⚠️ Kaydedilecek token bulunamadı');
        return;
      }

      if (!user?.id) {
        console.log('⚠️ Kullanıcı oturum açmamış, token kaydedilemiyor');
        return;
      }

      // Aynı token zaten kaydediliyorsa tekrar kaydetme
      if (lastSavedToken.current === tokenToSave) {
        console.log('⚠️ Token zaten kaydedildi, tekrar kaydetme');
        return;
      }

      // Eğer token kaydediliyorsa bekle
      if (isTokenBeingSaved.current) {
        console.log('⚠️ Token zaten kaydediliyor, bekle');
        return;
      }

      isTokenBeingSaved.current = true;
      console.log('💾 Token veritabanına kaydediliyor...');
      
      await saveFCMToken(tokenToSave);
      lastSavedToken.current = tokenToSave;
      
    } catch (error) {
      console.error('❌ Token kaydetme hatası:', error);
    } finally {
      isTokenBeingSaved.current = false;
    }
  }, [token, user?.id, saveFCMToken]);

  // Token yenilenme dinleyicisi
  useEffect(() => {
    const messagingService = getMessagingInstance();
    
    const unsubscribe = messagingService.onTokenRefresh(async (newToken: string) => {
      console.log('🔄 FCM Token yenilendi:', {
        tokenLength: newToken.length,
        platform: Platform.OS
      });
      
      setToken(newToken);
      
      if (user?.id) {
        await saveToken(newToken);
      }
    });

    return unsubscribe;
  }, [user?.id, saveToken, getMessagingInstance]);

  // Kullanıcı giriş yaptığında token'ı al ve kaydet (sadece bir kez)
  useEffect(() => {
    if (user?.id && !token && !isLoading) {
      console.log('🔐 Kullanıcı giriş yaptı, FCM token alınıyor...');
      getToken().then((fcmToken) => {
        if (fcmToken) {
          saveToken(fcmToken);
        }
      });
    }
  }, [user?.id, token, isLoading, getToken, saveToken]);

  return {
    token,
    isLoading,
    error,
    getToken,
    saveToken,
    refreshToken: getToken, // Alias for getToken
  };
} 