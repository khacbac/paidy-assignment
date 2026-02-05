# Development Guide

This guide covers the development workflow, best practices, and common tasks for working with the Secured TODO List application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Feature Development](#feature-development)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Code Style](#code-style)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** package manager (recommended)
- **iOS Simulator** (macOS) or **Android Emulator**
- **Expo CLI** (installed as dev dependency)
- **Git** for version control

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/khacbac/paidy-assignment.git
   cd paidy-assignment
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Create development build** (required for biometrics)

   ```bash
   # Generate native project files
   pnpm expo prebuild

   # Or use EAS Build for cloud builds
   pnpm eas build --profile development --platform ios
   ```

4. **Run the app**

   ```bash
   # iOS
   pnpm ios

   # Android
   pnpm android
   ```

### Development Server

For quick iteration without native builds:

```bash
pnpm start
```

This starts the Metro bundler. Use the Expo Dev Client to scan the QR code.

## Project Structure

```
paidy-assignment/
├── app/                            # Expo Router screens
│   ├── _layout.tsx                # Root layout with auth
│   ├── index.tsx                  # Main TODO screen
│   ├── settings.tsx              # Settings
│   └── todo-actions.tsx          # Modal for todo CRUD
│
├── src/
│   ├── features/                   # Feature modules
│   │   ├── auth/                   # Authentication
│   │   │   ├── _atoms/            # Auth state atoms
│   │   │   ├── components/        # Auth UI
│   │   │   ├── __tests__/         # Auth tests
│   │   │   ├── types.ts           # Auth types
│   │   │   ├── constants.ts       # Auth constants
│   │   │   ├── authGate.ts        # Auth orchestration
│   │   │   ├── localAuth.ts       # Biometric auth
│   │   │   ├── session.ts         # Session management
│   │   │   └── smartAuth.ts       # Auth calculations
│   │   │
│   │   └── todos/                  # Todos feature
│   │       ├── _atoms/            # Todo atoms
│   │       ├── components/        # Todo components
│   │       ├── __tests__/         # Todo tests
│   │       ├── types.ts           # Todo types
│   │       ├── formatTimestamp.ts # Date formatting
│   │       └── useProtectedTodoActions.ts # Protected ops
│   │
│   ├── lib/                        # Shared infrastructure
│   │   ├── jotai/                  # Jotai setup
│   │   │   └── atomWithAsyncStorage.ts
│   │   ├── storage/                # Storage adapters
│   │   │   ├── async-storage.ts
│   │   │   ├── secure-store.ts
│   │   │   └── todoStorage.ts
│   │   └── utils/                  # Utilities
│   │
│   └── components/                 # Shared UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ...
│
├── .eas/                          # EAS Build configuration
├── assets/                        # Static assets
├── scripts/                       # Build scripts
└── package.json
```

### Key Directories Explained

**`app/`** - Expo Router uses file-based routing. Each file becomes a route:

- `index.tsx` → `/`
- `settings.tsx` → `/settings`
- `todo-actions.tsx` → `/todo-actions` (modal)

**`src/features/`** - Feature-based organization:

- Each feature has its own directory
- Colocated: atoms, components, types, tests
- Clear boundaries between features
- Example: `auth/` and `todos/` are completely separate

**`src/lib/`** - Shared infrastructure:

- Storage adapters
- Jotai configuration
- Utilities that cross feature boundaries

**`src/components/`** - Reusable UI components:

- Shared across features
- No business logic
- Focused on presentation

## Development Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/auth-enhancement

# Work on feature...

# Before committing
pnpm lint              # Check code style
pnpm test              # Run tests

# Commit changes
git add .
git commit -m "feat: add biometric type detection"

# Push and create PR
git push origin feature/auth-enhancement
```

### Daily Development Loop

```bash
# 1. Start dev server
pnpm start

# 2. Run on device/simulator
# iOS: pnpm ios
# Android: pnpm android

# 3. Watch for changes
# Metro bundler auto-reloads

# 4. Test changes
pnpm test

# 5. Lint before commit
pnpm lint
```

### Hot Reloading

The app supports hot reloading for most changes:

- **JS/TS changes** → Instant reload
- **Component changes** → Fast refresh
- **Atom changes** → State preserved
- **Navigation changes** → May require restart
- **Native code** → Requires rebuild

## Feature Development

### Adding a New Feature

1. **Create feature directory**

   ```bash
   mkdir -p src/features/categories
   cd src/features/categories
   ```

2. **Setup feature structure**

   ```bash
   mkdir _atoms components __tests__
   touch types.ts constants.ts index.ts
   ```

3. **Define types** (`types.ts`)

   ```typescript
   export interface Category {
     id: string;
     name: string;
     color: string;
   }

   export type CategoryFilter = "all" | Category["id"];
   ```

4. **Create atoms** (`_atoms/categories.ts`)

   ```typescript
   import { atom } from "jotai";
   import { atomWithAsyncStorage } from "@/lib/jotai/atomWithAsyncStorage";
   import { Category } from "../types";

   // Source of truth
   export const categoriesAtom = atomWithAsyncStorage<Category[]>(
     "categories:v1",
     [],
   );

   // Actions
   export const addCategoryAtom = atom(null, (get, set, category: Category) => {
     const categories = get(categoriesAtom);
     set(categoriesAtom, [...categories, category]);
   });
   ```

5. **Create components** (`components/`)
   - Follow existing patterns
   - Use shared components
   - Implement dark mode

6. **Add protected actions if needed**

   ```typescript
   // In useProtectedCategoryActions.ts
   import { useAuthGate } from "@/features/auth/authGate";
   import { AuthLevel } from "@/features/auth/types";

   export function useProtectedCategoryActions() {
     const ensureAuthenticated = useAuthGate();

     const handleAddCategory = async (category: Category) => {
       await ensureAuthenticated(AuthLevel.SENSITIVE);
       // Add category...
     };

     return { handleAddCategory };
   }
   ```

7. **Write tests** (`__tests__/categories.test.ts`)

   ```typescript
   import { addCategoryAtom, categoriesAtom } from "../_atoms/categories";
   import { Category } from "../types";

   describe("categoriesAtom", () => {
     it("should add category", () => {
       // Test implementation
     });
   });
   ```

### Modifying Existing Features

#### Updating Authentication

**File**: `src/features/auth/constants.ts`

```typescript
// Change session durations
export const TRUSTED_TTL = 5 * 60 * 1000; // 5 minutes
export const SENSITIVE_TTL = 2 * 60 * 1000; // 2 minutes
```

**File**: `src/features/auth/types.ts`

```typescript
// Add new auth level
export enum AuthLevel {
  TRUSTED = "TRUSTED",
  SENSITIVE = "SENSITIVE",
  CRITICAL = "CRITICAL",
  EXTREME = "EXTREME", // New level
}
```

**Update all references**:

- `smartAuth.ts` - Add TTL calculation
- `authGate.ts` - Handle new level
- `useProtectedTodoActions.ts` - Map actions to new level

#### Adding Todo Fields

1. **Update type** (`src/features/todos/types.ts`)

   ```typescript
   export interface Todo {
     id: string;
     title: string;
     completed: boolean;
     createdAtMs: number;
     updatedAtMs: number;
     priority: "low" | "medium" | "high"; // New field
   }
   ```

2. **Update storage** (`src/features/todos/_atoms/todos.ts`)

   ```typescript
   // Update addTodoAtom to include priority
   export const addTodoAtom = atom(
     null,
     (get, set, title: string, priority: Todo["priority"] = "medium") => {
       const todo: Todo = {
         id: generateId(),
         title,
         priority, // Include in creation
         // ... other fields
       };
       set(todosAtom, [...get(todosAtom), todo]);
     },
   );
   ```

3. **Migrate existing data** (`src/lib/storage/todoStorage.ts`)

   ```typescript
   // Add migration logic for existing todos without priority
   export async function getTodos(): Promise<Todo[]> {
     const data = await asyncStorage.getItem(STORAGE_KEY);
     if (!data) return [];

     const todos = JSON.parse(data);

     // Migration: Add priority to old todos
     return todos.map((todo) => ({
       ...todo,
       priority: todo.priority || "medium", // Default value
     }));
   }
   ```

4. **Update UI components**
   - Add priority picker in AddTodoForm
   - Show priority indicator in TodoItem
   - Filter by priority in TodoFilters

## Testing

### Test Structure

Tests are colocated with implementation:

```
src/features/auth/
├── __tests__/
│   └── auth.test.ts      # Auth tests
├── authGate.ts
└── session.ts
```

### Writing Tests

#### Testing Atoms

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useAtom } from "jotai";
import { todosAtom, addTodoAtom } from "../_atoms/todos";

describe("todosAtom", () => {
  it("should initialize with empty array", () => {
    const { result } = renderHook(() => useAtom(todosAtom));
    expect(result.current[0]).toEqual([]);
  });

  it("should add todo", () => {
    const { result } = renderHook(() => {
      const [todos] = useAtom(todosAtom);
      const [, addTodo] = useAtom(addTodoAtom);
      return { todos, addTodo };
    });

    act(() => {
      result.current.addTodo("Test todo");
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Test todo");
  });
});
```

#### Testing Components

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { AddTodoForm } from '../components/AddTodoForm'

describe('AddTodoForm', () => {
  it('should add todo on submit', async () => {
    const onAddTodo = jest.fn()
    const { getByPlaceholderText, getByText } = render(
      <AddTodoForm onAddTodo={onAddTodo} />
    )

    const input = getByPlaceholderText('Add a new todo...')
    fireEvent.changeText(input, 'Test todo')

    const button = getByText('Add')
    fireEvent.press(button)

    await waitFor(() => {
      expect(onAddTodo).toHaveBeenCalledWith('Test todo')
    })
  })
})
```

#### Testing Authentication

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { useAuthGate } from "../authGate";
import * as localAuth from "../localAuth";

jest.mock("../localAuth");

describe("useAuthGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate when session expired", async () => {
    const mockAuthenticate = jest.spyOn(localAuth, "authenticateAsync");
    mockAuthenticate.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuthGate());

    const auth = await result.current(AuthLevel.CRITICAL);

    expect(auth.success).toBe(true);
    expect(mockAuthenticate).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Single file
pnpm test todos.test.ts

# With coverage
pnpm test --coverage

# Update snapshots
pnpm test --updateSnapshot
```

### Test Utilities

**Mock Auth**:

```typescript
// __mocks__/@/features/auth/authGate.ts
export const mockAuthGate = {
  ensureAuthenticated: jest.fn().mockResolvedValue({ success: true }),
};

export const useAuthGate = () => mockAuthGate.ensureAuthenticated;
```

**Mock Storage**:

```typescript
// In test setup
jest.mock("@/lib/storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

## Debugging

### React Native Debugger

1. **Chrome DevTools**

   ```bash
   # In simulator, press Cmd+D (iOS) or Cmd+M (Android)
   # Select "Debug"
   ```

2. **React DevTools**

   ```bash
   # Install standalone React DevTools
   npm install -g react-devtools

   # Run
   react-devtools
   ```

3. **Flipper**
   - Install Flipper desktop app
   - Connect device/simulator
   - Provides network, logs, and layout inspection

### Common Issues

#### Auth Not Working

- **Check biometric availability**

  ```typescript
  import { isEnrolledAsync } from "expo-local-authentication";
  const enrolled = await isEnrolledAsync();
  ```

- **Verify SecureStore access**

  ```typescript
  import * as SecureStore from "expo-secure-store";
  await SecureStore.setItemAsync("test", "value");
  const value = await SecureStore.getItemAsync("test");
  ```

- **Check auth state**:
  - Console log `authStateAtom` value
  - Verify timestamps in SecureStore
  - Check session calculation

#### State Not Persisting

- **Verify AsyncStorage**

  ```typescript
  import AsyncStorage from "@react-native-async-storage/async-storage";
  await AsyncStorage.setItem("test", "value");
  const value = await AsyncStorage.getItem("test");
  ```

- **Check atom configuration**
  - Verify storage key is unique
  - Check `atomWithAsyncStorage` wrapper
  - Ensure `unwrap` for async atoms

- **Debug storage operations**
  ```typescript
  // Add logs to storage adapters
  console.log("[Storage] Getting item:", key);
  console.log("[Storage] Setting item:", key, value);
  ```

#### Navigation Issues

- **Clear navigation state**

  ```bash
  # In simulator, shake gesture
  # Select "Clear storage and refresh"
  ```

- **Check route params**

  ```typescript
  // In component
  const { params } = useLocalSearchParams();
  console.log("Route params:", params);
  ```

- **Verify modal configuration**
  - Check `presentation: 'modal'` in layout
  - Ensure proper screen stacking

### Logging

**Enable detailed logs**:

```typescript
// In development
if (__DEV__) {
  console.log = (...args) => {
    global.console.log("[DEV]", ...args);
  };
}
```

**Log auth flow**:

```typescript
// In authGate.ts
console.log("[Auth] Checking session for level:", level);
console.log("[Auth] Session valid:", isValid);
console.log("[Auth] Auth result:", result);
```

### Performance Debugging

**Slow list rendering**:

```typescript
// Use FlashList instead of FlatList
import { FlashList } from '@shopify/flash-list'

// Add getItemLayout for FlatList
getItemLayout={(data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index
})}
```

**Re-render issues**:

```typescript
// Use React DevTools Profiler
// Wrap with React.memo
export const TodoItem = React.memo(({ todo, onToggle }) => {
  // Component
});
```

**Storage performance**:

```typescript
// Batch storage operations
const operations = [
  ["todos:v1", JSON.stringify(todos)],
  ["lastSync", Date.now().toString()],
];
await AsyncStorage.multiSet(operations);
```

## Code Style

### TypeScript Guidelines

**Use explicit types**:```typescript
// ✅ Good
interface Todo {
id: string
title: string
}

