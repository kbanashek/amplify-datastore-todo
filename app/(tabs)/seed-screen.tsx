/**
 * Development screen to run seed script
 * 
 * This screen provides a UI to seed the database with Activities and Tasks
 * for testing question rendering.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { seedQuestionData } from '../../scripts/seed-question-data';
import { TaskService } from '../../src/services/TaskService';

export default function SeedScreen() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const insets = useSafeAreaInsets();

  const handleClearAll = async () => {
    console.log('🗑️ [SeedScreen] Clear All Tasks button pressed');
    
    Alert.alert(
      'Clear All Tasks?',
      'This will permanently delete all tasks from the database. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              console.log('🗑️ [SeedScreen] Starting to delete all tasks...');
              const deletedCount = await TaskService.deleteAllTasks();
              console.log('✅ [SeedScreen] All tasks deleted successfully', {
                deletedCount,
              });
              Alert.alert(
                'Success',
                `Deleted ${deletedCount} task${deletedCount !== 1 ? 's' : ''} from the database.`
              );
            } catch (error: any) {
              console.error('❌ [SeedScreen] Error deleting tasks:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              Alert.alert('Error', error?.message || 'Failed to delete tasks');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleSeed = async () => {
    console.log('🌱 [SeedScreen] Seed button pressed');
    setIsSeeding(true);
    setSeedResult(null);

    try {
      console.log('🌱 [SeedScreen] Starting seed process...');
      const result = await seedQuestionData();
      console.log('✅ [SeedScreen] Seed process completed successfully', {
        activitiesCount: result.activities.length,
        tasksCount: result.tasks.length,
        tasksWithQuestions: result.tasks.filter((t: any) => t.entityId).length,
        tasksWithoutQuestions: result.tasks.filter((t: any) => !t.entityId).length,
        activityIds: result.activities.map((a: any) => a.id),
        taskIds: result.tasks.map((t: any) => t.id),
      });
      setSeedResult(result);
      Alert.alert(
        'Success',
        `Seeded ${result.activities.length} activities and ${result.tasks.length} tasks!\n\n` +
        `${result.tasks.filter((t: any) => t.entityId).length} tasks have questions.\n` +
        `${result.tasks.filter((t: any) => !t.entityId).length} tasks are simple (no questions).`
      );
    } catch (error: any) {
      console.error('❌ [SeedScreen] Seed error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      Alert.alert('Error', error?.message || 'Failed to seed data');
    } finally {
      setIsSeeding(false);
      console.log('🏁 [SeedScreen] Seed process finished', {
        isSeeding: false,
        hasResult: !!seedResult,
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seed Question Data</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What this does:</Text>
          <Text style={styles.sectionText}>
            Creates sample Activities with question structures and Tasks that reference them.
            This allows you to test the question rendering functionality.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Will create:</Text>
          <Text style={styles.listItem}>• 3 Activities with different question types</Text>
          <Text style={styles.listItem}>• Tasks for today + 5 days (6 days total)</Text>
          <Text style={styles.listItem}>• Mix of task types (SCHEDULED, TIMED, EPISODIC)</Text>
          <Text style={styles.listItem}>• ~60% of tasks have questions (linked to activities)</Text>
          <Text style={styles.listItem}>• ~40% are simple tasks (no questions)</Text>
          <Text style={styles.listItem}>• Tasks spread throughout the day (8 AM - 8 PM)</Text>
        </View>

        <TouchableOpacity
          style={[styles.clearButton, isClearing && styles.clearButtonDisabled]}
          onPress={handleClearAll}
          disabled={isClearing || isSeeding}
        >
          {isClearing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.clearButtonText}>🗑️ Clear All Tasks</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.seedButton, isSeeding && styles.seedButtonDisabled]}
          onPress={handleSeed}
          disabled={isSeeding || isClearing}
        >
          {isSeeding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.seedButtonText}>🌱 Seed Data</Text>
          )}
        </TouchableOpacity>

        {seedResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Seed Results:</Text>
            <Text style={styles.resultText}>
              Activities: {seedResult.activities.length}
            </Text>
            <Text style={styles.resultText}>
              Tasks: {seedResult.tasks.length}
            </Text>
            <View style={styles.resultDetails}>
              <Text style={styles.resultSubtitle}>Activities:</Text>
              {seedResult.activities.map((activity: any, index: number) => (
                <Text key={activity.id} style={styles.resultItem}>
                  {index + 1}. {activity.title || activity.name} (ID: {activity.id})
                </Text>
              ))}
              <Text style={styles.resultSubtitle}>Tasks:</Text>
              {seedResult.tasks.map((task: any, index: number) => (
                <Text key={task.id} style={styles.resultItem}>
                  {index + 1}. {task.title} (ID: {task.id}, EntityID: {task.entityId})
                </Text>
              ))}
            </View>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#57606f',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: '#57606f',
    marginBottom: 4,
    paddingLeft: 8,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButtonDisabled: {
    opacity: 0.6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seedButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  seedButtonDisabled: {
    opacity: 0.6,
  },
  seedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#57606f',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
    marginTop: 12,
    marginBottom: 8,
  },
  resultDetails: {
    marginTop: 8,
  },
  resultItem: {
    fontSize: 12,
    color: '#747d8c',
    fontFamily: 'monospace',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

