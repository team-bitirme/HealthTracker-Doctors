import React from 'react';
import { StyleSheet, Text, View, StatusBar, Platform } from 'react-native';
import { Avatar } from './Avatar';

export interface CustomHeaderProps {
  userName?: string;
  title?: string;
}

export function CustomHeader({ userName = 'Kullanıcı', title }: CustomHeaderProps) {
  // Get status bar height for proper padding
  const statusBarHeight = StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0);

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return now.toLocaleDateString('tr-TR', options);
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 20 }]}>
      <View style={styles.textContainer}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <>
            <Text style={styles.greeting}>{/*Merhaba, */}{userName}!</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </>
        )}
      </View>
      <View style={styles.avatarContainer}>
        <Avatar size={50} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    minHeight: 150,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarContainer: {
    marginLeft: 10,
  },
});
