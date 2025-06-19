import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Complaint } from '~/store/complaintsStore';
import { useRouter } from 'expo-router';

interface ComplaintWithPatient extends Complaint {
  patient_name?: string;
}

interface DoctorComplaintsOverviewProps {
  complaints: ComplaintWithPatient[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const DoctorComplaintsOverview: React.FC<DoctorComplaintsOverviewProps> = ({
  complaints,
  isLoading,
  onRefresh,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#fd7e14';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getPriorityIcon = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return 'exclamation-triangle';
      case 'medium':
        return 'exclamation';
      case 'low':
        return 'info-circle';
      default:
        return 'question-circle';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} saat önce`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} gün önce`;
      }
    } catch {
      return 'Geçersiz tarih';
    }
  };

  const handleComplaintPress = (complaint: ComplaintWithPatient) => {
    if (complaint.patient_id) {
      router.push({
        pathname: '/patient/[id]' as any,
        params: { id: complaint.patient_id },
      });
    }
  };

  const handleViewAllPress = () => {
    // Gelecekte şikayetlerin listesini gösteren bir sayfa açılabilir
    console.log('Tüm şikayetleri görüntüle');
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const renderComplaintCard = (complaint: ComplaintWithPatient) => {
    const priorityColor = getPriorityColor(complaint.priority_level);
    const priorityIcon = getPriorityIcon(complaint.priority_level);

    return (
      <TouchableOpacity
        key={complaint.id}
        style={[styles.complaintCard, { borderLeftColor: priorityColor }]}
        onPress={() => handleComplaintPress(complaint)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <FontAwesome name="user" size={12} color="#6c757d" />
            <Text style={styles.patientName}>
              {complaint.patient_name || 'Hasta ismi belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.priorityInfo}>
            {complaint.is_critical && (
              <FontAwesome
                name="exclamation-triangle"
                size={12}
                color="#dc3545"
                style={styles.criticalIcon}
              />
            )}
            <FontAwesome name={priorityIcon as any} size={12} color={priorityColor} />
          </View>
        </View>

        <View style={styles.categoryInfo}>
          <Text style={styles.categoryText}>
            {complaint.category_name ?? 'Kategori belirtilmemiş'}
          </Text>
          <Text style={styles.subcategoryText}>
            {complaint.subcategory_name ?? 'Alt kategori belirtilmemiş'}
          </Text>
        </View>

        <Text style={styles.descriptionText} numberOfLines={2}>
          {complaint.description || 'Açıklama yok'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDate(complaint.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Şikayetler yükleniyor...</Text>
        </View>
      );
    }

    if (complaints.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome name="check-circle" size={32} color="#28a745" />
          <Text style={styles.emptyStateTitle}>Harika! 🎉</Text>
          <Text style={styles.emptyStateText}>Şu anda aktif şikayet bulunmuyor</Text>
        </View>
      );
    }

    return (
      <View style={styles.complaintsContainer}>
        {complaints.slice(0, 5).map(renderComplaintCard)}
        {complaints.length > 5 && (
          <TouchableOpacity
            style={styles.viewMoreCard}
            onPress={handleViewAllPress}
            activeOpacity={0.7}>
            <FontAwesome name="plus" size={20} color="#6c757d" />
            <Text style={styles.viewMoreText}>+{complaints.length - 5} daha</Text>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome name="exclamation-circle" size={16} color="#fd7e14" />
          <Text style={styles.title}>Aktif Şikayetler</Text>
          {complaints.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{complaints.length}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleToggleExpanded}
          activeOpacity={0.7}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#6c757d" />
        </TouchableOpacity>
      </View>

      {expanded && renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#fd7e14',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandButton: {
    padding: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  complaintsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  complaintCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 6,
  },
  priorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criticalIcon: {
    marginRight: 4,
  },
  categoryInfo: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 2,
  },
  subcategoryText: {
    fontSize: 12,
    color: '#6c757d',
  },
  descriptionText: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    color: '#6c757d',
  },
  viewMoreCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
  },
});
