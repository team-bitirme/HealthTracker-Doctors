import { create } from 'zustand';
import { doctorService, DoctorProfile } from '~/services/doctorService';

interface ProfileState {
  profile: DoctorProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (doctorId: string, updates: { name?: string; surname?: string; specialization_id?: number }) => Promise<boolean>;
  clearProfile: () => void;
  setError: (error: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    console.log('🏪 [ProfileStore] Profil getirme işlemi başlatılıyor...', { userId });
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔄 [ProfileStore] Doktor servisi çağrılıyor...');
      const profile = await doctorService.getDoctorProfile(userId);
      
      if (profile) {
        console.log('✅ [ProfileStore] Profil başarıyla store\'a kaydedildi:', {
          doctorId: profile.id,
          doctorName: `${profile.name} ${profile.surname}`,
          email: profile.email
        });
        set({ profile, isLoading: false, error: null });
      } else {
        console.warn('⚠️ [ProfileStore] Profil bulunamadı, hata durumu ayarlanıyor');
        set({ 
          profile: null, 
          isLoading: false, 
          error: 'Doktor profili bulunamadı. Lütfen yöneticinizle iletişime geçin.' 
        });
      }
    } catch (error) {
      console.error('💥 [ProfileStore] Profil getirme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        userId
      });
      set({
        profile: null,
        isLoading: false,
        error: 'Profil bilgileri yüklenirken bir hata oluştu.',
      });
    }
  },

  updateProfile: async (doctorId: string, updates: { name?: string; surname?: string; specialization_id?: number }) => {
    console.log('📝 [ProfileStore] Profil güncelleme işlemi başlatılıyor...', { doctorId, updates });
    
    const currentProfile = get().profile;
    if (!currentProfile) {
      console.error('❌ [ProfileStore] Güncelleme yapılamıyor: Mevcut profil bulunamadı');
      return false;
    }

    console.log('🔄 [ProfileStore] Mevcut profil bulundu, servis çağrılıyor...', {
      currentProfileId: currentProfile.id
    });

    try {
      const success = await doctorService.updateDoctorProfile(doctorId, updates);
      
      if (success) {
        const updatedProfile = {
          ...currentProfile,
          ...updates,
        };

        console.log('✅ [ProfileStore] Profil başarıyla güncellendi ve store\'a kaydedildi:', {
          doctorId,
          oldProfile: {
            name: currentProfile.name,
            surname: currentProfile.surname
          },
          newProfile: {
            name: updatedProfile.name,
            surname: updatedProfile.surname
          },
          updates
        });

        set({ profile: updatedProfile });
        return true;
      } else {
        console.error('❌ [ProfileStore] Profil güncelleme servis tarafından başarısız oldu');
        return false;
      }
    } catch (error) {
      console.error('💥 [ProfileStore] Profil güncelleme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        doctorId,
        updates
      });
      return false;
    }
  },

  clearProfile: () => {
    console.log('🗑️ [ProfileStore] Profil temizleniyor...');
    const currentProfile = get().profile;
    
    if (currentProfile) {
      console.log('📋 [ProfileStore] Temizlenen profil:', {
        doctorId: currentProfile.id,
        doctorName: `${currentProfile.name} ${currentProfile.surname}`
      });
    } else {
      console.log('ℹ️ [ProfileStore] Temizlenecek profil bulunamadı, zaten boş');
    }
    
    set({ profile: null, isLoading: false, error: null });
    console.log('✅ [ProfileStore] Profil başarıyla temizlendi');
  },

  setError: (error: string | null) => {
    console.log('⚠️ [ProfileStore] Hata durumu ayarlanıyor:', { error });
    set({ error });
  },
})); 