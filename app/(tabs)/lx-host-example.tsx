import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../../src/components/GlobalHeader";
import { LXHostExample } from "../../packages/task-system/LX Integration Resources/LXHostExample";
import { NavigationMenu } from "../../src/components/NavigationMenu";

/**
 * In-app harness screen to test LXHostExample without re-configuring Amplify/DataStore.
 *
 * app/_layout.tsx already:
 * - imports amplify-init-sync (Amplify.configure)
 * - bootstraps DataStore
 *
 * So this screen runs LXHostExample in "already configured" mode and only imports fixture.
 */
export default function LXHostExampleScreen(): React.ReactElement {
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title="LX Host Example"
        showMenuButton={true}
        onMenuPress={() => setShowMenu(true)}
      />

      <View style={styles.moduleContainer}>
        <LXHostExample
          configureAmplify={false}
          startDataStore={false}
          importFixture={true}
          embedded={true}
        />
      </View>

      <NavigationMenu visible={showMenu} onClose={() => setShowMenu(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  moduleContainer: {
    flex: 1,
    padding: 20,
  },
});
