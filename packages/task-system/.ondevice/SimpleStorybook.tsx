import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppointmentCard } from "../src/components/AppointmentCard";
import { NetworkStatusIndicator } from "../src/components/NetworkStatusIndicator";
import { TaskCard } from "../src/components/TaskCard";
import { ThemedText } from "../src/components/ThemedText";
import { ThemedView } from "../src/components/ThemedView";
import {
  MultiSelectQuestion,
  NumberQuestion,
  ProgressIndicator,
  SingleSelectQuestion,
  TextQuestion,
} from "../src/components/questions";
import { Button } from "../src/components/ui/Button";
import { Card } from "../src/components/ui/Card";
import { DatePicker } from "../src/components/ui/DatePicker";
import { FieldLabel } from "../src/components/ui/FieldLabel";
import { IconSymbol } from "../src/components/ui/IconSymbol";
import { LoadingSpinner } from "../src/components/ui/LoadingSpinner";
import { NumericInput } from "../src/components/ui/NumericInput";
import { TextField } from "../src/components/ui/TextField";
import { AppColors } from "../src/constants/AppColors";

// Control config interface
interface ControlConfig {
  type: "boolean" | "text" | "select";
  value: string | boolean;
  label?: string;
  placeholder?: string;
  options?: string[];
}

