import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Line } from 'react-native-svg';

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

      // Calculate rotations
      const hourDegrees = (hours * 30) + (minutes * 0.5);
      const minuteDegrees = minutes * 6;
      const secondDegrees = seconds * 6;

      // Use spring animation for smoother movement
      Animated.parallel([
        Animated.spring(hourRotation, {
          toValue: hourDegrees,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.spring(minuteRotation, {
          toValue: minuteDegrees,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.spring(secondRotation, {
          toValue: secondDegrees,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
      ]).start();
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const center = size / 2;
  const clockRadius = size / 2 - 10;

  return (
    <View style={[styles.clock, { width: size, height: size }]}>
      <View style={[styles.face, { borderColor: color }]}>
        <Svg width={size} height={size}>
          {/* Hour marks */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const markerLength = i % 3 === 0 ? 10 : 5; // Longer marks at 12, 3, 6, 9
            const startRadius = clockRadius - markerLength;
            const x1 = center + startRadius * Math.sin(angle);
            const y1 = center - startRadius * Math.cos(angle);
            const x2 = center + clockRadius * Math.sin(angle);
            const y2 = center - clockRadius * Math.cos(angle);
            
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}
        </Svg>
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
      {/* Center dot */}
      <View style={[styles.centerDot, { backgroundColor: color }]} />
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
    backgroundColor: '#ffffff28',
  },
  hand: {
    position: 'absolute',
    left: '50%',
    bottom: '50%',
    transformOrigin: '50% 100%',
    borderRadius: 4,
  },
  hourHand: {
    width: 4,
    height: '25%',
  },
  minuteHand: {
    width: 3,
    height: '35%',
  },
  secondHand: {
    width: 1,
    height: '40%',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
});

export default AnalogClock; 