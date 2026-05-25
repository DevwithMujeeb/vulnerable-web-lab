# 06 — Sensitive Data Exposure

## What Is It?

Sensitive Data Exposure occurs when applications store or
transmit sensitive data without adequate protection. The most
common case: storing passwords in plain text in the database.

## The Vulnerable Code

```js
// ❌ Password stored exactly as the user typed it
const user = await User.create({
  username: username,
  password: password, // "mypassword123" → stored as "mypassword123"
});
```

## The Exploit

An attacker gains read access to the database (via SQL/NoSQL
injection, misconfigured DB, or insider threat) and dumps
the users table:
