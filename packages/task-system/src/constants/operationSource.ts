/**
 * Operation source constants for DataStore operations
 * Use these constants instead of string literals when logging operation sources
 */
export const OperationSource = {
  LOCAL: "LOCAL",
  REMOTE_SYNC: "REMOTE_SYNC",
} as const;

export type OperationSourceType =
  (typeof OperationSource)[keyof typeof OperationSource];
