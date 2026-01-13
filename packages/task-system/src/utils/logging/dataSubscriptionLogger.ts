import { logWithPlatform } from "@utils/logging/platformLogger";

/**
 * Centralized logging manager for data subscriptions
 * Prevents duplicate logs across multiple hook instances
 */
class DataSubscriptionLogger {
  private recentLogs = new Map<string, number>();
  private readonly LOG_DEDUP_WINDOW_MS = 5000; // 5 second window (increased to catch more duplicates)

  /**
   * Log tasks with deduplication across all hook instances
   * Suppresses duplicate logs when same tasks are logged with different sync statuses
   */
  logTasks(
    items: Array<{
      title: string;
      startTimeInMillSec?: number | null;
      expireTimeInMillSec?: number | null;
    }>,
    synced: boolean,
    serviceName: string
  ): void {
    const stateSignature = `tasks-${items.length}-${synced}`;
    const countSignature = `tasks-${items.length}`;
    const now = Date.now();

    // Check if we recently logged the same count with different sync status
    const otherSyncState = `tasks-${items.length}-${!synced}`;
    const otherSyncTime = this.recentLogs.get(otherSyncState) || 0;
    const recentlyLoggedOtherSync =
      otherSyncTime > 0 && now - otherSyncTime < this.LOG_DEDUP_WINDOW_MS * 3;

    // If we just logged "synced" and now we're logging "local-only" for same count, suppress it
    // (or vice versa - prefer synced state)
    if (recentlyLoggedOtherSync) {
      // If the other state was synced and we're now local-only, suppress this
      if (synced === false && otherSyncTime > 0) {
        return; // Suppress local-only if we just logged synced
      }
      // If the other state was local-only and we're now synced, log the synced state (preferred)
    }

    // Check if we recently logged the exact same state (same count, same sync status)
    // This handles cases where the same data is logged multiple times from different hook instances
    const lastStateTime = this.recentLogs.get(stateSignature) || 0;
    if (now - lastStateTime < this.LOG_DEDUP_WINDOW_MS) {
      return; // Skip duplicate
    }

    const taskList = items
      .map(t => {
        const startDate = t.startTimeInMillSec
          ? new Date(t.startTimeInMillSec).toISOString().split("T")[0]
          : "no date";
        const expireDate = t.expireTimeInMillSec
          ? new Date(t.expireTimeInMillSec).toISOString().split("T")[0]
          : "no expiry";
        return `  • ${t.title} (start: ${startDate}, expire: ${expireDate})`;
      })
      .join("\n");

    logWithPlatform(
      "📋",
      "",
      serviceName,
      `Received ${items.length} tasks (${synced ? "synced-with-cloud" : "local-only"})\n${taskList}`,
      {
        status: synced ? "synced-with-cloud" : "local-only",
      }
    );

    this.recordLog(stateSignature);
    // Also record count signature to track when count changes
    this.recordLog(countSignature);
  }

  /**
   * Log activities with deduplication across all hook instances
   * Suppresses duplicate logs when same activities are logged with different sync statuses
   */
  logActivities(
    items: Array<{
      name?: string | null;
      title?: string | null;
      createdAt?: string | null;
    }>,
    synced: boolean,
    serviceName: string
  ): void {
    const stateSignature = `activities-${items.length}-${synced}`;
    const countSignature = `activities-${items.length}`;
    const now = Date.now();

    // Check if we recently logged the same count with different sync status
    const otherSyncState = `activities-${items.length}-${!synced}`;
    const otherSyncTime = this.recentLogs.get(otherSyncState) || 0;
    const recentlyLoggedOtherSync =
      otherSyncTime > 0 && now - otherSyncTime < this.LOG_DEDUP_WINDOW_MS * 3;

    // If we just logged "synced" and now we're logging "local-only" for same count, suppress it
    if (recentlyLoggedOtherSync && synced === false && otherSyncTime > 0) {
      return; // Suppress local-only if we just logged synced
    }

    // Normal deduplication check
    if (!this.shouldLog(stateSignature)) return;

    const activityList = items
      .map(a => {
        const name = a.name || a.title || "unnamed";
        const createdDate = a.createdAt
          ? new Date(a.createdAt).toISOString().split("T")[0]
          : "no date";
        return `  • ${name} (created: ${createdDate})`;
      })
      .join("\n");

    logWithPlatform(
      "📋",
      "",
      serviceName,
      `Received ${items.length} activities (${synced ? "synced-with-cloud" : "local-only"})\n${activityList}`,
      {
        status: synced ? "synced-with-cloud" : "local-only",
      }
    );

    this.recordLog(stateSignature);
    // Also record count signature to track when count changes
    this.recordLog(countSignature);
  }

