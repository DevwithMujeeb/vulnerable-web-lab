# 🔓 Vulnerable Web Lab

A hands-on application security learning lab built with Node.js and Express. Each module demonstrates a real-world OWASP Top 10 vulnerability — exploit it, understand it, then see the patch.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![OWASP](https://img.shields.io/badge/OWASP-Top%2010-red?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> ⚠️ **This app is intentionally vulnerable. Run locally only. Never deploy to production.**

---

## 🎯 What Is This?

Most developers learn security by reading about it. This lab lets you **actually exploit** each vulnerability yourself — then see exactly how to fix it.

Every module has three parts:

1. **The vulnerable version** — broken on purpose
2. **The exploit** — try it yourself in the browser or Postman
3. **The patched version** — secure implementation side by side

---

## 🧪 Vulnerabilities Covered

| #   | Vulnerability                  | OWASP Category             | What You'll Do                                         |
| --- | ------------------------------ | -------------------------- | ------------------------------------------------------ |
| 01  | **NoSQL Injection**            | A03: Injection             | Bypass login without a password using `$ne` operator   |
| 02  | **Cross-Site Scripting (XSS)** | A03: Injection             | Inject JavaScript that executes in the browser         |
| 03  | **Broken Authentication**      | A07: Auth Failures         | Brute-force login with no lockout                      |
| 04  | **IDOR**                       | A01: Broken Access Control | Access other users' private data by changing an ID     |
| 05  | **Security Misconfiguration**  | A05: Misconfiguration      | Extract stack traces, server config, and API keys      |
| 06  | **Sensitive Data Exposure**    | A02: Crypto Failures       | See plain text passwords vs bcrypt hashes in a DB dump |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com) free tier)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DevwithMujeeb/vulnerable-web-lab.git
cd vulnerable-web-lab

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# 4. Start the lab
npm run dev
```

### Environment Variables

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
```

### Open the Lab

```
http://localhost:4000
```

---

## 📁 Project Structure

```
vulnerable-web-lab/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── routes/
│   │   ├── injection.js          # 01 - NoSQL Injection
│   │   ├── xss.js                # 02 - XSS
│   │   ├── auth.js               # 03 - Broken Authentication
│   │   ├── idor.js               # 04 - IDOR
│   │   ├── misconfig.js          # 05 - Security Misconfiguration
│   │   └── exposure.js           # 06 - Sensitive Data Exposure
│   ├── models/
│   │   └── User.js               # User model (intentionally insecure)
│   └── server.js                 # Entry point
├── public/
│   └── index.html                # Lab homepage
├── writeups/
│   ├── 01-injection.md
│   ├── 02-xss.md
│   ├── 03-broken-auth.md
│   ├── 04-idor.md
│   ├── 05-misconfig.md
│   └── 06-data-exposure.md
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔍 Module Walkthroughs

### 01 — NoSQL Injection

**Route:** `/injection`

Seed the test user at `/injection/seed`, then send this payload via Postman:

```json
POST /injection/vulnerable-login
{
  "username": "admin",
  "password": { "$ne": "" }
}
```

MongoDB interprets `$ne` as an operator — matching any user regardless of password.

**Fix:** Validate input types and strip MongoDB operators before querying.

---

### 02 — Cross-Site Scripting (XSS)

**Route:** `/xss`

Submit this in the vulnerable comment box:

```html
<script>
  alert("XSS by " + document.domain);
</script>
```

The browser executes it. The patched version escapes all HTML characters before rendering.

**Fix:** Always escape user input with `escapeHtml()` before inserting into the DOM.

---

### 03 — Broken Authentication

**Route:** `/auth`

Seed the test user at `/auth/seed`, then submit wrong passwords repeatedly on the vulnerable form — no lockout ever happens. The patched form locks after 3 attempts for 60 seconds.

**Fix:** Implement account lockout, rate limiting, and minimum password length enforcement.

---

### 04 — IDOR (Insecure Direct Object Reference)

**Route:** `/idor`

Seed users at `/idor/seed`, get their IDs at `/idor/users`. Paste another user's ID into the vulnerable form — you get their private data. The patched form checks ownership and returns 403.

**Fix:** Always verify the requesting user owns the resource before returning data.

---

### 05 — Security Misconfiguration

**Route:** `/misconfig`

Three vulnerable endpoints expose:

- Full stack traces with file paths and line numbers
- Node.js version, memory layout, working directory, and PID
- Database credentials, JWT secrets, and API keys

The patched endpoints return only generic messages or 404/403.

**Fix:** Log errors server-side only. Disable debug endpoints. Never expose config.

---

### 06 — Sensitive Data Exposure

**Route:** `/exposure`

Register the same user on both forms. The DB dump at `/exposure/dump` shows:

```
vuln_alice    | mypassword123          ← PLAIN TEXT ❌
patched_alice | $2b$12$abc123xyz...    ← bcrypt hash ✅
```

**Fix:** Always hash passwords with bcrypt (12 rounds) before storing.

---

## 📝 Writeups

Detailed writeups for each vulnerability are in the `/writeups` folder:

- [01 - NoSQL Injection](../../../writeups/01-injection.md)
- [02 - XSS](../../../writeups/02-xss.md)
- [03 - Broken Authentication](../../../writeups/03-broken-auth.md)
- [04 - IDOR](../../../writeups/04-idor.md)
- [05 - Security Misconfiguration](../../../writeups/05-misconfig.md)
- [06 - Sensitive Data Exposure](../../../writeups/06-data-exposure.md)

---

## 🗺️ Part of the 90-Day Build Challenge

This is Project 2 of my 90-day open-source build challenge.

| Project                                                             | Description                         | Status      |
| ------------------------------------------------------------------- | ----------------------------------- | ----------- |
| [Secure Auth API](https://github.com/DevwithMujeeb/secure-auth-api) | Production-grade JWT auth with RBAC | ✅ Shipped  |
| Vulnerable Web Lab                                                  | OWASP Top 10 exploit and patch lab  | ✅ Shipped  |
| Security Tools                                                      | Python recon and security tooling   | 🔜 Building |
| Secure Fullstack App                                                | React + Node.js with security layer | 🔜 Building |

---

## 👨‍💻 Author

**Abdulmujeeb Uthman**

- GitHub: [@DevwithMujeeb](https://github.com/DevwithMujeeb)
- X: [@JeebExplains](https://x.com/JeebExplains)
- LinkedIn: [Abdulmujeeb Uthman](https://linkedin.com/in/abdulmujeeb-uthman)

---

## 📄 License

MIT License — use this however you want for learning.
