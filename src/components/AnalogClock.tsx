import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AnalogClockProps {
  size: number;
  color: string;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ size, color }) => {
  const hourRotation = useRef(new Animated.Value(0)).current;
  const minuteRotation = useRef(new Animated.Value(0)).current;
  const secondRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      Animated.parallel([
        Animated.timing(hourRotation, {
          toValue: (hours * 30) + (minutes * 0.5),
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(minuteRotation, {
          toValue: minutes * 6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(secondRotation, {
          toValue: seconds * 6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.clock, { width: size, height: size }]}>
      {/* Clock face */}
      <View style={[styles.face, { borderColor: color }]}>
        {/* Hour marks */}
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.hourMark,
              {
                transform: [{ rotate: `${i * 30}deg` }],
                backgroundColor: color,
              },
            ]}
          />
        ))}
      </View>

      {/* Clock hands */}
      <Animated.View
        style={[
          styles.hand,
          styles.hourHand,
          {
            transform: [
              { rotate: hourRotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
            ],
            backgroundColor: color,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.hand,
          styles.minuteHand,
          {
            transform: [
              { rotate: minuteRotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
            ],
            backgroundColor: color,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.hand,
          styles.secondHand,
          {
            transform: [
              { rotate: secondRotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              })},
            ],
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  clock: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    borderWidth: 2,
  },
  hourMark: {
    position: 'absolute',
    width: 2,
    height: '10%',
    top: '5%',
    left: '50%',
    transformOrigin: '50% 100%',
  },
  hand: {
    position: 'absolute',
    left: '50%',
    bottom: '50%',
    transformOrigin: '50% 100%',
  },
  hourHand: {
    width: 3,
    height: '30%',
  },
  minuteHand: {
    width: 2,
    height: '40%',
  },
  secondHand: {
    width: 1,
    height: '45%',
  },
});

export default AnalogClock; 