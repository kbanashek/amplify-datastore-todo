import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SyncStatusBanner } from "../components/SyncStatusBanner";
import { GlobalHeader } from "../components/GlobalHeader";
import { TestIds } from "../constants/testIds";
import { useDevOptions } from "../hooks/useDevOptions";

type ActionVariant = "primary" | "secondary" | "danger";

type ActionCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
  variant?: ActionVariant;
  testID?: string;
};

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  buttonLabel,
  onPress,
  disabled,
  loading,
  variant = "primary",
  testID,
}) => {
  const buttonStyle = useMemo(() => {
    switch (variant) {
      case "danger":
        return styles.buttonDanger;
      case "secondary":
        return styles.buttonSecondary;
      default:
        return styles.buttonPrimary;
    }
  }, [variant]);

  const buttonTextStyle = useMemo(() => {
    switch (variant) {
      case "secondary":
        return styles.buttonTextSecondary;
      default:
        return styles.buttonText;
    }
  }, [variant]);

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>

      <TouchableOpacity
        style={[buttonStyle, (disabled || loading) && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled || loading}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={buttonTextStyle}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

type CollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={onToggle} style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        <Text style={styles.sectionChevron}>{isOpen ? "Hide" : "Show"}</Text>
      </TouchableOpacity>
      {isOpen ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
};

export const DevOptionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGeneratedJson, setShowGeneratedJson] = useState(false);

  const {
    isBusy,
    isImportingFixture,
    isSeedingAppointments,
    isDeleting,
    isForceSyncing,
    seedResult,
    appointmentSeedResult,
    generatedFixtureJson,
    lastError,
    generateFixtureJson,
    importFixtureFromRepo,
    generateFixtureAndImport,
    freshCloudResetAndImport,
    resetLocalAndImport,
    seedAppointmentsOnly,
    deleteTasksOnly,
    deleteAppointmentsOnly,
    nuclearDeleteCloud,
    forceSyncThisDevice,
  } = useDevOptions();

  const confirm = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", style: "destructive", onPress: onConfirm },
    ]);
  };

  const handleFreshDatabase = () => {
    confirm(
      "Fresh Database (Cloud Reset)",
      "Deletes task-system data in cloud (models) then imports the fixture.\n\nRun ONCE on one device. Other devices should sync automatically; use Force Sync only if stuck.\n\nThis cannot be undone.",
      () => {
        freshCloudResetAndImport()
          .then(() => {
            Alert.alert("Done", "Cloud reset + fixture import completed.");
          })
          .catch(() => {
            // error is surfaced via lastError
          });
      }
    );
  };

  const handleForceSync = () => {
    confirm(
      "Force Sync (This Device)",
      "Clears local DataStore cache/outbox and re-syncs from cloud.\n\nAny unsynced local changes on this device will be lost.",
      () => {
        forceSyncThisDevice()
          .then(() => {
            Alert.alert("Done", "Force sync completed on this device.");
          })
          .catch(() => {
            // error is surfaced via lastError
          });
      }
    );
  };

  const handleDeleteTasksOnly = () => {
    confirm(
      "Delete Tasks (This Device + Cloud)",
      "Deletes all Task records (and syncs those deletes). Use only for dev.",
      () => {
        deleteTasksOnly()
          .then(() => Alert.alert("Done", "All tasks deleted."))
          .catch(() => {});
      }
    );
  };

  const handleDeleteAppointmentsOnly = () => {
    confirm(
      "Delete Appointments (This Device)",
      "Clears locally stored appointments (AsyncStorage).",
      () => {
        deleteAppointmentsOnly()
          .then(() => Alert.alert("Done", "Appointments cleared."))
          .catch(() => {});
      }
    );
  };

  const handleNuclearDelete = () => {
    confirm(
      "Nuclear Delete (Cloud)",
      "Deletes ALL DataStore models used by the task-system (Tasks, Activities, Questions, Answers, Results, History, DataPoints, etc).\n\nThis cannot be undone.",
      () => {
        nuclearDeleteCloud()
          .then(() => Alert.alert("Done", "Nuclear delete completed."))
          .catch(() => {});
      }
    );
  };

  const resultSummary = useMemo(() => {
    if (!seedResult) return null;
    return `Activities +${seedResult.activities.created} / ~${seedResult.activities.updated} • Tasks +${seedResult.tasks.created} / ~${seedResult.tasks.updated} • Questions +${seedResult.questions.created} / ~${seedResult.questions.updated} • Appointments: ${seedResult.appointments.saved ? "saved" : "no"}`;
  }, [seedResult]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      testID={TestIds.seedScreenRoot}
    >
      <GlobalHeader title="Dev Options" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SyncStatusBanner />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data (Fixture-first)</Text>
          <Text style={styles.sectionSubtitle}>
            Use these to converge ALL devices to the exact fixture dataset.
          </Text>

          <ActionCard
            title="Fresh Database"
            description="Cloud wipe (task-system models) + local clear + import fixture (authoritative)."
            buttonLabel="Run"
            onPress={handleFreshDatabase}
            disabled={isBusy}
            loading={isDeleting}
            variant="danger"
          />

          <ActionCard
            title="Generate + Import (This Device)"
            description="Generates today’s fixture in-app, clears local cache, imports fixture, prunes non-fixture records."
            buttonLabel="Run"
            onPress={() => {
              generateFixtureAndImport()
                .then(() =>
                  Alert.alert("Done", "Generated + imported fixture.")
                )
                .catch(() => {});
            }}
            disabled={isBusy}
            loading={isImportingFixture}
            variant="primary"
            testID={TestIds.seedScreenSeedCoordinatedButton}
          />

          <ActionCard
            title="Force Sync (This Device)"
            description="Only if this device isn’t updating automatically. Clears local cache/outbox and resyncs from cloud."
            buttonLabel="Run"
            onPress={handleForceSync}
            disabled={isBusy}
            loading={isForceSyncing}
            variant="secondary"
          />
        </View>

        <CollapsibleSection
          title="Advanced Tools"
          subtitle="Less common operations (safe for dev, but easy to misuse)"
          isOpen={showAdvanced}
          onToggle={() => setShowAdvanced(v => !v)}
        >
          <ActionCard
            title="Import Fixture From Repo File"
            description="Imports src/fixtures/task-system.fixture.v1.json into DataStore (prunes non-fixture records)."
            buttonLabel="Run"
            onPress={() => {
              importFixtureFromRepo()
                .then(() =>
                  Alert.alert("Done", "Imported fixture from repo file.")
                )
                .catch(() => {});
            }}
            disabled={isBusy}
            loading={isImportingFixture}
            variant="primary"
          />

          <ActionCard
            title="Generate Fixture JSON (Preview)"
            description="Shows the exact JSON payload that would be imported (copy/paste)."
            buttonLabel="Generate"
            onPress={() => {
              generateFixtureJson();
              setShowGeneratedJson(true);
            }}
            disabled={isBusy}
            loading={false}
            variant="secondary"
          />

          <ActionCard
            title="Reset Local + Import Fixture"
            description="Local-only reset + import fixture (best-effort force sync)."
            buttonLabel="Run"
            onPress={() => {
              resetLocalAndImport()
                .then(() =>
                  Alert.alert("Done", "Local reset + import completed.")
                )
                .catch(() => {});
            }}
            disabled={isBusy}
            loading={isImportingFixture}
            variant="secondary"
          />

          <ActionCard
            title="Seed Appointments Only"
            description="Creates sample appointments (AsyncStorage). Does not touch tasks."
            buttonLabel="Run"
            onPress={() => {
              seedAppointmentsOnly()
                .then(() => Alert.alert("Done", "Seeded appointments."))
                .catch(() => {});
            }}
            disabled={isBusy}
            loading={isSeedingAppointments}
            variant="secondary"
          />

          <ActionCard
            title="Delete Tasks Only"
            description="Deletes all Task records (syncs deletes to cloud)."
            buttonLabel="Delete"
            onPress={handleDeleteTasksOnly}
            disabled={isBusy}
            loading={isDeleting}
            variant="danger"
          />

          <ActionCard
            title="Delete Appointments Only"
            description="Clears locally stored appointments (AsyncStorage)."
            buttonLabel="Delete"
            onPress={handleDeleteAppointmentsOnly}
            disabled={isBusy}
            loading={isDeleting}
            variant="danger"
          />

          <ActionCard
            title="Nuclear Delete (Cloud)"
            description="Deletes ALL task-system-related DataStore models in cloud (dev only)."
            buttonLabel="Delete"
            onPress={handleNuclearDelete}
            disabled={isBusy}
            loading={isDeleting}
            variant="danger"
          />
        </CollapsibleSection>

        {(resultSummary || lastError) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Result</Text>
            {resultSummary ? (
              <Text style={styles.resultText}>{resultSummary}</Text>
            ) : null}
            {appointmentSeedResult ? (
              <Text style={styles.resultText}>
                Appointments: {appointmentSeedResult.appointmentsCount} • Today:{" "}
                {appointmentSeedResult.todayAppointments} • TZ:{" "}
                {appointmentSeedResult.timezone}
              </Text>
            ) : null}
            {lastError ? (
              <Text style={styles.errorText}>Error: {lastError}</Text>
            ) : null}
          </View>
        )}

        {showGeneratedJson && generatedFixtureJson.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated Fixture JSON</Text>
            <Text style={styles.sectionSubtitle}>
              Long-press to select/copy.
            </Text>
            <View style={styles.jsonBox}>
              <Text selectable={true} style={styles.jsonText}>
                {generatedFixtureJson}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 28, gap: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe4ea",
    padding: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderText: { flex: 1, paddingRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2f3542" },
  sectionSubtitle: { fontSize: 13, color: "#57606f", marginTop: 4 },
  sectionChevron: { fontSize: 13, fontWeight: "600", color: "#1e90ff" },
  sectionBody: { marginTop: 12, gap: 10 },
  card: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#edf0f5",
    backgroundColor: "#fafbfc",
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#2f3542" },
  cardDescription: { marginTop: 4, fontSize: 12, color: "#57606f" },
  buttonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#1e90ff",
    minWidth: 86,
    alignItems: "center",
  },
  buttonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#2f3542",
    minWidth: 86,
    alignItems: "center",
  },
  buttonDanger: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#e74c3c",
    minWidth: 86,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  buttonTextSecondary: { color: "#fff", fontWeight: "700", fontSize: 13 },
  resultText: { marginTop: 8, fontSize: 13, color: "#2f3542" },
  errorText: { marginTop: 8, fontSize: 13, color: "#e74c3c" },
  jsonBox: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#edf0f5",
    backgroundColor: "#0b1020",
    padding: 10,
  },
  jsonText: { color: "#e8ecff", fontSize: 11, lineHeight: 16 },
});
