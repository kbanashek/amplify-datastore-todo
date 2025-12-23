## Translation Memory (Offline-Ready i18n Strategy)

Translation Memory is an offline-ready lookup table used to translate **dynamic strings** (like task titles) that do not have stable i18next translation keys.

The task-system package primarily uses **i18next** for UI labels (key-based translations). Translation Memory is a complementary mechanism for content that is:

- Dynamic (fixture/user content)
- Not naturally represented as stable translation keys
- Still useful to translate for demos/offline behavior

### Goals

- Keep the UI functional **without AWS Translate**
- Allow shipping **seed translations** with the app for known UI phrases
- Persist learned translations locally for future sessions

### Current Architecture (today)

```mermaid
flowchart TB
  UI[TranslatedText] --> TM[TranslationMemoryService]
  TM --> Seed[packages/task-system/src/src/translations/memory.*.json\n(seed memory)]
  TM --> AS[(AsyncStorage: translation_memory:*)]

  style UI fill:#e1f5ff
  style TM fill:#fff4e1
```

### Resolution order (important)

1. **In-memory Translation Memory** (seed files + any rehydrated runtime entries)
2. **AsyncStorage Translation Memory** (`translation_memory:*`) if not already in memory

If nothing is found, the app displays the original text (e.g., English title).

### Where translation memory lives

#### Seed files (bundled)

- Directory: `packages/task-system/src/src/translations/`
- Example: `packages/task-system/src/src/translations/memory.en-es.json`

These files ship with the app and provide a baseline of known translations.

#### Runtime memory (persisted)

- Storage: AsyncStorage keys prefixed with `translation_memory:`
- Service: `src/services/TranslationMemoryService.ts`

This is populated by calling `TranslationMemoryService.storeTranslation(...)`.

### Updating seed translations

Add stable UI phrases (buttons, labels, error strings) into the appropriate `memory.<src>-<dst>.json` file under `entries`.

Example:

```json
{
  "_meta": { "sourceLanguage": "en", "targetLanguage": "es" },
  "entries": {
    "Save": "Guardar",
    "Cancel": "Cancelar"
  }
}
```

### Legacy note (AWS Translate)

Some older docs and code paths refer to AWS Translate + a TTL cache layer. The current task-system translation flow for dynamic strings relies on Translation Memory for offline translations; key-based UI strings are handled by i18next. If AWS Translate is still used elsewhere in the harness, treat it as a legacy/optional source that can populate Translation Memory.

### Notes / Follow-ups

- Add tooling to **export** runtime memory to a JSON file (so it can be reviewed/committed).
- Add support for multiple language pairs (`memory.en-fr.json`, etc.).
- Consider adding a small “translation admin” screen for debugging or exporting.
