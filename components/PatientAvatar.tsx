import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface PatientAvatarProps {
  gender?: string | null;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({ 
  gender, 
  size = 'medium',
  style 
}) => {
  console.log('👤 [PatientAvatar] Avatar render ediliyor:', { gender, size });

  const getAvatarSource = () => {
    if (gender === 'Kadın' || gender === 'Female') {
      console.log('👩 [PatientAvatar] Kadın avatarı seçildi');
      return require('~/assets/default-profile/female.jpg');
    } else if (gender === 'Erkek' || gender === 'Male') {
      console.log('👨 [PatientAvatar] Erkek avatarı seçildi');
      return require('~/assets/default-profile/male.png');
    } else {
      console.log('👤 [PatientAvatar] Default avatar seçildi, cinsiyet:', gender);
      // Varsayılan olarak erkek avatarını kullan
      return require('~/assets/default-profile/male.png');
    }
  };

  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'medium':
        return { width: 48, height: 48, borderRadius: 24 };
      case 'large':
        return { width: 64, height: 64, borderRadius: 32 };
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  const avatarSize = getAvatarSize();
  const avatarSource = getAvatarSource();

  return (
    <View style={[styles.container, avatarSize, style]}>
      <Image
        source={avatarSource}
        style={[styles.avatar, avatarSize]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    backgroundColor: '#f8f9fa',
  },
}); 