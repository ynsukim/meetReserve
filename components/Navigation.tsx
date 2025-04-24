import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsModal from './SettingsModal';
import AnalogClock from './AnalogClock';

const menuItems = [
  { id: 'reserve', name: 'Reserve Room', icon: 'calendar-month', iconType: 'MaterialCommunityIcons' },
  { id: 'cafeteria', name: 'Cafeteria Menu', icon: 'restaurant', iconType: 'MaterialIcons' },
  { id: 'bus', name: 'Bus Schedule', icon: 'directions-bus', iconType: 'MaterialIcons' },
  { id: 'drawing', name: 'Drawing Pad', icon: 'palette', iconType: 'MaterialCommunityIcons' },
  { id: 'chatbot', name: 'Chatbot', icon: 'chat-processing-outline', iconType: 'MaterialCommunityIcons' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ICON_SIZE = 20;
const NAV_WIDTH = SCREEN_WIDTH * 0.2;
const NAV_HEIGHT = ((ICON_SIZE * 3 + ICON_SIZE * 0.25) * menuItems.length) + ICON_SIZE*1;

interface NavigationProps {
  onMenuSelect: (menuId: string) => void;
  selectedMenu: string;
  onToggleExpand?: (isExpanded: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onMenuSelect, selectedMenu, onToggleExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const NAV_WIDTHAnim = useRef(new Animated.Value(NAV_WIDTH)).current;
  const NAV_RadiusAnim = useRef(new Animated.Value(0)).current;
  const NAV_MarginLeft = useRef(new Animated.Value(0)).current;
  const NAV_HeightAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const iconHeightAnim = useRef(new Animated.Value(ICON_SIZE*2.5)).current;
  const OpacityAnim = useRef(new Animated.Value(1)).current;
  const RevOpacityAnim = useRef(new Animated.Value(0)).current;

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
                <MaterialCommunityIcons name="arrow-collapse" size={ICON_SIZE} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconButton}>
                <Icon name="settings" size={ICON_SIZE} color="#b4b4b4" />
              </TouchableOpacity>
            </View>

            <View style={styles.clockContainer}>
              <AnalogClock size={140} color="white" />
              <Text style={styles.timeText}>
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

          <View style={[styles.menuArea]}>
            <Animated.View style={[styles.iconButton, { 
              height: iconHeightAnim, 
              opacity: RevOpacityAnim, 
              margin: ICON_SIZE*0.25 
            }]}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleExpansion}>
                <MaterialCommunityIcons name="arrow-expand" size={16} color="#ffffff91" />
              </TouchableOpacity>
            </Animated.View>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[
                  styles.menuTouchArea,
                  item.id === selectedMenu && styles.selectedMenuItem
                ]}
                onPress={() => handleMenuSelect(item.id)}
              >
                <Animated.View style={styles.menuItemContent}>
                  <View style={styles.iconButton}>
                    {item.iconType === 'MaterialCommunityIcons' ? (
                      <MaterialCommunityIcons name={item.icon} size={ICON_SIZE} color="white" />
                    ) : (
                      <Icon name={item.icon} size={ICON_SIZE} color="white" />
                    )}
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

      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  navigation: {

    zIndex: 1000,
    justifyContent: 'center',
    height: SCREEN_HEIGHT,
    
  },
  bgPanel: {
    backgroundColor: 'black',
    overflow: 'hidden',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingBottom: ICON_SIZE*0.25,
  },
  iconButton: {
    width: ICON_SIZE*2,
    height: ICON_SIZE*2,
    borderRadius: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  header: {
    flex: 1,
    alignContent: 'flex-start',
    // backgroundColor: 'green',
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
  },
  dateText: {
    color: '#ffffffb7',
    fontSize: 14,
    fontWeight: '300',
  },
  timeText: {
    marginTop: 10,
    color: 's#ffffffea',
    fontSize: 16,
    fontWeight: '400',
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
  selectedMenuItem: {
    backgroundColor: '#0867ff',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: ICON_SIZE*0.25,
    flex: 1,
  },
  menuTextContainer: {
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
    // backgroundColor: 'blue',
  },
});

export default Navigation; 