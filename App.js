import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Text, StyleSheet, Image, Animated, PanResponder, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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

      <View style={styles.top}>
        <Image style={styles.logo} source={require('./assets/snack-icon.png')} />
        <View style={{ flexDirection: 'row' }}></View>

        <View style={styles.gaugeContainer}>
          <AnimatedCircularProgress
            size={SCREEN_WIDTH * 0.35}
            width={SCREEN_WIDTH * 0.035}
            fill={mappedNumber1}
            tintColor="#ff6b6b"
            backgroundColor="#e0e0e0"
            rotation={180}
            lineCap="round"
          >
            {() => (
              <Text
                style={{
                  fontSize: SCREEN_WIDTH * 0.045,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '100%',
                  color: '#ff6b6b',
                  letterSpacing: 1.2,
                }}
              >
                Heart {Math.round(rawValue1)}bpm
              </Text>
            )}
          </AnimatedCircularProgress>

          {heartRateError && (
            <Text style={styles.errorText}>{heartRateError}</Text>
          )}

          <AnimatedCircularProgress
            size={SCREEN_WIDTH * 0.35}
            width={SCREEN_WIDTH * 0.035}
            fill={mappedNumber2} 
            tintColor="#00b894"
            backgroundColor="#e0e0e0"
            rotation={180}
            lineCap="round"
          >
            {() => (
              <Text style={{ fontSize: SCREEN_WIDTH * 0.045, fontWeight: 'bold', color: '#00b894', textAlign: 'center', width: '100%', letterSpacing: 1.2 }}>
                Oxy {Math.round(rawValue2)}%
              </Text>
            )}
          </AnimatedCircularProgress>
        </View>

      </View>

      <View style={styles.bot}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.customButton, styles.redButton, styles.shadowButton]}
            activeOpacity={0.8}
            onPressIn={() =>
              fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V6?value=1')
            }
            onPressOut={() =>
              fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V6?value=0')
            }
          >
            <Text style={styles.buttonText}>Shrink</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, styles.greenButton, styles.shadowButton]}
            activeOpacity={0.8}
            onPressIn={() =>
              fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V7?value=1')
            }
            onPressOut={() =>
              fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V7?value=0')
            }
          >
            <Text style={styles.buttonText}>Stretch</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.text}>X: {coords.x} | Y: {coords.y}</Text>
        <Text style={styles.countInlineText}>Count: {count} | Last: {lastcount}</Text>
        <View style={styles.joystickArea}>
          <Animated.View
            style={[styles.knob, { transform: pan.getTranslateTransform() }]}
            {...panResponder.panHandlers}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  top: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f1f2f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bot: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  logo: {
    marginTop: SCREEN_HEIGHT * 0.07,
    height: SCREEN_HEIGHT * 0.15,
    width: SCREEN_WIDTH * 0.5,
    resizeMode: 'contain',
  },
  gaugeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    width: SCREEN_WIDTH * 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH * 0.9,
    marginTop: 10,
    marginBottom: 10,
  },
  customButton: {
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.045,
    borderRadius: 12,
    minWidth: SCREEN_WIDTH * 0.22,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  redButton: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  greenButton: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },
  shadowButton: {
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#222f3e',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  text: {
    marginTop: SCREEN_HEIGHT * 0.02,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#636e72',
  },
  errorText: {
    color: 'red',
    fontSize: SCREEN_WIDTH * 0.035,
    marginTop: 10,
    textAlign: 'center',
  },
  joystickArea: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    backgroundColor: '#f1f2f6',
    borderRadius: JOYSTICK_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    backgroundColor: '#00b894',
    borderRadius: KNOB_SIZE / 2,
    position: 'absolute',
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#fff',
  },
  countInlineText: {
    marginTop: 2,
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#636e72',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