// Control Panel Component for interactive props
const ControlPanel: React.FC<{
  controls: Record<string, ControlConfig>;
  onChange: (key: string, value: string | boolean) => void;
}> = ({ controls, onChange }) => {
  if (Object.keys(controls).length === 0) return null;

  return (
    <View style={styles.controlPanel}>
      <Text style={styles.controlPanelTitle}>Controls</Text>
      {Object.entries(controls).map(([key, config]) => (
        <View key={key} style={styles.controlItem}>
          <Text style={styles.controlLabel}>{config.label || key}</Text>
          {config.type === "boolean" && (
            <Switch
              value={typeof config.value === "boolean" ? config.value : false}
              onValueChange={value => onChange(key, value)}
            />
          )}
          {config.type === "text" && (
            <TextInput
              style={styles.controlInput}
              value={typeof config.value === "string" ? config.value : ""}
              onChangeText={value => onChange(key, value)}
              placeholder={config.placeholder}
            />
          )}
          {config.type === "select" && config.options && (
            <View style={styles.selectContainer}>
              {config.options.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectOption,
                    config.value === option && styles.selectOptionActive,
                  ]}
                  onPress={() => onChange(key, option)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      config.value === option && styles.selectOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// Interactive TextField Story with Controls
const InteractiveTextField = ({
  label = "Username",
  placeholder = "Enter text",
  error = false,
}: {
  label?: string;
  placeholder?: string;
  error?: boolean;
}) => {
  const [value, setValue] = useState("");
  return (
    <View style={styles.storyContainer}>
      <TextField
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        errorText={error ? "This field has an error" : undefined}
      />
    </View>
  );
};

// Interactive TaskCard Story with Controls
const InteractiveTaskCard = ({
  title = "Sample Task",
  description = "Task description",
  status = "SCHEDULED",
}: {
  title?: string;
  description?: string;
  status?: string;
}) => {
  const mockTask = {
    id: "mock-task-interactive",
    title,
    description,
    status,
    startTimeInMillSec: Date.now() + 3600000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return (
    <View style={styles.storyContainer}>
      <TaskCard
        task={mockTask as any}
        onPress={() => Alert.alert("Task Pressed", title)}
      />
    </View>
  );
};

// Interactive Card Story with Controls
const InteractiveCard = ({
  title = "Card Title",
  content = "Card content",
}: {
  title?: string;
  content?: string;
}) => (
  <View style={styles.storyContainer}>
    <Card style={styles.card}>
      <Text style={styles.cardText}>{title}</Text>
      <Text style={styles.cardSubtext}>{content}</Text>
    </Card>
  </View>
);

// Interactive LoadingSpinner Story with Controls
const InteractiveLoadingSpinner = ({ size = "default" }: { size?: string }) => (
  <View style={styles.centeredStoryContainer}>
    <LoadingSpinner
      size={size === "default" ? undefined : (size as "small" | "large")}
    />
    <View style={styles.spacer} />
    <Text style={styles.label}>{size} size</Text>
  </View>
);

// Interactive ProgressIndicator Story with Controls
const InteractiveProgressIndicator = ({
  currentStep = "2",
  totalSteps = "5",
}: {
  currentStep?: string;
  totalSteps?: string;
}) => {
  const current = parseInt(currentStep, 10) || 2;
  const total = parseInt(totalSteps, 10) || 5;
  return (
    <View style={styles.centeredStoryContainer}>
      <ProgressIndicator currentPage={current} totalPages={total} />
      <View style={styles.spacer} />
      <Text style={styles.label}>
        Step {current} of {total}
      </Text>
    </View>
  );
};

// Interactive ThemedText Story with Controls
const InteractiveThemedText = ({
  text = "Sample Text",
  type = "default",
}: {
  text?: string;
  type?: string;
}) => (
  <View style={styles.centeredStoryContainer}>
    <ThemedText
      type={
        type === "default"
          ? undefined
          : (type as
              | "link"
              | "title"
              | "default"
              | "defaultSemiBold"
              | "subtitle")
      }
    >
      {text}
    </ThemedText>
  </View>
);

// Interactive AppointmentCard Story with Controls
const InteractiveAppointmentCard = ({
  title = "Doctor's Appointment",
  location = "Medical Center - Room 302",
}: {
  title?: string;
  location?: string;
}) => {
  const mockAppointment = {
    id: "mock-apt-interactive",
    title,
    location,
    startTimeInMillSec: Date.now() + 86400000,
    appointmentType: "DOCTOR_VISIT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return (
    <View style={styles.storyContainer}>
      <AppointmentCard
        appointment={mockAppointment as any}
        onPress={() => Alert.alert("Appointment", title)}
      />
    </View>
  );
};

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
      <FieldLabel label="Enter Number" />
      <NumericInput value={value} onChange={setValue} placeholder="0" />
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
        value={selected}
        onChange={setSelected}
        displayProperties={{}}
        errors={[]}
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
        value={selected}
        onChange={(selectedIds: string[]) => {
          setSelected(selectedIds);
        }}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
      />
    </View>
  );
};

// Interactive Button Story with Controls
const InteractiveButton = ({
  label = "Click Me",
  variant = "primary",
  disabled = false,
  loading = false,
  size = "md",
}: {
  label?: string;
  variant?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: string;
}) => (
  <View style={styles.centeredStoryContainer}>
    <Button
      label={label}
      variant={variant as "primary" | "secondary" | "outline" | "ghost"}
      disabled={disabled}
      loading={loading}
      size={size as "sm" | "md" | "lg"}
      onPress={() => Alert.alert("Success", `${variant} button pressed!`)}
    />
  </View>
);

// Define all stories
const stories = [
  {
    category: "Buttons",
    icon: "🔘",
    items: [
      {
        name: "Interactive",
        component: InteractiveButton,
        controls: {
          label: { type: "text", value: "Click Me", label: "Label" },
          variant: {
            type: "select",
            value: "primary",
            options: ["primary", "secondary", "outline"],
            label: "Variant",
          },
          size: {
            type: "select",
            value: "md",
            options: ["sm", "md", "lg"],
            label: "Size",
          },
          disabled: { type: "boolean", value: false, label: "Disabled" },
          loading: { type: "boolean", value: false, label: "Loading" },
        },
      },
      {
        name: "Primary",
        component: () => (
          <View style={styles.centeredStoryContainer}>
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
          <View style={styles.centeredStoryContainer}>
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
          <View style={styles.centeredStoryContainer}>
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
          <View style={styles.centeredStoryContainer}>
            <Button label="Disabled Button" disabled onPress={() => {}} />
          </View>
        ),
      },
      {
        name: "Loading",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <Button label="Loading Button" loading onPress={() => {}} />
          </View>
        ),
      },
      {
        name: "All Sizes",
        component: () => (
          <View style={styles.centeredStoryContainer}>
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
    icon: "📝",
    items: [
      {
        name: "TextField (Interactive)",
        component: InteractiveTextField,
        controls: {
          label: { type: "text", value: "Username", label: "Label" },
          placeholder: {
            type: "text",
            value: "Enter text",
            label: "Placeholder",
          },
          error: { type: "boolean", value: false, label: "Show Error" },
        },
      },
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
          <View style={styles.centeredStoryContainer}>
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
    icon: "🎨",
    items: [
      {
        name: "Card (Interactive)",
        component: InteractiveCard,
        controls: {
          title: { type: "text", value: "Card Title", label: "Title" },
          content: {
            type: "text",
            value: "Card content goes here",
            label: "Content",
          },
        },
      },
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
    icon: "⏳",
    items: [
      {
        name: "Loading Spinner (Interactive)",
        component: InteractiveLoadingSpinner,
        controls: {
          size: {
            type: "select",
            value: "default",
            options: ["small", "default", "large"],
            label: "Size",
          },
        },
      },
      {
        name: "Loading Spinner - Default",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <LoadingSpinner />
            <View style={styles.spacer} />
            <Text style={styles.label}>Default Size</Text>
          </View>
        ),
      },
      {
        name: "Loading Spinner - Large",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <LoadingSpinner size="large" />
            <View style={styles.spacer} />
            <Text style={styles.label}>Large Size</Text>
          </View>
        ),
      },
      {
        name: "Loading Spinner - Small",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <LoadingSpinner size="small" />
            <View style={styles.spacer} />
            <Text style={styles.label}>Small Size</Text>
          </View>
        ),
      },
      {
        name: "Progress Indicator (Interactive)",
        component: InteractiveProgressIndicator,
        controls: {
          currentStep: { type: "text", value: "2", label: "Current Step" },
          totalSteps: { type: "text", value: "5", label: "Total Steps" },
        },
      },
      {
        name: "Progress Indicator",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <ProgressIndicator currentPage={2} totalPages={5} />
            <View style={styles.spacer} />
            <Text style={styles.label}>Step 2 of 5</Text>
          </View>
        ),
      },
    ],
  },
  {
    category: "Icons",
    icon: "⭐",
    items: [
      {
        name: "Icon Samples",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <View style={styles.iconRow}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={32}
                color={AppColors.successGreen}
              />
              <Text style={styles.iconLabel}>Checkmark</Text>
            </View>
            <View style={styles.iconRow}>
              <IconSymbol
                name="xmark.circle.fill"
                size={32}
                color={AppColors.errorRed}
              />
              <Text style={styles.iconLabel}>X Mark</Text>
            </View>
            <View style={styles.iconRow}>
              <IconSymbol
                name="star.fill"
                size={32}
                color={AppColors.lightYellow}
              />
              <Text style={styles.iconLabel}>Star</Text>
            </View>
            <View style={styles.iconRow}>
              <IconSymbol name="heart.fill" size={32} color={AppColors.punch} />
              <Text style={styles.iconLabel}>Heart</Text>
            </View>
          </View>
        ),
      },
    ],
  },
  {
    category: "Domain Components",
    icon: "📋",
    items: [
      {
        name: "TaskCard (Interactive)",
        component: InteractiveTaskCard,
        controls: {
          title: {
            type: "text",
            value: "Take Morning Medication",
            label: "Title",
          },
          description: {
            type: "text",
            value: "Take blood pressure medication with water",
            label: "Description",
          },
          status: {
            type: "select",
            value: "SCHEDULED",
            options: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"],
            label: "Status",
          },
        },
      },
      {
        name: "TaskCard - Scheduled",
        component: () => {
          const mockTask = {
            id: "mock-task-1",
            title: "Take Morning Medication",
            description: "Take blood pressure medication with water",
            status: "SCHEDULED",
            startTimeInMillSec: Date.now() + 3600000, // 1 hour from now
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return (
            <View style={styles.storyContainer}>
              <TaskCard
                task={mockTask as any}
                onPress={() => Alert.alert("Task Pressed", mockTask.title)}
              />
            </View>
          );
        },
      },
      {
        name: "TaskCard - In Progress",
        component: () => {
          const mockTask = {
            id: "mock-task-2",
            title: "Complete Health Survey",
            description: "Fill out weekly health assessment",
            status: "IN_PROGRESS",
            startTimeInMillSec: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return (
            <View style={styles.storyContainer}>
              <TaskCard
                task={mockTask as any}
                onPress={() => Alert.alert("Task Pressed", mockTask.title)}
              />
            </View>
          );
        },
      },
      {
        name: "TaskCard - Completed",
        component: () => {
          const mockTask = {
            id: "mock-task-3",
            title: "Exercise Routine",
            description: "30-minute walk completed",
            status: "COMPLETED",
            startTimeInMillSec: Date.now() - 7200000, // 2 hours ago
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return (
            <View style={styles.storyContainer}>
              <TaskCard
                task={mockTask as any}
                onPress={() => Alert.alert("Task Pressed", mockTask.title)}
              />
            </View>
          );
        },
      },
      {
        name: "AppointmentCard (Interactive)",
        component: InteractiveAppointmentCard,
        controls: {
          title: {
            type: "text",
            value: "Doctor's Appointment",
            label: "Title",
          },
          location: {
            type: "text",
            value: "Medical Center - Room 302",
            label: "Location",
          },
        },
      },
      {
        name: "AppointmentCard",
        component: () => {
          const mockAppointment = {
            id: "mock-apt-1",
            title: "Doctor's Appointment",
            location: "Medical Center - Room 302",
            startTimeInMillSec: Date.now() + 86400000, // Tomorrow
            appointmentType: "DOCTOR_VISIT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return (
            <View style={styles.storyContainer}>
              <AppointmentCard
                appointment={mockAppointment as any}
                onPress={() =>
                  Alert.alert("Appointment", mockAppointment.title)
                }
              />
            </View>
          );
        },
      },
    ],
  },
  {
    category: "Themed Components",
    icon: "🌓",
    items: [
      {
        name: "ThemedText (Interactive)",
        component: InteractiveThemedText,
        controls: {
          text: {
            type: "text",
            value: "Sample themed text",
            label: "Text Content",
          },
          type: {
            type: "select",
            value: "default",
            options: ["default", "title", "subtitle", "link"],
            label: "Type",
          },
        },
      },
      {
        name: "ThemedText - Default",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <ThemedText>Default themed text</ThemedText>
            <View style={styles.spacer} />
            <ThemedText type="title">Title Text</ThemedText>
            <View style={styles.spacer} />
            <ThemedText type="subtitle">Subtitle Text</ThemedText>
            <View style={styles.spacer} />
            <ThemedText type="link">Link Text</ThemedText>
          </View>
        ),
      },
      {
        name: "ThemedView",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <ThemedView style={{ padding: 20, borderRadius: 8 }}>
              <ThemedText>Content inside ThemedView</ThemedText>
              <ThemedText type="subtitle">
                Adapts to light/dark theme
              </ThemedText>
            </ThemedView>
          </View>
        ),
      },
    ],
  },
  {
    category: "Status & Indicators",
    icon: "📡",
    items: [
      {
        name: "Network Status - Online",
        component: () => (
          <View style={styles.centeredStoryContainer}>
            <Text style={styles.label}>Network Status Indicator</Text>
            <View style={styles.spacer} />
            <NetworkStatusIndicator />
            <View style={styles.spacer} />
            <Text style={styles.label}>Shows connection status</Text>
          </View>
        ),
      },
    ],
  },
  {
    category: "Question Types",
    icon: "❓",
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(stories.map(s => s.category))
  );
  const [controls, setControls] = useState<Record<string, string | boolean>>(
    {}
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleControlChange = (key: string, value: any) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  // If a story is selected, show it
  if (selectedStory) {
    const category = stories.find(c => c.category === selectedStory.category);
    const story = category?.items.find(s => s.name === selectedStory.name);

    const StoryComponent = story?.component;
    const storyControls = story?.controls || {};

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSelectedStory(null);
              setControls({});
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.categoryBadge}>{selectedStory.category}</Text>
            <Text style={styles.headerTitle}>{selectedStory.name}</Text>
          </View>
        </View>
        <ScrollView
          style={styles.storyView}
          contentContainerStyle={styles.storyViewContent}
        >
          {StoryComponent && <StoryComponent {...controls} />}
          <ControlPanel
            controls={storyControls}
            onChange={handleControlChange}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show story list
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Component Library</Text>
        <Text style={styles.headerSubtitle}>
          {stories.reduce((acc, cat) => acc + cat.items.length, 0)} components
          across {stories.length} categories
        </Text>
      </View>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {stories.map(category => {
          const isExpanded = expandedCategories.has(category.category);
          return (
            <View key={category.category} style={styles.categorySection}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.category)}
              >
                <View style={styles.categoryHeaderLeft}>
                  <Text style={styles.categoryIcon}>
                    {category.icon || "📦"}
                  </Text>
                  <Text style={styles.categoryTitle}>{category.category}</Text>
                  <View style={styles.categoryBadgeSmall}>
                    <Text style={styles.categoryBadgeText}>
                      {category.items.length}
                    </Text>
                  </View>
                </View>
                <Text style={styles.chevron}>{isExpanded ? "▼" : "▶"}</Text>
              </TouchableOpacity>
              {isExpanded &&
                category.items.map(story => (
                  <TouchableOpacity
                    key={story.name}
                    style={styles.storyItem}
                    onPress={() => {
                      setSelectedStory({
                        category: category.category,
                        name: story.name,
                      });
                      // Initialize controls with default values
                      if (story.controls) {
                        const initialControls: Record<
                          string,
                          string | boolean
                        > = {};
                        Object.entries(story.controls).forEach(
                          ([key, config]: [string, ControlConfig]) => {
                            initialControls[key] = config.value;
                          }
                        );
                        setControls(initialControls);
                      }
                    }}
                  >
                    <Text style={styles.storyName}>{story.name}</Text>
                    <Text style={styles.arrow}>→</Text>
                  </TouchableOpacity>
                ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginBottom: 12,
    marginLeft: -8,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  headerTitleContainer: {
    flexDirection: "column",
    gap: 4,
  },
  categoryBadge: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  categorySection: {
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginTop: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  categoryBadgeSmall: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  chevron: {
    fontSize: 14,
    color: "#9ca3af",
    marginLeft: 8,
  },
  storyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingLeft: 56,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fafafa",
  },
  storyName: {
    fontSize: 15,
    flex: 1,
    color: "#374151",
  },
  arrow: {
    fontSize: 16,
    color: "#9ca3af",
  },
  storyView: {
    flex: 1,
  },
  storyViewContent: {
    paddingBottom: 40,
  },
  storyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    padding: 24,
    backgroundColor: "#fafafa",
    minHeight: 400,
  },
  centeredStoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fafafa",
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
    color: "#111827",
  },
  cardSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  spacer: {
    height: 12,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
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
    color: "#374151",
  },
  // Control Panel Styles
  controlPanel: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  controlPanelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  controlItem: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  controlInput: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111827",
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectOptionActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  selectOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
