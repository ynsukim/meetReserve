import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface TimeTableData {
  location: string;
  platform: string;
  times: Array<{
    number: number;
    time: string;
  }>;
}

const timeTableData: TimeTableData[] = [
  {
    location: "서울R&D캠퍼스출발",
    platform: "4번 승차장",
    times: [
      { number: 1, time: "8:10" },
      { number: 2, time: "9:10" },
      { number: 3, time: "10:10" },
      { number: 4, time: "12:10" },
      { number: 5, time: "13:10" },
      { number: 6, time: "14:10" },
    ]
  },
  {
    location: "수원사업장출발",
    platform: "중앙문7번 승차장",
    times: [
      { number: 1, time: "10:10" },
      { number: 2, time: "12:10" },
      { number: 3, time: "13:10" },
      { number: 4, time: "14:10" },
      { number: 5, time: "15:10" },
      { number: 6, time: "16:10" },
    ]
  }
];

const TimeTable = ({ data }: { data: TimeTableData }) => {
  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.locationText}>{data.location}</Text>
        <Text style={styles.platformText}>{data.platform}</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {data.times.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{item.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const BusWork = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.tablesContainer}>
        {timeTableData.map((data, index) => (
          <TimeTable key={index} data={data} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'red',
  },
  tablesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  tableContainer: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerContainer: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationText: {
    fontSize: 20,
    marginBottom: 5,
    paddingLeft: 12,
    fontWeight: '600',
    color: '#333333',
  },
  platformText: {
    fontSize: 14,
    color: '#6C757D',
    paddingLeft: 12,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: '#495057',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cell: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    width: 50,
  },
});

export default BusWork; 