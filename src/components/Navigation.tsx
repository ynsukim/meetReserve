import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SettingsModal from './SettingsModal';
import AnalogClock from './AnalogClock';

const menuItems = [
  { id: 'reserve', name: 'Reserve Room', icon: 'event' },
  { id: 'cafeteria', name: 'Cafeteria Menu', icon: 'restaurant' },
  { id: 'bus', name: 'Bus Schedule', icon: 'directions-bus' },
  { id: 'drawing', name: 'Drawing Pad', icon: 'brush' },
  { id: 'chatbot', name: 'Chatbot', icon: 'chat' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ICON_SIZE = 24;
const NAV_WIDTH = SCREEN_WIDTH * 0.2;
const NAV_HEIGHT = ((ICON_SIZE * 3 + ICON_SIZE * 0.25) * menuItems.length) + ICON_SIZE*2;

interface NavigationProps {
  onMenuSelect: (menuId: string) => void;
  selectedMenu: string;
  onToggleExpand?: (isExpanded: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onMenuSelect, selectedMenu, onToggleExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [highlightPosition, setHighlightPosition] = useState(0);

  const NAV_WIDTHAnim = useRef(new Animated.Value(NAV_WIDTH)).current;
  const NAV_RadiusAnim = useRef(new Animated.Value(0)).current;
  const NAV_MarginLeft = useRef(new Animated.Value(0)).current;
  const NAV_HeightAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const iconHeightAnim = useRef(new Animated.Value(ICON_SIZE*2.5)).current;
  const OpacityAnim = useRef(new Animated.Value(1)).current;
  const RevOpacityAnim = useRef(new Animated.Value(0)).current;
  const highlightAnim = useRef(new Animated.Value(0)).current;

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    onToggleExpand?.(!isExpanded);
    Animated.parallel([
      Animated.timing(NAV_WIDTHAnim, {
        toValue: isExpanded ? NAV_WIDTH : ICON_SIZE * 3.5,
        easing: Easing.bezier(0.83, 0.01, 0.39, 1.01),
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(NAV_MarginLeft, {
        toValue: isExpanded ? 0 : ICON_SIZE * 1.25,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(OpacityAnim, {
        toValue: isExpanded ? 1 : 0,
        delay: isExpanded ? 250 : 0,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(RevOpacityAnim, {
        toValue: isExpanded ? 0 : 1,
        delay: isExpanded ? 0 : 250,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(iconHeightAnim, {
        toValue: isExpanded ? 0 : ICON_SIZE*2,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(NAV_RadiusAnim, {
        toValue: isExpanded ? 0 : 100,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(NAV_HeightAnim, {
        toValue: isExpanded ? SCREEN_HEIGHT : NAV_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleMenuSelect = (menuId: string) => {
    const index = menuItems.findIndex(item => item.id === menuId);
    const newPosition = index * (ICON_SIZE * 2.5 + 8)-(ICON_SIZE*5.5); // 8 is marginBottom from menuTouchArea
    Animated.spring(highlightAnim, {
      toValue: newPosition,
      useNativeDriver: false,
      tension: 100,
      friction: 50,
    }).start();
    onMenuSelect(menuId);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Animated.View style={[styles.navigation, { marginLeft: NAV_MarginLeft }]}>
        <Animated.View style={[styles.bgPanel, { 
          width: NAV_WIDTHAnim, 
          height: NAV_HeightAnim, 
          borderRadius: NAV_RadiusAnim 
        }]}>

          <Animated.View style={[styles.header, { opacity: OpacityAnim }]}>
            <View style={styles.topMenu}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleExpansion}>
                <Icon name="menu" size={ICON_SIZE} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconButton}>
                <Icon name="settings" size={ICON_SIZE} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.clockContainer}>
              <AnalogClock size={140} color="white" />
              <Text style={styles.dateText}>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
              </Text>
              <Text style={styles.dateText}>
                {currentTime.toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </Text>
            </View>
          </Animated.View>

          <View style={styles.menuArea}>
          
            <Animated.View style={[styles.iconButton, { 
              height: iconHeightAnim, 
              opacity: RevOpacityAnim, 
              margin: ICON_SIZE*0.25 
            }]}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleExpansion}>
                <Icon name="menu" size={ICON_SIZE} color="white" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={[
                styles.highlight,
                {
                  transform: [{ translateY: highlightAnim }],
                  opacity: OpacityAnim
                }
              ]} 
            />

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuTouchArea}
                onPress={() => handleMenuSelect(item.id)}
              >
                <Animated.View style={styles.menuItemContent}>
                  <View style={styles.iconButton}>
                    <Icon name={item.icon} size={ICON_SIZE} color="white" />
                  </View>
                  <View style={[styles.menuTextContainer, { display: isExpanded ? 'none' : 'flex' }]}>
                    <Text style={styles.menuText}>
                      {item.name}
                    </Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer} />
        </Animated.View>
      </Animated.View>

      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  navigation: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
    justifyContent: 'center',
    height: SCREEN_HEIGHT,
  },
  bgPanel: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  iconButton: {
    width: ICON_SIZE*2,
    height: ICON_SIZE*2,
    borderRadius: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    alignContent: 'flex-start',
    paddingTop: 20,
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },
  menuArea: {
    padding: ICON_SIZE*0.5,
    justifyContent: 'center',
  },
  menuTouchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ICON_SIZE * 2.5,
    borderRadius: ICON_SIZE * 1.5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: ICON_SIZE*0.25,
    flex: 1,
  },
  menuTextContainer: {
    // backgroundColor: 'red',
    padding: 4,
    borderRadius: 4,
    flex: 1,
  },
  menuText: {
    color: 'white',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flex: 1,
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ICON_SIZE * 2.5,
    backgroundColor: '#3612ff',
    borderRadius: ICON_SIZE * 1.5,
    zIndex: -1,
  },
});

export default Navigation; 