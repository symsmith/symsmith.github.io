---
title: Inspecting the Active Element in Chrome Devtools
date: 2025/11/20
---

I recently picked up a nice trick to debug the active element in Chrome, in order to get better focus management.

The trick is to use the [Live Expression feature](https://developer.chrome.com/docs/devtools/console/live-expressions) of the Chrome Devtools, which lets you watch JavaScript values update in real time, as you're interacting with the page.

In the Live Expression input, simply type `document.activeElement` which is a [property of the Document class](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) that points to the currently focused element. As you Tab through the page, or click on inputs or buttons, the Live Expression will update accordingly.

This is only a very simple but already very useful example of using this Devtools feature.
