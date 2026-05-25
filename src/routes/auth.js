const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Track login attempts in memory (per username)
const loginAttempts = {};

// ===== AUTH LAB PAGE =====
router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>03 - Broken Authentication</title>
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
        .back:hover { color:#00ff88; }
        a.seed { display:inline-block; margin-top:16px; color:#8b949e; font-size:12px; text-decoration:none; }
        a.seed:hover { color:#00ff88; }
      </style>
    </head>
    <body>
      <a class="back" href="/">← Back to Lab</a>
      <br><br>
      <h1>03 — Broken Authentication</h1>
      <p class="subtitle">// No rate limiting, weak passwords accepted, no lockout</p>

      <div class="hint">
        💡 <strong>Exploit hint:</strong><br>
        1. Seed the test user first → <a href="/auth/seed" style="color:#00ff88;">/auth/seed</a><br>
        2. On the vulnerable form — try wrong passwords repeatedly. No lockout ever happens.<br>
        3. Try registering with password <strong>123</strong> — it gets accepted.<br>
        4. On the patched form — fail 3 times and get locked out for 1 minute.
      </div>

      <div class="grid">

        <div class="section vuln">
          <h2>🔴 Vulnerable Login</h2>
          <form action="/auth/vulnerable-login" method="POST">
            <label>Username</label>
            <input type="text" name="username" placeholder="try: victim" />
            <label>Password</label>
            <input type="password" name="password" placeholder="try wrong passwords freely" />
            <button class="btn-vuln" type="submit">Login (Vulnerable)</button>
          </form>
          <div class="rules">
            ❌ No rate limiting<br>
            ❌ No account lockout<br>
            ❌ Accepts password "123"<br>
            ❌ No minimum password length
          </div>
        </div>

        <div class="section patch">
          <h2>🟢 Patched Login</h2>
          <form action="/auth/patched-login" method="POST">
            <label>Username</label>
            <input type="text" name="username" placeholder="try: victim" />
            <label>Password</label>
            <input type="password" name="password" placeholder="correct password required" />
            <button class="btn-patch" type="submit">Login (Patched)</button>
          </form>
          <div class="rules">
            <span>✅ Lockout after 3 failed attempts</span><br>
            <span>✅ 1 minute cooldown on lockout</span><br>
            <span>✅ Password must be 8+ characters</span><br>
            <span>✅ Attempt counter shown</span>
          </div>
        </div>

      </div>

      <br>
      <a class="seed" href="/auth/seed">⚡ Seed test user (username: victim / password: securepass123)</a>
      <br>
      <a class="seed" href="/auth/reset-attempts" style="color:#ff4444;">🔄 Reset lockout attempts</a>

    </body>
    </html>
  `);
});

// ===== SEED test user =====
router.get("/seed", async (req, res) => {
  try {
    await User.deleteMany({ username: "victim" });
    await User.create({
      username: "victim",
      password: "securepass123",
      email: "victim@lab.com",
      role: "user",
      secret: "FLAG{broken_auth_cracked}",
    });
    res.send(`
      <body style="background:#0d1117;color:#00ff88;font-family:monospace;padding:40px;">
        ✅ Test user created!<br><br>
        Username: <strong>victim</strong><br>
        Password: <strong>securepass123</strong><br><br>
        <a href="/auth" style="color:#8b949e;">← Go to auth lab</a>
      </body>
    `);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ===== VULNERABLE LOGIN — no protection at all =====
router.post("/vulnerable-login", async (req, res) => {
  const { username, password } = req.body;

  // ❌ No rate limiting, no lockout, no password policy
  const user = await User.findOne({ username, password });

  if (user) {
    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#ff4444;">🔴 VULNERABLE LOGIN SUCCEEDED</h2><br>
        <p>Welcome, <strong style="color:#00ff88;">${user.username}</strong></p>
        <p>Secret: <strong style="color:#ff4444;">${user.secret}</strong></p>
        <br><p style="color:#8b949e;font-size:13px;">No lockout occurred. An attacker could have brute-forced this.</p>
        <br><a href="/auth" style="color:#8b949e;">← Back</a>
      </body>
    `);
  } else {
    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <p style="color:#ff4444;">❌ Wrong password — but you can try again immediately. No lockout.</p>
        <br><a href="/auth" style="color:#8b949e;">← Try again</a>
      </body>
    `);
  }
});

// ===== PATCHED LOGIN — lockout + password policy =====
router.post("/patched-login", async (req, res) => {
  const { username, password } = req.body;

  // ✅ Enforce minimum password length
  if (password.length < 8) {
    return res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#00ff88;">🟢 WEAK PASSWORD REJECTED</h2><br>
        <p style="color:#8b949e;">Password must be at least 8 characters.</p>
        <br><a href="/auth" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }

  // ✅ Check lockout
  const attempts = loginAttempts[username] || { count: 0, lockedUntil: null };

  if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
    const secondsLeft = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    return res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#00ff88;">🟢 ACCOUNT LOCKED</h2><br>
        <p style="color:#8b949e;">Too many failed attempts. Try again in <strong style="color:#00ff88;">${secondsLeft} seconds</strong>.</p>
        <br><a href="/auth" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }

  const user = await User.findOne({ username, password });

  if (user) {
    // Reset on success
    loginAttempts[username] = { count: 0, lockedUntil: null };
    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#00ff88;">✅ Login successful</h2><br>
        <p>Welcome, <strong>${user.username}</strong></p>
        <br><a href="/auth" style="color:#8b949e;">← Back</a>
      </body>
    `);
  } else {
    // ✅ Increment attempts
    attempts.count += 1;
    const remaining = 3 - attempts.count;

    if (attempts.count >= 3) {
      attempts.lockedUntil = Date.now() + 60 * 1000; // 1 minute
      loginAttempts[username] = attempts;
      return res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <h2 style="color:#00ff88;">🟢 ACCOUNT LOCKED</h2><br>
          <p style="color:#8b949e;">3 failed attempts detected. Account locked for <strong style="color:#00ff88;">60 seconds</strong>.</p>
          <br><a href="/auth" style="color:#8b949e;">← Back</a>
        </body>
      `);
    }

    loginAttempts[username] = attempts;
    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <p style="color:#ff4444;">❌ Wrong password.</p>
        <p style="color:#8b949e;margin-top:8px;">Attempts remaining before lockout: <strong style="color:#00ff88;">${remaining}</strong></p>
        <br><a href="/auth" style="color:#8b949e;">← Try again</a>
      </body>
    `);
  }
});

// ===== RESET attempts =====
router.get("/reset-attempts", (req, res) => {
  Object.keys(loginAttempts).forEach((k) => delete loginAttempts[k]);
  res.redirect("/auth");
});

module.exports = router;
