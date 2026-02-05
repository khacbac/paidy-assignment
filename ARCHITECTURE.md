# Architecture Documentation

## Overview

The Secured TODO List is a React Native + Expo application that implements a sophisticated authentication system requiring biometric verification for sensitive operations. The app demonstrates enterprise-grade architecture with security-first design, modular feature organization, and robust state management.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐│
│  │  Screens  │  │Components │  │ Navigation│  │  Modals ││
│  │  (app/)   │  │(components)│  │(Expo Router)│ │         ││
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬──────┘│
└────────┼──────────────┼──────────────┼─────────────┼───────┘
         │              │              │             │
┌────────┼──────────────┼──────────────┼─────────────┼───────┐
│        │              │              │             │       │
│  ┌─────▼──────┐  ┌────▼─────┐  ┌────▼─────┐  ┌───▼────┐  │
│  │   Auth     │  │  Todos   │  │  Shared  │  │ Jotai  │  │
│  │  Feature   │  │  Feature │  │  Utils   │  │ Atoms  │  │
│  └─────┬──────┘  └────┬─────┘  └────┬─────┘  └────┬───┘  │
└────────┼──────────────┼──────────────┼─────────────┼───────┘
         │              │              │             │
┌────────▼──────────────▼──────────────▼─────────────▼───────┐
│              Storage & Persistence Layer                     │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  SecureStore     │  │  AsyncStorage    │                │
│  │  (Sensitive)     │  │  (General Data)  │                │
│  └─────────┬────────┘  └─────────┬────────┘                │
│            │                     │                          │
│  ┌─────────▼────────┐  ┌────────▼────────┐                │
│  │  Auth Timestamps │  │     Todos       │                │
│  └──────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Core Features

### 1. Authentication System

The authentication system is session-based with three security tiers, providing graduated security based on operation risk.

#### Security Levels

| Level | Grace Period | Use Cases | Examples |
|-------|--------------|-----------|----------|
| **TRUSTED** | 5 minutes | Low-risk actions | Toggle todo completion |
| **SENSITIVE** | 2 minutes | Medium-risk actions | Add new todo, duplicate todo |
| **CRITICAL** | Always required | High-risk actions | Delete todo, clear completed |

#### Authentication Flow

```
User Action
    ↓
Calculate Auth Requirement
    ↓
┌─────────────────────────┐
│ Session Valid?          │
│  ├─ Yes → Proceed      │
│  └─ No → Authenticate   │
└─────────────────────────┘
    ↓
Biometric Prompt
    ↓
┌─────────────────────────┐
│ Authentication Success? │
│  ├─ Yes → Update        │
│  │       Session         │
│  └─ No → Show Error     │
└─────────────────────────┘
    ↓
Execute Protected Action
```

#### Key Components

**Session Management** (`src/features/auth/session.ts`)
- `isSessionValid()` - Validates session against timestamp
- `isSessionValidForLevel()` - Level-specific validation
- Calculates remaining time based on auth level

**Smart Authentication** (`src/features/auth/smartAuth.ts`)
- `calculateAuthRequirement()` - Determines if re-auth needed
- `useSmartAuth()` - Hook for auth calculations
- Configurable TTL per security level

**Local Authentication** (`src/features/auth/localAuth.ts`)
- Wraps `expo-local-authentication`
- Platform-specific error handling
- Hardware capability detection

**Secure Storage** (`src/features/auth/secureAuthStorage.ts`)
- Timestamp storage in SecureStore
- Integer-based storage for cross-platform compatibility
- Keys: `lastTrustedAuth`, `lastSensitiveAuth`

**Auth Gate** (`src/features/auth/authGate.ts`)
- `ensureAuthenticated()` - Main auth orchestration
- Prevents concurrent authentication attempts
- Returns authentication result with metadata

