const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===== VULNERABLE LOGIN PAGE =====
router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>01 - NoSQL Injection</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0d1117; color:#e6edf3; font-family:monospace; padding:40px; }
        h1 { color:#00ff88; margin-bottom:8px; }
        .subtitle { color:#8b949e; margin-bottom:32px; font-size:13px; }
        .section { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:24px; margin-bottom:24px; max-width:500px; }
        .section h2 { color:#ff4444; margin-bottom:16px; font-size:15px; }
        .section.patch h2 { color:#00ff88; }
        label { display:block; color:#8b949e; font-size:12px; margin-bottom:6px; margin-top:14px; }
        input { width:100%; background:#0d1117; border:1px solid #30363d; color:#e6edf3; padding:10px; border-radius:6px; font-family:monospace; font-size:14px; }
        button { margin-top:16px; width:100%; padding:10px; border:none; border-radius:6px; font-family:monospace; font-size:14px; cursor:pointer; }
        .btn-vuln { background:#ff4444; color:white; }
        .btn-patch { background:#00ff88; color:#0d1117; font-weight:bold; }
        .hint { background:#1e2a1e; border:1px solid #00ff88; border-radius:6px; padding:12px; margin-bottom:24px; max-width:500px; font-size:13px; color:#00ff88; }
        .back { color:#8b949e; text-decoration:none; font-size:13px; }
        .back:hover { color:#00ff88; }
      </style>
    </head>
    <body>
      <a class="back" href="/">← Back to Lab</a>
      <br><br>
      <h1>01 — NoSQL Injection</h1>
      <p class="subtitle">// Bypass login without knowing the password</p>

      <div class="hint">
        💡 <strong>Exploit hint:</strong> In the vulnerable form, try entering this as the password exactly as shown:<br><br>
        Username: <strong>admin</strong><br>
        Password field — switch to raw JSON body in Postman:<br>
        <code>{"username": "admin", "password": {"$ne": ""}}</code>
      </div>

      <div class="section">
        <h2>🔴 Vulnerable Login</h2>
        <form action="/injection/vulnerable-login" method="POST">
          <label>Username</label>
          <input type="text" name="username" placeholder="try: admin" />
          <label>Password</label>
          <input type="text" name="password" placeholder="try: anything" />
          <button class="btn-vuln" type="submit">Login (Vulnerable)</button>
        </form>
      </div>

      <div class="section patch">
        <h2>🟢 Patched Login</h2>
        <form action="/injection/patched-login" method="POST">
          <label>Username</label>
          <input type="text" name="username" placeholder="username" />
          <label>Password</label>
          <input type="password" name="password" placeholder="password" />
          <button class="btn-patch" type="submit">Login (Patched)</button>
        </form>
      </div>

    </body>
    </html>
  `);
});

// ===== SEED ROUTE — creates a test user =====
router.get("/seed", async (req, res) => {
  try {
    await User.deleteMany({ username: "admin" });
    await User.create({
      username: "admin",
      password: "supersecret123",
      email: "admin@lab.com",
      role: "admin",
      secret: "FLAG{injection_found_secret_data}",
    });
    res.send(`
      <body style="background:#0d1117;color:#00ff88;font-family:monospace;padding:40px;">
        ✅ Seed complete! User created:<br><br>
        Username: <strong>admin</strong><br>
        Password: <strong>supersecret123</strong><br><br>
        <a href="/injection" style="color:#8b949e;">← Go to injection lab</a>
      </body>
    `);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ===== VULNERABLE LOGIN — no input sanitization =====
router.post("/vulnerable-login", async (req, res) => {
  try {
    let { username, password } = req.body;

    // ❌ VULNERABLE: passes user input directly into MongoDB query
    // Attacker can send { "$ne": "" } as password to match ANY user
    const user = await User.findOne({ username: username, password: password });

    if (user) {
      res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <h2 style="color:#ff4444;">🔴 VULNERABLE LOGIN SUCCEEDED</h2><br>
          <p>Logged in as: <strong style="color:#00ff88;">${user.username}</strong></p>
          <p>Role: <strong>${user.role}</strong></p>
          <p>Secret: <strong style="color:#ff4444;">${user.secret}</strong></p>
          <br>
          <p style="color:#8b949e;font-size:13px;">
            The attacker used a MongoDB <code>$ne</code> operator to bypass the password check entirely.
          </p>
          <br><a href="/injection" style="color:#8b949e;">← Try again</a>
        </body>
      `);
    } else {
      res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <p style="color:#ff4444;">Login failed. <a href="/injection" style="color:#8b949e;">← Try again</a></p>
        </body>
      `);
    }
  } catch (err) {
    res.status(500).send(`
      <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
        Error: ${err.message}<br>
        <a href="/injection" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

// ===== PATCHED LOGIN — sanitized input =====
router.post("/patched-login", async (req, res) => {
  try {
    let { username, password } = req.body;

    // ✅ PATCH 1: Reject if inputs are not plain strings
    if (typeof username !== "string" || typeof password !== "string") {
      return res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <h2 style="color:#00ff88;">🟢 INJECTION BLOCKED</h2><br>
          <p style="color:#8b949e;">Input rejected — objects/operators not allowed as login fields.</p>
          <br><a href="/injection" style="color:#8b949e;">← Back</a>
        </body>
      `);
    }

    // ✅ PATCH 2: Sanitize — strip any $ characters from input
    username = username.replace(/[${}]/g, "");
    password = password.replace(/[${}]/g, "");

    const user = await User.findOne({ username, password });

    if (user) {
      res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <h2 style="color:#00ff88;">✅ Legitimate login successful</h2><br>
          <p>Welcome, <strong>${user.username}</strong></p>
          <br><a href="/injection" style="color:#8b949e;">← Back</a>
        </body>
      `);
    } else {
      res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <p style="color:#ff4444;">Invalid credentials. <a href="/injection" style="color:#8b949e;">← Try again</a></p>
        </body>
      `);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
