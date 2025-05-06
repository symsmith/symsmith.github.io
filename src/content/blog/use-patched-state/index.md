---
title: Handling Complex React State with usePatchedState
date: 2025/05/06
---

`usePatchedState` is a nice hook to simplify complex state management in React with TypeScript. Instead of many indivual, atomic `useState` calls, you define your initial state and then get a "patch" function that you use to edit parts of the state granularly.

### Usage

```tsx {7,13,18}
const initialState = {
  name: "",
  age: 0,
};

export function Form() {
  const [state, patchState] = usePatchedState(initialState);

  return (
    <form>
      <input
        value={state.name}
        onChange={(e) => patchState({ name: e.target.value })}
        type="text"
      />
      <input
        value={state.age}
        onChange={(e) => patchState({ age: e.target.value })}
        type="number"
      />
      <button>Submit</button>
    </form>
  );
}
```

Any part of the state (or multiple parts at once) can be edited using `patchState`, and everything is strongly typed thanks to the inference on the initial state. A specific type can also be used:

```ts
const [state, patchState] = usePatchState<{
  name?: string;
  age?: number;
}>({});
```

### Definition

The hook is a light wrapper around React's `useReducer`, with a specific use-case and better typing.

```ts
export function usePatchedState<
  State extends Record<string, unknown>,
>(initialState: State) {
  return useReducer(
    (state: State, patch: Partial<State>): State => ({
      ...state,
      ...patch,
    }),
    initialState,
  );
}
```
