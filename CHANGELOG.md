# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.8] - 2025-01-XX

### Added
- **Translation & Internationalization**: Full AWS Translate integration for real-time question translation
  - `TranslationService` with caching and request deduplication
  - `TranslationContext` for global language state management
  - `useTranslatedText` hook for translating text with loading states
  - `LanguageSelector` component for language selection
  - `GlobalHeader` component with integrated language selector and menu
  - Support for 20+ languages including Spanish, French, German, Arabic, Hebrew, and more
- **Right-to-Left (RTL) Language Support**: Complete RTL implementation
  - `useRTL` hook for RTL-aware styling
  - Automatic style flipping for margins, padding, borders, and text alignment
  - RTL support for Arabic, Hebrew, Urdu, Persian, and Yiddish
  - `I18nManager` integration for system-level RTL
- **Navigation Improvements**: 
  - Moved "Tasks" screen from bottom tab bar to navigation menu
  - Simplified tab bar to only show "Dashboard"
  - Enhanced `NavigationMenu` with translated menu items
- **Reactive Hooks Architecture**: New reactive hooks for data management
  - `useTaskUpdate` for reactive task updates
  - `useTaskAnswer` for reactive task answer management
  - `useDataPointInstance` for reactive data point instance management
  - `useActivity` for reactive single activity fetching
- **Polyfills**: 
  - `structuredClone` polyfill for React Native compatibility with AWS SDK v3
- **Documentation**: 
  - `DOCS/aws-technical-details.md` for detailed AWS configuration
  - `DOCS/rtl-support.md` for RTL implementation details
  - `DOCS/troubleshooting-translation.md` for translation troubleshooting
  - `DOCS/aws-iam-policy-setup.md` for IAM policy configuration

### Fixed
- Fixed submit button blocking form inputs at the bottom of question screens
- Submit button now properly integrated into form content flow instead of overlaying inputs
- Fixed question text translation not triggering when language changes
- Fixed Spanish language not persisting on app refresh
- Fixed clock skew errors with AWS Translate by adding proper error handling and guidance
- Fixed `structuredClone` not available in React Native by implementing polyfill
- Fixed memory leak in `TranslationService` cleanup interval

### Changed
- Refactored question screen layout to render submit button as part of form content
- Submit button now uses activity config screen-level display properties for positioning and styling
- Submit button respects RTL (Right-to-Left) language support via `useRTL` hook
- Removed unused `NavigationButtons` component (replaced with inline button rendering)
- Navigation buttons (Previous/Next/Submit) now rendered within `QuestionScreenContent` component
- Button container styling now uses screen-level `displayProperties` (width, margins, padding, fontSize)
- All screens now use `GlobalHeader` for consistent language switching
- All user-facing text across all screens is now translatable
- Question choices and options are now translated
- Updated `QuestionRenderer` to use `useTranslatedText` for question text
- Updated `SingleSelectQuestion` and `MultiSelectQuestion` to translate choice options
- Updated `ReviewScreen` to display translated questions

### Technical Details
- Submit button container uses `rtlStyle` for RTL-aware layout
- Button positioning respects screen-level `displayProperties` from activity config
- Form content padding adjusted to prevent button overlap with inputs
- Removed absolute positioning from navigation buttons in favor of flexbox layout
- Translation caching with 30-day expiry in AsyncStorage
- Request deduplication to prevent duplicate API calls
- AWS credentials loading from config file, environment variables, or default provider chain
- Comprehensive error handling for translation failures with user-friendly messages

## [0.0.7] - Previous version
- Initial version tracking

