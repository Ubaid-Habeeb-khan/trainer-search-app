import "react-native-gesture-handler";
import "react-native-reanimated"; // REQUIRED for Reanimated to work

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function App() {
  // Animation values
  const fadeBg = useSharedValue(0);
  const slideUp = useSharedValue(60);
  const zoomImg = useSharedValue(0.5);
  const fadeText = useSharedValue(0);

  // Animations on load
  useEffect(() => {
    fadeBg.value = withTiming(1, { duration: 800 });

    slideUp.value = withDelay(
      300,
      withTiming(0, { duration: 700 })
    );

    zoomImg.value = withDelay(
      300,
      withTiming(1, { duration: 700 })
    );

    fadeText.value = withDelay(
      1000,
      withTiming(1, { duration: 700 })
    );
  }, []);

  // Styles using animated values
  const bgStyle = useAnimatedStyle(() => ({
    opacity: fadeBg.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideUp.value }],
  }));

  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomImg.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: fadeText.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, bgStyle]}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.container}
      >
        <Animated.View style={[styles.profileCard, cardStyle]}>
          <Animated.Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={[styles.profileImage, imgStyle]}
          />

          <Animated.Text style={[styles.name, textStyle]}>
            UBAID HABEEB KHAN
          </Animated.Text>

          <Animated.View style={[styles.infoBox, textStyle]}>
            <Text style={styles.label}>USN</Text>
            <Text style={styles.value}>4NI24IS222</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>habeebkhanubaid@gmail.com</Text>

            <Text style={styles.label}>College</Text>
            <Text style={styles.value}>NIE</Text>

            <Text style={styles.label}>Branch</Text>
            <Text style={styles.value}>ISE</Text>
          </Animated.View>
        </Animated.View>

        <StatusBar style="light" />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  profileCard: {
    backgroundColor: "#ffffffdd",
    width: "90%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 8,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#3b5998",
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#192f6a",
    marginBottom: 20,
  },

  infoBox: {
    width: "100%",
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
  },

  value: {
    fontSize: 16,
    color: "#222",
    marginBottom: 5,
  },
});
