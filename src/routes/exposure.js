const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ===== EXPOSURE LAB PAGE =====
router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>06 - Sensitive Data Exposure</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0d1117; color:#e6edf3; font-family:monospace; padding:40px; }
        h1 { color:#00ff88; margin-bottom:8px; }
        .subtitle { color:#8b949e; margin-bottom:32px; font-size:13px; }
        .hint { background:#1e2a1e; border:1px solid #00ff88; border-radius:6px; padding:12px; margin-bottom:24px; font-size:13px; color:#00ff88; line-height:1.8; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .section { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:24px; }
        .section h2 { margin-bottom:16px; font-size:15px; }
        .vuln h2 { color:#ff4444; }
        .patch h2 { color:#00ff88; }
        label { display:block; color:#8b949e; font-size:12px; margin-bottom:6px; margin-top:14px; }
        input { width:100%; background:#0d1117; border:1px solid #30363d; color:#e6edf3; padding:10px; border-radius:6px; font-family:monospace; font-size:13px; }
        button { margin-top:16px; width:100%; padding:10px; border:none; border-radius:6px; font-family:monospace; font-size:14px; cursor:pointer; }
        .btn-vuln { background:#ff4444; color:white; }
        .btn-patch { background:#00ff88; color:#0d1117; font-weight:bold; }
        .rules { margin-top:16px; background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:12px; font-size:12px; color:#8b949e; line-height:1.8; }
        .rules span { color:#00ff88; }
        .back { color:#8b949e; text-decoration:none; font-size:13px; }
        a.link { display:inline-block; margin-top:16px; color:#8b949e; font-size:12px; text-decoration:none; }
        a.link:hover { color:#00ff88; }
      </style>
    </head>
    <body>
      <a class="back" href="/">← Back to Lab</a>
      <br><br>
      <h1>06 — Sensitive Data Exposure</h1>
      <p class="subtitle">// Passwords stored and returned in plain text</p>

      <div class="hint">
        💡 <strong>How to exploit:</strong><br>
        1. Register a user on the vulnerable form with any password<br>
        2. Click "Dump all users" — see every password in plain text<br>
        3. Register the same user on the patched form<br>
        4. Click "Dump all users" again — passwords are now hashed 🔐
      </div>

      <div class="grid">

        <div class="section vuln">
          <h2>🔴 Vulnerable Registration</h2>
          <form action="/exposure/vulnerable-register" method="POST">
            <label>Username</label>
            <input type="text" name="username" placeholder="e.g. alice" />
            <label>Password</label>
            <input type="text" name="password" placeholder="e.g. mypassword123" />
            <button class="btn-vuln" type="submit">Register (Vulnerable)</button>
          </form>
          <div class="rules">
            ❌ Password stored as plain text<br>
            ❌ Password returned in API response<br>
            ❌ DB breach = all passwords exposed<br>
            ❌ No hashing, no salting
          </div>
        </div>

        <div class="section patch">
          <h2>🟢 Patched Registration</h2>
          <form action="/exposure/patched-register" method="POST">
            <label>Username</label>
            <input type="text" name="username" placeholder="e.g. bob" />
            <label>Password</label>
            <input type="password" name="password" placeholder="e.g. mypassword123" />
            <button class="btn-patch" type="submit">Register (Patched)</button>
          </form>
          <div class="rules">
            <span>✅ Password hashed with bcrypt (12 rounds)</span><br>
            <span>✅ Plain text never stored</span><br>
            <span>✅ Hash not returned in response</span><br>
            <span>✅ DB breach reveals only hashes</span>
          </div>
        </div>

      </div>

      <br>
      <a class="link" href="/exposure/dump">🔍 Dump all registered users (see the difference)</a>
      <br>
      <a class="link" href="/exposure/clear" style="color:#ff4444;">🗑 Clear all exposure test users</a>

    </body>
    </html>
  `);
});

// ===== VULNERABLE REGISTER — plain text password =====
router.post("/vulnerable-register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ❌ Password stored as plain text — no hashing
    const user = await User.create({
      username: `vuln_${username}`,
      password: password, // raw plain text
      email: `${username}@vulnerable.com`,
    });

    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#ff4444;">🔴 VULNERABLE — User Registered</h2><br>
        <p>Username: <strong style="color:#00ff88;">${user.username}</strong></p>
        <p>Password stored as: <strong style="color:#ff4444;">${user.password}</strong></p>
        <br>
        <p style="color:#8b949e;font-size:13px;">
          Plain text password saved directly to the database.<br>
          Anyone with DB access can read every user's password.
        </p>
        <br>
        <a href="/exposure/dump" style="color:#00ff88;">🔍 View all users in DB</a>
        <br><br><a href="/exposure" style="color:#8b949e;">← Back</a>
      </body>
    `);
  } catch (err) {
    res.send(`
      <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
        Error: ${err.message} <br>
        <a href="/exposure" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

// ===== PATCHED REGISTER — bcrypt hashed password =====
router.post("/patched-register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Hash password with bcrypt before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: `patched_${username}`,
      password: hashedPassword,
      email: `${username}@patched.com`,
    });

    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#00ff88;">🟢 PATCHED — User Registered Securely</h2><br>
        <p>Username: <strong style="color:#00ff88;">${user.username}</strong></p>
        <p>Password stored as: <strong style="color:#00ff88;">${user.password}</strong></p>
        <br>
        <p style="color:#8b949e;font-size:13px;">
          bcrypt hash stored — not the real password.<br>
          Even if the DB is breached, hashes can't be reversed.
        </p>
        <br>
        <a href="/exposure/dump" style="color:#00ff88;">🔍 View all users in DB</a>
        <br><br><a href="/exposure" style="color:#8b949e;">← Back</a>
      </body>
    `);
  } catch (err) {
    res.send(`
      <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
        Error: ${err.message} <br>
        <a href="/exposure" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

// ===== DUMP all users — shows plain text vs hashed =====
router.get("/dump", async (req, res) => {
  const users = await User.find({
    username: { $regex: /^(vuln_|patched_)/ },
  });

  const rows = users
    .map((u) => {
      const isHashed = u.password.startsWith("$2");
      return `
      <tr>
        <td style="padding:10px 16px;color:#00ff88;">${u.username}</td>
        <td style="padding:10px 16px;color:${isHashed ? "#00ff88" : "#ff4444"};">
          ${u.password}
        </td>
        <td style="padding:10px 16px;font-size:11px;">
          ${
            isHashed
              ? '<span style="color:#00ff88;">✅ bcrypt hash</span>'
              : '<span style="color:#ff4444;">❌ PLAIN TEXT</span>'
          }
        </td>
      </tr>
    `;
    })
    .join("");

  res.send(`
    <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
      <h2 style="color:#00ff88;margin-bottom:16px;">Database Dump — Passwords</h2>
      <p style="color:#8b949e;font-size:13px;margin-bottom:16px;">
        This simulates what an attacker sees after a database breach.
      </p>
      <table style="border-collapse:collapse;width:100%;">
        <tr style="color:#8b949e;font-size:12px;border-bottom:1px solid #30363d;">
          <th style="padding:10px 16px;text-align:left;">Username</th>
          <th style="padding:10px 16px;text-align:left;">Password (as stored in DB)</th>
          <th style="padding:10px 16px;text-align:left;">Status</th>
        </tr>
        ${rows || '<tr><td colspan="3" style="padding:16px;color:#8b949e;">No users yet — register some first.</td></tr>'}
      </table>
      <br>
      <a href="/exposure" style="color:#8b949e;">← Back to lab</a>
    </body>
  `);
});

// ===== CLEAR exposure users =====
router.get("/clear", async (req, res) => {
  await User.deleteMany({ username: { $regex: /^(vuln_|patched_)/ } });
  res.redirect("/exposure");
});

module.exports = router;
