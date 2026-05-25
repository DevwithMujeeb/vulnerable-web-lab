# 01 — NoSQL Injection

## What Is It?

NoSQL Injection occurs when user-supplied input is passed directly
into a database query without sanitization. In MongoDB, attackers
can inject query operators like `$ne`, `$gt`, or `$regex` to
manipulate the query logic.

## The Vulnerable Code

```js
// ❌ Input passed directly into MongoDB query
const user = await User.findOne({
  username: username,
  password: password, // attacker controls this
});
```

## The Exploit

Instead of a string password, the attacker sends a MongoDB operator:

```json
{
  "username": "admin",
  "password": { "$ne": "" }
}
```

MongoDB interprets this as: _"find a user where username is admin
AND password is NOT EQUAL to empty string"_ — which matches every
user with any password.

## The Fix

```js
// ✅ Reject non-string inputs
if (typeof username !== "string" || typeof password !== "string") {
  return res.status(400).json({ message: "Invalid input" });
}

// ✅ Strip MongoDB operators from input
username = username.replace(/[${}]/g, "");
password = password.replace(/[${}]/g, "");
```

## OWASP Category

A03:2021 — Injection

## Lesson

Never pass raw user input directly into database queries.
Always validate input types and sanitize special characters
before they touch your database layer.
