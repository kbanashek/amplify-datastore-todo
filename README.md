# ✨ LX App Sync POC - Amplify DataStore Task Management App ✨

A React Native application built with Expo and AWS Amplify that demonstrates online/offline synchronization capabilities using DataStore with SQLite as the storage adapter. This POC showcases task management, dynamic question rendering, and data point recording for health assessment workflows. Perfect for building resilient apps that work anywhere! 🚀

![App Screenshot](./assets/images/todo-app-screenshot.png)

*The app running on iOS devices showing task management, question forms, and online/offline sync capabilities*

## ✅ Features

- 📋 **Task Management**: Create, view, and manage tasks with due dates and status tracking
- 📝 **Dynamic Question Forms**: Multi-page questionnaires with various question types (text, single/multi-select, numeric scale, date)
- 📊 **Data Point Recording**: Automatic recording of answers as DataPointInstance records for analytics
- 🔄 **Offline-First Architecture**: Seamless synchronization with AWS AppSync
- 📶 **Visual Indicators**: Network and sync status indicators
- 🎨 **Component Architecture**: Clean separation of logic (hooks) and presentation (components)
- 🛡️ **TypeScript**: Full type safety throughout the application
- ☁️ **AWS AppSync Backend**: GraphQL API with real-time subscriptions
- 🔍 **Smart Conflict Resolution**: Custom conflict resolution for data consistency
- 📱 **Multi-Screen Activities**: Support for introduction, question pages, review, and completion screens

## 💻 Prerequisites

- 🔍 Node.js (v14 or later)
- 💾 npm or yarn
- 📱 Expo CLI (`npm install -g expo-cli`)
- ☁️ AWS Account (for backend services)
- 🔨 AWS Amplify CLI (`npm install -g @aws-amplify/cli`)

## 📍 Setup Instructions

### 1. 💼 Clone the repository

```bash
git clone <repository-url>
cd amplify-datastore-todo
```

### 2. 📦 Install dependencies

```bash
npm install
```

### 3. ☁️ Pull the existing Amplify backend

```bash
amplify pull --appId d19l3dxjz56ge3 --envName dev
```

Follow the prompts to configure the Amplify backend. This will create the necessary `aws-exports.js` file.

### 4. 🚀 Start the app

```bash
npm start
```

In the output, you'll find options to open the app in a:

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) on your physical device
## Project Structure

```
/amplify-datastore-todo
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Main tasks screen with task creation
│   │   ├── dashboard-sim.tsx  # Dashboard view (read-only)
│   │   ├── questions.tsx  # Dynamic question rendering screen
│   │   └── seed-screen.tsx  # Data seeding interface
│   └── _layout.tsx        # App layout configuration
├── models/                # Amplify generated models
├── scripts/               # Utility scripts
│   ├── seed-question-data.ts  # Seed script for activities and tasks
│   └── version-bump.sh   # Version bumping automation
├── src/
│   ├── amplify-config.ts  # Amplify configuration
│   ├── API.ts            # Generated TypeScript types from GraphQL schema
│   ├── components/        # UI components
│   │   ├── NetworkStatusIndicator.tsx
│   │   ├── TasksGroupedView.tsx  # Task list grouped by date/time
│   │   ├── TaskCard.tsx  # Individual task card component
│   │   └── questions/     # Question rendering components
│   │       ├── QuestionRenderer.tsx
│   │       ├── TextQuestion.tsx
│   │       ├── SingleSelectQuestion.tsx
│   │       ├── MultiSelectQuestion.tsx
│   │       ├── NumberQuestion.tsx
│   │       ├── DateQuestion.tsx
│   │       ├── IntroductionScreen.tsx
│   │       ├── CompletionScreen.tsx
│   │       ├── ReviewScreen.tsx
│   │       ├── NavigationButtons.tsx
│   │       └── ProgressIndicator.tsx
│   ├── contexts/
│   │   └── AmplifyContext.tsx  # Amplify context provider
│   ├── graphql/          # Generated GraphQL operations
│   │   ├── mutations.ts  # GraphQL mutation operations
│   │   ├── queries.ts    # GraphQL query operations
│   │   └── subscriptions.ts # GraphQL subscription operations
│   ├── hooks/            # Custom React hooks (business logic)
│   │   ├── useAmplifyState.ts # Amplify state management
│   │   ├── useNetworkStatus.ts # Network status logic
│   │   ├── useTaskForm.ts # Task form logic
│   │   ├── useTaskList.ts # Task list logic
│   │   ├── useGroupedTasks.ts # Task grouping logic
│   │   └── useQuestionsScreen.ts # Questions screen logic
│   ├── services/         # Data services
│   │   ├── TaskService.ts  # Task CRUD operations
│   │   ├── ActivityService.ts  # Activity operations
│   │   ├── TaskAnswerService.ts  # Task answer operations
│   │   ├── DataPointService.ts  # Data point operations
│   │   └── ConflictResolution.ts  # Centralized conflict resolution
│   ├── types/            # TypeScript type definitions
│   │   ├── ActivityConfig.ts  # Activity JSON structure types
│   │   └── Task.ts  # Task type definitions
│   └── utils/            # Utility functions
│       └── activityParser.ts  # Activity JSON parser
└── aws-exports.js         # AWS configuration (generated by Amplify CLI)
```

