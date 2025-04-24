import React, { useState, useEffect, useRef } from 'react';
import {  View,   Text,  StyleSheet,  ScrollView,  TouchableOpacity,  GestureResponderEvent, } from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isWeekend, isSameWeek, isBefore, isAfter } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ReservationPopup from '../components/ReservationPopup';
import ReservationEditPopup from '../components/ReservationEditPopup';
import type { Reservation } from '../types/reservation';
import { initDatabase, saveReservation, getReservations, deleteReservation, getReservationsForWeek } from './services/database';


const TIME_GRID_HEIGHT = 30;
const SCROLL_VIEW_HEIGHT = 500;
const MARGIN_LEFT = 3;
const MARGIN_RIGHT = 4;


interface SelectedSlot {
  hour: number;
  minute: number;
  dayIndex: number;
  year: number;
  month: number;
  day: number;
  duration: number;
  name?: string;
  date: Date;
}



const ReserveRoom = () => {

  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectionSlotActive, setSelectionSlotActive] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const scrollViewRef = useRef<ScrollViewType>(null);
  const [duration, setDuration] = useState(0);
  const [isDbInitialized, setIsDbInitialized] = useState(false);


  // Initialize database on component mount
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    
    setupDatabase();
  }, []);
  
  // Load reservations when database is initialized or week changes
  useEffect(() => {
    if (isDbInitialized) {
      loadReservationsForCurrentWeek();
    }
  }, [isDbInitialized, weekStart]);
  
  // Load reservations for the current week from the database
  const loadReservationsForCurrentWeek = async () => {
    try {
      const weekEnd = addDays(weekStart, 6);
      const weekReservations = await getReservationsForWeek(weekStart, weekEnd);
      setReservations(weekReservations);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Scroll to current time when component mounts or week changes
  useEffect(() => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const today = new Date();
    
    if (hour >= 8 && hour <= 20 && isSameWeek(today, weekStart, { weekStartsOn: 1 })) {
      const scrollPosition = ((hour - 8) * TIME_GRID_HEIGHT * 2) + (minutes * (TIME_GRID_HEIGHT / 30));
      const centerPosition = Math.max(0, scrollPosition - SCROLL_VIEW_HEIGHT / 2);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: centerPosition,
          animated: true
        });
      }, 100);
    }
  }, [weekStart, currentTime]);

  const goToPreviousWeek = () => {
    setWeekStart(prev => subWeeks(prev, 1));
    setSelectedSlot(null);
    setSelectionSlotActive(false);
    setShowReservationPopup(false);
    setShowEditPopup(false);
  };
  
  const goToNextWeek = () => {
    setWeekStart(prev => addWeeks(prev, 1));
    setSelectedSlot(null);
    setSelectionSlotActive(false);
    setShowReservationPopup(false);
    setShowEditPopup(false);
  };
  
  const goToToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    setSelectedSlot(null);
    setSelectionSlotActive(false);
    setShowReservationPopup(false);
    setShowEditPopup(false);
  };

  const renderTimeSlots = () => {
    const hours = [];
    for (let i = 8; i <= 20; i++) {
      hours.push(
        <View key={`hour-${i}`} style={styles.timeSlot}>
          <Text style={styles.timeTextBig}>{i}</Text>
        </View>
      );
      hours.push(
        <View key={`half-hour-${i}`} style={styles.timeSlot}>
          <Text style={styles.timeText}>30</Text>
        </View>
      );
    }
    return hours;
  };

  const renderDateRow = (day: Date, index: number) => {
    const isToday = isSameDay(day, new Date());
    return (
      <View style={styles.dateBlock} key={index}>
        <View style={[styles.dayHeader, isToday && styles.todayHeader]}>
          <Text style={styles.dayNumber}>{format(day, 'd')}</Text>
          <Text style={styles.dayName}>{format(day, 'EEE').toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  const handleTimeSlotPress = (hour: number, minute: number, dayIndex: number, date: Date, event: GestureResponderEvent) => {
    event.stopPropagation();
    
    // Check if there's a reservation at this time slot
    const existingReservation = reservations.find(res => 
      isSameDay(res.date, date) && 
      res.hour === hour && 
      res.minute === minute
    );

    if (existingReservation) {
      setSelectedReservation(existingReservation);
      setShowEditPopup(true);
      setShowReservationPopup(false);
      return;
    }

    // If this is the same slot that's already selected, show the popup
    if (selectedSlot?.hour === hour && 
        selectedSlot?.minute === minute && 
        selectedSlot?.dayIndex === dayIndex) {
      setShowReservationPopup(true);
      setShowEditPopup(false);
      return;
    }

    // Get all reservations for this day
    const dayReservations = reservations.filter(res => isSameDay(res.date, date));
    
    console.log('All reservations for this day:', dayReservations.map(res => ({
      hour: res.hour,
      minute: res.minute,
      duration: res.duration
    })));

    // Check if there's a reservation in the next 30 minutes
    const nextReservation = dayReservations.find(res => {
      const resStartTime = new Date(res.date);
      resStartTime.setHours(res.hour, res.minute);
      
      const selectedTime = new Date(date);
      selectedTime.setHours(hour, minute);
      
      const timeDiff = (resStartTime.getTime() - selectedTime.getTime()) / (1000 * 60);
      
      console.log(`Comparing with reservation at ${res.hour}:${res.minute}, time difference: ${timeDiff} minutes`);
      
      return timeDiff > 0 && timeDiff <= 30;
    });

    // Set duration based on next reservation
    let duration = 60; // Default to 1 hour
    
    if (nextReservation) {
      duration = 30; // If there's a reservation in the next 30 minutes
    }

    console.log(`Selected empty timeslot: ${hour}:${minute}`);
    console.log(`Next reservation in 30min: ${nextReservation ? `Yes (at ${nextReservation.hour}:${nextReservation.minute})` : 'No'}`);
    console.log(`Final duration set to: ${duration} minutes`);

    // Select a new slot
    const newSlot = { 
      hour, 
      minute, 
      dayIndex, 
      date,
      duration,
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate()
    };
    setSelectedSlot(newSlot);
    setSelectionSlotActive(true);
    setShowReservationPopup(false);
    setShowEditPopup(false);
  };

  const handleSelectionBoxPress = () => {
    if (selectedSlot) {
      setShowReservationPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowReservationPopup(false);
    setSelectedSlot(null);
    setSelectionSlotActive(false);
  };

  const handleSaveReservation = async (name: string, duration: number) => {
    if (!selectedSlot) return;

    // Check if there's already a reservation at this time
    const existingReservation = reservations.find(res => 
      res.year === selectedSlot.year &&
      res.month === selectedSlot.month &&
      res.day === selectedSlot.day &&
      res.hour === selectedSlot.hour &&
      res.minute === selectedSlot.minute
    );

    if (existingReservation) {
      // If it's the same reservation being edited, update it
      if (selectedSlot.name === existingReservation.name) {
        const updatedReservation: Reservation = {
          ...existingReservation,
          duration,
          name,
        };
        const id = await saveReservation(updatedReservation);
        setReservations(prev => prev.map(res => 
          res.id === existingReservation.id ? updatedReservation : res
        ));
      } else {
        // If it's a different reservation, show an error or handle accordingly
        console.warn('A reservation already exists at this time');
        return;
      }
    } else {
      // Create a new reservation
      const date = new Date(selectedSlot.year, selectedSlot.month, selectedSlot.day);
      const newReservation: Reservation = {
        id: '', // This will be set by the storage service
        year: selectedSlot.year,
        month: selectedSlot.month,
        day: selectedSlot.day,
        hour: selectedSlot.hour,
        minute: selectedSlot.minute,
        duration,
        name,
        date,
      };

      const id = await saveReservation(newReservation);
      
      // Update the reservation with the new ID
      newReservation.id = id;
      setReservations(prev => [...prev, newReservation]);
    }

    handleClosePopup();
  };

  const handleDeleteReservation = async (id: string) => {
    await deleteReservation(id);
    setReservations(prev => prev.filter(res => res.id !== id));
    setShowEditPopup(false);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedSlot({
      hour: reservation.hour,
      minute: reservation.minute,
      dayIndex: reservation.date.getDay() - 1, // Convert to 0-based index (Monday = 0)
      date: reservation.date,
      duration: reservation.duration,
      name: reservation.name,
      year: reservation.year,
      month: reservation.month,
      day: reservation.day
    });
    setShowReservationPopup(true);
    setShowEditPopup(false);
  };

  const handleCloseEditPopup = () => {
    setShowEditPopup(false);
    setSelectedReservation(null);
  };

  const getReservationStyle = (reservation: Reservation) => {
    const reservationStart = new Date(reservation.date);
    reservationStart.setHours(reservation.hour, reservation.minute);
    
    const reservationEnd = new Date(reservationStart);
    reservationEnd.setMinutes(reservationEnd.getMinutes() + reservation.duration);

    if (isBefore(reservationEnd, currentTime)) {
      return styles.pastReservation;
    } else if (isBefore(reservationStart, currentTime) && isAfter(reservationEnd, currentTime)) {
      return styles.currentReservation;
    } else {
      return styles.futureReservation;
    }
  };

  const getReservationTextStyle = (reservation: Reservation) => {
    const reservationStart = new Date(reservation.date);
    reservationStart.setHours(reservation.hour, reservation.minute);
    
    const reservationEnd = new Date(reservationStart);
    reservationEnd.setMinutes(reservationEnd.getMinutes() + reservation.duration);

    const isCurrent = isBefore(reservationStart, currentTime) && isAfter(reservationEnd, currentTime);

    return [
      styles.reservationText,
      isCurrent && styles.currentReservationText
    ];
  };

  const getReservationTimeStyle = (reservation: Reservation) => {
    const reservationStart = new Date(reservation.date);
    reservationStart.setHours(reservation.hour, reservation.minute);
    
    const reservationEnd = new Date(reservationStart);
    reservationEnd.setMinutes(reservationEnd.getMinutes() + reservation.duration);

    const isCurrent = isBefore(reservationStart, currentTime) && isAfter(reservationEnd, currentTime);

    return [
      styles.reservationTimeText,
      isCurrent && styles.currentReservationTimeText
    ];
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour}:${minute === 0 ? '00' : '30'}`;
  };

  const renderReservationContent = (reservation: Reservation) => {
    const reservationStart = new Date(reservation.date);
    reservationStart.setHours(reservation.hour, reservation.minute);
    
    const reservationEnd = new Date(reservationStart);
    reservationEnd.setMinutes(reservationEnd.getMinutes() + reservation.duration);

    return (
      <View>
        <Text style={getReservationTextStyle(reservation)}>{reservation.name}</Text>
        {reservation.duration >= 60 && (
          <Text style={getReservationTimeStyle(reservation)}>
            {formatTime(reservation.hour, reservation.minute)} - {formatTime(reservation.hour, reservation.minute + reservation.duration)}
          </Text>
        )}
      </View>
    );
  };

  const renderTimeGrid = () => {
    const hours = [];
    for (let i = 8; i <= 20; i++) {
      // Full hour slot
      const hourSlot = (
        <View key={`hour-${i}`} style={styles.fullHourRow}>
          {Array(5).fill(null).map((_, dayIndex) => {
            const day = addDays(weekStart, dayIndex);
            // Remove duplicate reservations by checking IDs
            const reservationsForSlot = reservations.filter(res => 
              isSameDay(res.date, day) && 
              res.hour === i && 
              res.minute === 0
            );
            
            // Ensure unique IDs
            const uniqueReservations = Array.from(
              new Map(reservationsForSlot.map(r => [r.id, r])).values()
            );

            return (
              <View
                key={`hour-${i}-day-${dayIndex}`}
                style={styles.timeGridSlot}
              >
                <View style={styles.timeGridSlotContent}>
                  {uniqueReservations.map(reservation => (
                    <TouchableOpacity
                      key={reservation.id}
                      style={[
                        styles.reservationSlot,
                        getReservationStyle(reservation),
                        { height: (reservation.duration / 30) * TIME_GRID_HEIGHT }
                      ]}
                      onPress={(event) => handleTimeSlotPress(
                        reservation.hour,
                        reservation.minute,
                        dayIndex,
                        day,
                        event
                      )}
                      activeOpacity={0.6}
                    >
                      {renderReservationContent(reservation)}
                    </TouchableOpacity>
                  ))}
                  {selectedSlot?.hour === i && 
                   selectedSlot?.minute === 0 &&
                   selectedSlot?.dayIndex === dayIndex && (
                    <TouchableOpacity
                      style={styles.selectedSlotContainer}
                      onPress={handleSelectionBoxPress}
                      activeOpacity={1}
                    >
                      <View
                        style={[
                          styles.selectedTimeSlot,
                          {
                            height: TIME_GRID_HEIGHT * (selectedSlot.duration / 30)
                          }
                        ]}
                      >
                        <TouchableOpacity onPress={handleSelectionBoxPress} style={styles.addButton}>
                          <MaterialCommunityIcons name="plus-circle" size={22} color="#180df5" />
                        </TouchableOpacity>
                        <Text style={styles.selectedTimeText}>
                          {formatTime(selectedSlot.hour, selectedSlot.minute)}-{formatTime(calculateEndTime(selectedSlot.hour, selectedSlot.minute, selectedSlot.duration).endHour, calculateEndTime(selectedSlot.hour, selectedSlot.minute, selectedSlot.duration).endMinute)}
                        </Text>
                        {!showReservationPopup && (
                          <TouchableOpacity onPress={handleClosePopup} style={styles.closeButton}>
                             <MaterialCommunityIcons name="window-close" size={20} color="#3b3eff5c" />
                          </TouchableOpacity>
                        )}
                        {showReservationPopup && <View style={styles.buttonPlaceholder} />}
                      </View>
                    </TouchableOpacity>
                  )}
                  {reservationsForSlot.length === 0 && (
                    <TouchableOpacity
                      style={styles.emptySlotTouchable}
                      onPress={(event) => handleTimeSlotPress(i, 0, dayIndex, day, event)}
                      activeOpacity={0.6}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      );

      // Half hour slot
      const halfHourSlot = (
        <View key={`half-hour-${i}`} style={styles.timeGridRow}>
          {Array(5).fill(null).map((_, dayIndex) => {
            const day = addDays(weekStart, dayIndex);
            // Remove duplicate reservations by checking IDs
            const reservationsForSlot = reservations.filter(res => 
              isSameDay(res.date, day) && 
              res.hour === i && 
              res.minute === 30
            );
            
            // Ensure unique IDs
            const uniqueReservations = Array.from(
              new Map(reservationsForSlot.map(r => [r.id, r])).values()
            );

            return (
              <View
                key={`half-hour-${i}-day-${dayIndex}`}
                style={styles.timeGridSlot}
              >
                <View style={styles.timeGridSlotContent}>
                  {uniqueReservations.map(reservation => (
                    <TouchableOpacity
                      key={reservation.id}
                      style={[
                        styles.reservationSlot,
                        getReservationStyle(reservation),
                        { height: (reservation.duration / 30) * TIME_GRID_HEIGHT }
                      ]}
                      onPress={(event) => handleTimeSlotPress(
                        reservation.hour,
                        reservation.minute,
                        dayIndex,
                        day,
                        event
                      )}
                      activeOpacity={0.6}
                    >
                      {renderReservationContent(reservation)}
                    </TouchableOpacity>
                  ))}
                  {selectedSlot?.hour === i && 
                   selectedSlot?.minute === 30 && 
                   selectedSlot?.dayIndex === dayIndex && (
                    <TouchableOpacity
                      style={styles.selectedSlotContainer}
                      onPress={handleSelectionBoxPress}
                      activeOpacity={1}
                    >
                      <View
                        style={[
                          styles.selectedTimeSlot,
                          {
                            height: TIME_GRID_HEIGHT * (selectedSlot.duration / 30)
                          }
                        ]}
                      >
                        <TouchableOpacity onPress={handleSelectionBoxPress} style={styles.addButton}>
                          <MaterialCommunityIcons name="plus-circle" size={22} color="#180df5" />
                        </TouchableOpacity>
                        <Text style={styles.selectedTimeText}>
                          {formatTime(selectedSlot.hour, selectedSlot.minute)}-{formatTime(calculateEndTime(selectedSlot.hour, selectedSlot.minute, selectedSlot.duration).endHour, calculateEndTime(selectedSlot.hour, selectedSlot.minute, selectedSlot.duration).endMinute)}
                        </Text>
                        {!showReservationPopup && (
                          <TouchableOpacity onPress={handleClosePopup} style={styles.closeButton}>
                             <MaterialCommunityIcons name="window-close" size={20} color="#3b3eff5c" />
                          </TouchableOpacity>
                        )}
                        {showReservationPopup && <View style={styles.buttonPlaceholder} />}
                      </View>
                    </TouchableOpacity>
                  )}
                  {reservationsForSlot.length === 0 && (
                    <TouchableOpacity
                      style={styles.emptySlotTouchable}
                      onPress={(event) => handleTimeSlotPress(i, 30, dayIndex, day, event)}
                      activeOpacity={0.6}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      );

      // Push both slots at once
      hours.push(hourSlot, halfHourSlot);
    }
    return hours;
  };

  const renderCurrentTimeIndicator = () => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const top = ((hour - 8) * TIME_GRID_HEIGHT * 2) + (minutes * (TIME_GRID_HEIGHT / 30));

    if (hour < 8 || hour > 20) return null;

    return (
      <View style={[styles.currentTimeContainer, { top }]}>
        <View style={styles.currentTimeDot} />
        <View style={styles.currentTimeLine} />
      </View>
    );
  };

  const renderDayColumn = (day: Date, index: number) => (
    <View style={styles.dayColumn} key={index}>
      {isSameDay(day, new Date()) && renderCurrentTimeIndicator()}
    </View>
  );

  const calculateEndTime = (startHour: number, startMinute: number, duration: number) => {
    const totalStartMinutes = startHour * 60 + startMinute;
    const totalEndMinutes = totalStartMinutes + duration;
    const endHour = Math.floor(totalEndMinutes / 60);
    const endMinute = totalEndMinutes % 60;
    return { endHour, endMinute };
  }

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topBarButtons} />

            <Text style={styles.dateRangeText}>
              {format(weekStart, 'M월 d일')} - {format(addDays(weekStart, 4), 'M월 d일')}
            </Text>

          <View style={styles.topBarButtons}>
            <TouchableOpacity style={styles.navButton} onPress={goToPreviousWeek}>
              <MaterialCommunityIcons name="chevron-left" size={36} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.todayButton,
                isSameWeek(new Date(), weekStart, { weekStartsOn: 1 }) && styles.todayButtonActive
              ]} 
              onPress={goToToday}
            >
              <MaterialCommunityIcons 
                name="calendar-month" 
                size={24} 
                color={isSameWeek(new Date(), weekStart, { weekStartsOn: 1 }) ? 'white' : '#0e0efd'} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
              <MaterialCommunityIcons name="chevron-right" size={36} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.datesRowBar}>
            {Array(7).fill(null).map((_, index) => {
              const day = addDays(weekStart, index);
              if (!isWeekend(day)) {
                return renderDateRow(day, index);
              }
            })}
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
          >
            <View style={{flexDirection: 'row'}}>
              <View style={styles.timeColumn}>
                {renderTimeSlots()}
              </View>

              <View style={styles.daysContainer}>
                <View style={styles.timeGridContainer}>
                  {renderTimeGrid()}
                </View>
                {Array(7).fill(null).map((_, index) => {
                  const day = addDays(weekStart, index);
                  if (!isWeekend(day)) {
                    return renderDayColumn(day, index);
                  }
                  return null;
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {selectedSlot && (
        <ReservationPopup
          selectedSlot={selectedSlot}
          onClose={handleClosePopup}
          onSave={handleSaveReservation}
          visible={showReservationPopup}
          initialDuration={selectedSlot.duration}
          reservations={reservations}
          onDurationChange={(newDuration) => {
            setSelectedSlot(prev => prev ? { ...prev, duration: newDuration } : null);
          }}
        />
      )}

      {selectedReservation && (
        <ReservationEditPopup
          reservation={selectedReservation}
          onClose={handleCloseEditPopup}
          onDelete={handleDeleteReservation}
          onEdit={handleEditReservation}
          visible={showEditPopup}
        />
      )}
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginRight: 40,
    marginLeft: 20,
    backgroundColor: '#F1F1F1',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop:10,
  },
  dateRangeText: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  topBarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'red',
    width: 50+50+40+40,
    height: 40,
  },
  navButton: {
    width: 50,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'black',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  todayButton: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 40,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonActive: {
    backgroundColor: '#4e5bf2',
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 50,
    overflow: 'hidden',
  },
  datesRowBar: {
    width: '100%',
    height: 70,
    flexDirection: 'row',
    paddingLeft: 40,
    borderBottomWidth: 2,
    borderBottomColor: 'gray',
  },
  dateBlock: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayHeader: {
    backgroundColor: '#e6e9ff',
    borderRadius: 30,
    width: 50,
    height: 50,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  dayName: {
    fontSize: 12,
    color: 'black',
    letterSpacing: -0.3,
    fontFamily: 'System',
  },
  scrollView: {
    flex: 0.5,
    flexDirection: 'column',
  },
  timeColumn: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    marginTop: -18,
  },
  timeSlot: {
    height: TIME_GRID_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-end',
    // backgroundColor: 'red',
    // borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingRight: 5,
  },
  timeGridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  timeGridRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#d5d5d5',
    height: TIME_GRID_HEIGHT,
  },
  fullHourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    height: TIME_GRID_HEIGHT,
  },
  timeGridSlot: {
    flex: 1,
    height: TIME_GRID_HEIGHT,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    position: 'relative',
  },
  
  timeGridSlotContent: {
    height: TIME_GRID_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  timeTextBig: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
    lineHeight: TIME_GRID_HEIGHT,
    letterSpacing: -1,
    fontFamily: 'System',
  },
  timeText: {
    fontSize: 12,
    color: '#d9d9d9',
    lineHeight: TIME_GRID_HEIGHT,
    letterSpacing: -0.3,
    fontFamily: 'System',
  },
  daysContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  dayColumn: {
    width:'20%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    position: 'relative',
  },
  selectedTimeSlot: {
    position: 'absolute',
    top: 0,
    left: MARGIN_LEFT,
    right: MARGIN_RIGHT,
    backgroundColor: '#cfdaff',
    borderWidth: 2,
    borderColor: '#0216ef',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingLeft: 4,
    paddingRight: 10,

    
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#091be6',
    flexGrow: 1,
    textAlign: 'left',
    marginBottom: 2,
  },
  closeButton: {
    left:3,
    padding: 1,
    minWidth: 30,
    alignItems: 'center',
  },
  addButton: {
     paddingLeft: 3,
     paddingRight: 2,
     minWidth: 30,
     alignItems: 'center',
  },
  buttonPlaceholder: {
    width: 30,
    padding: 6,
  },
  selectedSlotContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  currentTimeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 4,
    pointerEvents: 'none',
  },
  currentTimeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginLeft: -6,
    position: 'relative',
    zIndex: 4,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#FF0000',
    opacity: 0.8,
    marginLeft: 0,
    position: 'relative',
    zIndex: 4,
  },
  todayButtonTextActive: {
    color: 'white',
  },
  reservationSlot: {
    position: 'absolute',
    top: -1,
    left: MARGIN_LEFT,
    right: MARGIN_RIGHT,
    borderWidth: 1,
    borderColor: '#bcbcbc',
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  reservationText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  currentReservationText: {
    color: 'white',
  },
  reservationTimeText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 2,
  },
  currentReservationTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pastReservation: {
    backgroundColor: '#898989',
    borderColor: '#ffffff',
  },
  currentReservation: {
    backgroundColor: '#1edb1e',
    borderColor: '#ffffff',
  },
  futureReservation: {
    backgroundColor: '#77b0ff',
    borderColor: '#ffffff',
  },
  emptySlotTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});


export default ReserveRoom; 