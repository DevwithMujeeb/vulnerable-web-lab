# Contributing

## How to Add a New Vulnerability Module

1. Create a new route file in `src/routes/`
2. Follow the pattern: vulnerable endpoint + patched endpoint + seed route
3. Add the route to `src/server.js`
4. Add a card to `public/index.html`
5. Write a writeup in `writeups/` following the existing format
6. Submit a PR

## Vulnerability Ideas

- CSRF (Cross-Site Request Forgery)
- Path Traversal
- XXE (XML External Entity)
- Open Redirect
- Command Injection

## Rules

- Every vulnerability must have a vulnerable version AND a patched version
- Every vulnerability must have a writeup
- Never deploy this app to production
