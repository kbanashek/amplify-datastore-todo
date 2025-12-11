import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataPointList } from '../../src/hooks/useDataPointList';
import { DataPointService } from '../../src/services/DataPointService';
import { GlobalHeader } from '../../src/components/GlobalHeader';
import { TranslatedText } from '../../src/components/TranslatedText';

export default function DataPointsScreen() {
  const { dataPoints, instances, loading, error, handleDeleteDataPoint, handleDeleteInstance } = useDataPointList();
  const [showForm, setShowForm] = useState(false);
  const [dataPointKey, setDataPointKey] = useState('');
  const [pk, setPk] = useState(`DATAPOINT-${Date.now()}`);
  const [sk, setSk] = useState(`SK-${Date.now()}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!dataPointKey.trim() || !pk.trim() || !sk.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await DataPointService.createDataPoint({
        pk: pk.trim(),
        sk: sk.trim(),
        dataPointKey: dataPointKey.trim(),
      });
      setDataPointKey('');
      setPk(`DATAPOINT-${Date.now()}`);
      setSk(`SK-${Date.now()}`);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating data point:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader title="Data Points" />

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
              <TranslatedText text="+ Create New Data Point" style={styles.createButtonText} />
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <TranslatedText text="Create Data Point" style={styles.formTitle} />
              
              <TextInput
                style={styles.input}
                placeholder="Data Point Key *"
                value={dataPointKey}
                onChangeText={setDataPointKey}
                editable={!isSubmitting}
                autoFocus
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
                    setDataPointKey('');
                  }}
                  disabled={isSubmitting}
                >
                  <TranslatedText text="Cancel" style={styles.cancelButtonText} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || !dataPointKey.trim() || !pk.trim() || !sk.trim()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <TranslatedText text="Create" style={styles.submitButtonText} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* DATA POINTS LIST */}
        <View style={styles.listSection}>
          <TranslatedText text={`Data Points (${dataPoints.length})`} style={styles.listTitle} />
          
          {loading && dataPoints.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <TranslatedText text="Loading data points..." style={styles.loadingText} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : dataPoints.length === 0 ? (
            <View style={styles.centerContainer}>
              <TranslatedText text="No data points yet. Create one above!" style={styles.emptyText} />
            </View>
          ) : (
            dataPoints.map((dp) => (
              <View key={dp.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{dp.dataPointKey || 'Unnamed Data Point'}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteDataPoint(dp.id)}
                    style={styles.deleteButton}
                  >
                    <TranslatedText text="Delete" style={styles.deleteButtonText} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardMeta}>PK: {dp.pk}</Text>
                <Text style={styles.cardMeta}>SK: {dp.sk}</Text>
                {dp.type && <Text style={styles.cardMeta}>Type: {dp.type}</Text>}
              </View>
            ))
          )}
        </View>

        {/* INSTANCES LIST */}
        {instances.length > 0 && (
          <View style={styles.listSection}>
            <TranslatedText text={`Instances (${instances.length})`} style={styles.listTitle} />
            {instances.map((instance) => (
              <View key={instance.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{instance.dataPointKey || 'Unnamed Instance'}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteInstance(instance.id)}
                    style={styles.deleteButton}
                  >
                    <TranslatedText text="Delete" style={styles.deleteButtonText} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardMeta}>PK: {instance.pk}</Text>
                <Text style={styles.cardMeta}>SK: {instance.sk}</Text>
                {instance.activityId && <Text style={styles.cardMeta}>Activity: {instance.activityId}</Text>}
                {instance.questionId && <Text style={styles.cardMeta}>Question: {instance.questionId}</Text>}
              </View>
            ))}
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
    marginBottom: 24,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    flex: 1,
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

