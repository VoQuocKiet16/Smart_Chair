import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';

const Button = ({ onPressIn, onPressOut, title }) => {
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
      <Animated.View style={[styles.button, { transform: [{ scale: scaleValue }] }]}>
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
    minWidth: 140,
    padding: 2,
    borderWidth: 1,
    borderColor: '#00FFFF',
    height: 40,
  },
  touchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#00FFFF',
    fontSize: 18, // Khôi phục lại font size ban đầu
    paddingVertical: 4, // Giảm tiếp để nút thấp hơn
    paddingHorizontal: 24, // Khôi phục lại padding ban đầu
    backgroundColor: 'transparent',
    borderRadius: 6,
    textAlign: 'center',
  },
});

export default Button;