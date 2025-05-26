import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '~/store/profileStore';

interface AvatarProps {
  size?: number;
  source?: string;
}

export function Avatar({ size = 40, source }: AvatarProps) {
  const router = useRouter();
  const { profile } = useProfileStore();

  const handlePress = () => {
    // Navigate to profile page
    router.push('/profile');
  };

  // Doktorun ad ve soyadından baş harfleri al
  const getInitials = () => {
    if (!profile?.name && !profile?.surname) {
      return 'DR';
    }
    
    const firstInitial = profile.name ? profile.name.charAt(0).toUpperCase() : '';
    const lastInitial = profile.surname ? profile.surname.charAt(0).toUpperCase() : '';
    
    return `${firstInitial}${lastInitial}` || 'DR';
  };

  // Eğer source varsa resim göster, yoksa baş harfleri göster
  if (source) {
    return (
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <Image
          source={{ uri: source }}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View
        style={[
          styles.initialsContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>
          {getInitials()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container'a borderRadius eklemeye gerek yok çünkü içerideki View zaten daire
    borderRadius: 10
  },
  avatar: {
    backgroundColor: '#e1e1e1',
  },
  initialsContainer: {
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10
    // borderRadius dinamik olarak View'da ayarlanıyor
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