// ❌ Avoid
const todo = {
id: '123',
title: 'Test'
} // Implicit type

````

**Prefer interfaces over types for objects**:
```typescript
// ✅ Good
interface User {
  name: string
  email: string
}

// For unions, use type
type Status = 'active' | 'inactive'
````

**Use enum for auth levels**:

```typescript
// ✅ Good
export enum AuthLevel {
  TRUSTED = "TRUSTED",
  SENSITIVE = "SENSITIVE",
}
```

**Avoid any**:

```typescript
// ✅ Good
function process(data: unknown) {
  if (isValid(data)) {
    // Type-safe processing
  }
}

// ❌ Avoid
function process(data: any) {
  // No type safety
}
```

### React Patterns

**Functional components with hooks**:

```typescript
// ✅ Good
export function TodoList() {
  const [todos] = useAtom(todosAtom);
  // ...
}

// ❌ Avoid class components
class TodoList extends React.Component {
  // ...
}
```

**Custom hooks for logic**:

```typescript
// ✅ Good
export function useProtectedTodoActions() {
  const ensureAuthenticated = useAuthGate();
  // Hook logic
}

// Use in component
const { handleAddTodo } = useProtectedTodoActions();
```

**Memoize expensive computations**:

```typescript
// ✅ Good
const filteredTodos = useMemo(() => {
  return todos.filter((t) => t.completed === filter);
}, [todos, filter]);
```

**Avoid inline functions in JSX**:

```typescript
// ✅ Good
const handlePress = useCallback(() => {
  onToggle(id)
}, [id, onToggle])