## 📱 Key Features

### Task Management
- Create tasks with due dates and times
- Tasks grouped by day and time
- Status tracking (OPEN, STARTED, INPROGRESS, COMPLETED)
- Task type icons for visual identification
- BEGIN/RESUME buttons based on task status

### Dynamic Question Rendering
- Multi-page questionnaires with introduction, question pages, review, and completion screens
- Support for various question types:
  - Text input (single-line and multi-line)
  - Single select (radio buttons)
  - Multi-select (checkboxes)
  - Numeric scale (slider)
  - Date picker
- Form validation with required field checking
- Progress indicators for multi-page activities
- Answer persistence and restoration

### Data Point Recording
- Automatic creation of `DataPointInstance` records when answers are submitted
- Links answers to activities and questions for analytics
- Synchronized with AWS AppSync for cloud storage

### Component Architecture
- **Hooks contain all business logic**: State management, side effects, API calls
- **Components are presentation-only**: Render UI and handle user interactions
- **Small, focused components**: Each component has a single responsibility
- **Reusable sub-components**: Shared UI elements across screens

## 📱 Testing Offline Functionality

1. 🔍 Create a few tasks while online
2. ✈️ Turn off your device's network connection (airplane mode or disable Wi-Fi/cellular)
3. 📝 Create more tasks and answer questions while offline
4. 📶 Turn your network connection back on
5. ✨ Watch as the sync indicator changes and your offline data syncs with the backend

## 🔧 Troubleshooting

- 🗑️ If you encounter issues with DataStore synchronization, try clearing the local database:
  ```javascript
  // In your app code, add this for testing:
  await DataStore.clear();
  ```

- 🔄 Ensure you have the latest version of the Amplify CLI installed

- 🔍 If you see "VirtualizedLists should never be nested" warnings, make sure FlatList components aren't nested inside ScrollView components with the same orientation

- ⚠️ If you encounter "Amplify has not been configured" warnings, check that Amplify is initialized before any component tries to use it (see our custom entry.js approach)

## 👏 Implementation Highlights

### 🏗️ Component Architecture Pattern

This app follows a strict separation of concerns:

**Hooks (`src/hooks/`)**: Contain all business logic
- State management (`useState`, `useReducer`)
- Side effects (`useEffect`, subscriptions)
- API calls and data operations
- Event handlers with logic
- Validation and data transformation

**Components (`src/components/`, `app/`)**: Handle presentation only
- Render UI based on props
- Handle user interactions (pass to hooks)
- Compose smaller sub-components
- No business logic in components

