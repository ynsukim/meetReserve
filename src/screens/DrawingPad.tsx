import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DrawingPad = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drawing Pad</Text>
      {/* Add your drawing pad content here */}
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

export default DrawingPad; 