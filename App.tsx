import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Navigation from './components/Navigation';
import ReserveRoom from './app/ReserveRoom';
import CafeteriaMenu from './app/CafeteriaMenu';
import BusSchedule from './app/BusSchedule';
import DrawingPad from './app/DrawingPad';
import Chatbot from './app/Chatbot';
import DrawingCanvas from './app/drawingCanvas/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_WIDTH = SCREEN_WIDTH * 0.25;

const Stack = createNativeStackNavigator();

const App = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>('reserve');

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('#000000');
      StatusBar.setBarStyle('dark-content');
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
        return <DrawingPad setSelectedMenu={setSelectedMenu} />;
      case 'drawingCanvas':
        return <DrawingCanvas setSelectedMenu={setSelectedMenu} />;
      case 'chatbot':
        return <Chatbot />;
      default:
        return <ReserveRoom />;
    }
  };

  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.navigationContainer}>
              <Navigation 
                onMenuSelect={setSelectedMenu}
                selectedMenu={selectedMenu}
              />
            </View>
            <View style={styles.content}>
              {renderScreen()}
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  navigationContainer: {
    height: '100%',
    // backgroundColor: 'red',
  },
  content: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
});

export default App; 