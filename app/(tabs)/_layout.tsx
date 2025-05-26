import { Link, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4263eb',
          tabBarInactiveTintColor: '#868e96',
          tabBarStyle: {
            height: 80,
            paddingBottom: 16,
            paddingTop: 12,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: 'white',
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: -3,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="hastalar"
          options={{
            title: 'Hastalar',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="users" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="mesajlar"
          options={{
            title: 'Mesajlar',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="comments" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
