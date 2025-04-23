import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import shuttleRoutes from '../data/shuttleHomeData';

const ShuttleRouteCard = ({ route }: { route: typeof shuttleRoutes[0] }) => {
  return (
    <View style={styles.routeContainer}>
 
      {/* Schedule Table */}
      <View style={styles.scheduleContainer}>

        {/* Table Headers */}
          <View style={styles.tableHeaderBox}>
            <Text style={styles.headerText}>{route.destination}</Text>
            <Text style={styles.platformText}>{route.platform}</Text>
          </View>
        <View style={styles.tableHeader}>
          <Text style={styles.columnHeader}>월-목</Text>
          <Text style={styles.columnHeader}>금요일</Text>
          <Text style={styles.columnHeader}>디데이</Text>
        </View>

        {/* Time Slots */}
        <ScrollView style={styles.timeGrid}>
          {Array.from({ length: Math.max(
            route.schedule.weekday.length,
            route.schedule.friday.length,
            route.schedule.dday.length
          ) }).map((_, index) => (
            <View key={index} style={styles.timeRow}>
              <Text style={styles.timeText}>
                {route.schedule.weekday[index]?.time || '-'}
              </Text>
              <Text style={styles.timeText}>
                {route.schedule.friday[index]?.time || '-'}
              </Text>
              <Text style={styles.timeText}>
                {route.schedule.dday[index]?.time || '-'}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const ShuttleHome = () => {
  return (

      <View style={styles.container}>
        {shuttleRoutes.map((route, index) => (
          <ShuttleRouteCard key={index} route={route} />
        ))}
      </View>

  );
};

const CARD_MARGIN = 16;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex:1,
    padding: CARD_MARGIN,
    gap: CARD_MARGIN,
    // backgroundColor: 'blue',
  },
  routeContainer: {
    minWidth: 150,
    flex:1,
    height: '85%',
    // backgroundColor: 'red',
  },
  header: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  platformText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  scheduleContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    // flex:1,
    backgroundColor: 'white',
  },
  tableHeaderBox: {
    flexDirection: 'column',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  columnHeader: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  timeGrid: {
    // height: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    width: 50,
    textAlign: 'center',
  },
});

export default ShuttleHome; 