import { authStateAtom } from "@/features/auth/_atoms/auth";
import type { AuthState } from "@/features/auth/types";
import type { Todo } from "@/features/todos/types";
import { render } from "@testing-library/react-native";
import { createStore, Provider } from "jotai";
import type { Store } from "jotai/vanilla/store";
import type { ReactElement, ReactNode } from "react";

type RenderWithProvidersOptions = {
  store?: Store;
};

function Providers({ children, store }: { children: ReactNode; store: Store }) {
  return <Provider store={store}>{children}</Provider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions,
) {
  const store = options?.store ?? createStore();
  return {
    store,
    ...render(ui, {
      wrapper: ({ children }) => (
        <Providers store={store}>{children}</Providers>
      ),
    }),
  };
}

export function createMockTodo(overrides?: Partial<Todo>): Todo {
  const now = Date.now();
  return {
    id: "todo-1",
    title: "Sample todo",
    description: "",
    createdAtMs: now,
    updatedAtMs: now,
    completed: false,
    ...overrides,
  };
}

export function mockAuth(
  store: Store,
  options?: { authenticated?: boolean; lastAuthenticatedAtMs?: number | null },
): AuthState {
  const authenticated = options?.authenticated ?? true;
  const nextState: AuthState = {
    status: authenticated ? "unlocked" : "locked",
    lastAuthenticatedAtMs:
      options?.lastAuthenticatedAtMs ?? (authenticated ? Date.now() : null),
  };

  store.set(authStateAtom, nextState);
  return nextState;
}
