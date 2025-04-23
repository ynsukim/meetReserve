import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

type CafeteriaType = '1식당' | '2식당';

const CafeteriaMenu = () => {
  const [selectedCafeteria, setSelectedCafeteria] = useState<CafeteriaType>('1식당');

  const cafeteriaUrls = {
    '1식당': 'https://front.cjfreshmeal.co.kr/menuinfo?idx=6415',
    '2식당': 'https://www.samsungwelstory.com/menu/seoulrnd/menu.jsp',
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(Object.keys(cafeteriaUrls) as CafeteriaType[]).map((cafeteria) => (
          <TouchableOpacity
            key={cafeteria}
            style={[styles.tab, selectedCafeteria === cafeteria && styles.selectedTab]}
            onPress={() => setSelectedCafeteria(cafeteria)}
          >
            <Text style={[styles.tabText, selectedCafeteria === cafeteria && styles.selectedTabText]}>
              {cafeteria}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: cafeteriaUrls[selectedCafeteria] }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
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
  webviewContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webview: {
    flex: 1,
  },
});

export default CafeteriaMenu; 