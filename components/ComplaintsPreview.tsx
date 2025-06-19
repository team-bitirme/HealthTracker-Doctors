import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Complaint } from '~/store/complaintsStore';

export interface ComplaintsPreviewProps {
  complaints: Complaint[];
  onAddPress: () => void;
  onComplaintPress?: (complaint: Complaint) => void;
}

export function ComplaintsPreview({
  complaints,
  onAddPress,
  onComplaintPress,
}: ComplaintsPreviewProps) {
  const activeComplaints = complaints.filter(
    (complaint) => complaint.is_active && !complaint.is_deleted
  );

  const getPriorityColor = (priorityLevel: string | null | undefined) => {
    switch (priorityLevel) {
      case 'high':
        return '#dc3545'; // Kırmızı
      case 'medium':
        return '#fd7e14'; // Turuncu
      case 'low':
        return '#28a745'; // Yeşil
      default:
        return '#6c757d'; // Gri
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
      return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Geçersiz tarih';
    }
  };

  const renderComplaintCard = (complaint: Complaint) => {
    const priorityColor = getPriorityColor(complaint.priority_level);
    const priorityIcon = getPriorityIcon(complaint.priority_level);

    return (
      <TouchableOpacity
        key={complaint.id}
        style={[styles.complaintCard, { borderLeftColor: priorityColor }]}
        onPress={() => onComplaintPress?.(complaint)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={styles.categoryText}>
              {complaint.category_name ?? 'Kategori belirtilmemiş'}
            </Text>
            {complaint.is_critical && (
              <FontAwesome
                name="exclamation-triangle"
                size={12}
                color="#dc3545"
                style={styles.criticalIcon}
              />
            )}
          </View>
          <FontAwesome name={priorityIcon as any} size={14} color={priorityColor} />
        </View>

        <Text style={styles.subcategoryText}>
          {complaint.subcategory_name ?? 'Alt kategori belirtilmemiş'}
        </Text>

        <Text style={styles.descriptionText} numberOfLines={2}>
          {complaint.description || 'Açıklama yok'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Başlangıç Tarihi: </Text>
          <Text style={styles.dateText}>{formatDate(complaint.start_date)}</Text>
          {/* <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: '#28a745' }]} />
            <Text style={styles.statusText}>Aktif</Text>
          </View> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Frame */}
      <View style={styles.headerFrame}>
        <View style={styles.titleContainer}>
          <FontAwesome name="stethoscope" size={14} color="#495057" />
          <Text style={styles.title}>Şikayetler</Text>
          {activeComplaints.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeComplaints.length}</Text>
            </View>
          )}
        </View>

        {/* <TouchableOpacity style={styles.addButton} onPress={onAddPress} activeOpacity={0.7}>
          <Ionicons name="add" size={12} color="#fff" />
          <Text style={styles.addButtonText}>Yeni Şikayet</Text>
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="info-circle" size={32} color="#6c757d" />
            <Text style={styles.emptyTitle}>Aktif şikayet bulunmuyor</Text>
            <Text style={styles.emptyText}></Text>
          </View>
        ) : (
          <ScrollView style={styles.complaintsContainer} showsVerticalScrollIndicator={false}>
            {activeComplaints.map(renderComplaintCard)}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 0,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerFrame: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginLeft: 6,
  },
  countBadge: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  content: {
    minHeight: 100,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  complaintsContainer: {
    maxHeight: 250,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
    flex: 1,
  },
  criticalIcon: {
    marginLeft: 4,
  },
  subcategoryText: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 6,
    marginLeft: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
});
