import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/auth';
import { fcmTokenService } from '../services/fcmTokenService';

interface AuthState {
  // State
  isLoading: boolean;
  isInitialized: boolean;
  session: Session | null;
  user: User | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  saveFCMToken: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  isLoading: false,
  isInitialized: false,
  session: null,
  user: null,

  // Sign in action
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const result = await authService.signIn(email, password);
      
      if (result.success && result.session && result.user) {
        set({
          session: result.session,
          user: result.user,
          isLoading: false,
        });
        
        console.log('✅ Kullanıcı başarıyla giriş yaptı:', result.user.email);
        return { success: true };
      } else {
        set({ isLoading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Bir hata oluştu' };
    }
  },

  // Sign out action
  signOut: async () => {
    set({ isLoading: true });
    
    try {
      const { user } = get();
      
      // Kullanıcı çıkış yaparken FCM token'larını pasif yap
      if (user?.id) {
        console.log('🚪 Kullanıcı çıkışı yapıyor, FCM token\'ları pasifleştiriliyor...');
        await fcmTokenService.handleUserLogout(user.id);
      }
      
      await authService.signOut();
      set({
        session: null,
        user: null,
        isLoading: false,
      });
      
      console.log('✅ Kullanıcı başarıyla çıkış yaptı');
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
      set({ isLoading: false });
    }
  },

  // Reset password action
  resetPassword: async (email: string) => {
    set({ isLoading: true });
    
    try {
      const result = await authService.resetPassword(email);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Bir hata oluştu' };
    }
  },

  // Update password action
  updatePassword: async (newPassword: string) => {
    set({ isLoading: true });
    
    try {
      const result = await authService.updatePassword(newPassword);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: 'Bir hata oluştu' };
    }
  },

  // Save FCM Token (tekrar eden çağrıları önle)
  saveFCMToken: async (token: string) => {
    try {
      const { user } = get();
      
      if (!user?.id) {
        console.log('⚠️ FCM Token kaydedilemedi: Kullanıcı oturum açmamış');
        return;
      }

      // FCM servisine token kaydetme işlemini delege et
      // Servis kendi içinde tekrar eden çağrıları kontrol ediyor
      await fcmTokenService.saveToken(user.id, { token });
    } catch (error) {
      console.error('❌ FCM Token kaydetme hatası:', error);
    }
  },

  // Initialize auth state
  initialize: async () => {
    try {
      // Get current session
      const session = await authService.getCurrentSession();
      
      if (session) {
        const user = await authService.getCurrentUser();
        set({
          session,
          user,
          isInitialized: true,
        });
        
        console.log('🔐 Mevcut oturum bulundu:', user?.email);
      } else {
        set({
          session: null,
          user: null,
          isInitialized: true,
        });
        
        console.log('🔓 Aktif oturum bulunamadı');
      }

      // Listen to auth state changes
      authService.onAuthStateChange((event, session) => {
        console.log('🔄 Auth durumu değişti:', event, session?.user?.email);
        
        if (session) {
          set({
            session,
            user: session.user,
          });
        } else {
          set({
            session: null,
            user: null,
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Auth başlatma hatası:', error);
      set({
        session: null,
        user: null,
        isInitialized: true,
      });
    }
  },

  // Set session manually
  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user || null,
    });
  },
})); 