**Jotai Integration** (`src/features/auth/_atoms/auth.ts`)
```typescript
// Core atoms
authStateAtom          // Current authentication state
authHydratedAtom       // Persistence hydration status

// Actions
refreshAuthAtom        // Load from SecureStore
lockAuthAtom          // Lock the app
unlockAuthAtom        // Unlock with biometrics
```

### 2. State Management (Jotai)

The application uses Jotai atomic state management with async persistence.

#### Atom Organization

```
src/features/
├── auth/
│   └── _atoms/
│       └── auth.ts           // Auth state atoms
└── todos/
    └── _atoms/
        └── todos.ts          // Todo list atoms
```

#### Todo Atoms Structure

**Core State** (`src/features/todos/_atoms/todos.ts`)
```typescript
// Source of truth
todosAtom = atomWithAsyncStorage<Todo[]>("todos:v1", [])

// Derived read-only atoms
todosCountAtom         // Total count
activeTodosCountAtom   // Active count
completedTodosCountAtom // Completed count

// Action atoms (imperative updates)
addTodoAtom           // Create todo
updateTodoAtom        // Edit todo
deleteTodoAtom        // Delete todo
toggleTodoAtom        // Toggle completion
duplicateTodoAtom     // Clone todo
clearCompletedAtom    // Bulk delete completed
```

**Filtered Atoms**
```typescript
filteredTodosAtom     // Filter by status (all/active/completed)
limitedTodosAtom      // Filter + limit (optimization)
```

#### Persistence Layer

**AsyncStorage Wrapper** (`src/lib/jotai/atomWithAsyncStorage.ts`)
```typescript
function atomWithAsyncStorage<T>(key, initialValue)
  └─> Uses Jotai's atomWithStorage with custom JSON storage
  └─> Handles async loading with 'unwrap'
  └─> Integrates with storage adapters
```

**Storage Adapters** (`src/lib/storage/`)
```typescript
async-storage.ts      // AsyncStorage wrapper
secure-store.ts       // SecureStore wrapper
todoStorage.ts        // Todo-specific persistence
```

### 3. Data Models

#### Todo Model

```typescript
interface Todo {
  id: string              // UUID
  title: string           // Todo text
  createdAtMs: number     // Creation timestamp
  updatedAtMs: number     // Last update timestamp
  completed: boolean      // Completion status
}
```

**Data Flow**:
```
User Input
    ↓
Component State
    ↓
Protected Action Hook
    ↓
Authentication Gate
    ↓
Jotai Action Atom
    ↓
Update todosAtom
    ↓
Persist to AsyncStorage
    ↓
UI Re-renders
```

### 4. Navigation Architecture

#### Expo Router Structure

```
app/                    // File-based routing
├── _layout.tsx        // Root layout with auth
├── index.tsx          // Main TODO screen
├── all-todos.tsx      // Full list view
├── settings.tsx       // Settings screen
└── todo-actions.tsx   // Modal for CRUD
```

**Root Layout** (`app/_layout.tsx`)
- Auth state initialization
- Auth lock screen overlay
- Stack navigator configuration
- Dark mode configuration
- Global error boundaries

**Navigation Flow**:
```
Main Screen (index)
    ├─ Limited todo list (5 items)
    ├─ "Show All" → all-todos.tsx
    └─ Add Todo → Protected action

Todo Item (swipe)
    └─ Edit/Delete → todo-actions.tsx (modal)

All Todos Screen
    └─ Complete list with filters
```

### 5. Component Architecture

#### Component Hierarchy

```
Screen Components (app/)
    └─ Layout Components
        └─ Feature Components (src/features/)
            └─ Shared UI Components (src/components/)
```

#### Todo Feature Components

**TodoList.tsx** - Container component
- FlatList with optimized rendering
- Empty state handling
- Pull-to-refresh placeholder

**SwipeableTodoItem.tsx** - Gesture wrapper
- Swipe actions (iOS style)
- Navigation-aware routing
- Long-press fallback

