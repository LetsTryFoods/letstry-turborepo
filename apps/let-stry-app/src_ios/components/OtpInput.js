import React, { useRef, useEffect, useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const OtpInput = forwardRef(({ value = "", length = 6, onChange, onComplete, error }, ref) => {
  const inputRef = useRef(null);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [cursorIndex, setCursorIndex] = useState(value.length);

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (value.length < length) {
      setCursorIndex(value.length);
    }
    
    // Auto-submit when 6 digits are entered
    if (value.length === length) {
      onComplete?.(value);
    }
  }, [value]);

  const handleChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, length);
    onChange(cleaned);
  };

  const handleBoxTap = (index) => {
    setCursorIndex(index);
    inputRef.current?.focus();
    setTimeout(() => {
      inputRef.current?.setNativeProps({
        selection: { start: index, end: index },
      });
    }, 20);
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden
        autoFocus={true}
        contextMenuHidden={true}
      />

      <View style={styles.boxRow}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const isCursorHere = i === cursorIndex && value.length < length;

          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => handleBoxTap(i)}
              style={styles.boxTouchable}
            >
              <View style={styles.box}>
                {char ? (
                  <Text style={styles.boxText}>{char}</Text>
                ) : isCursorHere ? (
                  <Animated.Text
                    style={[styles.boxText, { opacity: blinkAnim }]}
                  >
                    |
                  </Animated.Text>
                ) : (
                  <Text style={[styles.boxText, { opacity: 0 }]}>0</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <Text style={styles.errorText} allowFontScaling={false}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  hiddenInput: {
    position: "absolute",
    height: verticalScale(50),
    width: "100%",
    opacity: 0,
    zIndex: 1,
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(3),
    width: "100%",
    right: scale(7),
  },
  boxTouchable: {
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: scale(40),
    height: verticalScale(45),
    borderWidth: 2,
    borderColor: "#F8EBC7",
    borderRadius: scale(8),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: scale(2),
  },
  boxText: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    minWidth: scale(16),
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: verticalScale(8),
    fontSize: 14,
    textAlign: "center",
  },
});

export default OtpInput;






