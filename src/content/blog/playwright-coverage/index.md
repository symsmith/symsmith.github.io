---
title: Collecting Test Coverage in Playwright
date: 2025/05/31
---

Test coverage collection is a good tool to evaluate how much of your code is being tested. It can help you identify untested parts of your codebase and improve your test suite.
I recently had to implement test coverage collection for a Playwright test suite.

I searched for a bit online, and got some pointers through blog articles about how I could achieve that.

The basic idea is to use [custom Playwright fixtures](https://playwright.dev/docs/test-fixtures#creating-a-fixture), by extending the built-in `test` utility. This allows you to collect coverage data created using the [`vite-plugin-istanbul`](https://www.npmjs.com/package/vite-plugin-istanbul) package. If your project doesn't use [Vite](https://vite.dev/), there is probably another option for you to collect the coverage data. All that is really needed for the rest is that the coverage data gets collected into `window.__coverage__`.

### Setting Vite up

First of all, we need to install the `vite-plugin-istanbul` package that will allow us to collect coverage data in the browser.

```bash
pnpm install -D vite-plugin-istanbul
```

In our `vite.config.ts`, let's setup the plugin:

```ts
import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

const config = defineConfig({
  plugins: [
    // ...
    ...(process.env.ISTANBUL_COVERAGE
      ? [
          istanbul({
            include: "src/*",
            exclude: ["node_modules", "test/"],
            extension: [".js", ".jsx", ".ts", ".tsx"],
            requireEnv: false,
            checkProd: false,
            forceBuildInstrument: true,
          }),
        ]
      : []),
  ],
  build: {
    // ...
    sourcemap:
      mode === "production" || !!process.env.ISTANBUL_COVERAGE,
  },
  // ...
});

export default config;
```

This will depend on the project. Here, we're only enabling the plugin if the environment variable `process.env.ISTANBUL_COVERAGE` is enabled. This way, we're only collecting data exactly when we want to (when Playwright starts the server). We're also adding sourcemaps to the build if this variable is set. This ensures that the coverage can map to the actual source code, and not the bundled code.

Let's also setup the environment variable in the Playwright config file (`playwright.config.ts`):

```ts {7}
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // ...
  webServer: {
    // ...
    env: { ISTANBUL_COVERAGE: "1" },
  },
  // ...
});
```

Now that we have the setup, we can implement the coverage collection itself.

### Creating the fixture

In a utility file next to the tests, we're going to expose our own `test` function, that will need to be used in every test file instead of the default import from `@playwright/test`.

```ts
import { test as baseTest } from "@playwright/test";

export const test = baseTest.extend({});
export const expect = test.expect;
```

We also have to export the `expect` utility created from our custom `test`, and use it in every test as well.

Inside the `extend` method, we can create our own fixtures (that will be available inside the test functions) or override existing ones. To implement test coverage, we need to extend the existing `context` fixture, in order to run code before the context is used in the tests (to add the collecting code) and after (to save the coverage data to a directory).

```ts {4}
// ...

export const test = baseTest.extend({
  context: async ({ browser }, use) => {},
});

// ...
```

### Adding the coverage code

First, let's use the `mkdir` Node function to create the directory that will hold our coverage data.

```ts {7,11-13}
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// coverage directory path, relative to this file
const istanbulCLIOutput = path.join(__dirname, "../.nyc_output");

export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    await fs.promises.mkdir(istanbulCLIOutput, {
      recursive: true,
    });
  },
});
```

We're setting the `recursive` option so that the function doesn't throw if the directory already exists.

Next, we're going to create our own `BrowserContext` instance, in order to have control over how it behaves.

```ts {4}
export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    // ...
    const context = await browser.newContext();
  },
});
```

Then, we're going to expose a function on the `window` object in every page of our context, called `collectIstanbulCoverage`. This function takes the coverage data generated by [Istanbul](https://istanbul.js.org/) as a JSON string and creates a file with a random name containing the data, inside the directory we just created.

```ts {12}
export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    // ...
    await context.exposeFunction(
      "collectIstanbulCoverage",
      (coverageJSON) => {
        if (!coverageJSON) return;
        const filePath = path.join(
          istanbulCLIOutput,
          `playwright_coverage_${generateUUID()}.json`,
        );
        fs.writeFileSync(filePath, coverageJSON);
      },
    );
  },
});
```

For reference, here is the function we're using to generate the UUIDs to name the files:

```ts
export function generateUUID() {
  return crypto.randomBytes(16).toString("hex");
}
```

We're then going to tell Playwright to run a function when initializing every new page in our context, using `context.addInitScript`. This function will add an event listener to `window`, on the [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) event. It will collect the coverage data every time the tests navigate to another page. Since the coverage data is stored in the global `window` object in the page, it will be lost after navigating (after a real navigation, not SPA navigations like with React Router). By listening to the `beforeunload` browser event, we can hook into the navigation and collect the coverage right before the data is cleared from the browser's memory. To collect the coverage, we simply call the function that we just exposed on the `window` object.

```ts {6-8}
export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    // ...
    await context.addInitScript(() =>
      window.addEventListener("beforeunload", () =>
        window.collectIstanbulCoverage(
          JSON.stringify(window.__coverage__),
        ),
      ),
    );
  },
});
```

Here, the context is ready to be used in our tests. So, we use the `use` function provided by Playwright:

```ts {4}
export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    // ...
    await use(context);
  },
});
```

After the `use` function is done running, the test is over, either passed or failed. In both cases, we need to collect the coverage of all the tabs that the test opened, because the `beforeunload` event did not run since there was no navigation at the end of the test. To do that, we use the `context.pages()` method to get a list of all the pages in our context, and the `page.evaluate()` method on each page to run our coverage collection script inside the page.

```ts {5-9}
export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    // ...
    for (const page of context.pages()) {
      await page.evaluate(() =>
        window.collectIstanbulCoverage(
          JSON.stringify(window.__coverage__),
        ),
      );
    }
  },
});
```

At this point, the collection code works and is ready to show us how much of our codebase is covered. However, we still need to close the context, otherwise the window will stay open even after continuing to run other tests that open other windows.

The only thing to take into account is that we don't want the window to close when we manually interrupt the test, so that we can easily add to the test via Playwright's code generation integration in the editor.

```ts {7}
export const test = baseTest.extend({
  context: async ({ browser }, use) => {
    // ...
    // don't close the browser when interrupting the test
    // (during development)
    if (baseTest.info().status !== "interrupted") {
      await context.close();
    }
  },
});
```

With that, the coverage data gets collected when running the tests!

```bash {1}
ls ./.nyc_output
playwright_coverage_0a0a0ee57c6a751357a3aaf97897c6fa.json
playwright_coverage_1dbe194936c86c77d87d6e35eac06bdd.json
...
```

To get a coverage report generated from the collected data, we can use the `nyc` CLI tool:

```bash {1}
nyc report --reporter=text-summary
===================== Coverage summary =====================
Statements   : 60.64% ( 16752/27622 )
Branches     : 48.63% ( 7308/15025 )
Functions    : 52.04% ( 4894/9404 )
Lines        : 60.77% ( 14647/24099 )
============================================================
```

Or we can get a detailed HTML report:

```bash
nyc report --reporter=html-spa
# open generated web app with whatever tool
pnpx http-server ./coverage -p 3001 -d false --no-dotfiles -o
```

### Note

To correctly get all the file coverage data in the project, I had to specifically ask `nyc` to include all `ts(x)/js(x)` files, using a `.nycrc` file:

```json {4-9}
{
  "all": true,
  "exclude-after-remap": false,
  "include": [
    "./src/**/*.ts",
    "./src/**/*.tsx",
    "./src/**/*.js",
    "./src/**/*.jsx"
  ]
}
```
