import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';

const Button = ({ onPressIn, onPressOut, title, style }) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
    onPressIn && onPressIn();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPressOut && onPressOut();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.button, style, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={styles.touchable}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D3748',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    minWidth: 50, // Thu nhỏ nút hơn nữa
    padding: 3,
    borderWidth: 1,
    borderColor: '#00FFFF',
    height: 32, // Giảm chiều cao
  },
  touchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8, // Tăng khoảng cách giữa các nút
  },
  text: {
    color: '#00FFFF',
    fontSize: 12, // Thu nhỏ chữ hơn nữa
    paddingVertical: 4, // Thu nhỏ padding dọc
    paddingHorizontal: 6, // Thu nhỏ padding ngang
    backgroundColor: 'transparent',
    borderRadius: 6,
    textAlign: 'center',
  },
});

export default Button;