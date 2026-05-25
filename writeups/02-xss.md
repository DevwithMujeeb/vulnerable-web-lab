# 02 — Cross-Site Scripting (XSS)

## What Is It?

XSS occurs when an application includes unvalidated user input
in its HTML output. The browser interprets injected scripts as
legitimate code and executes them.

## The Vulnerable Code

```js
// ❌ Raw user input rendered directly into HTML
const vulnerableComments = comments
  .map(
    (c) => `
  <p>${c.message}</p>  // browser executes any <script> tags
`,
  )
  .join("");
```

## The Exploit

Submitting this as a comment:

```html
<script>
  alert("XSS by " + document.domain);
</script>
```

The browser executes the script — attacker can steal cookies,
redirect users, or deface the page.

## The Fix

```js
// ✅ Escape all HTML special characters before rendering
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

`<script>` becomes `&lt;script&gt;` —
displayed as text, never executed.

## OWASP Category

A03:2021 — Injection

## Lesson

Never render raw user input as HTML. Always escape special
characters before inserting user content into the DOM.
