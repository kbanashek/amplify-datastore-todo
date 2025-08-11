import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const NetworkStatusIndicator: React.FC = () => {
  // Use the custom hook to get network status information
  const { statusColor, statusText } = useNetworkStatus();
  
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
      <Text style={styles.text}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f6fa',
    borderRadius: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2f3542',
  },
});
