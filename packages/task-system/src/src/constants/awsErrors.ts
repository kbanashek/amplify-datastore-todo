/**
 * AWS error name constants
 * Use these constants instead of string literals when checking AWS error types
 */
export const AWSErrorName = {
  InvalidSignatureException: "InvalidSignatureException",
} as const;

export type AWSErrorNameType = (typeof AWSErrorName)[keyof typeof AWSErrorName];
