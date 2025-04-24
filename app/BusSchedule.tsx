import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BusHome from '../components/BusHome';
import ShuttleHome from '../components/ShuttleHome';
import BusWork from '../components/BusWork';
import BusStation from '../components/BusStation';

type BusType = '퇴근버스' | '퇴근셔틀' | '업무버스' | '버스정류장';
const BusSchedule = () => {
  const [selectedTab, setSelectedTab] = useState('퇴근버스');


  const renderContent = () => {
    switch (selectedTab) {
      case '퇴근버스':
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
    <View style={[styles.container]}>
      <View style={styles.tabBar}>
        {['퇴근버스', '퇴근셔틀', '업무버스', '버스정류장'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={selectedTab === tab ? styles.activeTabText : styles.tabText}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    marginTop: 20,
    justifyContent: 'center',
  },
  tab: {
    width: 130,
    alignItems: 'center',
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  tabText: {
    color: 'black',
    fontSize: 18,
  },
  activeTabText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  contentArea: {
    flex: 1,
    marginRight: 20,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default BusSchedule; 