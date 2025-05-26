import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export interface MessageBoxProps {
  sender: string;
  date: string;
  isUnread: boolean;
  content: string;
  onPress?: () => void;
}

export function MessageBox({ sender, date, isUnread, content, onPress }: MessageBoxProps) {
  // Truncate message content if it's too long
  const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.headerContainer}>
        <View style={styles.senderInfoContainer}>
          <Text style={styles.senderName}>{sender}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, isUnread ? styles.unreadStatus : styles.readStatus]}>
            {isUnread ? 'Yeni mesajınız var' : 'Yeni mesaj yok'}
          </Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{truncatedContent}</Text>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  senderInfoContainer: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  dateText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unreadStatus: {
    backgroundColor: '#e3fafc',
    color: '#0c8599',
  },
  readStatus: {
    backgroundColor: '#f1f3f5',
    color: '#868e96',
  },
  contentContainer: {
    marginTop: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20,
  },
});
