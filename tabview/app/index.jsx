import { View, Text, StyleSheet, Image } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      
      {/* Logo */}
      <Image
        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png" }}
        style={styles.logo}
      />

      {/* Your Details */}
      <Text style={styles.name}>Nandhu</Text>
      <Text style={styles.usn}>USN: 4NI24IS161</Text>
      <Text style={styles.college}>The National Institute of Engineering</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 25,
    borderRadius: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },
  usn: {
    fontSize: 20,
    fontWeight: "600",
    color: "#444",
    marginBottom: 5,
  },
  college: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
});