**TodoItemDisplay.tsx** - Read-only display
- Checkbox for completion
- Timestamp display
- Press interaction

**AddTodoForm.tsx** - Input component
- TextInput with validation
- Submit handling
- Loading states

**TodoFilters.tsx** - Filter UI
- Segmented control
- Active/completed counts

#### Shared Components (`src/components/`)

- **Button.tsx** - Reusable button variants
- **Input.tsx** - Consistent text input
- Additional shared UI primitives

### 6. Protected Actions Pattern

#### Action Protection Flow

```typescript
// Before: Direct state update
const handleDelete = () => {
  deleteTodo(id)  // ❌ No auth check
}

// After: Protected action
const { handleDeleteTodo } = useProtectedTodoActions()

const handleDelete = () => {
  handleDeleteTodo(id)  // ✅ Auth checked automatically
}
```

**Implementation** (`src/features/todos/useProtectedTodoActions.ts`)
```typescript
function useProtectedTodoActions() {
  // Auth integration
  const ensureAuthenticated = useAuthGate()

  // Generic protection wrapper
  const runProtectedAction = async (
    level: AuthLevel,
    action: () => Promise<void>
  ) => {
    const auth = await ensureAuthenticated(level)
    if (auth.success) {
      await action()
    }
  }

  // Action-specific wrappers
  const handleAddTodo = (title: string) =>
    runProtectedAction(AuthLevel.SENSITIVE, () => addTodo(title))

  const handleDeleteTodo = (id: string) =>
    runProtectedAction(AuthLevel.CRITICAL, () => deleteTodo(id))

  // ... other actions
}
```

#### Auth Level Mapping

| Action         | Auth Level | Session TTL | Rationale                          |
|----------------|-----------|-------------|------------------------------------|
| Toggle todo    | TRUSTED   | 5 min       | Low risk, frequent operation       |
| Add todo       | SENSITIVE | 2 min       | Medium risk, data creation         |
| Update todo    | SENSITIVE | 2 min       | Medium risk, data modification     |
| Duplicate todo | SENSITIVE | 2 min       | Medium risk, bulk creation         |
| Delete todo    | CRITICAL  | 0 (always)  | High risk, data loss possible      |
| Clear completed| CRITICAL  | 0 (always)  | High risk, bulk deletion           |

## Security Architecture

### Data Protection

| Data Type         | Storage          | Encryption | Access Control          |
|-------------------|------------------|------------|-------------------------|
| Auth timestamps   | SecureStore      | Hardware   | App-level only          |
| Todo items        | AsyncStorage     | OS-level   | App-level, no sandbox   |
| Session state     | Jotai (memory)   | N/A        | Component-scoped        |

### Threat Mitigation

1. **Session Hijacking**
   - Automatic lock on app background
   - Timestamp validation prevents replay
   - Grace periods minimize re-auth friction

2. **Tampering**
   - SecureStore for sensitive data
   - No sensitive data in AsyncStorage
   - Type validation for stored data

3. **Unauthorized Access**
   - Biometric requirement for sensitive ops
   - App-level authentication gate
   - UI blocks when unauthenticated

## Performance Considerations

### Optimizations Implemented

1. **Limited Todos Display**
   - Main screen shows only 5 todos
   - "Show All" navigates to full list
   - Reduces initial render time

2. **Filtered Atoms**
   - Pre-computed filtered lists
   - Avoids filtering on every render
   - O(1) lookup for filtered views

3. **Memoized Components**
   - React.memo for list items
   - Prevents unnecessary re-renders
   - FlatList optimization

4. **Async Storage**
   - JSON serialization for todos
   - Versioned storage keys
   - Migration support

5. **Lazy Hydration**
   - Atoms load async on demand
   - Unwrap pattern for loading states
   - No blocking startup

### Bundle Size Optimization

- **Feature-based code splitting** - Natural with features/
- **Expo Router** - Automatic route-based splitting
- **Jotai** - Tree-shakable state management
- **NativeWind** - PurgeCSS for styles

