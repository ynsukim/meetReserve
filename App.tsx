import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import Navigation from './src/components/Navigation';
import ReserveRoom from './src/screens/ReserveRoom';
import CafeteriaMenu from './src/screens/CafeteriaMenu';
import BusSchedule from './src/screens/BusSchedule';
import DrawingPad from './src/screens/DrawingPad';
import Chatbot from './src/screens/Chatbot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_WIDTH = SCREEN_WIDTH * 0.25;

const App = () => {
  const [selectedMenu, setSelectedMenu] = useState('reserve');
  const contentMarginLeft = new Animated.Value(NAV_WIDTH);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  const renderScreen = () => {
    switch (selectedMenu) {
      case 'reserve':
        return <ReserveRoom />;
      case 'cafeteria':
        return <CafeteriaMenu />;
      case 'bus':
        return <BusSchedule />;
      case 'drawing':
        return <DrawingPad />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return <ReserveRoom />;
    }
  };

  return (
    <SafeAreaProvider>
      <ExpoStatusBar style="auto" />
      <View style={styles.container}>
        <Navigation 
          onMenuSelect={setSelectedMenu}
          selectedMenu={selectedMenu}
          onToggleExpand={(isExpanded: boolean) => {
            Animated.timing(contentMarginLeft, {
              toValue: isExpanded ?  120 : NAV_WIDTH,
              duration: 300,
              useNativeDriver: false,
            }).start();
          }}
        />
        <Animated.View style={[
          styles.content,
          { marginLeft: contentMarginLeft }
        ]}>
          {renderScreen()}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
  },
  content: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
});

export default App;
