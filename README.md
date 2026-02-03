# Secured TODO List

A React Native + Expo TODO list application with biometric authentication. Users must authenticate via Face ID/Touch ID before performing CRUD operations on todos.

## Features

- Biometric authentication (Face ID / Touch ID)
- Session-based access with configurable TTL
- Tiered auth levels (Trusted, Sensitive, Critical)
- Persistent storage with SecureStore and AsyncStorage
- File-based routing with Expo Router

## Getting Started

### Prerequisites

- Node.js 18+
- iOS Simulator or Android Emulator
- Expo CLI

### Installation

```bash
pnpm install
```

### Running the App

**Important**: This app uses `expo-local-authentication` for biometrics, which requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (not Expo Go).

```bash
# Generate native projects (required once)
pnpm expo prebuild

# Run development build
pnpm expo run:ios      # iOS simulator
pnpm expo run:android  # Android emulator
```

For development server only:
```bash
pnpm start
```

## Project Structure

```
app/                    # Expo Router screens (file-based routing)
src/
  features/
    auth/               # Authentication module
      _atoms/           # Jotai atoms for auth state
      components/       # Auth-related components
      types.ts          # Auth types and levels
    todos/              # TODO list module
      _atoms/           # Jotai atoms for todos state
      components/       # Todo-related components
  lib/
    jotai/              # Jotai setup and storage adapters
    storage/            # AsyncStorage and SecureStore adapters
  components/           # Shared UI components
```

## Authentication

The app uses a session-based authentication system with three auth levels:

| Level | Use Case | Grace Period |
|-------|----------|--------------|
| TRUSTED | Low-risk actions | 5 minutes |
| SENSITIVE | Medium-risk actions | 2 minutes |
| CRITICAL | Delete, clear all | Always requires fresh auth |

## Tech Stack

- **Framework**: React Native + Expo
- **Routing**: Expo Router (file-based)
- **State Management**: Jotai
- **Styling**: NativeWind (Tailwind CSS)
- **Storage**: AsyncStorage + SecureStore
- **Auth**: expo-local-authentication

## Scripts

```bash
pnpm start       # Start Expo dev server
pnpm ios         # Start iOS simulator
pnpm android     # Start Android emulator
pnpm lint        # Run ESLint
pnpm test        # Run all tests
pnpm test:watch  # Run tests in watch mode
```

## License

MIT
