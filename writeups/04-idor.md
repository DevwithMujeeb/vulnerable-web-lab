# 04 — IDOR (Insecure Direct Object Reference)

## What Is It?

IDOR occurs when an application uses user-controlled input to
access objects directly without verifying the requester owns
or has permission to access that object.

## The Vulnerable Code

```js
// ❌ Fetches any user by ID — no ownership check
const user = await User.findById(userId);
// Returns private data to anyone who knows the ID
```

## The Exploit

User1 is logged in. They change the ID in the request:
