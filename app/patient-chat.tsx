import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChatHeader } from '~/components/ChatHeader';
import { MessageBubble, MessageBubbleProps } from '~/components/MessageBubble';
import { MessageInput } from '~/components/MessageInput';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { useMessagesStore } from '~/store/messagesStore';
import { useMessageChecker } from '~/lib/hooks/useMessageChecker';
import { messagesService } from '~/services/messagesService';

export default function HastaMessagesScreen() {
  const router = useRouter();
  const { patientId, patientUserId, patientName } = useLocalSearchParams<{ 
    patientId: string;
    patientUserId: string;
    patientName: string;
  }>();
  
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const flatListRef = useRef<FlatList>(null);
  const {
    messages,
    isLoading,
    isSending,
    error,
    loadMessages,
    sendMessage,
    loadMessageTypes,
    loadPatientInfo,
    patientInfo,
    markChatAsRead,
    clearMessages,
    setError,
    lastMessageId
  } = useMessagesStore();

  // Mesaj kontrol hook'u
  const { checkMessages } = useMessageChecker({
    onNewMessage: () => {
      console.log('🔔 [Patient-Chat] Yeni mesaj var, mesajlar yeniden yükleniyor...');
      if (user?.id && patientUserId) {
        loadMessages(user.id, patientUserId, true);
      }
    }
  });  // Sayfa focus olduğunda mesaj kontrolü yap ve okunmamış mesajları okundu işaretle
  useFocusEffect(
    React.useCallback(() => {
      const checkForNewChatMessages = async () => {
        if (!user?.id || !patientUserId) return;
        
        console.log('👁️ [Patient-Chat] Sayfa focus oldu, yeni mesajlar kontrol ediliyor...');
        
        try {
          // Chat'e özel yeni mesaj kontrolü yap
          const hasNewMessages = await messagesService.checkForNewMessagesInChat(
            user.id, 
            patientUserId, 
            lastMessageId || undefined
          );
          
          if (hasNewMessages) {
            console.log('🔔 [Patient-Chat] Yeni mesaj var, mesajlar yeniden yükleniyor...');
            loadMessages(user.id, patientUserId, true);
          }

          // Okunmamış mesajları okundu olarak işaretle
          await markChatAsRead(user.id, patientUserId);
          
        } catch (error) {
          console.error('💥 [Patient-Chat] Yeni mesaj kontrolü hatası:', error);
        }
      };

      // Mesajlar yüklendikten sonra kontrol et
      if (user?.id && patientUserId) {
        checkForNewChatMessages();
      }
    }, [user?.id, patientUserId, lastMessageId, messages.length])
  );

  useEffect(() => {
    const initializeMessages = async () => {
      if (!user?.id || !patientUserId) return;
      
      try {
        console.log('📋 [Patient-Chat] Mesajlaşma başlatılıyor...', {
          patientId,
          patientUserId,
          patientName
        });
        
        // Mesaj tiplerini yükle
        await loadMessageTypes();
        
        // Hasta bilgilerini yükle
        if (patientUserId) {
          await loadPatientInfo(patientUserId);
        }
        
        // Mesajları yükle ve otomatik olarak okundu işaretle
        await loadMessages(user.id, patientUserId, true);
      } catch (error) {
        console.error('💥 [Patient-Chat] Mesaj sistemi başlatılırken hata:', error);
      }
    };

    initializeMessages();
    
    // Component unmount olduğunda mesajları temizle
    return () => {
      clearMessages();
    };
  }, [user?.id, patientUserId, patientId, patientName, loadMessageTypes, loadPatientInfo, loadMessages, clearMessages]);

  useEffect(() => {
    // Mesajlar güncellendiğinde en sona scroll yap
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user?.id || !patientUserId) {
      return;
    }

    try {
      await sendMessage(messageText, user.id, patientUserId, 1, async () => {
        // Mesaj gönderildikten sonra chat'e özel yeni mesaj kontrolü yap
        console.log('📤 [Patient-Chat] Mesaj gönderildi, yeni mesajlar kontrol ediliyor...');
        
        setTimeout(async () => {
          try {
            const hasNewMessages = await messagesService.checkForNewMessagesInChat(
              user.id, 
              patientUserId, 
              lastMessageId || undefined
            );
            
            if (hasNewMessages) {
              console.log('🔔 [Patient-Chat] Gönderimden sonra yeni mesaj tespit edildi, yeniden yükleniyor...');
              loadMessages(user.id, patientUserId, true);
            }
          } catch (error) {
            console.error('💥 [Patient-Chat] Gönderim sonrası mesaj kontrolü hatası:', error);
          }
        }, 500);
      });
      
      // Mesaj gönderildikten sonra en sona scroll yap
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert(
        'Hata',
        'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleInfoPress = () => {
    if (patientId) {
      router.push({
        pathname: "/patient/[id]",
        params: { id: patientId }
      });
    } else {
      Alert.alert(
        'Bilgi',
        'Hasta detayları görüntülenemiyor.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const getDisplayPatientName = () => {
    if (patientInfo?.patient_name) {
      return patientInfo.patient_name;
    }
    return patientName || 'Hasta';
  };

  const getPatientSubtitle = () => {
    return 'Çevrimiçi';
  };

  const renderMessage = ({ item }: { item: MessageBubbleProps }) => (
    <MessageBubble {...item} />
  );

  const getItemLayout = (_: any, index: number) => ({
    length: 80, // Ortalama mesaj yüksekliği
    offset: 80 * index,
    index,
  });

  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Hata',
        error,
        [
          { 
            text: 'Tamam', 
            onPress: () => setError(null) 
          }
        ]
      );
    }
  }, [error, setError]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ChatHeader
        title={getDisplayPatientName()}
        subtitle={getPatientSubtitle()}
        onBackPress={handleBackPress}
        onInfoPress={handleInfoPress}
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshing={isLoading}
        onRefresh={() => {
          if (user?.id && patientUserId) {
            loadMessages(user.id, patientUserId, true);
          }
        }}
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!patientUserId || isSending}
        isLoading={isSending}
        placeholder={
          patientUserId 
            ? "Mesajınızı yazın..." 
            : "Hasta bulunamadı..."
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
}); 