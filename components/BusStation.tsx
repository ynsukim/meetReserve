import React from 'react';
import { ScrollView, Image, StyleSheet, Dimensions } from 'react-native';

const BusStation = () => {
  return (
    <ScrollView style={styles.container}>
      <Image
        source={require('../assets/images/busStation_o.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 1200,
    height: undefined,
    aspectRatio: 1,
  },
});

export default BusStation; 