<TouchableOpacity onPress={handlePress} />

// ❌ Avoid
<TouchableOpacity onPress={() => onToggle(id)} />
```

### Jotai Patterns

**Organize atoms by feature**:

```typescript
// ✅ In src/features/todos/_atoms/todos.ts
export const todosAtom = atom<Todo[]>([]);
export const addTodoAtom = atom(null, (get, set, todo) => {
  set(todosAtom, [...get(todosAtom), todo]);
});
```

**Use derived atoms for computed state**:

```typescript
// ✅ Good
export const todosCountAtom = atom((get) => get(todosAtom).length);
export const activeTodosAtom = atom((get) =>
  get(todosAtom).filter((t) => !t.completed),
);
```

**Action atoms for updates**:

```typescript
// ✅ Good
export const toggleTodoAtom = atom(null, (get, set, id: string) => {
  const todos = get(todosAtom);
  set(
    todosAtom,
    todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
  );
});
```

**Async atoms for side effects**:

```typescript
// ✅ Good
export const loadTodosAtom = atom(async (get) => {
  const todos = await todoStorage.getTodos();
  return todos;
});
```

### Styling Patterns

**Use StyleSheet with theme-aware variants**:

```typescript
// ✅ Good
const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700" },
  titleLight: { color: "#171717" },
  titleDark: { color: "#f5f5f5" },
});

<Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]} />
```

**Dark mode support**:

```typescript
// ✅ Good
<View style={isDark ? styles.containerDark : styles.containerLight}>
  <Text style={isDark ? styles.textDark : styles.textLight}>Content</Text>
</View>
```

**Extract component variants**:

```typescript
// ✅ Good
const buttonVariants = {
  primary: {
    container: styles.primaryContainer,
    text: styles.primaryText,
  },
  secondary: {
    container: styles.secondaryContainer,
    text: styles.secondaryText,
  },
};
```

### Error Handling

**Handle errors explicitly**:

```typescript
// ✅ Good
try {
  const result = await authenticateAsync();
  if (!result.success) {
    throw new Error("Authentication failed");
  }
  return result;
} catch (error) {
  console.error("Auth error:", error);
  throw new Error("Unable to authenticate");
}
```

**Typed errors**:

```typescript
// ✅ Good
interface AuthError {
  code: string;
  message: string;
}

function isAuthError(error: unknown): error is AuthError {
  return typeof error === "object" && error !== null && "code" in error;
}
```

**Graceful degradation**:

```typescript
// ✅ Good
const handleAction = async () => {
  try {
    await protectedAction();
  } catch (error) {
    // Show user-friendly message
    setError("Unable to complete action. Please try again.");
    // Log for debugging
    console.error("Action failed:", error);
  }
};
```

### Naming Conventions

**Files**: `kebab-case.ts`

```
auth-gate.ts
todo-item.tsx
use-protected-actions.ts
```

**Components**: `PascalCase`

```typescript
export function TodoItem() {}
export class AuthError {}
```

**Functions**: `camelCase`

```typescript
function ensureAuthenticated() {}
const handlePress = () => {};
```

**Constants**: `UPPER_SNAKE_CASE`

```typescript
export const TRUSTED_TTL = 5 * 60 * 1000;
export const STORAGE_KEY = "todos:v1";
```

**Types**: `PascalCase`

```typescript
type TodoStatus = "active" | "completed";
interface UserProfile {}
enum AuthLevel {}
```

**Hooks**: `useCamelCase`

```typescript
function useAuthGate() {}
function useProtectedTodoActions() {}
```

## Common Tasks

### Adding a New Component

```bash
# Create component file
touch src/components/Card.tsx
```

**Component template**:

```typescript
import { View, Text } from 'react-native'
import { cn } from '@/lib/utils' // If you have cn utility

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <View className={cn('rounded-lg bg-white dark:bg-gray-800', className)}>
      {title && (
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </Text>
      )}
      {children}
    </View>
  )
}
```

### Adding a New Screen

1. **Create screen file**:

   ```bash
   touch app/analytics.tsx
   ```

2. **Basic structure**:

   ```typescript
   import { View, Text } from 'react-native'
   import { Stack } from 'expo-router'

   export default function AnalyticsScreen() {
     return (
       <>
         <Stack.Screen options={{ title: 'Analytics' }} />
         <View className="flex-1 bg-white dark:bg-gray-900">
           <Text className="text-gray-900 dark:text-white">
             Analytics content
           </Text>
         </View>
       </>
     )
   }
   ```

3. **Add navigation link**:

   ```typescript
   // In parent screen
   import { Link } from 'expo-router'

   <Link href="/analytics">View Analytics</Link>
   ```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update expo-router

# Check for outdated packages
pnpm outdated

# Install new package
pnpm add @react-navigation/drawer
pnpm add -D @types/new-package
```

