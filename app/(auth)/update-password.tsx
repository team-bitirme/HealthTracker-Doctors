import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';

export default function UpdatePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { updatePassword } = useAuthStore();

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        Alert.alert(
          'Başarılı', 
          'Şifreniz başarıyla güncellendi.',
          [
            {
              text: 'Tamam',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Hata', result.error || 'Bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🔐</Text>
          </View>
          <Text style={styles.title}>Şifre Güncelle</Text>
          <Text style={styles.subtitle}>
            Hesabınız için yeni bir şifre oluşturun
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni şifrenizi girin"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
            <TextInput
              style={styles.input}
              placeholder="Yeni şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Şifre Gereksinimleri:</Text>
            <Text style={[
              styles.requirementItem, 
              newPassword.length >= 6 && styles.requirementMet
            ]}>
              • En az 6 karakter
            </Text>
            <Text style={[
              styles.requirementItem, 
              newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet
            ]}>
              • Şifreler eşleşmeli
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.updateButton, 
              isLoading && styles.updateButtonDisabled
            ]}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>
              {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
  },
  passwordRequirements: {
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#28a745',
  },
  updateButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
}); 