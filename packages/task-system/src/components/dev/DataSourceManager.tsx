/**
 * Simple data source toggle UI.
 *
 * Provides a toggle to switch between data sources.
 * The host app is responsible for loading the actual fixture data.
 *
 * @example
 * ```tsx
 * <DataSourceProvider>
 *   <DataSourceManager />
 * </DataSourceProvider>
 * ```
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { DataSourceToggle } from "./DataSourceToggle";

export interface DataSourceManagerProps {
  /** Show detailed controls and status (currently unused, for future expansion) */
  showDetails?: boolean;
}

/**
 * Data source manager component.
 *
 * Displays a toggle for switching between static and LX data sources.
 * The host application is responsible for:
 * - Loading fixture data when the source changes
 * - Handling errors during loading
 * - Managing the fixture import process
 *
 * @param props - Component props
 * @returns Data source manager UI
 */
export const DataSourceManager: React.FC<DataSourceManagerProps> = ({
  showDetails = true,
}) => {
  return (
    <View style={styles.container}>
      <DataSourceToggle showCounts={showDetails} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
});
