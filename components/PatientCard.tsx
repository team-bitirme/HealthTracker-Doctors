import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doctorService } from '~/services/doctorService';
import { PatientAvatar } from './PatientAvatar';

interface PatientCardProps {
  id: string;
  name: string | null;
  surname: string | null;
  birth_date: string | null;
  gender_name: string | null;
  patient_note: string | null;
  created_at: string | null;
  onPress: (patientId: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  id,
  name,
  surname,
  birth_date,
  gender_name,
  patient_note,
  created_at,
  onPress,
}) => {
  console.log('🏥 [PatientCard] Hasta kartı render ediliyor:', {
    patientId: id,
    patientName: `${name} ${surname}`,
    hasNote: !!patient_note
  });

  const patientName = name && surname ? `${name} ${surname}` : 'İsim belirtilmemiş';
  const age = birth_date ? doctorService.calculateAge(birth_date) : null;
  const gender = doctorService.formatGender(gender_name);
  const joinDate = created_at ? new Date(created_at).toLocaleDateString('tr-TR') : '';

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

  const handlePress = () => {
    console.log('👆 [PatientCard] Hasta kartına tıklandı:', {
      patientId: id,
      patientName,
      age,
      gender
    });
    onPress(id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <PatientAvatar 
          gender={gender} 
          size="medium" 
          style={styles.avatar}
        />
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patientName}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Ionicons 
                name={getGenderIcon() as any} 
                size={14} 
                color={getGenderColor()} 
                style={styles.detailIcon} 
              />
              <Text style={styles.detailText}>{gender}</Text>
            </View>
            {age && (
              <View style={styles.detail}>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color="#FF9800" 
                  style={styles.detailIcon} 
                />
                <Text style={styles.detailText}>{age} yaş</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
      </View>
      
      {patient_note && (
        <Text style={styles.note} numberOfLines={2}>
          {patient_note}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.joinInfo}>
          <Ionicons name="time-outline" size={12} color="#9E9E9E" />
          <Text style={styles.joinDate}>Katılım: {joinDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  note: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
    marginLeft: 60, // Avatar genişliği + margin kadar indent
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 8,
    marginLeft: 60, // Avatar genişliği + margin kadar indent
  },
  joinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 11,
    color: '#9E9E9E',
    marginLeft: 4,
  },
}); 