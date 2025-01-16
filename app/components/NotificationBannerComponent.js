import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationBannerComponent = ({ title, message }) => {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  message: {
    fontSize: 14,
    color: 'white',
  },
});

export default NotificationBannerComponent;
