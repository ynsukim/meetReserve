import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ShuttleRoute, ShuttleStop, ShuttleDepartureTime } from '../data/busHomeData';
import shuttleRoutes from '../data/busHomeData';

const BusRouteRow = ({ route }: { route: ShuttleRoute }) => {
  return (
    <View style={styles.row}>
      {/* NO Column */}
      <View style={[styles.cell, styles.noCell]}>
        <Text style={styles.noText}>{route.no}</Text>
      </View>

      {/* Route Name Column */}
      <View style={[styles.cell, styles.nameCell]}>
        <Text style={styles.routeText}>{route.name}</Text>
        <Text style={styles.stopText}>{route.waitingArea}</Text>
      </View>

      {/* Departure Times Column */}
      <View style={[styles.cell, styles.timesCell]}>
        {route.departureTimes.map((time: ShuttleDepartureTime, index: number) => (
          <View key={index} style={styles.timeRow}>
            <Text style={styles.timeText}>{time.weekday}</Text>
            <Text style={styles.timeText}>{time.friday}</Text>
          </View>
        ))}
      </View>

      {/* Stops Column */}
      <View style={[styles.cell, styles.stopsCell]}>
        {route.stops.map((stop: ShuttleStop, index: number) => (
          <Text key={index} style={styles.stopText}>
            {index + 1}. {stop.name}
          </Text>
        ))}
      </View>


    </View>
  );
};

const BusHome = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.noCell]}> </Text>
        <Text style={[styles.headerCell, styles.nameCell]}>노선명</Text>
        <Text style={[styles.headerCell, styles.timesCell, { textAlign: 'center' }]}> 월 - 목  |  금요일 </Text>
        <Text style={[styles.headerCell, styles.stopsCell]}>정류장</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {shuttleRoutes.map((route: ShuttleRoute) => (
          <BusRouteRow key={route.no} route={route} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '60%',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
  },
  scrollContainer: {
    marginBottom: 50,
    width: '100%',
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomColor: '#E0E0E0',
    paddingVertical: 15,
  },
  headerCell: {
    paddingLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
  },
  cell: {
    paddingHorizontal: 8,
  },
  noCell: {
    width: 40,
    alignItems: 'center',

  },
  nameCell: {
    flex: 2.25,

  },
  stopsCell: {
    flex: 4,

  },
  timesCell: {
    flex: 1.75,
    marginRight: 70,

  },

  noText: {
    paddingTop: 5,
    fontSize: 12,
    color: '#333333',
  },
  routeText: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: '600',
    color: '#333333',
  },
  waitingText: {
    fontSize: 12,
    color: '#666666',
  },
  stopText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    width: 50,
    textAlign: 'center',
  },

});

export default BusHome; 