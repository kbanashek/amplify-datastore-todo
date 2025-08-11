import { StyleSheet, SafeAreaView, ScrollView, View } from 'react-native';
import { useEffect } from 'react';

import { TodoForm } from '../../src/components/TodoForm';
import { TodoList } from '../../src/components/TodoList';
import { NetworkStatusIndicator } from '../../src/components/NetworkStatusIndicator';
import { AmplifyProvider } from '../../src/contexts/AmplifyContext';

export default function HomeScreen() {
  // App initialization
  useEffect(() => {
    // Any app initialization can go here
    console.log('Todo app initialized');
  }, []);

  return (
    <AmplifyProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <NetworkStatusIndicator />
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <TodoForm />
          <TodoList />
        </ScrollView>
      </SafeAreaView>
    </AmplifyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
