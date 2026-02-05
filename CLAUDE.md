# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A secured TODO list application built with React Native + Expo. Users must authenticate via local biometrics (Face ID/Touch ID) before performing CRUD operations on todos.

For comprehensive documentation, see:
- [README.md](./README.md) - Project overview and quick start
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide and best practices
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture deep-dive

## Commands

```bash
pnpm start                       # Start Expo dev server
pnpm ios                         # Start iOS simulator
pnpm android                     # Start Android emulator
pnpm lint                        # Run ESLint on app/ and src/
pnpm test                        # Run all tests (Jest)
pnpm test:watch                  # Run tests in watch mode
pnpm test path/to/file.test.ts   # Run single test file
```

## Architecture

### Directory Structure
- `app/` - Expo Router screens (file-based routing)
- `src/features/` - Feature modules (auth, todos) with colocated atoms, components, types, tests
- `src/lib/` - Shared infrastructure (Jotai setup, storage adapters, providers)
- `src/components/` - Reusable UI components

### State Management (Jotai)
- Atoms live in `src/features/**/_atoms/` directories
- `atomWithAsyncStorage` wrapper (`src/lib/jotai/`) persists atoms to AsyncStorage
- Auth state uses SecureStore for sensitive data, AsyncStorage for todos
- Derive state with selectors; avoid duplicating source-of-truth
- Action atoms for imperative updates
- Derived atoms for computed values

### Auth System
- **Session-based**: Authentication grants a time-limited session (5 min default TTL)
- **Auth levels** (`src/features/auth/types.ts`):
  - `TRUSTED` - Low-risk actions, 5 min grace period
  - `SENSITIVE` - Medium-risk actions, 2 min grace period
  - `CRITICAL` - Always requires fresh auth (delete, clear)
- Auth state hydrates from SecureStore on app launch
- `AuthLockScreen` blocks access when session expired/locked
- Uses `expo-local-authentication` for biometric prompts
- **Protected Actions Pattern**: All sensitive operations wrapped with auth checks

### Protected Actions Pattern
```typescript
// In useProtectedTodoActions.ts
const handleDeleteTodo = async (id: string) => {
  await ensureAuthenticated(AuthLevel.CRITICAL)
  deleteTodo(id)
}
```

### Storage Layer
- `AsyncStorage` - General persistence (todos)
- `SecureStore` - Sensitive data (auth timestamps)
- Storage adapters in `src/lib/storage/`
- Versioned storage keys for migrations

### Path Aliases
Use `@/` to import from `src/` (configured in tsconfig.json and babel)

## Coding Standards

### General
- Functional components with hooks only
- Explicit types at feature boundaries (public functions, atoms, storage APIs)
- Types colocated in `src/features/**/types.ts`
- Handle async errors explicitly; fail gracefully in UI
- Use NativeWind (Tailwind CSS) for styling
- Component variants using className composition

### State Management
- Atoms for core state (single source of truth)
- Derived atoms for computed values
- Action atoms for imperative updates
- Async storage integration with `atomWithAsyncStorage`
- Never duplicate state; derive from source atoms

### Component Structure
- Small, focused components
- Container/presentation pattern where appropriate
- Shared UI components in `src/components/`
- Feature components colocated with atoms
- Dark mode support with dark: variants

### Testing
- Tests colocated in `__tests__/` directories
- Unit tests for atoms and pure functions
- Integration tests for component interactions
- Mock auth for component tests
- Clear test descriptions with action/expected format

### Naming Conventions
- Files: `kebab-case.ts` (e.g., `auth-gate.ts`)
- Components: `PascalCase` (e.g., `AuthGate`)
- Atoms: `camelCaseAtom` (e.g., `todosAtom`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `TRUSTED_TTL`)
- Hooks: `useCamelCase` (e.g., `useAuthGate`)

### Security Best Practices
- Always use `ensureAuthenticated()` for sensitive operations
- Map actions to appropriate auth levels
- Validate types at storage boundaries
- Use SecureStore for sensitive data only
- Clear sensitive data when logging out
- Handle auth failures gracefully in UI

## Common Patterns

### Adding a New Feature
1. Create feature directory in `src/features/`
2. Define types in `types.ts`
3. Create atoms in `_atoms/` directory
4. Build components in `components/` directory
5. Use `useProtectedActions` pattern for sensitive ops
6. Write tests in `__tests__/` directory
7. Export public API from `index.ts`

### Adding a Protected Action
```typescript
// In your feature hook
export function useProtectedActions() {
  const ensureAuthenticated = useAuthGate()

  const handleSensitiveAction = async (data: Data) => {
    await ensureAuthenticated(AuthLevel.SENSITIVE)
    // ... perform action
  }

  return { handleSensitiveAction }
}
```

### Working with Atoms
```typescript
// Create atom
const myFeatureAtom = atomWithAsyncStorage('key', initialValue)

// Derived atom
const derivedAtom = atom((get) => compute(get(myFeatureAtom)))

// Action atom
const updateAtom = atom(null, (get, set, update) => {
  set(myFeatureAtom, update(get(myFeatureAtom)))
})
```

### Navigation
- Use Expo Router's file-based routing
- Modals use `presentation: 'modal'` in layout
- Pass params via URL search params
- Type-safe navigation with `useRouter`
