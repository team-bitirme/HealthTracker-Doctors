import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { DetailHeader } from '~/components/DetailHeader';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { usePatientsStore } from '~/store/patientsStore';
import { supabase } from '~/lib/supabase';

interface PatientFormData {
  email: string;
  password: string;
  name: string;
  surname: string;
  birth_date: Date;
  gender: 'male' | 'female' | null;
  patient_note: string;
}

export default function AddPatient() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { fetchPatients } = usePatientsStore();

  const [formData, setFormData] = useState<PatientFormData>({
    email: '',
    password: '',
    name: '',
    surname: '',
    birth_date: new Date(),
    gender: null,
    patient_note: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('birth_date', selectedDate);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'E-posta adresi gereklidir';
    if (!formData.password.trim()) return 'Şifre gereklidir';
    if (formData.password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
    if (!formData.name.trim()) return 'Ad gereklidir';
    if (!formData.surname.trim()) return 'Soyad gereklidir';
    if (!formData.gender) return 'Cinsiyet seçimi gereklidir';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Geçerli bir e-posta adresi giriniz';
    
    // Test domain'lerini engelle
    const invalidDomains = ['example.com', 'test.com', 'invalid.com'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (invalidDomains.includes(emailDomain)) {
      return 'Lütfen gerçek bir e-posta adresi kullanın (gmail.com, outlook.com vb.)';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Hata', validationError);
      return;
    }

    if (!profile?.id) {
      Alert.alert('Hata', 'Doktor profili bulunamadı');
      return;
    }

    setIsLoading(true);

    try {
      console.log('👥 [AddPatient] Hasta ekleme işlemi başlatılıyor...', {
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        doctorId: profile.id
      });

      // 1. Önce hasta için auth kullanıcısı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('💥 [AddPatient] Auth kullanıcı oluşturma hatası:', authError);
        
        // E-posta validasyon hatası için özel mesaj
        if (authError.message.includes('Email address') && authError.message.includes('invalid')) {
          throw new Error('Geçersiz e-posta adresi. Lütfen gerçek bir e-posta adresi kullanın (gmail.com, outlook.com vb.)');
        }
        
        throw new Error(`Kullanıcı oluşturulamadı: ${authError.message}`);
      }

      if (!authData.user?.id) {
        throw new Error('Kullanıcı ID\'si alınamadı');
      }

      const patientUserId = authData.user.id;
      console.log('✅ [AddPatient] Auth kullanıcısı oluşturuldu:', { patientUserId });

      // 2. Users tablosuna ekle
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: patientUserId,
          email: formData.email,
          role_id: 3, // Patient role ID
          created_at: new Date().toISOString(),
        });

      if (userError) {
        console.error('💥 [AddPatient] Users tablosuna ekleme hatası:', userError);
        throw new Error(`Kullanıcı kaydı oluşturulamadı: ${userError.message}`);
      }

      console.log('✅ [AddPatient] Users tablosuna kaydedildi');

      // 3. Cinsiyet ID'sini belirle (erkek: 1, kadın: 2)
      const genderId = formData.gender === 'male' ? 1 : 2;
      console.log('✅ [AddPatient] Cinsiyet ID belirlendi:', { gender: formData.gender, genderId });

      // 4. Patients tablosuna ekle
      const patientInsertData = {
        user_id: patientUserId,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        birth_date: formData.birth_date.toISOString().split('T')[0],
        gender_id: genderId,
        patient_note: formData.patient_note.trim() || null,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert(patientInsertData as any)
        .select('id')
        .single();

      if (patientError) {
        console.error('💥 [AddPatient] Patients tablosuna ekleme hatası:', patientError);
        throw new Error(`Hasta kaydı oluşturulamadı: ${patientError.message}`);
      }

      if (!patientData?.id) {
        throw new Error('Hasta ID\'si alınamadı');
      }

      const patientId = patientData.id;
      console.log('✅ [AddPatient] Patients tablosuna kaydedildi:', { patientId });

      // 5. Doctor_patients tablosuna ilişki ekle
      const { error: doctorPatientError } = await supabase
        .from('doctor_patients')
        .insert({
          doctor_id: profile.id,
          patient_id: patientId,
          is_deleted: false,
          created_at: new Date().toISOString(),
        });

      if (doctorPatientError) {
        console.error('💥 [AddPatient] Doctor_patients tablosuna ekleme hatası:', doctorPatientError);
        throw new Error(`Doktor-hasta ilişkisi oluşturulamadı: ${doctorPatientError.message}`);
      }

      console.log('✅ [AddPatient] Doctor_patients tablosuna kaydedildi');

      // 6. Doktorun hasta sayısını güncelle
      const { count } = await supabase
        .from('doctor_patients')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', profile.id)
        .eq('is_deleted', false);

      await supabase
        .from('doctors')
        .update({
          patient_count: count || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      console.log('✅ [AddPatient] Doktor hasta sayısı güncellendi:', { newCount: count || 0 });

      Alert.alert(
        'Başarılı',
        'Hasta başarıyla eklendi!',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Hasta listesini yenile
              fetchPatients(profile.id);
              router.back();
            }
          }
        ]
      );

    } catch (error) {
      console.error('💥 [AddPatient] Hasta ekleme beklenmeyen hatası:', error);
      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Hasta eklenirken bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <DetailHeader 
        title="Yeni Hasta Ekle" 
        onBackPress={handleGoBack}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Hesap Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta Adresi *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="hasta@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre *</Text>
            <View style={styles.passwordContainer}>              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                placeholder="En az 6 karakter"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Kişisel Bilgiler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Ad *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Ad"
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Soyad *</Text>
              <TextInput
                style={styles.input}
                value={formData.surname}
                onChangeText={(text) => handleInputChange('surname', text)}
                placeholder="Soyad"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Doğum Tarihi *</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(formData.birth_date)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.birth_date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cinsiyet *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => handleInputChange('gender', 'male')}
              >
                <Ionicons
                  name="male"
                  size={20}
                  color={formData.gender === 'male' ? '#fff' : '#4FC3F7'}
                />
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'male' && styles.genderButtonTextActive
                ]}>
                  Erkek
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => handleInputChange('gender', 'female')}
              >
                <Ionicons
                  name="female"
                  size={20}
                  color={formData.gender === 'female' ? '#fff' : '#F06292'}
                />
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'female' && styles.genderButtonTextActive
                ]}>
                  Kadın
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>



        {/* Hasta Notu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hasta Notu</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Not (İsteğe bağlı)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.patient_note}
              onChangeText={(text) => handleInputChange('patient_note', text)}
              placeholder="Hasta hakkında özel notlar..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Kaydet Butonu */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Hastayı Kaydet</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  genderButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
}); 