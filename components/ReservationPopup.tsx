import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, StatusBar, Platform, TextInput } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Reservation } from '../types/reservation';

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

  // Reset duration when popup becomes visible
  useEffect(() => {
    if (visible) {
      setDuration(initialDuration);
    }
  }, [visible, initialDuration]);

  // Calculate maximum allowed duration based on existing reservations
  const getMaxDuration = () => {
    if (!selectedSlot) return 30;

    const selectedTime = new Date(selectedSlot.date);
    selectedTime.setHours(selectedSlot.hour, selectedSlot.minute);

    // Find the next reservation after the selected time
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

    if (!nextReservation) return 240; // Max 4 hours if no next reservation

    const nextResTime = new Date(nextReservation.date);
    nextResTime.setHours(nextReservation.hour, nextReservation.minute);
    const timeDiff = (nextResTime.getTime() - selectedTime.getTime()) / (1000 * 60); // in minutes

    return Math.min(timeDiff, 240); // Max 4 hours
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
      // Find the next reservation time
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
      // Small delay to ensure the popup is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  if (!selectedSlot) return null;

  useEffect(() => {
    let originalStyle: any;
    
    if (Platform.OS === 'android') {
      if (visible) {
        // Save original style
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
        // Restore original style when component unmounts or visibility changes
        StatusBar.popStackEntry(originalStyle);
      }
    };
  }, [visible]);
  
  const handleConfirm = () => {
    if (name.trim()) {
      onSave(name, duration);
    }
  };

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
                  onChangeText={setName}
                />
              </View>
            </View>

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
    // backgroundColor: 'red',
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
    // backgroundColor: '#ff000082',
  },
  durationWarningText: {
    color: 'blue',
    fontSize: 12,
    // backgroundColor: '#ffff005c',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  popupTextInput: {
    width: '100%',
    flexDirection: 'row',
    textAlign: 'right',
    paddingRight: 50,
    color: '#000000',
    textDecorationLine: 'none',
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
    // backgroundColor: 'red',
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
});

export default ReservationPopup; 