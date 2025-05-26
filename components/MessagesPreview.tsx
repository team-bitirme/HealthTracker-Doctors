import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isUnread: boolean;
  type: 'doctor' | 'ai' | 'system';
}

export interface MessagesPreviewProps {
  messages: Message[];
  onPress: () => void;
}

export function MessagesPreview({ messages, onPress }: MessagesPreviewProps) {
  const unreadCount = messages.filter(msg => msg.isUnread).length;
  const latestMessage = messages[0];

  if (messages.length === 0) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.emptyContainer}>
          <FontAwesome name="comments-o" size={24} color="#6c757d" />
          <Text style={styles.emptyTitle}>Mesajlar</Text>
          <Text style={styles.emptyText}>Doktorunuza mesaj gönderin</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome name="comments" size={20} color="#007bff" />
          <Text style={styles.title}>Mesajlar</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.messagePreview}>
        <Text style={styles.senderName}>{latestMessage.sender}</Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {latestMessage.content}
        </Text>
        <Text style={styles.timestamp}>{latestMessage.timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagePreview: {
    marginTop: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
}); 