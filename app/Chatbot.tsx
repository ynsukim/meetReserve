import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Chatbot = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>
      {/* Add your chatbot content here */}
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

export default Chatbot; 