---
title: Propagating Errors with Redux Toolkit
date: 2025/05/02
---

I recently started migrating my company's codebase to [Redux Toolkit](https://redux-toolkit.js.org/), after many years using bare [Redux](https://redux.js.org/) with manually (painfully) written action creators and reducers. After some time, I realized that our error handling code was malfunctioning for async thunks.

It turns out that by default, Redux Toolkit handles error propagation of failed async thunks differently than Redux (which doesn't really handle them at all).

Calling a manually created action in Redux that throws an error means you can catch it normally:

```js
import { store } from "./store.js";

const failingAction = () => async (dispatch) => {
	throw new Error("action failed");
};

try {
	await store.dispatch(failingAction());
} catch (e) {
	console.log(e.message); // "action failed"
}
```

But the same code, using Redux Toolkit's [`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk), does not throw an error at all:

```js {13}
import { createAsyncThunk } from "@reduxjs/toolkit";
import { store } from "./store.js";

const failingAction = createAsyncThunk(
	"actions/example",
	async () => {
		throw new Error("action failed");
	},
);

try {
	await store.dispatch(failingAction());
	console.log("no error?"); // no error!
} catch (e) {
	console.log(e.message); // doesn't run
}
```

Instead, Redux Toolkit dispatches a **rejected action** that looks like this:

```json
{
	"type": "actions/example/rejected",
	"meta": {
		"requestId": "w1qWHSJ2kjJNoYqCh0poG",
		"rejectedWithValue": false,
		"requestStatus": "rejected",
		"aborted": false,
		"condition": false
	},
	"error": {
		"name": "Error",
		"message": "action failed",
		"stack": "Error: action failed at..."
	}
}
```

This is great because it means that errors are deeply integrated in Redux's system, but in the context of a migration from an existing Redux codebase, it makes things harder to convert as you go. You have to go over every action dispatch when you convert them to Redux Toolkit to repair any broken error handling.

Redux Toolkit also provides an [`.unwrap()`](https://redux-toolkit.js.org/api/createAsyncThunk#unwrapping-result-actions) method on dispatched actions to get this behavior back, but it also means adding it to every action call if you're not migrating all your code at once.

## Creating a custom middleware

In order to unwrap all actions by default, [this Github issue comment](https://github.com/reduxjs/redux-toolkit/issues/910#issuecomment-801211740) suggested creating a custom Redux middleware to intercept rejected actions like in the example above, and to instead throw the error associated with it.

```ts
const throwMiddleware = () => (next) => (action) => {
	next(action);
	if (action?.error) {
		throw action.error;
	}
};
```

After trying it out however, I found that this is not ideal since we lose any returned value from the action, which may be useful to some parts of the code. Instead, I opted for this middleware:

```ts
const throwMiddleware = () => (next) => (action) => {
	if (action?.error) {
		throw action.error; // throw if the action failed
	}
	return next(action); // return the final payload
};
```

Use it like any other Redux middleware:

```ts {6}
const store = configureStore({
	reducer: {
		// ...
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(throwMiddleware),
});
```

And just like that, no need to worry about broken error handling!
