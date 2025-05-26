import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function IndexScreen() {
  const { session, isInitialized } = useAuthStore();

  // Wait for auth initialization
  if (!isInitialized) {
    return null; // or a loading screen
  }

  // Redirect based on auth state
  if (session) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
} 