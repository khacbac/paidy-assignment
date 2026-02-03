import { atom } from "jotai";

import type { Todo } from "../types";

/**
 * Phase_0 placeholder:
 * - The list is empty and not persisted yet.
 * - CRUD + persistence is implemented in Phase_2.
 */
export const todosAtom = atom<Todo[]>([]);

export const todosCountAtom = atom((get) => get(todosAtom).length);
