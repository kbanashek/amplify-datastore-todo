import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { storiesOf } from "@storybook/react-native/V6";
import { Button } from "../src/components/ui/Button";

// Test Category 1
storiesOf("Test/Welcome", module)
  .add("Welcome Message", () => (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Storybook is Working!</Text>
      <Text style={styles.subtitle}>
        This confirms React Native Storybook is properly configured.
      </Text>
      <Text style={styles.instructions}>
        👆 Tap the navigator icon (top left) to browse all stories
      </Text>
    </View>
  ))
  .add("Instructions", () => (
    <View style={styles.container}>
      <Text style={styles.title}>📖 How to Use Storybook</Text>
      <Text style={styles.instruction}>
        1. Tap the navigator icon (≡) in the top left
      </Text>
      <Text style={styles.instruction}>2. Browse through story categories</Text>
      <Text style={styles.instruction}>3. Select any story to view it</Text>
      <Text style={styles.instruction}>4. Interact with components</Text>
    </View>
  ));

// Test Category 2 - Buttons
storiesOf("Test/Interactive", module)
  .add("Button Test", () => (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Tap the button below:</Text>
      <View style={styles.spacer} />
      <Button onPress={() => Alert.alert("Success!", "Button is working!")}>
        Test Button
      </Button>
    </View>
  ))
  .add("Multiple Buttons", () => (
    <View style={styles.container}>
      <Button
        variant="primary"
        onPress={() => Alert.alert("Primary", "Primary button pressed!")}
      >
        Primary
      </Button>
      <View style={styles.spacer} />
      <Button
        variant="secondary"
        onPress={() => Alert.alert("Secondary", "Secondary button pressed!")}
      >
        Secondary
      </Button>
      <View style={styles.spacer} />
      <Button
        variant="outline"
        onPress={() => Alert.alert("Outline", "Outline button pressed!")}
      >
        Outline
      </Button>
    </View>
  ));

// Test Category 3 - Colors
storiesOf("Test/Colors", module).add("Color Boxes", () => (
  <View style={styles.container}>
    <View style={[styles.colorBox, { backgroundColor: "#3498db" }]}>
      <Text style={styles.colorText}>Blue</Text>
    </View>
    <View style={[styles.colorBox, { backgroundColor: "#2ecc71" }]}>
      <Text style={styles.colorText}>Green</Text>
    </View>
    <View style={[styles.colorBox, { backgroundColor: "#e74c3c" }]}>
      <Text style={styles.colorText}>Red</Text>
    </View>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    color: "#3498db",
    marginTop: 20,
    fontWeight: "600",
  },
  instruction: {
    fontSize: 16,
    color: "#444",
    marginVertical: 8,
  },
  spacer: {
    height: 12,
  },
  colorBox: {
    width: 200,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    borderRadius: 8,
  },
  colorText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
