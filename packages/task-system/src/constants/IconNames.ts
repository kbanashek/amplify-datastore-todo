import type { IconSymbolName } from "@components/ui/IconSymbol";

/**
 * Constants for icon names used throughout the application.
 *
 * These constants provide type-safe access to icon names and eliminate
 * magic strings in the codebase. All icon names must match the keys
 * in the IconSymbol MAPPING.
 */
export const IconNames = {
  /** Home icon */
  HOUSE_FILL: "house.fill" as IconSymbolName,
  /** Send/paper plane icon */
  PAPERPLANE_FILL: "paperplane.fill" as IconSymbolName,
  /** Code/chevron icon */
  CHEVRON_LEFT_FORWARDSLASH_CHEVRON_RIGHT:
    "chevron.left.forwardslash.chevron.right" as IconSymbolName,
  /** Left chevron icon */
  CHEVRON_LEFT: "chevron.left" as IconSymbolName,
  /** Right chevron icon */
  CHEVRON_RIGHT: "chevron.right" as IconSymbolName,
  /** Menu/hamburger icon */
  LINE_3_HORIZONTAL: "line.3.horizontal" as IconSymbolName,
  /** Close/X mark icon */
  XMARK: "xmark" as IconSymbolName,
  /** Cancel/X mark in circle icon */
  XMARK_CIRCLE_FILL: "xmark.circle.fill" as IconSymbolName,
  /** Checkmark in circle icon */
  CHECKMARK_CIRCLE_FILL: "checkmark.circle.fill" as IconSymbolName,
  /** Document text filled icon */
  DOC_TEXT_FILL: "doc.text.fill" as IconSymbolName,
  /** Bar chart icon */
  CHART_BAR_FILL: "chart.bar.fill" as IconSymbolName,
  /** Help/question mark in circle filled icon */
  QUESTIONMARK_CIRCLE_FILL: "questionmark.circle.fill" as IconSymbolName,
  /** Help/question mark in circle outline icon */
  QUESTIONMARK_CIRCLE: "questionmark.circle" as IconSymbolName,
  /** Chat bubble filled icon */
  TEXT_BUBBLE_FILL: "text.bubble.fill" as IconSymbolName,
  /** List bullet rectangle portrait filled icon */
  LIST_BULLET_RECTANGLE_PORTRAIT_FILL:
    "list.bullet.rectangle.portrait.fill" as IconSymbolName,
  /** Clipboard/list icon */
  LIST_CLIPBOARD: "list.clipboard" as IconSymbolName,
  /** Clock filled icon */
  CLOCK_FILL: "clock.fill" as IconSymbolName,
  /** Clock outline icon */
  CLOCK: "clock" as IconSymbolName,
  /** Pills/medication icon */
  PILLS: "pills" as IconSymbolName,
  /** Bell/notifications icon */
  BELL: "bell" as IconSymbolName,
  /** Calendar icon */
  CALENDAR: "calendar" as IconSymbolName,
  /** Repeat icon */
  REPEAT: "repeat" as IconSymbolName,
  /** Document text outline icon */
  DOC_TEXT: "doc.text" as IconSymbolName,
  /** Video/videocam icon (for telehealth appointments) */
  VIDEO_FILL: "video.fill" as IconSymbolName,
  /** Building icon (for onsite appointments) */
  BUILDING_2_FILL: "building.2.fill" as IconSymbolName,
} as const;
