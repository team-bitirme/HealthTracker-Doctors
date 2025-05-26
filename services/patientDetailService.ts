import { supabase } from '~/lib/supabase';
import { DataCategory } from '~/components/DataCategoryList';

export interface PatientDetailData {
  id: string;
  user_id: string | null;
  name: string | null;
  surname: string | null;
  birth_date: string | null;
  gender_name: string | null;
  patient_note: string | null;
  created_at: string | null;
  lastMessage?: {
    id: string;
    content: string;
    created_at: string;
    sender_name: string;
  } | null;
  healthDataCategories: DataCategory[];
}

interface MeasurementTypeWithLatest {
  id: number;
  name: string;
  unit: string;
  code: string;
  latest_value?: number;
  latest_measured_at?: string;
}

class PatientDetailService {
  async getPatientDetail(patientId: string): Promise<PatientDetailData> {
    console.log('🔍 [PatientDetailService] Hasta detayları getiriliyor...', { patientId });

    try {
      // Hasta temel bilgilerini getir
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select(`
          id,
          user_id,
          name,
          surname,
          birth_date,
          patient_note,
          created_at,
          genders (
            name
          )
        `)
        .eq('id', patientId)
        .eq('is_deleted', false)
        .single();

      if (patientError) {
        console.error('💥 [PatientDetailService] Hasta bilgileri getirme hatası:', patientError);
        throw new Error('Hasta bilgileri getirilemedi');
      }

      if (!patientData) {
        throw new Error('Hasta bulunamadı');
      }

      console.log('✅ [PatientDetailService] Hasta temel bilgileri getirildi:', {
        patientName: `${patientData.name} ${patientData.surname}`,
        hasUserId: !!patientData.user_id
      });

      // Son mesajı getir (varsa)
      let lastMessage = null;
      if (patientData.user_id) {
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_user_id,
            users!messages_sender_user_id_fkey (
              id,
              profiles (
                name,
                surname
              )
            )
          `)
          .or(`sender_user_id.eq.${patientData.user_id},receiver_user_id.eq.${patientData.user_id}`)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!messageError && messageData) {
          lastMessage = {
            id: messageData.id,
            content: messageData.content || '',
            created_at: messageData.created_at || '',
            sender_name: 'Hasta' // Profiles tablosu ilişkisi sorunu olduğu için geçici
          };
          
          console.log('📨 [PatientDetailService] Son mesaj getirildi:', {
            messageId: lastMessage.id,
            senderName: lastMessage.sender_name
          });
        } else {
          console.log('ℹ️ [PatientDetailService] Hasta için mesaj bulunamadı');
        }
      }

      // Sağlık veri kategorilerini getir
      const healthDataCategories = await this.getHealthDataCategories(patientId);

      const result: PatientDetailData = {
        id: patientData.id,
        user_id: patientData.user_id,
        name: patientData.name,
        surname: patientData.surname,
        birth_date: patientData.birth_date,
        gender_name: patientData.genders?.name || null,
        patient_note: patientData.patient_note,
        created_at: patientData.created_at,
        lastMessage,
        healthDataCategories
      };

      console.log('✅ [PatientDetailService] Hasta detayları başarıyla hazırlandı:', {
        patientName: `${result.name} ${result.surname}`,
        hasLastMessage: !!result.lastMessage,
        categoriesCount: result.healthDataCategories.length
      });

      return result;

    } catch (error) {
      console.error('💥 [PatientDetailService] Hasta detayları getirme genel hatası:', error);
      throw error instanceof Error ? error : new Error('Hasta detayları getirilemedi');
    }
  }

  private async getHealthDataCategories(patientId: string): Promise<DataCategory[]> {
    console.log('📊 [PatientDetailService] Sağlık veri kategorileri getiriliyor...', { patientId });

    try {
      // Önce measurement types'ları getir
      const { data: measurementTypes, error: typesError } = await supabase
        .from('measurement_types')
        .select('id, name, unit, code')
        .order('id');

      if (typesError) {
        console.error('💥 [PatientDetailService] Measurement types getirme hatası:', typesError);
        return [];
      }

      const categories: DataCategory[] = [];

      if (measurementTypes && measurementTypes.length > 0) {
        // Her measurement type için en son değeri getir
        for (const type of measurementTypes) {
          const { data: latestMeasurement } = await supabase
            .from('health_measurements')
            .select('value, measured_at')
            .eq('patient_id', patientId)
            .eq('measurement_type_id', type.id)
            .eq('is_deleted', false)
            .order('measured_at', { ascending: false })
            .limit(1)
            .single();

          let latestValue = '';
          if (latestMeasurement) {
            latestValue = `${latestMeasurement.value} ${type.unit}`;
            
            // Tarih ekle
            if (latestMeasurement.measured_at) {
              const measurementDate = new Date(latestMeasurement.measured_at);
              const daysDiff = Math.floor((Date.now() - measurementDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysDiff === 0) {
                latestValue += ' (Bugün)';
              } else if (daysDiff === 1) {
                latestValue += ' (Dün)';
              } else if (daysDiff < 7) {
                latestValue += ` (${daysDiff} gün önce)`;
              } else {
                latestValue += ` (${measurementDate.toLocaleDateString('tr-TR')})`;
              }
            }
          }

          categories.push({
            id: type.id.toString(),
            title: type.name,
            iconName: this.getIconNameForMeasurementType(type.code),
            latestValue: latestValue || undefined,
            measurementTypeId: type.id,
            unit: type.unit
          });
        }
      }

      // Sabit sağlık veri kategorileri ekle (eğer measurement_types boşsa)
      if (categories.length === 0) {
        categories.push(
          {
            id: 'blood_glucose',
            title: 'Kan Şekeri',
            iconName: 'tint',
            measurementTypeId: 1,
            unit: 'mg/dL'
          },
          {
            id: 'blood_pressure',
            title: 'Kan Basıncı',
            iconName: 'heart',
            measurementTypeId: 2,
            unit: 'mmHg'
          },
          {
            id: 'weight',
            title: 'Kilo',
            iconName: 'balance-scale',
            measurementTypeId: 3,
            unit: 'kg'
          },
          {
            id: 'height',
            title: 'Boy',
            iconName: 'arrows-v',
            measurementTypeId: 4,
            unit: 'cm'
          }
        );
      }

      console.log('✅ [PatientDetailService] Sağlık veri kategorileri hazırlandı:', {
        categoriesCount: categories.length,
        categoriesWithData: categories.filter(c => c.latestValue).length
      });

      return categories;

    } catch (error) {
      console.error('💥 [PatientDetailService] Sağlık veri kategorileri getirme hatası:', error);
      return [];
    }
  }

  private getIconNameForMeasurementType(code: string): string {
    const iconMap: Record<string, string> = {
      'blood_glucose': 'tint',
      'blood_pressure': 'heart',
      'weight': 'balance-scale', 
      'height': 'arrows-v',
      'temperature': 'thermometer-half',
      'pulse': 'heartbeat',
      'oxygen_saturation': 'heart',
      'cholesterol': 'flask',
      'hemoglobin': 'tint',
      'bmi': 'calculator'
    };

    return iconMap[code] || 'plus-square';
  }
}

export const patientDetailService = new PatientDetailService();

// Doktor için ölçüm verilerini getiren servisler
export interface MeasurementRecord {
  id: string;
  value: number;
  measured_at: string;
  method: string | null;
  created_at: string;
  updated_at: string | null;
  measurement_types: {
    id: number;
    name: string;
    unit: string;
    code: string;
  };
}

export interface MeasurementDetails extends MeasurementRecord {
  patient_id: string;
}

export class DoctorMeasurementService {
  async getMeasurementHistory(patientId: string, measurementTypeId: number): Promise<MeasurementRecord[]> {
    console.log('📊 [DoctorMeasurementService] Hasta ölçüm geçmişi getiriliyor...', { 
      patientId, 
      measurementTypeId 
    });

    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          id,
          value,
          measured_at,
          method,
          created_at,
          updated_at,
          measurement_types (
            id,
            name,
            unit,
            code
          )
        `)
        .eq('patient_id', patientId)
        .eq('measurement_type_id', measurementTypeId)
        .eq('is_deleted', false)
        .order('measured_at', { ascending: false });

      if (error) {
        console.error('💥 [DoctorMeasurementService] Ölçüm geçmişi getirme hatası:', error);
        throw new Error('Ölçüm geçmişi getirilemedi');
      }

             const measurements: MeasurementRecord[] = (data || [])
         .filter(item => item.value !== null && item.measured_at !== null && item.created_at !== null && item.measurement_types !== null)
         .map(item => ({
           id: item.id,
           value: item.value!,
           measured_at: item.measured_at!,
           method: item.method,
           created_at: item.created_at!,
           updated_at: item.updated_at,
           measurement_types: item.measurement_types!
         }));

      console.log('✅ [DoctorMeasurementService] Ölçüm geçmişi başarıyla getirildi:', {
        patientId,
        measurementTypeId,
        recordCount: measurements.length
      });

      return measurements;

    } catch (error) {
      console.error('💥 [DoctorMeasurementService] Ölçüm geçmişi getirme hatası:', error);
      throw error instanceof Error ? error : new Error('Ölçüm geçmişi getirilemedi');
    }
  }

