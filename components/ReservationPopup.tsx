import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar, Platform, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Reservation } from '../types/reservation';
import { saveNameToHistory, getRecentNames, deleteNameFromHistory } from '../app/services/database';

// Constants for history list item height calculation
const HISTORY_ITEM_PADDING_VERTICAL = 6;
const HISTORY_ITEM_FONT_SIZE = 16;
const HISTORY_ITEM_BORDER_BOTTOM_WIDTH = 1;
const HISTORY_ITEM_HEIGHT = (HISTORY_ITEM_PADDING_VERTICAL * 2) + HISTORY_ITEM_FONT_SIZE + HISTORY_ITEM_BORDER_BOTTOM_WIDTH; // Approx height
const HISTORY_LIST_VISIBLE_ITEMS = 4;
const HISTORY_LIST_HEIGHT = HISTORY_ITEM_HEIGHT * HISTORY_LIST_VISIBLE_ITEMS;

interface ReservationPopupProps {
  selectedSlot: {
    date: Date;
    hour: number;
    minute: number;
    name?: string;
  };
  onClose: () => void;
  onSave: (name: string, duration: number) => void;
  visible: boolean;
  initialDuration: number;
  reservations: Reservation[];
  onDurationChange: (duration: number) => void;
}

type DurationFormat = 
  | { number: string; unit: string }
  | { hours: { number: string; unit: string }; minutes: { number: string; unit: string } };

