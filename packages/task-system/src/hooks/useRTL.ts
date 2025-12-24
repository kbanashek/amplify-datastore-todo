import { useMemo } from "react";
import { ViewStyle, TextStyle } from "react-native";
import { useTaskTranslation } from "@translations/index";

/**
 * Hook to get RTL-aware styles
 * Automatically flips styles for RTL languages
 */
export function useRTL() {
  const { isRTL } = useTaskTranslation();

  /**
   * Create RTL-aware style that flips left/right properties
   */
  const rtlStyle = useMemo(
    () =>
      (style: ViewStyle | TextStyle): ViewStyle | TextStyle => {
        if (!isRTL) {
          return style;
        }

        const flipped: ViewStyle | TextStyle = { ...style };

        // Flip margin
        if (style.marginLeft !== undefined || style.marginRight !== undefined) {
          const temp = flipped.marginLeft;
          flipped.marginLeft = flipped.marginRight;
          flipped.marginRight = temp;
        }

        // Flip padding
        if (
          style.paddingLeft !== undefined ||
          style.paddingRight !== undefined
        ) {
          const temp = flipped.paddingLeft;
          flipped.paddingLeft = flipped.paddingRight;
          flipped.paddingRight = temp;
        }

        // Flip border
        if (
          style.borderLeftWidth !== undefined ||
          style.borderRightWidth !== undefined
        ) {
          const temp = flipped.borderLeftWidth;
          flipped.borderLeftWidth = flipped.borderRightWidth;
          flipped.borderRightWidth = temp;
        }

        // Flip border radius
        if (
          style.borderTopLeftRadius !== undefined ||
          style.borderTopRightRadius !== undefined
        ) {
          const temp = flipped.borderTopLeftRadius;
          flipped.borderTopLeftRadius = flipped.borderTopRightRadius;
          flipped.borderTopRightRadius = temp;
        }

        if (
          style.borderBottomLeftRadius !== undefined ||
          style.borderBottomRightRadius !== undefined
        ) {
          const temp = flipped.borderBottomLeftRadius;
          flipped.borderBottomLeftRadius = flipped.borderBottomRightRadius;
          flipped.borderBottomRightRadius = temp;
        }

        // Flip text align (TextStyle only)
        if ("textAlign" in style) {
          const textAlign = (style as TextStyle).textAlign;
          if (textAlign === "left") {
            (flipped as TextStyle).textAlign = "right";
          } else if (textAlign === "right") {
            (flipped as TextStyle).textAlign = "left";
          }
        }

        return flipped;
      },
    [isRTL]
  );

  /**
   * Create RTL-aware stylesheet
   */
  const createRTLStyles = useMemo(
    () =>
      <T extends Record<string, ViewStyle | TextStyle>>(styles: T): T => {
        if (!isRTL) {
          return styles;
        }

        const rtlStyles = {} as T;
        for (const key in styles) {
          rtlStyles[key] = rtlStyle(styles[key]) as T[typeof key];
        }
        return rtlStyles;
      },
    [isRTL, rtlStyle]
  );

  return {
    isRTL,
    rtlStyle,
    createRTLStyles,
  };
}
