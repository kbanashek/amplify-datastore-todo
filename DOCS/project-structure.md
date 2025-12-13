# Project Structure

```
amplify-datastore-todo/
│
├── 📱 app/                          # Expo Router app directory
│   ├── (tabs)/                     # Tab-based navigation
│   │   ├── index.tsx               # 🏠 Dashboard (tasks & appointments)
│   │   ├── questions.tsx            # ❓ Question/assessment screen
│   │   ├── seed-screen.tsx         # 🌱 Data seeding interface
│   │   └── ...                     # Other tab screens
│   └── _layout.tsx                 # App layout configuration
│
├── 🎨 src/
│   ├── components/                  # UI Components
│   │   ├── questions/              # Question rendering components
│   │   │   ├── QuestionRenderer.tsx
│   │   │   ├── SingleSelectQuestion.tsx
│   │   │   └── ...
│   │   ├── TaskCard.tsx            # Task display card
│   │   ├── AppointmentCard.tsx     # Appointment display card
│   │   ├── TasksGroupedView.tsx    # Grouped task display
│   │   └── ...
│   │
│   ├── 🪝 hooks/                    # Custom React Hooks
│   │   ├── useTaskList.ts          # Task list logic
│   │   ├── useQuestionsScreen.ts   # Question screen orchestration
│   │   ├── useAppointmentList.ts   # Appointment list logic
│   │   ├── useTranslatedText.ts    # Translation hook
│   │   └── ...
│   │
│   ├── 🔧 services/                 # Data Services
│   │   ├── TaskService.ts          # Task CRUD operations
│   │   ├── AppointmentService.ts   # Appointment operations
│   │   ├── ActivityService.ts      # Activity/assessment operations
│   │   ├── ConflictResolution.ts  # DataStore conflict handling
│   │   └── ...
│   │
│   ├── 📘 types/                    # TypeScript Definitions
│   │   ├── Task.ts                 # Task types and enums
│   │   ├── Appointment.ts          # Appointment types
│   │   ├── Activity.ts             # Activity/assessment types
│   │   └── ...
│   │
│   ├── 🌐 contexts/                 # React Contexts
│   │   ├── AmplifyContext.tsx      # Amplify configuration
│   │   └── TranslationContext.tsx  # Translation state
│   │
│   └── 🛠️ utils/                    # Utility Functions
│       ├── activityParser.ts      # Activity JSON parsing
│       ├── appointmentParser.ts   # Appointment parsing
│       └── questionValidation.ts  # Question validation logic
│
├── 🌱 scripts/                      # Seed Data Scripts
│   ├── seed-coordinated-data.ts    # Coordinated task/appointment seeding
│   ├── seed-appointment-data.ts    # Appointment seeding
│   └── seed-question-data.ts       # Activity/question seeding
│
├── 📚 DOCS/                         # Documentation
│   ├── current-rule-logic.md      # Current rule implementation status
│   ├── todos.md                    # Rule engine implementation plan
│   ├── testing-coordinated-seeding.md # Testing guide
│   ├── component-library.md       # Component library documentation
│   ├── testing.md                  # Testing guidelines
│   ├── aws-architecture.md         # AWS architecture details
│   ├── development-guidelines.md  # Development standards
│   ├── project-structure.md        # This file
│   ├── implementation-status.md   # Feature implementation status
│   └── roadmap.md                  # Future development roadmap
│
├── 📦 models/                       # Amplify Generated Models
│
├── ⚙️ amplify/                      # Amplify Backend Configuration
│   └── backend/api/lxtodoapp/
│       └── schema.graphql          # GraphQL schema definition
│
└── ☁️ aws-exports.js                 # AWS Configuration (generated)
```

## Key Directories

### `app/`
Expo Router app directory containing all screen components and navigation configuration.

### `src/components/`
UI components organized by feature. Question components are in `questions/` subdirectory.

### `src/hooks/`
Custom React hooks containing all business logic, state management, and side effects.

### `src/services/`
Data services that handle all DataStore operations, API calls, and data transformations.

### `src/types/`
TypeScript type definitions for all domain models and interfaces.

### `scripts/`
Seed data scripts for generating test data during development.

### `DOCS/`
Comprehensive documentation covering architecture, development guidelines, and implementation status.

