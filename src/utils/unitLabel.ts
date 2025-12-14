/**
 * Maps a unit i18n key (e.g. `unit_mmhg_key`) to a human-friendly label (e.g. `mmHg`).
 *
 * Note: The app currently uses AWS Translate for free-form text translation, not a static
 * key-based i18n dictionary. So keys should never be rendered directly in UI.
 */
export const getUnitDisplayLabel = (unitI18nKeyOrLabel: string): string => {
  const input = unitI18nKeyOrLabel?.trim?.() ?? "";
  if (!input) return "";

  // Known keys from seeded data
  const known: Record<string, string> = {
    unit_mmhg_key: "mmHg",
    unit_lbs_key: "lbs",
  };

  if (known[input]) return known[input];

  // Generic fallback: `unit_foo_bar_key` -> `foo bar`
  if (input.startsWith("unit_") && input.endsWith("_key")) {
    return input
      .replace(/^unit_/, "")
      .replace(/_key$/, "")
      .replace(/_/g, " ");
  }

  // Already a label
  return input;
};
