# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-01-13

### Added
- Appointment seeding functionality with seed script (`scripts/seed-appointment-data.ts`)
- Appointment seed results display on seed screen
- AsyncStorage persistence for seeded appointments
- Comprehensive logging for appointment loading and filtering
- Support for displaying appointments even when no tasks exist for today
- Appointment date filtering improvements with better timezone handling

### Fixed
- Reduced spacing between day groups on dashboard (from 32px to 4px)
- Fixed appointment date filtering to properly compare date parts
- Fixed appointment rendering when tasks exist for today
- Fixed TypeScript errors in GlobalHeader (rtlStyle type assertions)
- Fixed missing `deleteAllTasks` method in TaskService
- Fixed AppColors.background reference (changed to AppColors.powderGray)
- Fixed seed data screen navigation menu entry
- Fixed appointment JSON generation and loading flow

### Changed
- Improved appointment date comparison logic to handle timezone differences
- Enhanced appointment service logging for better debugging
- Updated seed screen to show appointment seeding results similar to task/activity results

## [0.1.0] - Initial Release

### Added
- Initial project setup with AWS Amplify DataStore
- Task management functionality
- Question rendering system
- Appointment display functionality
- Seed data functionality for tasks and activities

