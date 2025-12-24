/**
 * Border style type for input fields
 */
export type BorderStyleType = "oval" | "rectangle" | "line";

/**
 * Gets the appropriate border style based on the border style type.
 *
 * This utility function maps border style types to their corresponding
 * style configurations. Used across multiple question components and input fields.
 *
 * Border style types:
 * - **oval**: Rounded border with high border radius (creates oval/pill shape)
 * - **rectangle**: Standard rectangular border with small border radius
 * - **line**: Bottom border only (single line underline style)
 *
 * @param borderStyleType - The border style type ("oval", "rectangle", or "line")
 * @param styles - Object containing the style definitions for each border type
 * @returns The appropriate style for the given border type
 *
 * @example
 * ```typescript
 * const styles = {
 *   ovalBorder: { borderRadius: 20, borderWidth: 1 },
 *   rectangleBorder: { borderRadius: 4, borderWidth: 1 },
 *   lineBorder: { borderBottomWidth: 1 },
 * };
 *
 * const style = getBorderStyle("oval", styles);
 * // Returns styles.ovalBorder
 * ```
 */
export const getBorderStyle = <T>(
  borderStyleType: BorderStyleType | string | undefined,
  styles: {
    ovalBorder: T;
    rectangleBorder: T;
    lineBorder: T;
  }
): T => {
  switch (borderStyleType) {
    case "oval":
      return styles.ovalBorder;
    case "rectangle":
      return styles.rectangleBorder;
    default:
      return styles.lineBorder;
  }
};