**After updating**:

1. Check for breaking changes
2. Update code if needed
3. Run tests
4. Test on device/simulator
5. Commit with message: `chore: update expo-router to v3`

### Debugging Storage

**Read AsyncStorage**:

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

// Read all keys
const keys = await AsyncStorage.getAllKeys();
console.log("Keys:", keys);

// Read specific key
const todos = await AsyncStorage.getItem("todos:v1");
console.log("Todos:", JSON.parse(todos || "[]"));
```

**Read SecureStore**:

```typescript
import * as SecureStore from "expo-secure-store";

const lastAuth = await SecureStore.getItemAsync("lastTrustedAuth");
console.log("Last auth:", new Date(parseInt(lastAuth || "0")));
```

**Clear all data**:

```bash
# In simulator, shake gesture
# Select "Clear storage and refresh"
```

### Releasing a New Version

1. **Update version**:

   ```bash
   # Update package.json
   npm version patch  # or minor/major
   ```

2. **Update app.json**:

   ```json
   {
     "expo": {
       "version": "1.0.1",
       "ios": {
         "buildNumber": "1.0.1"
       },
       "android": {
         "versionCode": 2
       }
     }
   }
   ```

3. **Build production**:

   ```bash
   # iOS
   pnpm eas build --platform ios --profile production

   # Android
   pnpm eas build --platform android --profile production
   ```

4. **Submit to stores**:

   ```bash
   # iOS App Store
   pnpm eas submit --platform ios

   # Android Play Store
   pnpm eas submit --platform android
   ```

## Troubleshooting

### Common Issues

#### "Development build required"

**Error**: `expo-local-authentication` not available in Expo Go

**Solution**:

```bash
# Create development build
pnpm expo prebuild
pnpm expo run:ios  # or android

