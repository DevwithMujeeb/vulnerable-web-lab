# 05 — Security Misconfiguration

## What Is It?

Security Misconfiguration occurs when servers expose internal
information through verbose errors, open debug endpoints, or
accessible configuration routes.

## The Vulnerable Code

```js
// ❌ Full stack trace sent to client
res.status(500).send({ error: err.stack });

// ❌ Debug endpoint open in production
router.get("/debug", (req, res) => {
  res.json({ env: process.env, memory: process.memoryUsage() });
});
```

## What Gets Exposed

- Full file paths and line numbers from stack traces
- Node.js version and platform details
- Database connection strings and credentials
- JWT secrets and API keys
- Server memory layout and process ID

## The Fix

```js
// ✅ Log internally, return generic message
console.error("[ERROR]", err.stack); // server logs only
res.status(500).json({ message: "Something went wrong" });

// ✅ Disable debug endpoints in production
if (process.env.NODE_ENV === "production") {
  return res.status(404).json({ message: "Not found" });
}
```

## OWASP Category

A05:2021 — Security Misconfiguration

## Lesson

Never expose stack traces, debug endpoints, or configuration
details to clients. Log errors server-side only. Disable or
protect all debug routes before deploying to production.
