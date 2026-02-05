# Secured TODO List

A React Native + Expo TODO list application with biometric authentication. Users must authenticate via Face ID/Touch ID before performing CRUD operations on todos. Built with enterprise-grade security and modern React Native patterns.

![React Native](https://img.shields.io/badge/React%20Native-0.73-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2050-1B1F24)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📱 Features

- **🔐 Biometric Authentication** - Secure access using Face ID/Touch ID
- **⚡ Tiered Security Levels** - Three auth levels based on operation risk
- **⏱️ Session Management** - Auto-expiring sessions with configurable TTL
- **💾 Secure Storage** - Sensitive data encrypted with SecureStore
- **📱 Native Performance** - Built with React Native primitives
- **🎨 Modern UI** - Dark mode support with NativeWind styling
- **🧪 Tested** - Comprehensive unit tests with Jest
- **📦 Modular** - Feature-based architecture with Jotai state

## 🎯 Authentication Levels

| Level | Grace Period | Example Operations |
|-------|--------------|-------------------|
| **TRUSTED** (5 min) | Low-risk actions | Toggle todo completion |
| **SENSITIVE** (2 min) | Medium-risk actions | Add/update/duplicate todos |
| **CRITICAL** (Always required) | High-risk actions | Delete todo, clear completed |

<div align="center">
  <img src="assets/demo.gif" alt="App Demo" width="300" />
  <p><em>Demo: Biometric authentication for sensitive operations</em></p>
</div>

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** package manager (recommended)
- **iOS Simulator** (macOS) or **Android Emulator**
- **Expo CLI** (installed as dev dependency)

### Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd secured-todo-list
   pnpm install
   ```

2. **Create development build** (required for biometrics)
   ```bash
   pnpm expo prebuild  # Generate native project files
   ```

3. **Run the app**
   ```bash
   pnpm ios      # iOS simulator
   # or
   pnpm android  # Android emulator
   ```

For development server only:
```bash
pnpm start  # Start Metro bundler
```

📖 **Note**: This app requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) because it uses native biometric APIs not available in Expo Go.

## 📖 Documentation

- **[Development Guide](./DEVELOPMENT.md)** - Setup, workflow, and best practices
- **[Architecture Documentation](./ARCHITECTURE.md)** - Technical deep-dive and patterns
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant guidance and project context

## 🏗️ Project Structure

```
secured-todo-list/
├── app/                       # Expo Router screens
│   ├── _layout.tsx           # Root layout with auth overlay
│   ├── index.tsx             # Main TODO screen
│   ├── all-todos.tsx         # Full todo list
│   └── todo-actions.tsx      # Modal for CRUD ops
│
├── src/
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   │   ├── _atoms/        # Auth state atoms
│   │   │   ├── components/    # Auth UI components
│   │   │   ├── authGate.ts    # Auth orchestration
│   │   │   ├── session.ts     # Session management
│   │   │   ├── smartAuth.ts   # Auth calculations
│   │   │   └── types.ts       # Auth types
│   │   │
│   │   └── todos/             # Todos feature
│   │       ├── _atoms/        # Todo state atoms
│   │       ├── components/    # Todo components
│   │       ├── useProtectedTodoActions.ts  # Protected ops
│   │       └── types.ts       # Todo types
│   │
│   ├── lib/                   # Shared infrastructure
│   │   ├── jotai/             # Jotai configuration
│   │   └── storage/           # Storage adapters
│   │
│   └── components/            # Reusable UI components
│
└── assets/                    # Images, fonts, etc.
```

## 🔧 Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React Native 0.73 + Expo 50 | Cross-platform mobile development |
| **Navigation** | Expo Router 3 | File-based routing |
| **State Mgmt** | Jotai 2.6 | Atomic state management |
| **Styling** | NativeWind 4 | Tailwind CSS for RN |
| **Auth** | expo-local-authentication | Biometric authentication |
| **Storage** | expo-secure-store + @react-native-async-storage | Encrypted & async storage |
| **Language** | TypeScript 5.3 | Type safety |
| **Tests** | Jest + React Native Testing Library | Unit & integration tests |

## 🎬 How It Works

### Authentication Flow

```
User attempts action (e.g., delete todo)
    ↓
Check if session valid for required level (CRITICAL)
    ↓
┌─────────────────────────────┐
│ Session expired?            │
│  ├─ No → Allow action       │
│  └─ Yes → Prompt biometric  │
└─────────────────────────────┘
    ↓
Biometric authentication (Face ID/Touch ID)
    ↓
┌─────────────────────────────┐
│ Success?                    │
│  ├─ Yes → Update session    │
│  │       Execute action      │
│  └─ No → Show error         │
└─────────────────────────────┘
```

### State Management Flow

```
User Input
    ↓
Protected Action Hook (useProtectedTodoActions)
    ↓
Authentication Gate (ensureAuthenticated)
    ↓
Jotai Action Atom (e.g., deleteTodoAtom)
    ↓
Update Core Atom (todosAtom)
    ↓
Persist to AsyncStorage (automatic)
    ↓
UI Updates (React re-render)
```

## 🛡️ Security Features

- **Biometric Authentication** - Hardware-level security
- **SecureStore** - Encrypted storage for sensitive data
- **Session Management** - Auto-expiring sessions
- **Tiered Access** - Different security levels for different operations
- **Automatic Lock** - App locks when backgrounded

## 🧪 Testing

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode for development
pnpm test auth.test.ts # Run specific test file
```

Tests are colocated with implementation:
```
src/features/auth/
├── __tests__/
│   └── auth.test.ts  # Auth logic tests
├── authGate.ts
└── session.ts
```

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo dev server |
| `pnpm ios` | Run iOS simulator |
| `pnpm android` | Run Android emulator |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm expo prebuild` | Generate native project files |
| `pnpm expo run:ios` | Build and run iOS |
| `pnpm expo run:android` | Build and run Android |
| `pnpm eas build` | Create production build |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/auth-enhancement`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Lint your code (`pnpm lint`)
6. Commit with clear message (`git commit -m "feat: add new security feature"`)
7. Push to branch (`git push origin feature/auth-enhancement`)
8. Open a Pull Request

## 📄 License

MIT © [Your Name]

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Jotai](https://jotai.org/) team for the state management library
- [NativeWind](https://www.nativewind.dev/) for styling utilities
- All contributors and the open-source community

---

**💡 Tip**: If you're working with Claude Code, see [CLAUDE.md](./CLAUDE.md) for AI-specific guidance!

<div align="center">
  <p>Built with ❤️ using React Native, Expo, and TypeScript</p>
</div>