**Example Pattern:**
```typescript
// ❌ Bad: Large component with all logic
export default function MyComponent() {
  const [state, setState] = useState(...);
  useEffect(() => { ... }, []);
  const handleSubmit = async () => { ... };
  // 500+ lines of logic and JSX
}

// ✅ Good: Hook contains logic, component renders
// src/hooks/useMyComponent.ts
export const useMyComponent = () => {
  const [state, setState] = useState(...);
  useEffect(() => { ... }, []);
  const handleSubmit = async () => { ... };
  return { state, handleSubmit, ... };
};

// app/(tabs)/my-component.tsx
export default function MyComponent() {
  const { state, handleSubmit } = useMyComponent();
  return <View>...</View>;
}
```

### 💡 Custom Amplify Initialization

This app uses a custom entry point to ensure Amplify is properly configured before any component tries to use it:

```javascript
// entry.js - Custom entry point for the app
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import 'expo-router/entry';

// Configure Amplify immediately
console.log('Entry point: Initializing Amplify before Expo Router loads...');
Amplify.configure(awsconfig);
console.log('Entry point: Amplify initialized successfully');
```

This approach solves the common "Amplify has not been configured" warning in Expo Router apps by ensuring Amplify is initialized before any other code runs.

### 🧹 Clean UI Implementation

The app follows React Native best practices for list rendering:

- Avoids nesting `FlatList` inside `ScrollView` with the same orientation
- Uses separate View components for form and list sections
- Implements proper keyboard handling for form inputs

### 🔧 Smart Conflict Resolution

The app implements a sophisticated conflict resolution strategy for DataStore:

```typescript
// Custom conflict handler for DataStore
DataStore.configure({
  conflictHandler: async ({ modelConstructor, localModel, remoteModel, operation }) => {
    console.log('Conflict detected for model', modelConstructor.name);
    console.log('Local model: ', localModel);
    console.log('Remote model: ', remoteModel);
    console.log('Operation:', operation, 'Attempts:', attempts);
    
    // Special handling for DELETE operations
    if (operation === OpType.DELETE) {
      // If remote is already deleted, use it
      if (remoteModel?._deleted) {
        console.log('Remote already deleted, using remote model');
        return remoteModel;
      }
      
      // If local model is incomplete but remote exists, use remote with delete flag
      if (!localModel?.name && remoteModel) {
        console.log('Local model incomplete, using remote model with delete flag');
        return {
          ...remoteModel,
          _deleted: true
        };
      }
      
      // Otherwise use local delete
      console.log('Using local delete');
      return localModel;
    }
    
    // For other operations, merge changes
    return remoteModel;
  }
});
```

This approach prevents infinite retry loops and handles edge cases gracefully.

## 📚 Amplify Codegen

This project uses AWS Amplify's codegen feature to automatically generate TypeScript types and GraphQL operations from the GraphQL schema. The configuration is in `.graphqlconfig.yml`.

### 📁 Generated Files

- **`src/API.ts`**: 📝 Contains TypeScript interfaces for all GraphQL types, including:
  - Model interfaces (Todo)
  - Input types (CreateTodoInput, UpdateTodoInput, DeleteTodoInput)
  - Query/Mutation response types
  - Enums and scalars

- **`src/graphql/`**: 📚 Contains GraphQL operation strings:
  - `queries.ts`: GraphQL query operations (getTodo, listTodos)
  - `mutations.ts`: GraphQL mutation operations (createTodo, updateTodo, deleteTodo)
  - `subscriptions.ts`: GraphQL subscription operations (onCreateTodo, onUpdateTodo, onDeleteTodo)

### ✨ Benefits

- **🛡️ Type Safety**: Full TypeScript typing for all GraphQL operations
- **🔄 Automatic Updates**: When the schema changes, running codegen updates all types and operations
- **💡 Reduced Boilerplate**: No need to manually write GraphQL operations
- **💯 Consistency**: Ensures all operations follow the same patterns

### 🔄 Updating Generated Files

🔄 To update the generated files after schema changes:

```bash
amplify codegen
```

## ☁️ AWS Architecture Overview