  /**
   * Log appointments with deduplication across all hook instances
   */
  logAppointments(
    count: number,
    todayOnly: boolean,
    timezone?: string,
    serviceName: string = "useAppointmentList"
  ): void {
    const stateSignature = `appointments-${count}-${todayOnly}`;
    if (!this.shouldLog(stateSignature)) return;

    logWithPlatform(
      "📅",
      "",
      serviceName,
      `Loaded ${count} appointments${todayOnly ? " (today only)" : ""}`,
      {
        todayOnly,
        timezone,
      }
    );

    this.recordLog(stateSignature);
  }

  private shouldLog(signature: string): boolean {
    const now = Date.now();
    const lastLogTime = this.recentLogs.get(signature) || 0;
    return now - lastLogTime > this.LOG_DEDUP_WINDOW_MS;
  }

  /**
   * Log subscription start with deduplication
   */
  logSubscriptionStart(serviceName: string, dataType: string): void {
    const stateSignature = `subscription-${dataType}`;
    if (!this.shouldLog(stateSignature)) return;

    logWithPlatform("📋", "", serviceName, `Subscribing to ${dataType} data`);
    this.recordLog(stateSignature);
  }

  /**
   * Log service setup with deduplication
   */
  logServiceSetup(
    serviceName: string,
    message: string,
    icon: string = "☁️"
  ): void {
    const stateSignature = `setup-${serviceName}-${message}`;
    if (!this.shouldLog(stateSignature)) return;

    logWithPlatform(icon, "", serviceName, message);
    this.recordLog(stateSignature);
  }

  /**
   * Log service operation with deduplication (for service-level logs)
   */
  logServiceOperation(
    serviceName: string,
    message: string,
    metadata?: Record<string, unknown>,
    icon: string = "📅"
  ): void {
    // Create signature from message and key metadata values
    const metaKey = metadata ? Object.values(metadata).join("-") : "";
    const stateSignature = `operation-${serviceName}-${message}-${metaKey}`;
    if (!this.shouldLog(stateSignature)) return;

    logWithPlatform(icon, "", serviceName, message, metadata);
    this.recordLog(stateSignature);
  }

  /**
   * Log initial query completion with deduplication
   */
  logInitialQuery(serviceName: string, dataType: string, count: number): void {
    const stateSignature = `initial-query-${dataType}-${count}`;
    if (!this.shouldLog(stateSignature)) return;

    logWithPlatform(
      "☁️",
      "",
      serviceName,
      `Initial AWS DataStore query completed - ${count} ${dataType} loaded`,
      { count }
    );
    this.recordLog(stateSignature);
  }

  private recordLog(signature: string): void {
    const now = Date.now();
    this.recentLogs.set(signature, now);

    // Clean up old entries (keep cache small)
    if (this.recentLogs.size > 20) {
      const entries = Array.from(this.recentLogs.entries());
      entries
        .sort((a, b) => a[1] - b[1])
        .slice(0, 10)
        .forEach(([key]) => this.recentLogs.delete(key));
    }
  }
}

// Singleton instance shared across all hooks
export const dataSubscriptionLogger = new DataSubscriptionLogger();
