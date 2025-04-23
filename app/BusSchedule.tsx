import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BusHome from '../components/BusHome';
import ShuttleHome from '../components/ShuttleHome';
import BusWork from '../components/BusWork';
import BusStation from '../components/BusStation';

type BusType = '퇴근버스' | '퇴근셔틀' | '업무버스' | '버스정류장';

const BusSchedule = () => {
  const [selectedTab, setSelectedTab] = useState<BusType>('퇴근버스');

  const renderContent = () => {
    switch (selectedTab) {
      case '퇴근버어스':
        return <BusHome />;
      case '퇴근셔틀':
        return <ShuttleHome />;
      case '업무버스':
        return <BusWork />;
      case '버스정류장':
        return <BusStation />;
      default:
        return <BusHome />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(['퇴근버스', '퇴근셔틀', '업무버스', '버스정류장'] as BusType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  selectedTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default BusSchedule; 