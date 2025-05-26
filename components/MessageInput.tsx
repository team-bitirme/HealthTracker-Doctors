import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function MessageInput({ 
  onSendMessage, 
  placeholder = "Mesajınızı yazın...", 
  disabled = false,
  isLoading = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.inputContainer}>
        <View style={styles.textInputContainer}>
          <TextInput
            style={[styles.textInput, disabled && styles.disabledInput]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor="#6c757d"
            multiline
            maxLength={1000}
            editable={!disabled}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <FontAwesome name="spinner" size={20} color="#fff" />
          ) : (
            <FontAwesome name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      
      {disabled && (
        <View style={styles.disabledOverlay}>
          <FontAwesome name="lock" size={16} color="#6c757d" />
          <Text style={styles.disabledText}>
            Mesajlaşma özelliği henüz aktif değil
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  textInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
    backgroundColor: '#f8f9fa',
    color: '#212529',
  },
  disabledInput: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007bff',
  },
  sendButtonInactive: {
    backgroundColor: '#6c757d',
  },
  disabledOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  disabledText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    fontStyle: 'italic',
  },
}); 