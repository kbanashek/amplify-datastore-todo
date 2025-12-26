import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { storiesOf } from "@storybook/react-native/V6";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { TextField } from "../src/components/ui/TextField";
import { LoadingSpinner } from "../src/components/ui/LoadingSpinner";

// Button Stories
storiesOf("UI Components/Button", module)
  .add("Primary", () => (
    <View style={styles.container}>
      <Button
        variant="primary"
        onPress={() => Alert.alert("Primary Button Pressed!")}
      >
        Primary Button
      </Button>
    </View>
  ))
  .add("Secondary", () => (
    <View style={styles.container}>
      <Button
        variant="secondary"
        onPress={() => Alert.alert("Secondary Button Pressed!")}
      >
        Secondary Button
      </Button>
    </View>
  ))
  .add("Outline", () => (
    <View style={styles.container}>
      <Button
        variant="outline"
        onPress={() => Alert.alert("Outline Button Pressed!")}
      >
        Outline Button
      </Button>
    </View>
  ))
  .add("Disabled", () => (
    <View style={styles.container}>
      <Button disabled onPress={() => Alert.alert("Should not appear")}>
        Disabled Button
      </Button>
    </View>
  ))
  .add("Loading", () => (
    <View style={styles.container}>
      <Button loading onPress={() => Alert.alert("Loading")}>
        Loading Button
      </Button>
    </View>
  ))
  .add("All Sizes", () => (
    <View style={styles.container}>
      <Button size="sm" onPress={() => console.log("Small")}>
        Small Button
      </Button>
      <View style={styles.spacer} />
      <Button size="md" onPress={() => console.log("Medium")}>
        Medium Button
      </Button>
      <View style={styles.spacer} />
      <Button size="lg" onPress={() => console.log("Large")}>
        Large Button
      </Button>
    </View>
  ));

// Card Stories
storiesOf("UI Components/Card", module)
  .add("Default", () => (
    <View style={styles.container}>
      <Card>
        <View style={styles.cardContent}>
          <Button onPress={() => Alert.alert("Card Button Pressed!")}>
            Button Inside Card
          </Button>
        </View>
      </Card>
    </View>
  ))
  .add("With Padding", () => (
    <View style={styles.container}>
      <Card style={styles.paddedCard}>
        <TextField
          label="Name"
          placeholder="Enter your name"
          value=""
          onChangeText={() => {}}
        />
      </Card>
    </View>
  ));

// TextField Stories
storiesOf("UI Components/TextField", module)
  .add("Default", () => {
    const [value, setValue] = useState("");
    return (
      <View style={styles.container}>
        <TextField
          label="Username"
          placeholder="Enter username"
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  })
  .add("With Error", () => {
    const [value, setValue] = useState("");
    return (
      <View style={styles.container}>
        <TextField
          label="Email"
          placeholder="Enter email"
          value={value}
          onChangeText={setValue}
          error="Invalid email address"
        />
      </View>
    );
  })
  .add("Multiline", () => {
    const [value, setValue] = useState("");
    return (
      <View style={styles.container}>
        <TextField
          label="Description"
          placeholder="Enter description"
          value={value}
          onChangeText={setValue}
          multiline
          numberOfLines={4}
        />
      </View>
    );
  });

// LoadingSpinner Stories
storiesOf("UI Components/LoadingSpinner", module)
  .add("Default", () => (
    <View style={styles.container}>
      <LoadingSpinner />
    </View>
  ))
  .add("Large", () => (
    <View style={styles.container}>
      <LoadingSpinner size="large" />
    </View>
  ))
  .add("Small", () => (
    <View style={styles.container}>
      <LoadingSpinner size="small" />
    </View>
  ));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  cardContent: {
    padding: 16,
  },
  paddedCard: {
    padding: 20,
    width: "90%",
  },
  spacer: {
    height: 12,
  },
});
