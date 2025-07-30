import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Text, StyleSheet, Image, Animated, PanResponder, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomButton from './components/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOT_HEIGHT = SCREEN_HEIGHT * 0.5;
const JOYSTICK_SIZE = Math.min(SCREEN_WIDTH, BOT_HEIGHT) * 0.5;
const KNOB_SIZE = JOYSTICK_SIZE * 0.35;

export default function App() {
  const [count, setCount] = useState(0);
  const [lastcount, setlastCount] = useState(0);
  const lastcountRef = useRef(0);
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    lastcountRef.current = lastcount;
  }, [lastcount]);

  const pan = useRef(new Animated.ValueXY()).current;
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      let dx = Math.max(-100, Math.min(gesture.dx, 100));
      let dy = Math.max(-100, Math.min(gesture.dy, 100));
      pan.setValue({ x: dx, y: dy });
      setCoords({ x: Math.round(dx), y: Math.round(dy) });

      let newCount = 0;
      if (dy < -90 && dx > -20 && dx < 20) newCount = 1;
      if (dy > 90 && dx > -20 && dx < 20) newCount = 2;
      if (dx < -90 && dy > -20 && dy < 20) newCount = 3;
      if (dx > 90 && dy > -20 && dy < 20) newCount = 4;
      if (dx > -20 && dx < 20 && dy > -20 && dy < 20) newCount = 5; 
      setCount(newCount);

      if (newCount !== lastcountRef.current && newCount !== 0) {
        fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V2?value=' + newCount);
        setlastCount(newCount);               // cập nhật state
        lastcountRef.current = newCount;      // cập nhật ref
      }
    },

    onPanResponderRelease: () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false
      }).start();
      setCoords({ x: 0, y: 0 });

      // Khi thả ra, tự động trả về 5 nếu count khác 5
      if (countRef.current !== 5) {
        setCount(5);
        if (lastcountRef.current !== 5) {
          fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V2?value=5');
          setlastCount(5);
          lastcountRef.current = 5;
        }
      }
    }
  })).current;

  const [responseData1, setResponseData1] = useState(null);
  const [responseData2, setResponseData2] = useState(null);
  // Thêm state để lưu lỗi mạng cho nhịp tim
  const [heartRateError, setHeartRateError] = useState(null);

  useEffect(() => {
    const intervalId1 = setInterval(() => {
      fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/get/V0')
        .then(response => {
          // Kiểm tra nếu response không hợp lệ
          if (!response.ok) {
            throw new Error('Response không hợp lệ: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          setResponseData1(data);
          setHeartRateError(null); // Reset lỗi nếu fetch thành công
        })
        .catch(error => {
          console.error(error);
          setHeartRateError('Lỗi mạng: ' + error.message);
        });
    }, 1000);

    const intervalId2 = setInterval(() => {
      fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/get/V1')
        .then(response => response.json())
        .then(data => setResponseData2(data))
        .catch(error => console.error(error));
    }, 1000);

    return () => {
      clearInterval(intervalId1);
      clearInterval(intervalId2);
    }
  }, []);    

  const rawValue1 = responseData1 && !isNaN(parseInt(responseData1[0])) ? parseInt(responseData1[0]) : 0;
  const rawValue2 = responseData2 && !isNaN(parseInt(responseData2[0])) ? parseInt(responseData2[0]) : 0;

  const mapValue = (x, a, b, c, d) => {
    if (isNaN(x)) return 0;
    return ((x - a) / (b - a)) * (d - c) + c;
  };

  const mappedNumber1 = Math.max(0, Math.min(100, mapValue(rawValue1, 60, 130, 0, 100)));
  const mappedNumber2 = Math.max(0, Math.min(100, mapValue(rawValue2, 90, 100, 0, 100)));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image style={styles.logo} source={require('./assets/snack-icon.png')} />
          <Text style={styles.appTitle}>Hệ Thống Giám Sát Sức Khỏe</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Health Metrics Section */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Chỉ Số Sức Khỏe</Text>
          <View style={styles.gaugeContainer}>
            <View style={styles.healthCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="heart" size={SCREEN_WIDTH * 0.08} color="#00FFFF" />
                </View>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.cardTitle}>Heart Rate</Text>
                <View style={styles.valueContainer}>
                  <Text style={[styles.cardValue, styles.heartValue]}>{Math.round(rawValue1)}</Text>
                  <Text style={styles.cardUnit}>BPM</Text>
                </View>
              </View>
            </View>

            <View style={styles.healthCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="tint" size={SCREEN_WIDTH * 0.08} color="#00FFFF" />
                </View>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.cardTitle}>Oxygen</Text>
                <View style={styles.valueContainer}>
                  <Text style={styles.cardValue}>{Math.round(rawValue2)}</Text>
                  <Text style={styles.cardUnit}>%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Control Section */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Điều Khiển Ghế</Text>
          
          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <CustomButton
              onPressIn={() =>
                fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V6?value=1')
              }
              onPressOut={() =>
                fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V6?value=0')
              }
              title="Thu Nhỏ"
            />

            <CustomButton
              onPressIn={() =>
                fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V7?value=1')
              }
              onPressOut={() =>
                fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V7?value=0')
              }
              title="Kéo Dài"
            />
          </View>

          {/* Joystick Section */}
          <View style={styles.joystickSection}>
            <Text style={styles.joystickTitle}>Điều Khiển Hướng</Text>
            
            <View style={styles.joystickContainer}>
              <View style={styles.joystickArea}>
                <Animated.View
                  style={[styles.knob, { transform: pan.getTranslateTransform() }]}
                  {...panResponder.panHandlers}
                />
                <View style={styles.joystickCenter} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 2,
    paddingHorizontal: 20,
    backgroundColor: '#1A202C',
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    height: SCREEN_HEIGHT * 0.08,
    width: SCREEN_WIDTH * 0.3,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 5,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#1A202C',
  },
  metricsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  gaugeContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  gaugeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gaugeContent: {
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 2,
  },
  gaugeUnit: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '500',
    color: '#636e72',
    marginBottom: 5,
  },
  gaugeLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontWeight: '500',
    color: '#636e72',
    textAlign: 'center',
  },
  controlSection: {
    flex: 1,
    marginTop: -20, // Thêm margin âm để di chuyển lên trên
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  customButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    minWidth: SCREEN_WIDTH * 0.25,
  },
  buttonGradient: {
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  buttonText: {
    color: '#00FFFF',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  joystickSection: {
    alignItems: 'center',
  },
  joystickTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  joystickContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  joystickArea: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    backgroundColor: '#2D3748',
    borderRadius: JOYSTICK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    backgroundColor: '#00FFFF',
    borderRadius: KNOB_SIZE / 2,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#1A202C',
  },
  joystickCenter: {
    width: 8,
    height: 8,
    backgroundColor: '#00FFFF',
    borderRadius: 4,
    opacity: 0.3,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: SCREEN_WIDTH * 0.03,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 15,
  },
  cardLeft: {
    width: SCREEN_WIDTH * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: SCREEN_WIDTH * 0.16,
    height: SCREEN_WIDTH * 0.16,
    borderRadius: SCREEN_WIDTH * 0.08,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: SCREEN_WIDTH * 0.075,
    fontWeight: '700',
    color: '#00FFFF',
  },
  heartValue: {
    color: '#FF6B6B',
  },
  cardUnit: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '500',
    color: '#A0AEC0',
    marginLeft: 8,
  },
  cardRight: {
    width: SCREEN_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#A0AEC0',
  },
});
