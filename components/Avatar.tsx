import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface AvatarProps {
  size?: number;
  source?: string;
}

export function Avatar({ size = 40, source }: AvatarProps) {
  const router = useRouter();

  const handlePress = () => {
    // Navigate to profile page
    router.push('/profile');
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Image
        source={source ? { uri: source } : require('../assets/default-avatar.png')}
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
  },
  avatar: {
    backgroundColor: '#e1e1e1',
  },
});
