import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DataEntryHeader } from '~/components/DetailHeader';
import { doctorMeasurementService, MeasurementDetails } from '~/services/patientDetailService';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function OlcumDetay() {
  const router = useRouter();
  const { measurementId, categoryTitle } = useLocalSearchParams<{
    measurementId: string;
    categoryTitle: string;
  }>();

  const [measurementDetails, setMeasurementDetails] = useState<MeasurementDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📋 [OlcumDetay] Ölçüm detay sayfası açıldı:', measurementId);
    
    if (measurementId) {
      loadMeasurementDetails();
    }
  }, [measurementId]);

  const loadMeasurementDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 [OlcumDetay] Ölçüm detayları yükleniyor...', { measurementId });

      const data = await doctorMeasurementService.getMeasurementDetails(measurementId);
      
      if (!data) {
        throw new Error('Ölçüm detayları bulunamadı');
      }
      
      setMeasurementDetails(data);
      
      console.log('✅ [OlcumDetay] Ölçüm detayları başarıyla yüklendi:', {
        measurementId: data.id,
        measurementType: data.measurement_types.name
      });
      
    } catch (error) {
      console.error('💥 [OlcumDetay] Ölçüm detayları yükleme hatası:', error);
      setError(error instanceof Error ? error.message : 'Ölçüm detayları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('⬅️ [OlcumDetay] Geri butonuna tıklandı');
    router.back();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null || value === undefined) return 'Değer yok';
    return `${value} ${unit}`;
  };

  const getMethodText = (method: string | null) => {
    if (!method) return 'Yöntem belirtilmemiş';
    
    const methodMap: { [key: string]: string } = {
      'manual': 'El ile giriş',
      'photo': 'Fotoğraf ile',
      'device': 'Cihaz ile',
      'automatic': 'Otomatik'
    };
    
    return methodMap[method] || method;
  };

  const getMethodIcon = (method: string | null) => {
    if (method === 'manual') return 'create-outline';
    if (method === 'photo') return 'camera-outline';
    if (method === 'device') return 'hardware-chip-outline';
    return 'help-outline';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Ölçüm detayları yükleniyor...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!measurementDetails) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome name="info-circle" size={48} color="#6c757d" />
          <Text style={styles.emptyText}>Ölçüm detayları bulunamadı</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Main Value Card */}
          <View style={styles.valueCard}>
            <Text style={styles.valueLabel}>Ölçüm Değeri</Text>
            <Text style={styles.valueText}>
              {formatValue(measurementDetails.value, measurementDetails.measurement_types.unit)}
            </Text>
            <Text style={styles.measurementType}>
              {measurementDetails.measurement_types.name}
            </Text>
          </View>

          {/* Details Cards */}
          <View style={styles.detailsContainer}>
            {/* Date & Time */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="calendar-outline" size={24} color="#007bff" />
                <Text style={styles.detailTitle}>Ölçüm Tarihi</Text>
              </View>
              <Text style={styles.detailValue}>
                {formatDate(measurementDetails.measured_at)}
              </Text>
            </View>

            {/* Method */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons 
                  name={getMethodIcon(measurementDetails.method)} 
                  size={24} 
                  color="#28a745" 
                />
                <Text style={styles.detailTitle}>Ölçüm Yöntemi</Text>
              </View>
              <Text style={styles.detailValue}>
                {getMethodText(measurementDetails.method)}
              </Text>
            </View>

            {/* Created Date */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="add-circle-outline" size={24} color="#6f42c1" />
                <Text style={styles.detailTitle}>Kayıt Tarihi</Text>
              </View>
              <Text style={styles.detailValue}>
                {formatDate(measurementDetails.created_at)}
              </Text>
            </View>

            {/* Updated Date (if different from created) */}
            {measurementDetails.updated_at && 
             measurementDetails.updated_at !== measurementDetails.created_at && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="create-outline" size={24} color="#fd7e14" />
                  <Text style={styles.detailTitle}>Son Güncelleme</Text>
                </View>
                <Text style={styles.detailValue}>
                  {formatDate(measurementDetails.updated_at)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - Detay`} onBackPress={handleGoBack} />
      {renderContent()}
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
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  valueCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valueLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  measurementType: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  detailsContainer: {
    gap: 12,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
}); 