import { StyleSheet, SafeAreaView, View } from 'react-native';
import { useEffect } from 'react';

import { TodoForm } from '../../src/components/TodoForm';
import { TodoList } from '../../src/components/TodoList';
import { NetworkStatusIndicator } from '../../src/components/NetworkStatusIndicator';

export default function HomeScreen() {
  // App initialization
  useEffect(() => {
    // Any app initialization can go here

  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <NetworkStatusIndicator />
      </View>
      <View style={styles.content}>
        <TodoForm />
      </View>
      {/* TodoList has its own scrolling via FlatList */}
      <View style={styles.listContainer}>
        <TodoList />
      </View>
    </SafeAreaView>
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
  content: {
    padding: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
});
