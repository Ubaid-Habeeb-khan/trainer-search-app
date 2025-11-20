import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="contact" options={{ title: "Contact" }} />
      <Tabs.Screen name="projects" options={{ title: "Projects" }} />
    </Tabs>
  );
}