# Or use EAS Build
pnpm eas build --profile development --platform ios
```

#### Auth not prompting

**Check biometric enrollment**:

```typescript
import { isEnrolledAsync } from "expo-local-authentication";

const enrolled = await isEnrolledAsync();
if (!enrolled) {
  Alert.alert("Please enroll biometrics in device settings");
}
```

**Check permissions**:

- iOS: `Info.plist` should have `NSFaceIDUsageDescription`
- Android: Should request biometrics permission

#### State not updating

**Check atom updates**:

```typescript
// Verify atom is updating
const [todos, setTodos] = useAtom(todosAtom);
console.log("Todos before:", todos);
setTodos([...todos, newTodo]);
console.log("Todos after:", todos);
```

**Check component re-rendering**:

```typescript
console.log("Component render");
// Should log on each state change
```

#### Storage errors

**SecureStore not available**:

```typescript
// Some Android devices don't support SecureStore
// Check availability first
import * as SecureStore from "expo-secure-store";

const isAvailable = await SecureStore.isAvailableAsync();
if (!isAvailable) {
  // Fallback to AsyncStorage with encryption
}
```

**AsyncStorage full**:

- Check storage limits (6MB on Android)
- Remove old data
- Compress stored data

### Getting Help

1. **Check logs**: Metro bundler, device logs, console
2. **Search issues**: GitHub issues, Expo forums
3. **Create minimal reproduction**: Isolate the issue
4. **Ask in Discord**: Expo community, Jotai community
5. **Open issue**: With detailed description and reproduction

### Performance Issues

**Slow startup**:

- Check bundle size: `pnpm expo export`
- Analyze dependencies with `pnpm why <package>`
- Remove unused dependencies
- Enable Hermes: `expo.jsEngine: 'hermes'`

**List performance**:

- Use `getItemLayout` in FlatList
- Implement windowing with `FlashList`
- Reduce re-renders with `React.memo`

**Storage performance**:

- Batch operations with `multiGet`/`multiSet`
- Compress large data
- Use pagination for large lists

### Environment Issues

**Node modules cache**:

```bash
# Clear cache
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Metro cache**:

```bash
pnpm start --clear
```

**iOS build cache**:

```bash
cd ios
rm -rf build
rm -rf Pods
pod install
cd ..
```

**Android build cache**:

```bash
cd android
./gradlew clean
cd ..
```

## Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Jotai Documentation](https://jotai.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)

### Community

- [Expo Discord](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://reactnative.dev/community)
- [Jotai Community](https://github.com/pmndrs/jotai/discussions)

### Tools

- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

### Example Apps

- [Expo Examples](https://github.com/expo/examples)
- [Jotai Examples](https://github.com/pmndrs/jotai/tree/main/examples)
- [Expo Router Examples](https://github.com/expo/router/tree/main/apps)

---

This guide should cover most development scenarios. For questions not addressed here, please check the [Architecture Documentation](./ARCHITECTURE.md) for technical details or create an issue in the repository.
