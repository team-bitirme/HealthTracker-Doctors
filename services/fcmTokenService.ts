import { supabase } from '~/lib/supabase';
import { Tables } from '~/lib/types/supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export interface FCMTokenData {
  token: string;
  platform?: string;
  device_info?: string;
}

type FCMToken = Tables<'fcm_tokens'>;

class FCMTokenService {
  private savingTokens = new Set<string>(); // Aynı anda kaydedilen token'ları takip et

  /**
   * FCM token'ı veritabanına kaydeder veya günceller (upsert)
   */
  async saveToken(userId: string, tokenData: FCMTokenData): Promise<FCMToken | null> {
    const tokenKey = `${userId}-${tokenData.token}`;
    
    // Aynı token zaten kaydediliyorsa bekle
    if (this.savingTokens.has(tokenKey)) {
      console.log('⚠️ Token zaten kaydediliyor, işlem atlanıyor');
      return null;
    }

    try {
      this.savingTokens.add(tokenKey);
      
      console.log('🔔 FCM Token kaydediliyor...', {
        userId,
        platform: tokenData.platform,
        tokenLength: tokenData.token.length
      });

      // Platform bilgisini otomatik belirle
      const platform = tokenData.platform || Platform.OS;
      
      // Cihaz bilgisini topla
      const deviceInfo = tokenData.device_info || JSON.stringify({
        brand: Device.brand,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        deviceType: Device.deviceType
      });

      // Önce aynı token'ın var olup olmadığını kontrol et
      const { data: existingToken } = await supabase
        .from('fcm_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('token', tokenData.token)
        .eq('is_active', true)
        .single();

      if (existingToken) {
        console.log('✅ FCM Token zaten mevcut, güncelleniyor...');
        
        // Mevcut token'ı güncelle
        const { data, error } = await supabase
          .from('fcm_tokens')
          .update({
            platform,
            device_info: deviceInfo,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingToken.id)
          .select()
          .single();

        if (error) {
          console.error('❌ FCM Token güncelleme hatası:', error);
          throw error;
        }

        console.log('✅ FCM Token başarıyla güncellendi');
        return data;
      }

      // Kullanıcının eski token'larını pasif yap
      await this.deactivateUserTokens(userId);

      // Yeni token'ı ekle
      const { data, error } = await supabase
        .from('fcm_tokens')
        .insert({
          user_id: userId,
          token: tokenData.token,
          platform,
          device_info: deviceInfo,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ FCM Token kaydetme hatası:', error);
        throw error;
      }

      console.log('✅ FCM Token başarıyla kaydedildi');
      return data;

    } catch (error) {
      console.error('❌ FCM Token servis hatası:', error);
      return null;
    } finally {
      this.savingTokens.delete(tokenKey);
    }
  }

  /**
   * Kullanıcının tüm token'larını pasif yapar
   */
  async deactivateUserTokens(userId: string): Promise<void> {
    try {
      console.log('🔄 Kullanıcının eski FCM token\'ları pasif yapılıyor...', userId);

      const { error } = await supabase
        .from('fcm_tokens')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Token pasifleştirme hatası:', error);
        throw error;
      }

      console.log('✅ Eski token\'lar başarıyla pasifleştirildi');
    } catch (error) {
      console.error('❌ Token pasifleştirme servis hatası:', error);
    }
  }

  /**
   * Kullanıcının aktif token'larını getirir
   */
  async getUserActiveTokens(userId: string): Promise<FCMToken[]> {
    try {
      const { data, error } = await supabase
        .from('fcm_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Aktif token\'ları getirme hatası:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Aktif token\'ları getirme servis hatası:', error);
      return [];
    }
  }

  /**
   * Belirli bir token'ı siler
   */
  async deleteToken(tokenId: string): Promise<boolean> {
    try {
      console.log('🗑️ FCM Token siliniyor...', tokenId);

      const { error } = await supabase
        .from('fcm_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        console.error('❌ Token silme hatası:', error);
        throw error;
      }

      console.log('✅ FCM Token başarıyla silindi');
      return true;
    } catch (error) {
      console.error('❌ Token silme servis hatası:', error);
      return false;
    }
  }

  /**
   * Kullanıcı çıkış yaptığında tüm token'larını pasif yapar
   */
  async handleUserLogout(userId: string): Promise<void> {
    try {
      console.log('🚪 Kullanıcı çıkışı - FCM token\'ları pasifleştiriliyor...', userId);
      await this.deactivateUserTokens(userId);
    } catch (error) {
      console.error('❌ Çıkış sırasında token pasifleştirme hatası:', error);
    }
  }
}

export const fcmTokenService = new FCMTokenService(); 