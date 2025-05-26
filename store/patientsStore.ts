import { create } from 'zustand';
import { doctorService, DoctorWithPatients } from '~/services/doctorService';

type Patient = DoctorWithPatients['patients'][0];

interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  fetchPatients: (doctorId: string) => Promise<void>;
  clearPatients: () => void;
  setError: (error: string | null) => void;
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: [],
  isLoading: false,
  error: null,

  fetchPatients: async (doctorId: string) => {
    console.log('👥 [PatientsStore] Hasta listesi getirme işlemi başlatılıyor...', { doctorId });
    set({ isLoading: true, error: null });
    
    try {
      console.log('🔄 [PatientsStore] Doktor servisi çağrılıyor...');
      const patients = await doctorService.getDoctorPatients(doctorId);
      
      console.log('✅ [PatientsStore] Hasta listesi başarıyla store\'a kaydedildi:', {
        doctorId,
        patientCount: patients.length,
        patientNames: patients.map(p => `${p.name} ${p.surname}`).slice(0, 5), // İlk 5 hasta
        hasMorePatients: patients.length > 5
      });
      
      set({ patients, isLoading: false, error: null });
    } catch (error) {
      console.error('💥 [PatientsStore] Hasta listesi getirme beklenmeyen hatası:', {
        error: error instanceof Error ? error.message : error,
        doctorId
      });
      set({
        patients: [],
        isLoading: false,
        error: 'Hasta listesi yüklenirken bir hata oluştu.',
      });
    }
  },

  clearPatients: () => {
    console.log('🗑️ [PatientsStore] Hasta listesi temizleniyor...');
    const currentPatients = get().patients;
    
    if (currentPatients.length > 0) {
      console.log('📋 [PatientsStore] Temizlenen hasta listesi:', {
        patientCount: currentPatients.length,
        patientNames: currentPatients.map(p => `${p.name} ${p.surname}`).slice(0, 3)
      });
    } else {
      console.log('ℹ️ [PatientsStore] Temizlenecek hasta bulunamadı, zaten boş');
    }
    
    set({ patients: [], isLoading: false, error: null });
    console.log('✅ [PatientsStore] Hasta listesi başarıyla temizlendi');
  },

  setError: (error: string | null) => {
    console.log('⚠️ [PatientsStore] Hata durumu ayarlanıyor:', { error });
    set({ error });
  },
})); 