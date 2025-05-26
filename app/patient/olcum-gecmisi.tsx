import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DataEntryHeader } from '~/components/DetailHeader';
import { MeasurementListItem } from '~/components/MeasurementListItem';
import { doctorMeasurementService, MeasurementRecord } from '~/services/patientDetailService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function OlcumGecmisi() {
  const router = useRouter();
  const { patientId, categoryId, categoryTitle, measurementTypeId } = useLocalSearchParams<{
    patientId: string;
    categoryId: string;
    categoryTitle: string;
    measurementTypeId: string;
  }>();

  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('📊 [OlcumGecmisi] Ölçüm geçmişi sayfası açıldı:', { 
      categoryTitle, 
      patientId, 
      measurementTypeId 
    });
    
    if (patientId && measurementTypeId) {
      loadMeasurementHistory();
    }
  }, [patientId, measurementTypeId]);

  const loadMeasurementHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 [OlcumGecmisi] Ölçüm geçmişi yükleniyor...', {
        patientId,
        measurementTypeId: parseInt(measurementTypeId)
      });

      const data = await doctorMeasurementService.getMeasurementHistory(
        patientId, 
        parseInt(measurementTypeId)
      );
      
      setMeasurements(data);
      
      console.log('✅ [OlcumGecmisi] Ölçüm geçmişi başarıyla yüklendi:', {
        recordCount: data.length
      });
      
    } catch (error) {
      console.error('💥 [OlcumGecmisi] Ölçüm geçmişi yükleme hatası:', error);
      setError('Ölçüm geçmişi yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('⬅️ [OlcumGecmisi] Geri butonuna tıklandı');
    router.back();
  };

  const handleMeasurementPress = (measurement: MeasurementRecord) => {
    console.log('📋 [OlcumGecmisi] Ölçüm seçildi:', measurement.id);
    router.push({
      pathname: '/patient/olcum-detay' as any,
      params: { 
        measurementId: measurement.id,
        categoryTitle: categoryTitle 
      }
    });
  };

  const renderMeasurementItem = ({ item }: { item: MeasurementRecord }) => (
    <MeasurementListItem
      measurement={item}
      onPress={handleMeasurementPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="info-circle" size={48} color="#6c757d" />
      <Text style={styles.emptyText}>Henüz ölçüm kaydı bulunmuyor</Text>
      <Text style={styles.emptySubText}>
        Bu kategori için veri ekleyerek ölçüm geçmişinizi oluşturmaya başlayın
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>Ölçüm geçmişi yükleniyor...</Text>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (measurements.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={measurements}
        renderItem={renderMeasurementItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - Geçmiş`} onBackPress={handleGoBack} />
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
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
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 