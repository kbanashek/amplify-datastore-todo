import { useCallback, useMemo, useState } from "react";

import {
  AppointmentService,
  FixtureImportService,
  SeededDataCleanupService,
  TaskService,
} from "@orion/task-system";

import fixtureFromRepo from "../fixtures/task-system.fixture.v1.json";
// @ts-ignore - POC fixture may not exist
import { seedAppointmentData } from "../../scripts/seed-appointment-data";
import pocFixture from "../fixtures/poc-fixture.9384dbad-2910-4a5b-928c-e004e06ed634.json";
import { clearCacheAndResync, forceFullSync } from "../utils/syncUtils";
import { buildTaskSystemFixtureV1 } from "../utils/taskSystemFixtureGenerator";

export type DevOptionsSeedResult = Awaited<
  ReturnType<typeof FixtureImportService.importTaskSystemFixture>
>;

export interface DevOptionsAppointmentSeedResult {
  appointmentsCount: number;
  todayAppointments: number;
  timezone: string;
}

export interface UseDevOptionsReturn {
  // State
  isBusy: boolean;
  isImportingFixture: boolean;
  isSeedingAppointments: boolean;
  isDeleting: boolean;
  isForceSyncing: boolean;

  seedResult: DevOptionsSeedResult | null;
  appointmentSeedResult: DevOptionsAppointmentSeedResult | null;
  generatedFixtureJson: string;
  lastError: string | null;

  // Operations (no UI prompts; caller decides confirmation)
  generateFixtureJson: () => void;
  importFixtureFromRepo: () => Promise<void>;
  importPOCFixture: () => Promise<void>;
  generateFixtureAndImport: () => Promise<void>;
  freshCloudResetAndImport: () => Promise<void>;
  resetLocalAndImport: () => Promise<void>;

  seedAppointmentsOnly: () => Promise<void>;

  deleteTasksOnly: () => Promise<void>;
  deleteAppointmentsOnly: () => Promise<void>;
  nuclearDeleteCloud: () => Promise<void>;

  forceSyncThisDevice: () => Promise<void>;
}

const buildFixtureForToday = () => {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  return buildTaskSystemFixtureV1({
    fixtureId: `seed-screen-${baseDate.toISOString().slice(0, 10)}`,
    baseDate,
    allTypesHour: 8,
  }) as any;
};

export const useDevOptions = (): UseDevOptionsReturn => {
  const [isImportingFixture, setIsImportingFixture] = useState(false);
  const [isSeedingAppointments, setIsSeedingAppointments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);

  const [seedResult, setSeedResult] = useState<DevOptionsSeedResult | null>(
    null
  );
  const [appointmentSeedResult, setAppointmentSeedResult] =
    useState<DevOptionsAppointmentSeedResult | null>(null);
  const [generatedFixtureJson, setGeneratedFixtureJson] = useState<string>("");
  const [lastError, setLastError] = useState<string | null>(null);

  const isBusy = useMemo(() => {
    return (
      isImportingFixture ||
      isSeedingAppointments ||
      isDeleting ||
      isForceSyncing
    );
  }, [isImportingFixture, isSeedingAppointments, isDeleting, isForceSyncing]);

  const generateFixtureJson = useCallback((): void => {
    const generated = buildFixtureForToday();
    setGeneratedFixtureJson(JSON.stringify(generated, null, 2));
    setLastError(null);
  }, []);

  const doLocalReset = useCallback(async (): Promise<void> => {
    await clearCacheAndResync();
    await AppointmentService.clearAppointments();
  }, []);

  const importFixture = useCallback(async (fixture: any): Promise<void> => {
    const result = await FixtureImportService.importTaskSystemFixture(fixture, {
      updateExisting: true,
      pruneNonFixture: true,
      pruneDerivedModels: true,
    });
    setSeedResult(result);
  }, []);

  const importFixtureFromRepo = useCallback(async (): Promise<void> => {
    setIsImportingFixture(true);
    setLastError(null);
    setSeedResult(null);

    try {
      await doLocalReset();
      await importFixture(fixtureFromRepo as any);
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsImportingFixture(false);
    }
  }, [doLocalReset, importFixture]);

  const importPOCFixture = useCallback(async (): Promise<void> => {
    setIsImportingFixture(true);
    setLastError(null);
    setSeedResult(null);

    try {
      await doLocalReset();
      await importFixture(pocFixture as any);
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsImportingFixture(false);
    }
  }, [doLocalReset, importFixture]);

  const generateFixtureAndImport = useCallback(async (): Promise<void> => {
    setIsImportingFixture(true);
    setLastError(null);
    setSeedResult(null);

    try {
      const generated = buildFixtureForToday();
      setGeneratedFixtureJson(JSON.stringify(generated, null, 2));
      await doLocalReset();
      await importFixture(generated as any);
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsImportingFixture(false);
    }
  }, [doLocalReset, importFixture]);

  const freshCloudResetAndImport = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    setLastError(null);
    setSeedResult(null);

    try {
      await SeededDataCleanupService.clearAllSeededData();
      await doLocalReset();

      const generated = buildFixtureForToday();
      setGeneratedFixtureJson(JSON.stringify(generated, null, 2));
      await importFixture(generated as any);
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [doLocalReset, importFixture]);

  const resetLocalAndImport = useCallback(async (): Promise<void> => {
    setIsImportingFixture(true);
    setLastError(null);
    setSeedResult(null);

    try {
      await doLocalReset();

      const generated = buildFixtureForToday();
      setGeneratedFixtureJson(JSON.stringify(generated, null, 2));
      await importFixture(generated as any);

      // Optional best-effort: ensure new data propagates
      try {
        await forceFullSync();
      } catch {
        // Caller can decide if they want to surface this; we keep it non-fatal.
      }
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsImportingFixture(false);
    }
  }, [doLocalReset, importFixture]);

  const seedAppointmentsOnly = useCallback(async (): Promise<void> => {
    setIsSeedingAppointments(true);
    setLastError(null);
    setAppointmentSeedResult(null);

    try {
      const appointmentData = await seedAppointmentData();
      await AppointmentService.saveAppointments(appointmentData);

      const appointmentsCount =
        appointmentData.clinicPatientAppointments.clinicAppointments.items
          .length;
      const todayAppointments =
        appointmentData.clinicPatientAppointments.clinicAppointments.items.filter(
          (apt: any) => {
            const startDate = new Date(apt.startAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return startDate >= today && startDate < tomorrow;
          }
        ).length;

      setAppointmentSeedResult({
        appointmentsCount,
        todayAppointments,
        timezone: appointmentData.siteTimezoneId,
      });
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsSeedingAppointments(false);
    }
  }, []);

  const deleteTasksOnly = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    setLastError(null);
    try {
      await TaskService.deleteAllTasks();
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const deleteAppointmentsOnly = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    setLastError(null);
    try {
      await AppointmentService.clearAppointments();
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const nuclearDeleteCloud = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    setLastError(null);
    try {
      await SeededDataCleanupService.clearAllSeededData();
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const forceSyncThisDevice = useCallback(async (): Promise<void> => {
    setIsForceSyncing(true);
    setLastError(null);
    try {
      await clearCacheAndResync();
    } catch (error: unknown) {
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsForceSyncing(false);
    }
  }, []);

  return {
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
    importPOCFixture,
    generateFixtureAndImport,
    freshCloudResetAndImport,
    resetLocalAndImport,
    seedAppointmentsOnly,
    deleteTasksOnly,
    deleteAppointmentsOnly,
    nuclearDeleteCloud,
    forceSyncThisDevice,
  };
};
