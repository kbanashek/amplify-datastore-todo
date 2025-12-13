# Translation Memory (Offline-Ready i18n Strategy)

This app currently uses **AWS Translate** for free-form translation. To reduce vendor lock-in and keep the app functional if AWS Translate becomes unavailable, we maintain a **translation memory** that can satisfy translations without making network calls.

## Goals

- Keep the UI functional **without AWS Translate**
- Preserve the existing **cache + request dedupe** behavior
- Allow shipping **seed translations** with the app for known UI phrases
- Persist learned translations locally for future sessions

## Current Architecture

```mermaid
flowchart TB
  UI[useTranslatedText] --> TC[TranslationContext.translate]
  TC --> TS[TranslationService.translateText]

  TS --> TM[TranslationMemoryService]
  TM --> Seed[src/translations/*.json (seed memory)]
  TM --> AS[(AsyncStorage: translation_memory:*)]

  TS --> Cache[(AsyncStorage: translation_cache:* TTL)]
  TS --> AWS[AWS Translate]

  style UI fill:#e1f5ff
  style TS fill:#fff4e1
  style TM fill:#fff4e1
  style AWS fill:#ffe1e1
```

### Resolution order (important)

1. **Translation Memory** (seed files + persisted memory)
2. **TTL Cache** (existing `translation_cache:*`, 30-day expiry)
3. **AWS Translate** (network)

If AWS Translate is unavailable, the app still resolves translations from (1) and (2).

## Where translation memory lives

### Seed files (bundled)

- Directory: `src/translations/`
- Example: `src/translations/memory.en-es.json`

These files ship with the app and provide a baseline of known translations.

### Runtime memory (persisted)

- Storage: AsyncStorage keys prefixed with `translation_memory:`
- Service: `src/services/TranslationMemoryService.ts`

This is populated when AWS Translate successfully returns a translation.

## Updating seed translations

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

## Notes / Follow-ups

- Add tooling to **export** runtime memory to a JSON file (so it can be reviewed/committed).
- Add support for multiple language pairs (`memory.en-fr.json`, etc.).
- Consider adding a small “translation admin” screen for debugging or exporting.
