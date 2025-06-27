import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Text, StyleSheet, Image, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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

  const rawValue1 = responseData1 ? parseInt(responseData1[0]) : 0;
  const rawValue2 = responseData2 ? parseInt(responseData2[0]) : 0;

  const mapValue = (x, a, b, c, d) => { return ((x - a) / (b - a)) * (d - c) + c; };

  const mappedNumber1 = mapValue(rawValue1, 60, 130, 0, 100);
  const mappedNumber2 = mapValue(rawValue2, 90, 100, 0, 100);

  return (
    <View style={styles.container}>

      <View style={styles.top}>
        <Image style={styles.logo} source={require('./assets/snack-icon.png')} />
        <View style={{ flexDirection: 'row' }}></View>

        <View style={styles.gaugeContainer}>
          <AnimatedCircularProgress
            size={150}
            width={15}
            fill={mappedNumber1}
            tintColor="#ff0000"
            backgroundColor="#3d5875"
            rotation={180}
            lineCap="round"
          >
            {() => (
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                Heart {Math.round(rawValue1)}bpm
              </Text>
            )}
          </AnimatedCircularProgress>

          {heartRateError && (
            <Text style={styles.errorText}>{heartRateError}</Text>
          )}

          <AnimatedCircularProgress
            size={150}
            width={15}
            fill={mappedNumber2} 
            tintColor="#00e0ff"
            backgroundColor="#3d5875"
            rotation={180}
            lineCap="round"
          >
            {() => (
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                Oxy {Math.round(rawValue2)}%
              </Text>
            )}
          </AnimatedCircularProgress>
        </View>

      </View>

      <View style={styles.bot}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.customButton, styles.orangeButton]}
            onPressIn={() =>
              fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V6?value=1')
            }
            onPressOut={() =>
              fetch('http://kenhsangtaotre.ddns.net:8080/P1BOGnIhVoPZRoUf6T3nn64rlp-YE5AS/update/V6?value=0')
            }
          >
            <Text style={styles.buttonText}>Shrank</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.customButton, styles.greenButton]}
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
        <Text style={styles.text}>count: {count} | lastcount: {lastcount}</Text>
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
    alignItems: 'center',
    justifyContent: 'center'
  },

  top: {
    width: '100%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f0f0f0'
  },

  bot: {
    width: '100%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'pink'
  },

  logo: {
    marginTop: '5%',
    height: '50%',
    width: '100%',
  },

  gaugeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },

  customButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },

  orangeButton: {
    backgroundColor: '#FF9900',
  },

  greenButton: {
    backgroundColor: '#00FF00',
  },

  buttonText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: 'bold',
  },

  text: {
    marginTop: '4%',
    fontSize: 15,
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center'
  },

  joystickArea: {
    width: 250,
    height: 250,
    backgroundColor: '#e0e0e0',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  knob: {
    width: 80,
    height: 80,
    backgroundColor: '#3498db',
    borderRadius: 40,
    position: 'absolute'
  }
});
