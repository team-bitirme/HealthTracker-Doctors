import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';

import { CustomHeader } from '~/components/CustomHeader';
import { PatientCard } from '~/components/PatientCard';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { usePatientsStore } from '~/store/patientsStore';

export default function Hastalar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { patients, isLoading, error, fetchPatients } = usePatientsStore();

  useEffect(() => {
    if (profile?.id) {
      fetchPatients(profile.id);
    }
  }, [profile?.id, fetchPatients]);

  const handlePatientPress = (patientId: string) => {
    console.log('👆 [Hastalar] Hasta detayına yönlendirme:', { patientId });
    router.push(`/patient/${patientId}` as any);
  };

  const handleAddPatient = () => {
    console.log('➕ [Hastalar] Hasta ekle butonuna tıklandı');
    router.push('/add-patient');
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>Hastalar yükleniyor...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="users" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Henüz hasta yok</Text>
      <Text style={styles.emptyDescription}>
        Size atanan hastalar burada görüntülenecek.
      </Text>
      <TouchableOpacity style={styles.addPatientButtonLarge} onPress={handleAddPatient}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addPatientButtonLargeText}>İlk Hastanı Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPatientsList = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <FontAwesome name="users" size={24} color="#007bff" />
          <View style={styles.statText}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Toplam Hasta</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addPatientCard} onPress={handleAddPatient}>
          <Ionicons name="add-circle" size={28} color="#28a745" />
          <View style={styles.addPatientText}>
            <Text style={styles.addPatientTitle}>Hasta Ekle</Text>
            <Text style={styles.addPatientSubtitle}>Yeni hasta kaydı</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.patientsContainer}>
        <Text style={styles.sectionTitle}>Hastalarım</Text>
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            id={patient.id}
            name={patient.name}
            surname={patient.surname}
            birth_date={patient.birth_date}
            gender_name={patient.gender_name}
            patient_note={patient.patient_note}
            created_at={patient.created_at}
            onPress={handlePatientPress}
          />
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <CustomHeader title="Hastalar" />
      
      {isLoading && renderLoadingState()}
      {error && !isLoading && renderErrorState()}
      {!isLoading && !error && patients.length === 0 && renderEmptyState()}
      {!isLoading && !error && patients.length > 0 && renderPatientsList()}
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
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addPatientButtonLarge: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addPatientButtonLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flex: 1,
  },
  addPatientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flex: 1,
  },
  statText: {
    marginLeft: 16,
  },
  addPatientText: {
    marginLeft: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addPatientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  addPatientSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  patientsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
