import messaging, { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

class FirebaseService {
  private messagingInstance: any = null;

  /**
   * Messaging instance'ını al
   */
  private getMessagingInstance() {
    if (!this.messagingInstance) {
      try {
        const app = getApp();
        this.messagingInstance = getMessaging(app);
      } catch (error) {
        // Fallback to default messaging
        this.messagingInstance = messaging();
      }
    }
    return this.messagingInstance;
  }

  /**
   * Firebase messaging servisini başlatır
   */
  async initialize() {
    try {
      console.log('🔥 Firebase Messaging başlatılıyor...');

      const messagingService = this.getMessagingInstance();

      // iOS için ek konfigürasyon
      if (Platform.OS === 'ios') {
        // iOS için bildirim izinlerini iste
        const authStatus = await messagingService.requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ iOS bildirim izni verildi:', authStatus);
        } else {
          console.log('❌ iOS bildirim izni reddedildi:', authStatus);
        }
      }

      // Arka plan mesaj dinleyicisini ayarla
      messagingService.setBackgroundMessageHandler(async (remoteMessage: any) => {
        console.log('📱 Arka plan mesajı alındı:', remoteMessage);
      });

      console.log('✅ Firebase Messaging başarıyla başlatıldı');
    } catch (error) {
      console.error('❌ Firebase Messaging başlatma hatası:', error);
    }
  }

  /**
   * Ön plan mesaj dinleyicisini ayarlar
   */
  setupForegroundMessageListener() {
    const messagingService = this.getMessagingInstance();
    return messagingService.onMessage(async (remoteMessage: any) => {
      console.log('📱 Ön plan mesajı alındı:', remoteMessage);
      
      // Burada mesajı işleyebilir, local notification gösterebilirsiniz
      if (remoteMessage.notification) {
        console.log('📢 Bildirim:', {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body
        });
      }
    });
  }

  /**
   * Bildirime tıklama dinleyicisini ayarlar
   */
  setupNotificationOpenedListener() {
    const messagingService = this.getMessagingInstance();
    
    // Uygulama kapalıyken bildirime tıklanması
    messagingService
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('🚀 Uygulama bildirimle açıldı:', remoteMessage);
          // Burada deep linking yapabilirsiniz
        }
      });

    // Uygulama arka plandayken bildirime tıklanması
    return messagingService.onNotificationOpenedApp((remoteMessage: any) => {
      console.log('🔄 Bildirimle uygulama açıldı:', remoteMessage);
      // Burada deep linking yapabilirsiniz
    });
  }

  /**
   * FCM token'ı alır
   */
  async getToken(): Promise<string | null> {
    try {
      const messagingService = this.getMessagingInstance();
      const token = await messagingService.getToken();
      console.log('🔑 FCM Token alındı:', {
        tokenLength: token?.length || 0,
        platform: Platform.OS
      });
      return token;
    } catch (error) {
      console.error('❌ FCM Token alma hatası:', error);
      return null;
    }
  }

  /**
   * Token yenilenme dinleyicisini ayarlar
   */
  setupTokenRefreshListener(callback: (token: string) => void) {
    const messagingService = this.getMessagingInstance();
    return messagingService.onTokenRefresh((token: string) => {
      console.log('🔄 FCM Token yenilendi:', {
        tokenLength: token.length,
        platform: Platform.OS
      });
      callback(token);
    });
  }
}

export const firebaseService = new FirebaseService(); 