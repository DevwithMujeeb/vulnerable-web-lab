const express = require("express");
const router = express.Router();

// ===== MISCONFIG LAB PAGE =====
router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>05 - Security Misconfiguration</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0d1117; color:#e6edf3; font-family:monospace; padding:40px; }
        h1 { color:#00ff88; margin-bottom:8px; }
        .subtitle { color:#8b949e; margin-bottom:32px; font-size:13px; }
        .hint { background:#1e2a1e; border:1px solid #00ff88; border-radius:6px; padding:12px; margin-bottom:24px; font-size:13px; color:#00ff88; line-height:1.8; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
        .section { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:24px; }
        .section h2 { margin-bottom:16px; font-size:15px; }
        .vuln h2 { color:#ff4444; }
        .patch h2 { color:#00ff88; }
        .link-list a { display:block; padding:10px 14px; background:#0d1117; border:1px solid #30363d; border-radius:6px; color:#e6edf3; text-decoration:none; margin-bottom:8px; font-size:13px; transition:border-color 0.2s; }
        .link-list a:hover { border-color:#ff4444; color:#ff4444; }
        .link-list.safe a:hover { border-color:#00ff88; color:#00ff88; }
        .rules { margin-top:16px; background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:12px; font-size:12px; color:#8b949e; line-height:1.8; }
        .rules span { color:#00ff88; }
        .back { color:#8b949e; text-decoration:none; font-size:13px; }
        .back:hover { color:#00ff88; }
      </style>
    </head>
    <body>
      <a class="back" href="/">← Back to Lab</a>
      <br><br>
      <h1>05 — Security Misconfiguration</h1>
      <p class="subtitle">// Server leaks stack traces, debug info, and internal details</p>

      <div class="hint">
        💡 <strong>How to exploit:</strong><br>
        Click each vulnerable endpoint — notice what the server reveals.<br>
        Then click the patched versions — see how the same errors are handled safely.
      </div>

      <div class="grid">

        <div class="section vuln">
          <h2>🔴 Vulnerable Endpoints</h2>
          <div class="link-list">
            <a href="/misconfig/vulnerable/error">Trigger a server error</a>
            <a href="/misconfig/vulnerable/debug">Access debug endpoint</a>
            <a href="/misconfig/vulnerable/config">View server config</a>
          </div>
          <div class="rules">
            ❌ Full stack traces exposed<br>
            ❌ Debug endpoints open in production<br>
            ❌ Internal config details leaked<br>
            ❌ Tech stack revealed to attackers
          </div>
        </div>

        <div class="section patch">
          <h2>🟢 Patched Endpoints</h2>
          <div class="link-list safe">
            <a href="/misconfig/patched/error">Trigger a server error</a>
            <a href="/misconfig/patched/debug">Access debug endpoint</a>
            <a href="/misconfig/patched/config">View server config</a>
          </div>
          <div class="rules">
            <span>✅ Generic error messages only</span><br>
            <span>✅ Debug endpoints disabled</span><br>
            <span>✅ No internal details exposed</span><br>
            <span>✅ Stack traces hidden from client</span>
          </div>
        </div>

      </div>

    </body>
    </html>
  `);
});

// ===================================================
// 🔴 VULNERABLE ENDPOINTS
// ===================================================

// Vulnerable error — leaks full stack trace
router.get("/vulnerable/error", (req, res) => {
  try {
    // ❌ Intentionally trigger an error
    const obj = null;
    obj.nonExistentMethod(); // throws TypeError
  } catch (err) {
    // ❌ VULNERABLE: sends full error details to client
    res.status(500).send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#ff4444;">🔴 500 Internal Server Error</h2><br>
        <p style="color:#ff4444;">Error: ${err.message}</p><br>
        <pre style="background:#161b22;padding:16px;border-radius:6px;color:#ff8888;font-size:12px;overflow:auto;">${err.stack}</pre>
        <br>
        <p style="color:#8b949e;font-size:13px;">
          The full stack trace reveals: file paths, line numbers,
          Node.js version, and internal code structure.
          Attackers use this to craft targeted exploits.
        </p>
        <br><a href="/misconfig" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

// Vulnerable debug — open debug endpoint
router.get("/vulnerable/debug", (req, res) => {
  // ❌ VULNERABLE: debug endpoint left open
  res.send(`
    <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
      <h2 style="color:#ff4444;">🔴 DEBUG ENDPOINT — Should not exist in production</h2><br>
      <pre style="background:#161b22;padding:16px;border-radius:6px;color:#00ff88;font-size:12px;">
{
  "environment": "production",
  "nodeVersion": "${process.version}",
  "platform": "${process.platform}",
  "memoryUsage": ${JSON.stringify(process.memoryUsage(), null, 2)},
  "uptime": "${process.uptime().toFixed(2)} seconds",
  "cwd": "${process.cwd()}",
  "pid": ${process.pid}
}
      </pre>
      <p style="color:#8b949e;font-size:13px;">
        This endpoint reveals the server's runtime environment,
        memory layout, working directory, and process ID.
      </p>
      <br><a href="/misconfig" style="color:#8b949e;">← Back</a>
    </body>
  `);
});

// Vulnerable config — leaks internal config
router.get("/vulnerable/config", (req, res) => {
  // ❌ VULNERABLE: exposes internal configuration
  res.send(`
    <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
      <h2 style="color:#ff4444;">🔴 SERVER CONFIG EXPOSED</h2><br>
      <pre style="background:#161b22;padding:16px;border-radius:6px;color:#00ff88;font-size:12px;">
{
  "database": "mongodb+srv://user:p@ssw0rd@cluster.mongodb.net/app",
  "jwtSecret": "my_super_secret_jwt_key_12345",
  "adminEmail": "admin@company.com",
  "apiKeys": {
    "stripe": "sk_live_abc123xyz",
    "sendgrid": "SG.abc123xyz"
  },
  "debug": true,
  "version": "1.0.0"
}
      </pre>
      <p style="color:#8b949e;font-size:13px;">
        Exposed config reveals database credentials, JWT secrets,
        and API keys — complete account takeover possible.
      </p>
      <br><a href="/misconfig" style="color:#8b949e;">← Back</a>
    </body>
  `);
});

// ===================================================
// 🟢 PATCHED ENDPOINTS
// ===================================================

// Patched error — generic message only
router.get("/patched/error", (req, res) => {
  try {
    const obj = null;
    obj.nonExistentMethod();
  } catch (err) {
    // ✅ PATCHED: log internally, return generic message
    console.error("[INTERNAL ERROR]", err.stack); // logged server-side only
    res.status(500).send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#00ff88;">🟢 500 Internal Server Error (Patched)</h2><br>
        <p style="color:#8b949e;">Something went wrong. Please try again later.</p>
        <br>
        <p style="color:#3d6b4f;font-size:13px;">
          The real error is logged server-side only.<br>
          Check your terminal to see it — the client sees nothing useful.
        </p>
        <br><a href="/misconfig" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

// Patched debug — endpoint disabled
router.get("/patched/debug", (req, res) => {
  // ✅ PATCHED: debug endpoint disabled
  res.status(404).send(`
    <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
      <h2 style="color:#00ff88;">🟢 404 Not Found (Patched)</h2><br>
      <p style="color:#8b949e;">This endpoint does not exist.</p>
      <br>
      <p style="color:#3d6b4f;font-size:13px;">
        Debug endpoints must be disabled or protected
        behind authentication in production environments.
      </p>
      <br><a href="/misconfig" style="color:#8b949e;">← Back</a>
    </body>
  `);
});

// Patched config — access denied
router.get("/patched/config", (req, res) => {
  // ✅ PATCHED: no config exposed
  res.status(403).send(`
    <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
      <h2 style="color:#00ff88;">🟢 403 Forbidden (Patched)</h2><br>
      <p style="color:#8b949e;">Access denied.</p>
      <br>
      <p style="color:#3d6b4f;font-size:13px;">
        Configuration endpoints must never be publicly accessible.<br>
        Sensitive config belongs in environment variables only.
      </p>
      <br><a href="/misconfig" style="color:#8b949e;">← Back</a>
    </body>
  `);
});

module.exports = router;
