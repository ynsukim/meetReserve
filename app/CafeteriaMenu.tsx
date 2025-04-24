import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const CafeteriaMenu = () => {
  const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

  return (
    <View style={styles.container}>
      <View style={styles.cafeBox}>
        <View style={styles.cafeBoxHeader}>
          <Text style={styles.title}>1식당 메뉴 (B타워)</Text>
        </View>
        <View style={styles.cafeBoxContent}> 
          <WebView 
            // userAgent={mobileUserAgent}
            source={{ uri: 'https://front.cjfreshmeal.co.kr/menuinfo?idx=6415' }}
            
          />
        </View>
      </View>
      <View style={{ flex: 0.02 }} />
      <View style={styles.cafeBox}>
        <View style={styles.cafeBoxHeader}>
          <Text style={styles.title}>2식당 메뉴 (D타워)</Text>
        </View>
        <View style={styles.cafeBoxContent}> 
          <WebView 
            // userAgent={mobileUserAgent}
            source={{ uri: 'https://www.samsungwelstory.com/menu/seoulrnd/menu.jsp' }}
            
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
    paddingLeft: 10,
  },
  cafeBox: {
    flex: 1,
  },
  cafeBoxHeader: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cafeBoxContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CafeteriaMenu; 