const ReservationPopup: React.FC<ReservationPopupProps> = ({ 
  selectedSlot, 
  onClose, 
  visible, 
  onSave,
  initialDuration,
  reservations,
  onDurationChange
}) => {
  const [duration, setDuration] = useState(initialDuration);
  const [name, setName] = useState(selectedSlot.name || '');
  const inputRef = useRef<TextInput>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [nextReservationTime, setNextReservationTime] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [nameHistory, setNameHistory] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setDuration(initialDuration);
    }
  }, [visible, initialDuration]);

  const getMaxDuration = () => {
    if (!selectedSlot) return 30;

    const selectedTime = new Date(selectedSlot.date);
    selectedTime.setHours(selectedSlot.hour, selectedSlot.minute);

    const nextReservation = reservations
      .filter(res => isSameDay(res.date, selectedSlot.date))
      .sort((a, b) => {
        const timeA = new Date(a.date);
        timeA.setHours(a.hour, a.minute);
        const timeB = new Date(b.date);
        timeB.setHours(b.hour, b.minute);
        return timeA.getTime() - timeB.getTime();
      })
      .find(res => {
        const resTime = new Date(res.date);
        resTime.setHours(res.hour, res.minute);
        return resTime.getTime() > selectedTime.getTime();
      });

    if (!nextReservation) return 240;

    const nextResTime = new Date(nextReservation.date);
    nextResTime.setHours(nextReservation.hour, nextReservation.minute);
    const timeDiff = (nextResTime.getTime() - selectedTime.getTime()) / (1000 * 60);

    return Math.min(timeDiff, 240);
  };

  const formatDuration = (minutes: number): DurationFormat => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return { number: mins.toString(), unit: '분' };
    if (mins === 0) return { number: hours.toString(), unit: '시간' };
    return { 
      hours: { number: hours.toString(), unit: '시간' },
      minutes: { number: mins.toString(), unit: '분' }
    };
  };

  const handleDurationChange = (increment: number) => {
    const newDuration = duration + increment;
    const maxDuration = getMaxDuration();
    
    if (newDuration >= 30 && newDuration <= maxDuration) {
      setDuration(newDuration);
      onDurationChange(newDuration);
      setShowWarning(false);
    } else if (newDuration > maxDuration) {
      const nextRes = reservations
        .filter(res => isSameDay(res.date, selectedSlot.date))
        .sort((a, b) => {
          const timeA = new Date(a.date);
          timeA.setHours(a.hour, a.minute);
          const timeB = new Date(b.date);
          timeB.setHours(b.hour, b.minute);
          return timeA.getTime() - timeB.getTime();
        })
        .find(res => {
          const resTime = new Date(res.date);
          resTime.setHours(res.hour, res.minute);
          const selectedTime = new Date(selectedSlot.date);
          selectedTime.setHours(selectedSlot.hour, selectedSlot.minute);
          return resTime.getTime() > selectedTime.getTime();
        });

      if (nextRes) {
        const timeStr = `${nextRes.hour}:${nextRes.minute === 0 ? '00' : '30'}`;
        setNextReservationTime(timeStr);
      }
      setShowWarning(true);
    }
  };

  const renderDuration = () => {
    const formattedDuration = formatDuration(duration);
    
    if ('hours' in formattedDuration && 'minutes' in formattedDuration) {
      return (
        <View style={styles.durationTextContainer}>
          <Text style={styles.durationNumber}>{formattedDuration.hours.number}</Text>
          <Text style={styles.durationUnit}>{formattedDuration.hours.unit}</Text>
          <Text style={styles.durationNumber}>{formattedDuration.minutes.number}</Text>
          <Text style={styles.durationUnit}>{formattedDuration.minutes.unit}</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.durationTextContainer}>
        <Text style={styles.durationNumber}>{formattedDuration.number}</Text>
        <Text style={styles.durationUnit}>{formattedDuration.unit}</Text>
      </View>
    );
  };

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  useEffect(() => {
    let originalStyle: any;
    
    if (Platform.OS === 'android') {
      if (visible) {
        originalStyle = StatusBar.pushStackEntry({
          animated: true,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          barStyle: 'light-content',
          translucent: true
        });
      }
    }

    return () => {
      if (Platform.OS === 'android' && originalStyle) {
        StatusBar.popStackEntry(originalStyle);
      }
    };
  }, [visible]);
  
  const toggleHistoryList = async () => {
    if (showHistory) {
      setShowHistory(false);
    } else {
      try {
        const recentNames = await getRecentNames();
        setNameHistory(recentNames);
        setShowHistory(true);
      } catch (error) {
        console.error('Failed to fetch name history:', error);
      }
    }
  };

  const handleSelectFromHistory = (selectedName: string) => {
    setName(selectedName);
    setShowHistory(false);
  };

  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      try {
        await saveNameToHistory(trimmedName);
      } catch (error) {
        console.error('Failed to save name to history:', error);
      }
      onSave(trimmedName, duration);
    }
  };

  // Function to handle TextInput focus - hides history
  const handleInputFocus = () => {
    if (showHistory) {
      setShowHistory(false);
    }
  };

  // Function to handle text input changes - updates name and hides history
  const handleNameChange = (text: string) => {
    setName(text);
    if (showHistory) {
      setShowHistory(false);
    }
  };

  const handleDeleteNameFromHistory = async (nameToDelete: string) => {
    try {
      await deleteNameFromHistory(nameToDelete);
      setNameHistory(currentHistory => currentHistory.filter(name => name !== nameToDelete));
    } catch (error) { 
      console.error('Failed to delete name from history:', error);
    }
  };

  if (!selectedSlot) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <View 
        style={[
          styles.popupOverlay,
          Platform.OS === 'android' && styles.androidOverlay
        ]}
      >
        <TouchableOpacity 
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.popupTouchArea}>
            <TouchableOpacity 
              style={styles.popup}
              activeOpacity={1}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>회의실 예약</Text>
              </View>
              
              <View style={styles.popupContentLine}>
                <Text style={styles.popupText}>
                  회의 시각 
                </Text>
                <Text style={styles.popupTextBig}>
                {format(selectedSlot.date, 'M.dd (E) ', { locale: ko })}                
                {selectedSlot.hour}:{selectedSlot.minute === 0 ? '00' : '30'}
                </Text>
              </View>

              <View style={styles.popupContentLineIndent}>
                <Text style={styles.popupText}>
                  회의 시간 
                </Text>
                <View style={styles.durationContainer}>
                  <TouchableOpacity 
                    style={styles.durationButton} 
                    onPress={() => handleDurationChange(-30)}
                  >
                    <Text style={styles.durationButtonText}>-</Text>
                  </TouchableOpacity>
                  {renderDuration()}
                  <TouchableOpacity 
                    style={styles.durationButton} 
                    onPress={() => handleDurationChange(30)}
                  >
                    <Text style={styles.durationButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                {showWarning && (
                  <View style={styles.warningContainer}>
                    <Text style={styles.durationWarningText}>
                      {duration === 240 
                        ? "최대 예약 시간은 4시간 입니다"
                        : `${nextReservationTime} 회의 예약으로 현재 최대 시간임`}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.popupContentLine}>
                <View style={styles.inputContainer}>
                  <Text style={styles.popupText}>
                    예약자 
                  </Text>
                  <View style={styles.nameInputWrapper}> 
                    <TextInput
                      ref={inputRef}
                      style={[
                        styles.popupTextInput,
                        name ? styles.popupTextInputActive : null
                      ]}
                      placeholder="이름을 입력해주세요"
                      placeholderTextColor="gray"
                      returnKeyType="done"
                      keyboardType="default"
                      textContentType="name"
                      autoCapitalize="none"
                      value={name}
                      onChangeText={handleNameChange}
                      onFocus={handleInputFocus}
                    />
                    <TouchableOpacity onPress={toggleHistoryList} style={styles.historyButton}>
                      <MaterialCommunityIcons 
                        name={showHistory ? "chevron-up" : "history"} 
                        size={24} 
                        color="#888" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {showHistory && (
                <Pressable 
                  style={[
                    styles.historyListContainer,
                    { height: nameHistory.length === 0 ? 50 : Math.min(nameHistory.length * HISTORY_ITEM_HEIGHT + 10, HISTORY_LIST_HEIGHT) }
                  ]}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <ScrollView
                    style={styles.scrollViewContainer}
                    onTouchStart={(e) => e.stopPropagation()}
                    contentContainerStyle={nameHistory.length === 0 ? styles.emptyScrollContent : null}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    bounces={false}
                    directionalLockEnabled={true}
                    decelerationRate="normal"
                    scrollEventThrottle={16}
                    onScrollBeginDrag={() => console.log("scroll begin")}
                    onMomentumScrollBegin={() => console.log("momentum scroll begin")}
                  >
                    {nameHistory.length === 0 ? (
                      <Text style={styles.historyEmptyText}>최근 사용 기록 없음</Text>
                    ) : (
                      nameHistory.map((item, index) => (
                        <View style={styles.historyItemContainer}>
                          <Pressable
                            style={styles.historyItemSelectArea}
                            onPress={() => handleSelectFromHistory(item)}
                          >
                            <Text style={styles.historyItemText}>{item}</Text>
                          </Pressable>
                          <TouchableOpacity 
                            onPress={() => handleDeleteNameFromHistory(item)} 
                            style={styles.historyItemDeleteButton}
                          >
                            <MaterialCommunityIcons name="close-circle" size={20} color="#aaa" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </Pressable>
              )}

              <View style={styles.popupFooter}> 
                <TouchableOpacity style={styles.popupFooterButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.popupFooterButton, !name.trim() && styles.disabledButton]} 
                  onPress={handleConfirm}
                  disabled={!name.trim()}
                >
                  <Text style={styles.confirmButtonText}>예약</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidOverlay: {
    marginTop: -(StatusBar.currentHeight || 0),
  },
  fullScreenTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupTouchArea: {
    width: 420, // Slightly wider than popup
    height: 520, // Taller than popup to capture touches
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Invisible
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 400,
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupHeader: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    paddingLeft: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  popupContentLine: {
    paddingHorizontal: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  popupText: {
    fontSize: 18,
    color: '#333',
  },
  popupTextBig: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  popupContentLineIndent: {
    paddingLeft: 40,
    paddingRight: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'lightgray', 
    borderRadius: 50,
    overflow: 'hidden',
  },
  durationButton: {
    width: 40,
    height: 40,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  durationTextContainer: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  durationUnit: {
    fontSize: 16,
    color: '#333',
    marginLeft: 2,
  },
  warningContainer: {
    position: 'absolute',
    bottom: -20,
    right: 10,
    width: 220,
    alignItems: 'center',
  },
  durationWarningText: {
    color: 'blue',
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    position: 'relative',
  },
  nameInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  popupTextInput: {
    flex: 1,
    flexDirection: 'row',
    textAlign: 'right',
    color: '#000000',
    textDecorationLine: 'none',
    marginRight: 5,
  },
  popupTextInputActive: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  popupFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 20,
  },   
  popupFooterButton: {
    width: 80,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  disabledButton: {
    opacity: 0.5,
  },
  historyButton: {
    padding: 10,
  },
  historyListContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: HISTORY_LIST_HEIGHT,
    width: '60%',
    right: 40,
    top: 280,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  historyItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: HISTORY_ITEM_BORDER_BOTTOM_WIDTH,
    borderBottomColor: '#eee',
  },
  historyItemSelectArea: {
    flex: 1,
    paddingVertical: HISTORY_ITEM_PADDING_VERTICAL,
    paddingLeft: 8,
    paddingRight: 5,
  },
  historyItem: {
    paddingVertical: HISTORY_ITEM_PADDING_VERTICAL,
    paddingHorizontal: 8,
    borderBottomWidth: HISTORY_ITEM_BORDER_BOTTOM_WIDTH,
    borderBottomColor: '#eee',
  },
  historyItemDeleteButton: {
    paddingVertical: HISTORY_ITEM_PADDING_VERTICAL,
    paddingHorizontal: 8,
  },
  historyItemText: {
    fontSize: 14,
    color: '#333',
  },
  scrollViewContainer: {
    width: '100%',
    height: '100%',
  },
  emptyScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyEmptyText: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
  },
});

export default ReservationPopup; 