import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { TextField } from "../src/components/ui/TextField";
import { LoadingSpinner } from "../src/components/ui/LoadingSpinner";
import { DatePicker } from "../src/components/ui/DatePicker";
import { NumericInput } from "../src/components/ui/NumericInput";
import { FieldLabel } from "../src/components/ui/FieldLabel";
import { IconSymbol } from "../src/components/ui/IconSymbol";
import { SingleSelectQuestion } from "../src/components/questions/SingleSelectQuestion";
import { MultiSelectQuestion } from "../src/components/questions/MultiSelectQuestion";
import { TextQuestion } from "../src/components/questions/TextQuestion";
import { NumberQuestion } from "../src/components/questions/NumberQuestion";
import { ProgressIndicator } from "../src/components/questions/ProgressIndicator";

// Separate components for stateful examples (to avoid hooks violations)
const TextFieldExample = () => {
  const [value, setValue] = useState("");
  return (
    <View style={styles.storyContainer}>
      <TextField
        label="Username"
        placeholder="Enter username"
        value={value}
        onChangeText={setValue}
      />
    </View>
  );
};

const DatePickerExample = () => {
  const [date, setDate] = useState(new Date());
  return (
    <View style={styles.storyContainer}>
      <FieldLabel label="Select Date" />
      <DatePicker value={date} onChange={setDate} />
    </View>
  );
};

const NumericInputExample = () => {
  const [value, setValue] = useState("0");
  return (
    <View style={styles.storyContainer}>
      <NumericInput
        label="Enter Number"
        value={value}
        onChangeText={setValue}
        placeholder="0"
      />
    </View>
  );
};

const SingleSelectExample = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <View style={styles.storyContainer}>
      <SingleSelectQuestion
        question={
          {
            id: "q1",
            questionText: "What is your favorite color?",
            options: [
              { id: "1", text: "Red" },
              { id: "2", text: "Blue" },
              { id: "3", text: "Green" },
            ],
          } as any
        }
        selectedOption={selected}
        onSelectOption={setSelected}
      />
    </View>
  );
};

const MultiSelectExample = () => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <View style={styles.storyContainer}>
      <MultiSelectQuestion
        question={
          {
            id: "q2",
            questionText: "Select your hobbies:",
            options: [
              { id: "1", text: "Reading" },
              { id: "2", text: "Sports" },
              { id: "3", text: "Music" },
              { id: "4", text: "Gaming" },
            ],
          } as any
        }
        selectedOptions={selected}
        onToggleOption={optionId => {
          if (selected.includes(optionId)) {
            setSelected(selected.filter(id => id !== optionId));
          } else {
            setSelected([...selected, optionId]);
          }
        }}
      />
    </View>
  );
};

const TextQuestionExample = () => {
  const [answer, setAnswer] = useState("");
  return (
    <View style={styles.storyContainer}>
      <TextQuestion
        question={
          {
            id: "q3",
            questionText: "What is your feedback?",
          } as any
        }
        answer={answer}
        onChangeText={setAnswer}
      />
    </View>
  );
};

const NumberQuestionExample = () => {
  const [answer, setAnswer] = useState("");
  return (
    <View style={styles.storyContainer}>
      <NumberQuestion
        question={
          {
            id: "q4",
            questionText: "How many hours of sleep did you get?",
          } as any
        }
        answer={answer}
        onChangeText={setAnswer}
      />
    </View>
  );
};

