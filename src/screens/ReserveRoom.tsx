import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReserveRoom = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reserve Room</Text>
      {/* Add your room reservation content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F1F1F1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ReserveRoom; 