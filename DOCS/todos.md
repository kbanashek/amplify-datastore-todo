# Project Todos

This file tracks todos and future work items for the project.

## Backend/Infrastructure

- [ ] Remove Todo model from AWS Amplify backend (GraphQL schema, API, etc.)
  - Currently Todo model still exists in `amplify/backend/api/lxtodoapp/schema.graphql`
  - Need to remove from schema and run `amplify push` to update backend
  - This will also require removing Todo types from generated GraphQL files (`src/API.ts`, `src/graphql/*.ts`)

## Code Cleanup

- [x] Remove Todo components, hooks, and services from frontend codebase
  - Removed: `TodoForm.tsx`, `TodoList.tsx`, `useTodoForm.ts`, `useTodoList.ts`, `TodoService.ts`
  - Removed: Todo test files
  - Removed: Todo references from `ConflictResolution.ts` and `models/index.js`
  - Note: GraphQL files still contain Todo types (will be removed when backend is updated)

## Testing

- [ ] Update test mocks to remove Todo model references
  - Check `jest.setup.js` for Todo mocks
  - Update any test files that reference Todo

## Documentation

- [x] Update README.md to remove Todo references
- [x] Update any other documentation that mentions Todo functionality
- [x] Update README.md with new reactive hooks pattern (useTaskUpdate, useTaskAnswer, useDataPointInstance, useActivity)
- [x] Document reactive data management architecture

---

## How to Use This File

- Add new todos using the format: `- [ ] Description of task`
- Mark completed todos with: `- [x] Completed task`
- Group related todos under descriptive headings
- Add notes or context as needed below each todo item
- Reference specific files or code sections when relevant
