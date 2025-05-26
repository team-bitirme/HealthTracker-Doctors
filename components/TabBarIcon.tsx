import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) => {
  const { name, color, focused } = props;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundEllipse, { opacity: opacityAnim }]} />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <FontAwesome name={name} size={focused ? 26 : 24} color={color} />
      </Animated.View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 55,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundEllipse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    marginTop: 10,
    backgroundColor: 'rgba(66, 99, 235, 0.12)',
    borderRadius: 24,
  },
});
