import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuestionList } from '../../src/hooks/useQuestionList';
import { QuestionService } from '../../src/services/QuestionService';
import { NetworkStatusIndicator } from '../../src/components/NetworkStatusIndicator';

export default function QuestionsScreen() {
  const { questions, loading, error, handleDeleteQuestion } = useQuestionList();
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [controlType, setControlType] = useState('TEXT');
  const [pk, setPk] = useState(`QUESTION-${Date.now()}`);
  const [sk, setSk] = useState(`SK-${Date.now()}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!question.trim() || !questionId.trim() || !friendlyName.trim() || !pk.trim() || !sk.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await QuestionService.createQuestion({
        pk: pk.trim(),
        sk: sk.trim(),
        question: question.trim(),
        questionId: questionId.trim(),
        friendlyName: friendlyName.trim(),
        controlType: controlType.trim(),
        version: 1,
        index: questions.length,
      });
      setQuestion('');
      setQuestionId('');
      setFriendlyName('');
      setControlType('TEXT');
      setPk(`QUESTION-${Date.now()}`);
      setSk(`SK-${Date.now()}`);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating question:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Questions</Text>
        <NetworkStatusIndicator />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* CREATE SECTION */}
        <View style={styles.createSection}>
          {!showForm ? (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.createButtonText}>+ Create New Question</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Question</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Question Text *"
                value={question}
                onChangeText={setQuestion}
                editable={!isSubmitting}
                autoFocus
              />

              <TextInput
                style={styles.input}
                placeholder="Question ID *"
                value={questionId}
                onChangeText={setQuestionId}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="Friendly Name *"
                value={friendlyName}
                onChangeText={setFriendlyName}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="Control Type (e.g., TEXT, NUMBER, DATE) *"
                value={controlType}
                onChangeText={setControlType}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="PK *"
                value={pk}
                onChangeText={setPk}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="SK *"
                value={sk}
                onChangeText={setSk}
                editable={!isSubmitting}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowForm(false);
                    setQuestion('');
                    setQuestionId('');
                    setFriendlyName('');
                    setControlType('TEXT');
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || !question.trim() || !questionId.trim() || !friendlyName.trim() || !pk.trim() || !sk.trim()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* LIST SECTION */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Your Questions ({questions.length})</Text>
          
          {loading && questions.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : questions.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No questions yet. Create one above!</Text>
            </View>
          ) : (
            questions.map((q) => (
              <View key={q.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>{q.friendlyName || q.question}</Text>
                    <Text style={styles.cardSubtitle}>{q.controlType}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteQuestion(q.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardQuestion}>{q.question}</Text>
                <Text style={styles.cardMeta}>ID: {q.questionId}</Text>
                <Text style={styles.cardMeta}>PK: {q.pk}</Text>
                <Text style={styles.cardMeta}>SK: {q.sk}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  createSection: {
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#2f3542',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  cancelButtonText: {
    color: '#57606f',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 16,
  },
  centerContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#57606f',
    fontSize: 14,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: '#747d8c',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 4,
    fontWeight: '600',
  },
  cardQuestion: {
    fontSize: 14,
    color: '#57606f',
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#95a5a6',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

