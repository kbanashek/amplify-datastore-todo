import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Todo } from "../../models";
import { useTodoForm } from "../hooks/useTodoForm";

interface TodoFormProps {
  onTodoCreated?: (todo: Todo) => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onTodoCreated }) => {
  // Use the custom hook to handle form logic
  const {
    name,
    setName,
    description,
    setDescription,
    isSubmitting,
    error,
    handleSubmit,
  } = useTodoForm(onTodoCreated);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Todo</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Todo name"
        value={name}
        onChangeText={setName}
        editable={!isSubmitting}
        autoFocus={false}
        autoCorrect={true}
        autoCapitalize="sentences"
        keyboardType="default"
        returnKeyType="next"
        blurOnSubmit={false}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        editable={!isSubmitting}
        autoFocus={false}
        autoCorrect={true}
        autoCapitalize="sentences"
        keyboardType="default"
        returnKeyType="done"
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Create Todo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2f3542",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 4,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#e74c3c",
    marginBottom: 12,
  },
});
