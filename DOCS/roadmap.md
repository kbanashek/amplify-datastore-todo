# Development Roadmap

## 🔴 High Priority

### 1. Rule Engine Implementation

- 📋 **Status**: Planned (see [todos.md](todos.md))
- 🎯 **Goal**: Parse and evaluate rules from JSON fields
- 🛠️ **Approach**: Consider using [json-rules-engine](https://github.com/cachecontrol/json-rules-engine)
- 📝 **Tasks**:
  - Implement rule parsing and evaluation
  - Process rule actions (e.g., START_TIMED_TASK)
  - Handle triggers (ON_TASK_COMPLETION, ON_TASK_START, ON_ANSWER_VALUE)

### 2. Time-Based Validation

- 📋 **Status**: Fields exist, validation needed
- 🎯 **Goal**: Enforce completion and visibility rules
- 📝 **Tasks**:
  - Enforce `showBeforeStart` for task visibility
  - Validate `allowEarlyCompletion` and `allowLateCompletion`
  - Enforce `allowLateEdits` for post-completion editing

### 3. Anchor-Based Rescheduling

- 📋 **Status**: Relationships stored, rescheduling needed
- 🎯 **Goal**: Automatically reschedule tasks when appointments change
- 📝 **Tasks**:
  - Monitor appointment date changes
  - Find linked tasks via anchors
  - Recalculate and update task dates

## 🟡 Medium Priority

### 4. Enhanced Task Filtering

- Filter expired tasks
- Filter based on time windows
- Filter based on completion rules

### 5. Rule Engine UI

- Show rule status indicators
- Display expiration countdowns
- Show completion windows

### 6. Testing & Documentation

- Expand unit test coverage
- Add integration tests
- Update API documentation

### 7. Component Library Expansion

See [component-library.md](component-library.md) for detailed component roadmap.

## 🟢 Future Enhancements

- Advanced analytics and reporting
- Enhanced offline capabilities
- Performance optimizations
- Additional question types
- Customizable themes
- Advanced notification system