  async getMeasurementDetails(measurementId: string): Promise<MeasurementDetails | null> {
    console.log('📋 [DoctorMeasurementService] Ölçüm detayları getiriliyor...', { measurementId });

    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          id,
          patient_id,
          value,
          measured_at,
          method,
          created_at,
          updated_at,
          measurement_types (
            id,
            name,
            unit,
            code
          )
        `)
        .eq('id', measurementId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('💥 [DoctorMeasurementService] Ölçüm detayları getirme hatası:', error);
        throw new Error('Ölçüm detayları getirilemedi');
      }

      if (!data) {
        return null;
      }

             if (!data.value || !data.measured_at || !data.created_at || !data.measurement_types || !data.patient_id) {
         throw new Error('Gerekli ölçüm verileri eksik');
       }

       const measurementDetails: MeasurementDetails = {
         id: data.id,
         patient_id: data.patient_id,
         value: data.value,
         measured_at: data.measured_at,
         method: data.method,
         created_at: data.created_at,
         updated_at: data.updated_at,
         measurement_types: data.measurement_types
       };

      console.log('✅ [DoctorMeasurementService] Ölçüm detayları başarıyla getirildi:', {
        measurementId,
        patientId: measurementDetails.patient_id,
        measurementType: measurementDetails.measurement_types.name
      });

      return measurementDetails;

    } catch (error) {
      console.error('💥 [DoctorMeasurementService] Ölçüm detayları getirme hatası:', error);
      throw error instanceof Error ? error : new Error('Ölçüm detayları getirilemedi');
    }
  }
}

export const doctorMeasurementService = new DoctorMeasurementService(); 