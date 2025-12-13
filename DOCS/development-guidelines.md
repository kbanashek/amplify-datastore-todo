# Development Guidelines

## Component Development Guidelines

- **🧩 Components should be small and focused** - if a component exceeds ~200 lines, break it down
- **🪝 All business logic lives in custom hooks** - components should only handle rendering
- **🔧 Services handle data operations** - hooks call services, services interact with DataStore

📖 See `.cursor/rules/component-architecture.mdc` for detailed guidelines.

## TypeScript Standards

- ❌ Never use `any` type
- ✅ Use explicit return types for functions
- ✅ Prefer interfaces over type aliases for object shapes
- ✅ Handle null/undefined explicitly

📖 See `.cursor/rules/typescript.mdc` for detailed guidelines.

## Testing Requirements

**⚠️ MANDATORY: All new code must include unit tests**

- ✅ **Create unit tests for ALL hooks, services, components, and stateless functions**
- ✅ **Test files must be created alongside source files** - not as an afterthought
- ✅ **Test coverage requirements:**
  - **Hooks**: Test all return values, state changes, side effects, and edge cases
  - **Services**: Test all public methods, error handling, and data transformations
  - **Components**: Test rendering, user interactions, props handling, and conditional rendering
  - **Utils**: Test all functions with various inputs and edge cases
- ✅ **Use Jest and React Testing Library**
- ✅ **Mock external dependencies** (DataStore, APIs, AsyncStorage, etc.)
- ✅ **Test error states and loading states**
- ✅ **Test edge cases** (empty data, null values, invalid inputs)

**When creating new code:**

1. Create the hook/service/component/function
2. **Immediately create the corresponding test file**
3. Write tests covering the main functionality
4. Ensure tests pass before considering the feature complete

📖 See `.cursor/rules/testing.mdc` for detailed guidelines.

## Code Organization

- **Components**: `src/components/` - UI components organized by feature/category
- **Hooks**: `src/hooks/` - Custom React hooks for business logic
- **Services**: `src/services/` - Data operations and API interactions
- **Types**: `src/types/` - TypeScript type definitions
- **Utils**: `src/utils/` - Utility functions and helpers

## Git Workflow

- Work on feature branches (`feature/description`)
- Commit with meaningful messages
- Follow semantic versioning for releases
- See `.cursor/rules/version-control.mdc` for detailed guidelines
