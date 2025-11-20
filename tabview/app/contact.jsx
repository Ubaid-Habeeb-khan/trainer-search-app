import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { FontAwesome, Entypo } from "@expo/vector-icons";

export default function Contact() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Let's Connect 🚀</Text>

      {/* GitHub */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL("https://github.com/yourusername")}
      >
        <FontAwesome name="github" size={28} color="#000" />
        <Text style={styles.text}>GitHub</Text>
      </TouchableOpacity>

      {/* LinkedIn */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL("https://linkedin.com/in/yourprofile")}
      >
        <Entypo name="linkedin" size={28} color="#0072b1" />
        <Text style={styles.text}>LinkedIn</Text>
      </TouchableOpacity>

      {/* Email */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL("mailto:youremail@gmail.com")}
      >
        <Entypo name="mail" size={28} color="#d9534f" />
        <Text style={styles.text}>Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#f4f6f9",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#222",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  text: {
    fontSize: 20,
    marginLeft: 15,
    fontWeight: "600",
    color: "#333",
  },
});