This application uses several AWS technologies working together to provide a seamless offline-first experience. Here's an explanation of the key components and how they interact:

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Native App                           │
│                                                                 │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐    │
│  │  Components   │    │    Hooks      │    │   Contexts    │    │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘    │
│          │                    │                    │            │
│          └────────────┬───────┴────────────┬──────┘            │
│                       │                    │                    │
│               ┌───────▼───────┐    ┌──────▼───────┐            │
│               │  TodoService  │    │AmplifyContext│            │
│               └───────┬───────┘    └──────┬───────┘            │
│                       │                    │                    │
└───────────────────────┼────────────────────┼────────────────────┘
                        │                    │
                ┌───────▼────────────────────▼───────┐
                │           DataStore                │
                │  ┌─────────────┐  ┌────────────┐  │
                │  │Local Storage│  │ Sync Engine│  │
                │  │  (SQLite)   │  │            │  │
                │  └─────────────┘  └──────┬─────┘  │
                └────────────────────────────┼───────┘
                                             │
                                    ┌────────▼────────┐
                                    │  AWS AppSync     │
                                    │  (GraphQL API)   │
                                    └────────┬─────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  DynamoDB        │
                                    │  (Database)      │
                                    └─────────────────┘
```

### Key AWS Technologies

#### AWS Amplify

AWS Amplify is the framework that ties everything together. It provides:

- **CLI Tools**: For creating and managing backend resources
- **Client Libraries**: For connecting the React Native app to AWS services
- **Hosting**: For deploying web applications (not used in this mobile app)
- **Authentication**: For user management (not currently implemented but could be added)

In our app, Amplify is configured in `src/amplify-config.ts` and provides the connection to all AWS services.

#### AWS AppSync

AppSync is AWS's managed GraphQL service that acts as the API layer:

- **GraphQL API**: Provides a single endpoint for all data operations
- **Real-time Data**: Enables subscriptions for live updates
- **Schema Definition**: Defines the data model using GraphQL SDL
- **Resolvers**: Connect GraphQL operations to data sources

Our app uses AppSync as the backend API, with the schema defined in `amplify/backend/api/lxtodoapp/schema.graphql`.

#### DataStore

DataStore is Amplify's solution for offline-first data management:

- **Local Storage**: Persists data locally using SQLite
- **Sync Engine**: Handles synchronization with the cloud when online
- **Conflict Resolution**: Manages conflicts between local and remote changes
- **Real-time Updates**: Subscribes to changes and updates the UI

In our app, services like `TaskService.ts`, `ActivityService.ts`, and `TaskAnswerService.ts` use DataStore for all data operations, enabling offline functionality.

#### How They Work Together

1. **User Interaction**: User interacts with React components
2. **Component Logic**: Components use hooks for business logic
3. **Data Operations**: Hooks call TodoService methods
4. **Local Storage**: DataStore saves changes to local SQLite database
5. **Background Sync**: When online, DataStore syncs with AppSync
6. **Cloud Storage**: AppSync persists data to DynamoDB
7. **Real-time Updates**: Changes from other devices come back through subscriptions

#### DataStore Conflict Resolution

This app implements a custom conflict resolution strategy for handling synchronization conflicts between local and remote changes:

```typescript
// Custom conflict handler in TodoService.ts
DataStore.configure({
  conflictHandler: async ({ modelConstructor, localModel, remoteModel, operation }) => {
    // For Todo model conflicts during updates
    if (modelConstructor.name === "Todo" && operation === OpType.UPDATE) {
      // Custom merge strategy: take local name, but remote description if it exists
      const resolvedModel = {
        ...remoteModel,                // Start with remote model as base
        name: localModel.name,        // Always prefer local name changes
        description: remoteModel.description !== localModel.description && 
                    remoteModel.description ? 
                    remoteModel.description : 
                    localModel.description
      };
      return resolvedModel;
    }
    
    // For delete operations, always accept local delete
    if (operation === OpType.DELETE) {
      return localModel;
    }
    
    // Default to remote model for other cases
    return remoteModel;
  }
});
```

**How Conflicts Are Handled:**

1. **Detection**: DataStore detects when the same record has been modified both locally and remotely
2. **Custom Logic**: Our conflict handler applies specific merge rules:
   - For updates to Todo items:
     - Always keep the local name changes
     - Use remote description if it exists and differs from local
   - For deletions: Always accept local deletions
   - For other cases: Default to remote changes
3. **Tracking**: The app tracks conflict occurrences via the `conflictCount` in `useAmplifyState`
4. **Logging**: All conflicts are logged to the console with details for debugging

### Other AWS Services Used

- **DynamoDB**: NoSQL database that stores the Todo data
- **IAM**: Manages permissions and access control
- **CloudFormation**: Provisions and manages AWS resources (used by Amplify CLI)
- **Lambda Functions**: While not directly visible in our code, AppSync can use Lambda functions for resolvers

#### AppSync Resolvers and Lambda

In our current implementation, AppSync uses default VTL (Velocity Template Language) resolvers to connect GraphQL operations to DynamoDB. These are not Lambda functions but rather template scripts that AppSync executes.

However, for more complex operations, you can configure AppSync to use Lambda functions as resolvers. This would allow you to:

- Implement complex business logic
- Integrate with other AWS services
- Perform data validation and transformation
- Access multiple data sources in a single operation

To add a Lambda resolver, you would use the Amplify CLI:

```bash
amplify add function
amplify update api # to connect the function as a resolver
```

### Potential Future AWS Integrations

#### Cognito Authentication Example

Here's how you could integrate Amazon Cognito for authentication (this code is for reference only and is commented out):

```typescript
// src/auth-config.ts
// NOTE: This is an example and is NOT currently implemented