## Testing Strategy

### Test Organization

```
src/features/
├── auth/
│   └── __tests__/
│       └── auth.test.ts      # Auth logic tests
└── todos/
    └── __tests__/
        └── todos.test.ts     # Todo logic tests
```

### Test Focus Areas

1. **Authentication Logic**
   - Session calculation
   - Auth requirement determination
   - Timestamp validation

2. **Storage Layer**
   - Persistence operations
   - Migration paths
   - Type validation

3. **State Management**
   - Atom updates
   - Derived values
   - Async operations

4. **Component Integration**
   - Protected actions
   - Auth UI flows
   - Error handling

### Running Tests

```bash
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test path/to/file.test.ts  # Single file
```

## Development Patterns

### Feature Module Structure

```
src/features/[feature]/
├── _atoms/             # Jotai atoms
├── components/         # Feature components
├── __tests__/          # Feature tests
├── types.ts            # Feature types
├── constants.ts        # Feature constants
└── hooks.ts            # Feature hooks
```

### Component Guidelines

1. **Small, focused components**
   - Single responsibility
   - Composable architecture
   - Reusable when possible

2. **Type safety**
   - Explicit prop types
   - Feature boundary types
   - Runtime validation

3. **Accessibility**
   - `accessibilityLabel` props
   - Semantic elements
   - Screen reader support

4. **Styling**
   - NativeWind (Tailwind CSS)
   - Consistent patterns
   - Dark mode support

### State Management Guidelines

1. **Atoms for state**
   - Single source of truth
   - At feature module level
   - Async persistence when needed

2. **Derived atoms for computed values**
   - Avoid duplicating state
   - Memoized automatically
   - Compose derived atoms

3. **Action atoms for mutations**
   - Imperative updates
   - Async operations
   - Error handling

## Dependencies

### Core Framework

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based routing

### State Management

- **Jotai** - Atomic state management
- **jotai-optics** - Optics integration (unused)

### Authentication

- **expo-local-authentication** - Biometric auth
- **expo-secure-store** - Secure storage

### Storage

- **@react-native-async-storage/async-storage** - General storage

### UI & Styling

- **NativeWind** - Tailwind CSS for RN
- **react-native-reanimated** - Animations
- **react-native-gesture-handler** - Gestures

### Development

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Jest** - Testing framework

## Build & Deployment

### Development Build

```bash
# Required for biometrics
pnpm expo prebuild

# Run platform
pnpm expo run:ios
pnpm expo run:android
```

### scripts (package.json)

```bash
pnpm start       # Expo dev server
pnpm ios         # iOS simulator
pnpm android     # Android emulator
pnpm lint        # ESLint
pnpm test        # Jest tests
pnpm test:watch  # Watch mode
```

## Future Enhancements

### Potential Improvements

1. **Biometric Type Detection**
   - Show Face ID/Touch ID specific UI
   - Adaptive auth prompts

2. **Session Extension**
   - Session refresh on active use
   - Configurable extension rules

3. **Advanced Analytics**
   - Auth attempt tracking
   - Performance metrics
   - Usage patterns

4. **Cloud Sync**
   - Encrypted cloud backup
   - Multi-device sync
   - Conflict resolution

5. **Enhanced Security**
   - PIN fallback option
   - Timeout configurations
   - Security audit logging

6. **UI/UX Improvements**
   - Custom biometric UI
   - Haptic feedback refinement
   - Animation enhancements

## Conclusion

This architecture demonstrates a security-first approach to mobile app development, with sophisticated authentication, clean separation of concerns, and robust state management. The feature-based organization and comprehensive auth system make it suitable for applications with stringent security requirements.

The modular design allows for easy extension of features, while the Jotai integration provides performant state management with built-in persistence. The authentication system is particularly noteworthy for its graduated security levels and seamless user experience.
