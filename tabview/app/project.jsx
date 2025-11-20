import { View, Text, StyleSheet } from "react-native";

export default function Projects() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Projects</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Project 1: Weather App</Text>
        <Text style={styles.desc}>A clean React Native app showing real-time weather.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Project 2: Expense Tracker</Text>
        <Text style={styles.desc}>Track your daily expenses with charts.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Project 3: Portfolio Website</Text>
        <Text style={styles.desc}>Personal portfolio built using Expo & React.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15
  },
  title: { fontSize: 18, fontWeight: "600" },
  desc: { fontSize: 14, marginTop: 4 }
});