import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';

// Configure Amplify with authentication
export const configureAmplifyWithAuth = () => {
  // Add auth configuration to existing config
  const authConfig = {
    ...awsconfig,
    oauth: {
      domain: 'your-cognito-domain.auth.region.amazoncognito.com',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'myapp://callback/',
      redirectSignOut: 'myapp://signout/',
      responseType: 'code'
    }
  };
  
  Amplify.configure(authConfig);
};

// Example auth hook
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check current auth state
    const checkUser = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        setUser(userData);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Listen for auth events
    const listener = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      if (event === 'signIn') {
        checkUser();
      } else if (event === 'signOut') {
        setUser(null);
      }
    });
    
    return () => Hub.remove('auth', listener);
  }, []);
  
  const signIn = () => Auth.federatedSignIn();
  const signOut = () => Auth.signOut();
  
  return { user, loading, signIn, signOut };
};
```

To implement this, you would:

1. Run `amplify add auth` to add Cognito to your project
2. Configure authentication settings as needed
3. Integrate the auth hook into your app
4. Add protected routes based on authentication state

#### Other Potential AWS Integrations

- **S3**: For file storage (e.g., attaching images to todos)
- **CloudWatch**: For monitoring and logging
- **Pinpoint**: For analytics and push notifications
- **API Gateway**: For REST APIs if needed alongside GraphQL

## 🔄 Version Management

This project uses semantic versioning with automated version bumping:

```bash
# Use the Cursor command
/version-bump.cursor

# Or run directly
.cursor/commands/version-bump.sh [patch|minor|major] "Commit message"
```

The version bump script:
- Detects current version from branch name
- Validates commit message is meaningful
- Creates new version branch
- Commits all changes
- Pushes to origin

## 📊 Data Models

### Core Models
- **Task**: Represents user tasks with due dates, status, and activity links
- **Activity**: Defines questionnaire structure with JSON configuration
- **Question**: Individual questions within activities
- **TaskAnswer**: Stores user answers to questions
- **DataPointInstance**: Records data points for analytics and reporting

### Data Flow
1. User creates/views tasks
2. User clicks task to start questionnaire
3. System loads Activity configuration
4. User answers questions across multiple screens
5. Answers saved as TaskAnswer records
6. DataPointInstance records created for analytics
7. Task status updated (OPEN → STARTED → INPROGRESS → COMPLETED)

## Learn More

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Codegen Documentation](https://docs.amplify.aws/cli/graphql/codegen/)
- [DataStore Documentation](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js/)
- [AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
