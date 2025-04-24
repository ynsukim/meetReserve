import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, StatusBar } from 'react-native';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Reservation } from '../types/reservation';

interface ReservationEditPopupProps {
  reservation: Reservation;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (reservation: Reservation) => void;
  visible: boolean;
}

const ReservationEditPopup: React.FC<ReservationEditPopupProps> = ({
  reservation,
  onClose,
  onDelete,
  onEdit,
  visible,
}) => {
  const handleDelete = () => {
    onDelete(reservation.id);
    onClose();
  };

  const handleEdit = () => {
    onEdit(reservation);
    onClose();
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
              <Text style={styles.popupTitle}>예약 정보</Text>
            </View>
            
            <View style={styles.popupContentLine}>
              <Text style={styles.popupText}>
                회의 시각 
              </Text>
              <Text style={styles.popupTextBig}>
                {format(reservation.date, 'M.dd (E) ', { locale: ko })}                
                {reservation.hour}:{reservation.minute === 0 ? '00' : '30'}
              </Text>
            </View>

            <View style={styles.popupContentLine}>
              <Text style={styles.popupText}>
                회의 시간 
              </Text>
              <Text style={styles.popupTextBig}>
                {Math.floor(reservation.duration / 60)}시간 {reservation.duration % 60}분
              </Text>
            </View>

            <View style={styles.popupContentLine}>
              <Text style={styles.popupText}>
                예약자 
              </Text>
              <Text style={styles.popupTextBig}>
                {reservation.name}
              </Text>
            </View>

            <View style={styles.popupFooter}>
              <TouchableOpacity 
                style={[styles.popupFooterButton, styles.deleteButton]} 
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.popupFooterButton, styles.editButton]} 
                onPress={handleEdit}
              >
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.popupFooterButton} 
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
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
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  editButton: {
    backgroundColor: '#e3f2fd',
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  editButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default ReservationEditPopup; 