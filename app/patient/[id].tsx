import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { DetailHeader } from '~/components/DetailHeader';
import { PatientAvatar } from '~/components/PatientAvatar';
import { DataCategoryList, DataCategory } from '~/components/DataCategoryList';
import { ComplaintsPreview } from '~/components/ComplaintsPreview';
// @ts-ignore - Geçici import sorunu
import { patientDetailService, PatientDetailData } from '~/services/patientDetailService';
import { doctorService } from '~/services/doctorService';
import { useComplaintsStore } from '~/store/complaintsStore';

export default function PatientDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [patientData, setPatientData] = useState<PatientDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Şikayet store'u
  const {
    complaints,
    isLoading: complaintsLoading,
    fetchComplaints,
    reset: resetComplaints,
  } = useComplaintsStore();

  useEffect(() => {
    if (id) {
      loadPatientData();
      loadComplaints();
    }
  }, [id]);

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📋 [PatientDetail] Hasta detayları yükleniyor...', { patientId: id });

      const data = await patientDetailService.getPatientDetail(id);
      setPatientData(data);

      console.log('✅ [PatientDetail] Hasta detayları başarıyla yüklendi:', {
        patientName: `${data.name} ${data.surname}`,
        hasLastMessage: !!data.lastMessage,
        categoriesCount: data.healthDataCategories.length,
      });
    } catch (error) {
      console.error('💥 [PatientDetail] Hasta detayları yükleme hatası:', error);
      setError('Hasta detayları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      await fetchComplaints(id);
    } catch (error) {
      console.error('💥 [PatientDetail] Şikayetler yükleme hatası:', error);
    }
  };

  const handleGoBack = () => {
    console.log('⬅️ [PatientDetail] Geri butonuna tıklandı');
    router.back();
  };

  const handleSendMessage = () => {
    console.log('💬 [PatientDetail] Mesaj gönder butonuna tıklandı');
    Alert.alert('Mesaj Gönder', 'Mesajlaşma özelliği henüz hazırlanmadı.', [{ text: 'Tamam' }]);
    // TODO: Navigate to messages page
    // router.push(`/messages/${patientData?.user_id}`);
  };

  const handleAddComplaint = () => {
    console.log('📝 [PatientDetail] Şikayet ekleme butonuna tıklandı');
    Alert.alert(
      'Yeni Şikayet',
      'Şikayet ekleme özelliği doktor uygulamasında henüz hazırlanmadı. Bu özellik hasta uygulamasından kullanılabilir.',
      [{ text: 'Tamam' }]
    );
  };

  const handleComplaintPress = (complaint: any) => {
    console.log('📋 [PatientDetail] Şikayet detayına tıklandı:', complaint.id);
    Alert.alert(
      'Şikayet Detayı',
      `Şikayet: ${complaint.description || 'Açıklama yok'}\nKategori: ${complaint.category_name || 'Belirtilmemiş'}\nAlt kategori: ${complaint.subcategory_name || 'Belirtilmemiş'}`,
      [{ text: 'Tamam' }]
    );
  };

  const handleCategoryPress = (category: DataCategory) => {
    console.log('📊 [PatientDetail] Kategori seçildi:', {
      categoryTitle: category.title,
      categoryId: category.id,
      measurementTypeId: category.measurementTypeId,
    });

    if (!category.measurementTypeId) {
      Alert.alert('Hata', 'Ölçüm tipi bilgisi bulunamadı.', [{ text: 'Tamam' }]);
      return;
    }

    // Ölçüm geçmişi sayfasına git
    router.push({
      pathname: '/patient/olcum-gecmisi' as any,
      params: {
        patientId: id,
        categoryId: category.id,
        categoryTitle: category.title,
        measurementTypeId: category.measurementTypeId.toString(),
      },
    });
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>Hasta bilgileri yükleniyor...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadPatientData}>
        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPatientInfo = () => {
    if (!patientData) return null;

    const patientName =
      `${patientData.name || ''} ${patientData.surname || ''}`.trim() || 'İsim belirtilmemiş';
    const age = patientData.birth_date ? doctorService.calculateAge(patientData.birth_date) : null;
    const gender = doctorService.formatGender(patientData.gender_name);
    const joinDate = patientData.created_at
      ? new Date(patientData.created_at).toLocaleDateString('tr-TR')
      : '';

    const getGenderIcon = () => {
      if (gender === 'Erkek') return 'male';
      if (gender === 'Kadın') return 'female';
      return 'person';
    };

    const getGenderColor = () => {
      if (gender === 'Erkek') return '#4FC3F7';
      if (gender === 'Kadın') return '#F06292';
      return '#9E9E9E';
    };

    return (
      <View style={styles.patientInfoContainer}>
        <View style={styles.patientHeader}>
          <PatientAvatar gender={gender} size="large" style={styles.avatar} />
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patientName}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detail}>
                <Ionicons
                  name={getGenderIcon() as any}
                  size={16}
                  color={getGenderColor()}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{gender}</Text>
              </View>
              {age && (
                <View style={styles.detail}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#FF9800"
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailText}>{age} yaş</Text>
                </View>
              )}
            </View>
            <View style={styles.joinInfo}>
              <Ionicons name="time-outline" size={14} color="#9E9E9E" />
              <Text style={styles.joinDate}>Katılım: {joinDate}</Text>
            </View>
          </View>
        </View>

        {patientData.patient_note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Hasta Notu:</Text>
            <Text style={styles.noteText}>{patientData.patient_note}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderLastMessage = () => {
    if (!patientData?.lastMessage) return null;

    const messageTime = new Date(patientData.lastMessage.created_at).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.messageContainer}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageTitle}>Son Mesaj</Text>
          <TouchableOpacity style={styles.sendMessageButton} onPress={handleSendMessage}>
            <Ionicons name="chatbubble-outline" size={16} color="#007bff" />
            <Text style={styles.sendMessageText}>Mesaj Gönder</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.messageContent}>
          <Text style={styles.messageText} numberOfLines={3}>
            {patientData.lastMessage.content}
          </Text>
          <Text style={styles.messageTime}>{messageTime}</Text>
        </View>
      </View>
    );
  };

  const renderHealthDataCategories = () => {
    if (!patientData?.healthDataCategories.length) {
      return (
        <View style={styles.emptyDataContainer}>
          <FontAwesome name="bar-chart" size={48} color="#E0E0E0" />
          <Text style={styles.emptyDataTitle}>Henüz sağlık verisi yok</Text>
          <Text style={styles.emptyDataDescription}>
            Hasta henüz herhangi bir sağlık verisi girmemiş.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.categoriesContainer}>
        <DataCategoryList
          title="Sağlık Verileri"
          categories={patientData.healthDataCategories}
          onSelectCategory={handleCategoryPress}
        />
      </View>
    );
  };

  const renderComplaints = () => {
    return (
      <View style={styles.complaintsContainer}>
        <ComplaintsPreview
          complaints={complaints}
          onAddPress={handleAddComplaint}
          onComplaintPress={handleComplaintPress}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <DetailHeader title="Hasta Detayı" onBackPress={handleGoBack} />

      {isLoading && renderLoadingState()}
      {error && !isLoading && renderErrorState()}
      {!isLoading && !error && patientData && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          {renderPatientInfo()}
          {renderLastMessage()}
          {renderComplaints()}
          {renderHealthDataCategories()}
        </ScrollView>
      )}
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
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  patientInfoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 16,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginLeft: 4,
  },
  noteContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  messageContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sendMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  sendMessageText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  messageContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
  },
  categoriesContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  emptyDataContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDataDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  complaintsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});
