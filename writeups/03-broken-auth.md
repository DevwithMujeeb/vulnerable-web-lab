# 03 — Broken Authentication

## What Is It?

Broken Authentication happens when login systems lack protections
against automated attacks. Without rate limiting or account
lockout, attackers can try thousands of passwords until one works.

## The Vulnerable Code

```js
// ❌ No rate limiting, no lockout, no password policy
const user = await User.findOne({ username, password });

if (user) {
  // logged in
} else {
  // just say wrong password — try again immediately
}
```

## The Exploit

An attacker writes a script to hammer the login endpoint:

```bash
# Attacker tries passwords in a loop — nothing stops them
for password in rockyou.txt:
    POST /auth/vulnerable-login
    { username: "victim", password: password }
```

No lockout means unlimited guesses. Given enough time,
they will crack any weak password.

## The Fix

```js
// ✅ Track failed attempts per username
attempts.count += 1;

// ✅ Lock account after 3 failed attempts
if (attempts.count >= 3) {
  attempts.lockedUntil = Date.now() + 60 * 1000;
}

// ✅ Reject weak passwords
if (password.length < 8) {
  return res.status(400).json({ message: "Password too weak" });
}
```

## OWASP Category

A07:2021 — Identification and Authentication Failures

## Lesson

Always implement account lockout, rate limiting, and minimum
password policies. Authentication endpoints are the most
targeted part of any web application.
