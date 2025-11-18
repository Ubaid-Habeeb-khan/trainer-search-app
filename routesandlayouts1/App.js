import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from "react-native";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function App() {
  // Animations
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const zoom = useRef(new Animated.Value(0.6)).current;
  const fadeText = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const bubbles = useRef(new Animated.Value(height)).current;

  // Tilt effect
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  // PanResponder for 3D tilt
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      Animated.spring(tiltX, {
        toValue: gesture.dx / 60,
        friction: 4,
        useNativeDriver: true,
      }).start();

      Animated.spring(tiltY, {
        toValue: gesture.dy / 60,
        friction: 4,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderRelease: () => {
      Animated.spring(tiltX, { toValue: 0, useNativeDriver: true }).start();
      Animated.spring(tiltY, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  useEffect(() => {
    // Wave animation (infinite)
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Bubbles animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbles, {
          toValue: -100,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(bubbles, {
          toValue: height,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    // Content animations
    Animated.sequence([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(zoom, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeText, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Wave movement left → right
  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  // Shimmer translate
  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Animated.View style={{ flex: 1, opacity: fadeIn }}>
      
      {/* Background gradient (Sunset theme) */}
      <LinearGradient
        colors={["#ff9966", "#ff5e62", "#355c7d"]}
        style={StyleSheet.absoluteFill}
      />

      {/* BIG WAVES */}
      <Animated.Image
        source={require("./assets/wave.png")}
        style={[
          styles.wave,
          { transform: [{ translateX: waveTranslate }] },
        ]}
        resizeMode="repeat"
      />

      <Animated.Image
        source={require("./assets/wave.png")}
        style={[
          styles.wave2,
          { transform: [{ translateX: waveTranslate }] },
        ]}
        resizeMode="repeat"
      />

      {/* FLOATING BUBBLES */}
      <Animated.View
        style={[
          styles.bubble,
          { transform: [{ translateY: bubbles }] },
        ]}
      />

      {/* MAIN CONTENT */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        
        {/* PROFILE CARD */}
        <Animated.View
          {...pan.panHandlers}
          style={[
            styles.profileCard,
            {
              transform: [
                { translateY: slideUp },
                { scale: zoom },
                {
                  rotateX: tiltY.interpolate({
                    inputRange: [-20, 20],
                    outputRange: ["15deg", "-15deg"],
                  }),
                },
                {
                  rotateY: tiltX.interpolate({
                    inputRange: [-20, 20],
                    outputRange: ["-15deg", "15deg"],
                  }),
                },
              ],
            },
          ]}
        >
          {/* SHIMMER BORDER */}
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslate }] },
            ]}
          />

          {/* PROFILE PICTURE */}
          <Animated.Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={[
              styles.profileImage,
              { transform: [{ scale: zoom }] },
            ]}
          />

          {/* GRADIENT NAME */}
          <LinearGradient
            colors={["#fceabb", "#f8b500", "#ff9966"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Animated.Text style={[styles.name, { opacity: fadeText }]}>
              UBAID HABEEB KHAN
            </Animated.Text>
          </LinearGradient>

          {/* INFO */}
          <Animated.View style={{ opacity: fadeText }}>
            <View style={styles.infoBox}>
              <Text style={styles.label}>USN</Text>
              <Text style={styles.value}>4NI24IS222</Text>

              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>habeebkhanubaid@gmail.com</Text>

              <Text style={styles.label}>College</Text>
              <Text style={styles.value}>NIE</Text>

              <Text style={styles.label}>Branch</Text>
              <Text style={styles.value}>ISE</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <StatusBar style="light" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: "absolute",
    bottom: 0,
    height: 220,
    width: width * 2,
    opacity: 0.4,
  },
  wave2: {
    position: "absolute",
    bottom: 40,
    height: 180,
    width: width * 2,
    opacity: 0.3,
  },
  bubble: {
    position: "absolute",
    left: width * 0.2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff70",
  },
  profileCard: {
    width: "88%",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    shadowColor: "#ff9966",
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 120,
    height: "100%",
    backgroundColor: "#ffffff55",
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#ffd700",
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
    color: "transparent",
    marginBottom: 15,
  },
  infoBox: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffeedd",
    marginTop: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
});