// Define all stories
const stories = [
  {
    category: "Buttons",
    items: [
      {
        name: "Primary",
        component: () => (
          <View style={styles.storyContainer}>
            <Button
              label="Primary Button"
              variant="primary"
              onPress={() => Alert.alert("Success", "Primary button pressed!")}
            />
          </View>
        ),
      },
      {
        name: "Secondary",
        component: () => (
          <View style={styles.storyContainer}>
            <Button
              label="Secondary Button"
              variant="secondary"
              onPress={() =>
                Alert.alert("Success", "Secondary button pressed!")
              }
            />
          </View>
        ),
      },
      {
        name: "Outline",
        component: () => (
          <View style={styles.storyContainer}>
            <Button
              label="Outline Button"
              variant="outline"
              onPress={() => Alert.alert("Success", "Outline button pressed!")}
            />
          </View>
        ),
      },
      {
        name: "Disabled",
        component: () => (
          <View style={styles.storyContainer}>
            <Button label="Disabled Button" disabled onPress={() => {}} />
          </View>
        ),
      },
      {
        name: "Loading",
        component: () => (
          <View style={styles.storyContainer}>
            <Button label="Loading Button" loading onPress={() => {}} />
          </View>
        ),
      },
      {
        name: "All Sizes",
        component: () => (
          <View style={styles.storyContainer}>
            <Button label="Small" size="sm" onPress={() => {}} />
            <View style={styles.spacer} />
            <Button label="Medium" size="md" onPress={() => {}} />
            <View style={styles.spacer} />
            <Button label="Large" size="lg" onPress={() => {}} />
          </View>
        ),
      },
    ],
  },
  {
    category: "Form Inputs",
    items: [
      {
        name: "TextField",
        component: TextFieldExample,
      },
      {
        name: "NumericInput",
        component: NumericInputExample,
      },
      {
        name: "DatePicker",
        component: DatePickerExample,
      },
      {
        name: "FieldLabel",
        component: () => (
          <View style={styles.storyContainer}>
            <FieldLabel label="Field Label" />
            <View style={styles.spacer} />
            <FieldLabel label="Required Field" required />
          </View>
        ),
      },
    ],
  },
  {
    category: "Layout",
    items: [
      {
        name: "Card",
        component: () => (
          <View style={styles.storyContainer}>
            <Card style={styles.card}>
              <Text style={styles.cardText}>Card Component</Text>
              <Text style={styles.cardSubtext}>
                Cards can contain any content
              </Text>
            </Card>
          </View>
        ),
      },
      {
        name: "Card with Button",
        component: () => (
          <View style={styles.storyContainer}>
            <Card style={styles.card}>
              <Text style={styles.cardText}>Interactive Card</Text>
              <View style={styles.spacer} />
              <Button
                label="Action"
                size="sm"
                onPress={() =>
                  Alert.alert("Card Action", "Button in card pressed!")
                }
              />
            </Card>
          </View>
        ),
      },
    ],
  },
  {
    category: "Feedback",
    items: [
      {
        name: "Loading Spinner - Default",
        component: () => (
          <View style={styles.storyContainer}>
            <LoadingSpinner />
            <View style={styles.spacer} />
            <Text style={styles.label}>Default Size</Text>
          </View>
        ),
      },
      {
        name: "Loading Spinner - Large",
        component: () => (
          <View style={styles.storyContainer}>
            <LoadingSpinner size="large" />
            <View style={styles.spacer} />
            <Text style={styles.label}>Large Size</Text>
          </View>
        ),
      },
      {
        name: "Loading Spinner - Small",
        component: () => (
          <View style={styles.storyContainer}>
            <LoadingSpinner size="small" />
            <View style={styles.spacer} />
            <Text style={styles.label}>Small Size</Text>
          </View>
        ),
      },
      {
        name: "Progress Indicator",
        component: () => (
          <View style={styles.storyContainer}>
            <ProgressIndicator currentStep={2} totalSteps={5} />
            <View style={styles.spacer} />
            <Text style={styles.label}>Step 2 of 5</Text>
          </View>
        ),
      },
    ],
  },
  {
    category: "Icons",
    items: [
      {
        name: "Icon Samples",
        component: () => (
          <View style={styles.storyContainer}>
            <View style={styles.iconRow}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={32}
                color="#2ecc71"
              />
              <Text style={styles.iconLabel}>Checkmark</Text>
            </View>
            <View style={styles.iconRow}>
              <IconSymbol name="xmark.circle.fill" size={32} color="#e74c3c" />
              <Text style={styles.iconLabel}>X Mark</Text>
            </View>
            <View style={styles.iconRow}>
              <IconSymbol name="star.fill" size={32} color="#f39c12" />
              <Text style={styles.iconLabel}>Star</Text>
            </View>
            <View style={styles.iconRow}>
              <IconSymbol name="heart.fill" size={32} color="#e91e63" />
              <Text style={styles.iconLabel}>Heart</Text>
            </View>
          </View>
        ),
      },
    ],
  },
  {
    category: "Question Types",
    items: [
      {
        name: "Single Select",
        component: SingleSelectExample,
      },
      {
        name: "Multi Select",
        component: MultiSelectExample,
      },
      {
        name: "Text Question",
        component: TextQuestionExample,
      },
      {
        name: "Number Question",
        component: NumberQuestionExample,
      },
    ],
  },
];

export default function SimpleStorybook() {
  const [selectedStory, setSelectedStory] = useState<{
    category: string;
    name: string;
  } | null>(null);

  // If a story is selected, show it
  if (selectedStory) {
    const category = stories.find(c => c.category === selectedStory.category);
    const story = category?.items.find(s => s.name === selectedStory.name);

    const StoryComponent = story?.component;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedStory(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedStory.name}</Text>
        </View>
        <ScrollView style={styles.storyView}>
          {StoryComponent && <StoryComponent />}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show story list
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Storybook</Text>
        <Text style={styles.headerSubtitle}>
          {stories.reduce((acc, cat) => acc + cat.items.length, 0)} stories
        </Text>
      </View>
      <ScrollView style={styles.list}>
        {stories.map(category => (
          <View key={category.category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category.category} ({category.items.length})
            </Text>
            {category.items.map(story => (
              <TouchableOpacity
                key={story.name}
                style={styles.storyItem}
                onPress={() =>
                  setSelectedStory({
                    category: category.category,
                    name: story.name,
                  })
                }
              >
                <Text style={styles.storyName}>{story.name}</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  backButton: {
    padding: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  categorySection: {
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },
  storyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  storyName: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 18,
    color: "#999",
  },
  storyView: {
    flex: 1,
  },
  storyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
    minHeight: 400,
  },
  card: {
    padding: 20,
    width: "90%",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 14,
    color: "#666",
  },
  spacer: {
    height: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  iconLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
});
