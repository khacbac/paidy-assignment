# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A secured TODO list application built with React Native + Expo. Users must authenticate via local biometrics (Face ID/Touch ID) before performing CRUD operations on todos.

## Commands

```bash
npm start           # Start Expo dev server
npm run ios         # Start iOS simulator
npm run android     # Start Android emulator
npm run lint        # Run ESLint on app/ and src/
npm test            # Run all tests (Jest)
npm run test:watch  # Run tests in watch mode
npm test -- path/to/file.test.ts  # Run single test file
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

### Auth System
- **Session-based**: Authentication grants a time-limited session (5 min default TTL)
- **Auth levels** (`src/features/auth/types.ts`):
  - `TRUSTED` - Low-risk actions, 5 min grace period
  - `SENSITIVE` - Medium-risk actions, 2 min grace period
  - `CRITICAL` - Always requires fresh auth (delete, clear)
- Auth state hydrates from SecureStore on app launch
- `AuthLockScreen` blocks access when session expired/locked
- Uses `expo-local-authentication` for biometric prompts

### Storage Layer
- `AsyncStorage` - General persistence (todos)
- `SecureStore` - Sensitive data (auth timestamps)
- Storage adapters in `src/lib/storage/`

### Path Aliases
Use `@/` to import from `src/` (configured in tsconfig.json and babel)

## Coding Standards

- Functional components with hooks only
- Explicit types at feature boundaries (public functions, atoms, storage APIs)
- Types colocated in `src/features/**/types.ts`
- Handle async errors explicitly; fail gracefully in UI
- Use NativeWind (Tailwind CSS) for styling
