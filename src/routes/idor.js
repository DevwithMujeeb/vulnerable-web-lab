const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ===== IDOR LAB PAGE =====
router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>04 - IDOR</title>
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
        a.seed { display:inline-block; margin-top:16px; color:#8b949e; font-size:12px; text-decoration:none; }
        a.seed:hover { color:#00ff88; }
      </style>
    </head>
    <body>
      <a class="back" href="/">← Back to Lab</a>
      <br><br>
      <h1>04 — IDOR</h1>
      <p class="subtitle">// Access any user's private data by changing an ID in the URL</p>

      <div class="hint">
        💡 <strong>How to exploit:</strong><br>
        1. Seed users first → <a href="/idor/seed" style="color:#00ff88;">/idor/seed</a><br>
        2. You are logged in as <strong>user1</strong> (pretend)<br>
        3. Vulnerable: visit <code>/idor/vulnerable/profile/[any-id]</code> — see anyone's data<br>
        4. Patched: visit <code>/idor/patched/profile/[other-id]</code> — get blocked<br><br>
        After seeding, user IDs will be shown at <a href="/idor/users" style="color:#00ff88;">/idor/users</a>
      </div>

      <div class="grid">

        <div class="section vuln">
          <h2>🔴 Vulnerable Profile Lookup</h2>
          <form action="/idor/vulnerable/go" method="POST">
            <label>Enter any User ID</label>
            <input type="text" name="userId" placeholder="paste any user ID here" />
            <button class="btn-vuln" type="submit">View Profile (Vulnerable)</button>
          </form>
          <div class="rules">
            ❌ No ownership check<br>
            ❌ Any ID returns that user's data<br>
            ❌ Secrets exposed to anyone
          </div>
        </div>

        <div class="section patch">
          <h2>🟢 Patched Profile Lookup</h2>
          <form action="/idor/patched/go" method="POST">
            <label>Enter any User ID</label>
            <input type="text" name="userId" placeholder="paste any user ID here" />
            <button class="btn-patch" type="submit">View Profile (Patched)</button>
          </form>
          <div class="rules">
            <span>✅ Ownership verified before returning data</span><br>
            <span>✅ Can only view your own profile</span><br>
            <span>✅ Other IDs return 403 Forbidden</span>
          </div>
        </div>

      </div>

      <a class="seed" href="/idor/seed">⚡ Seed 3 test users</a> ·
      <a class="seed" href="/idor/users">👥 View all user IDs</a>

    </body>
    </html>
  `);
});

// ===== SEED 3 users =====
router.get("/seed", async (req, res) => {
  try {
    await User.deleteMany({ username: { $in: ["user1", "user2", "user3"] } });
    await User.create([
      {
        username: "user1",
        password: "pass1",
        email: "user1@lab.com",
        secret: "FLAG{user1_private_data}",
      },
      {
        username: "user2",
        password: "pass2",
        email: "user2@lab.com",
        secret: "FLAG{user2_private_data}",
      },
      {
        username: "user3",
        password: "pass3",
        email: "user3@lab.com",
        secret: "FLAG{user3_private_data}",
      },
    ]);
    res.send(`
      <body style="background:#0d1117;color:#00ff88;font-family:monospace;padding:40px;">
        ✅ 3 users seeded!<br><br>
        Visit <a href="/idor/users" style="color:#8b949e;">/idor/users</a> to get their IDs.
        <br><br><a href="/idor" style="color:#8b949e;">← Back to IDOR lab</a>
      </body>
    `);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ===== LIST all users + IDs (to copy for the exploit) =====
router.get("/users", async (req, res) => {
  const users = await User.find({
    username: { $in: ["user1", "user2", "user3"] },
  });
  const rows = users
    .map(
      (u) => `
    <tr>
      <td style="padding:8px 16px;color:#00ff88;">${u._id}</td>
      <td style="padding:8px 16px;">${u.username}</td>
      <td style="padding:8px 16px;color:#8b949e;">${u.email}</td>
    </tr>
  `,
    )
    .join("");

  res.send(`
    <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
      <h2 style="color:#00ff88;margin-bottom:16px;">All Users — Copy an ID to exploit IDOR</h2>
      <table style="border-collapse:collapse;">
        <tr style="color:#8b949e;font-size:12px;">
          <th style="padding:8px 16px;text-align:left;">_id</th>
          <th style="padding:8px 16px;text-align:left;">username</th>
          <th style="padding:8px 16px;text-align:left;">email</th>
        </tr>
        ${rows}
      </table>
      <br>
      <p style="color:#8b949e;font-size:13px;">
        You are "logged in" as <strong style="color:#00ff88;">user1</strong>.<br>
        Copy user2 or user3's ID and paste it into the vulnerable form.
      </p>
      <br><a href="/idor" style="color:#8b949e;">← Back to IDOR lab</a>
    </body>
  `);
});

// ===== VULNERABLE — no ownership check =====
router.post("/vulnerable/go", async (req, res) => {
  const { userId } = req.body;
  try {
    // ❌ Fetches ANY user by ID — no check if requester owns this profile
    const user = await User.findById(userId);
    if (!user) {
      return res.send(`
        <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
          User not found. <a href="/idor" style="color:#8b949e;">← Back</a>
        </body>
      `);
    }
    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#ff4444;">🔴 VULNERABLE — Profile Data Exposed</h2><br>
        <p>ID: <strong style="color:#00ff88;">${user._id}</strong></p>
        <p>Username: <strong>${user.username}</strong></p>
        <p>Email: <strong>${user.email}</strong></p>
        <p>Secret: <strong style="color:#ff4444;">${user.secret}</strong></p>
        <br>
        <p style="color:#8b949e;font-size:13px;">
          No ownership check was performed. Any authenticated user
          can read any other user's private data.
        </p>
        <br><a href="/idor" style="color:#8b949e;">← Back</a>
      </body>
    `);
  } catch (err) {
    res.send(`
      <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
        Invalid ID format. <a href="/idor" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

// ===== PATCHED — ownership check enforced =====
router.post("/patched/go", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.send(`
        <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
          User not found. <a href="/idor" style="color:#8b949e;">← Back</a>
        </body>
      `);
    }

    // ✅ Simulate: current logged-in user is always "user1"
    const loggedInUser = await User.findOne({ username: "user1" });

    // ✅ Ownership check — block if IDs don't match
    if (!loggedInUser || user._id.toString() !== loggedInUser._id.toString()) {
      return res.send(`
        <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
          <h2 style="color:#00ff88;">🟢 ACCESS DENIED — 403 Forbidden</h2><br>
          <p style="color:#8b949e;">
            You requested profile ID: <strong style="color:#ff4444;">${userId}</strong><br>
            Your profile ID: <strong style="color:#00ff88;">${loggedInUser?._id}</strong><br><br>
            These don't match. You can only view your own profile.
          </p>
          <br><a href="/idor" style="color:#8b949e;">← Back</a>
        </body>
      `);
    }

    res.send(`
      <body style="background:#0d1117;color:#e6edf3;font-family:monospace;padding:40px;">
        <h2 style="color:#00ff88;">✅ Your own profile — access granted</h2><br>
        <p>Username: <strong>${user.username}</strong></p>
        <p>Email: <strong>${user.email}</strong></p>
        <br><a href="/idor" style="color:#8b949e;">← Back</a>
      </body>
    `);
  } catch (err) {
    res.send(`
      <body style="background:#0d1117;color:#ff4444;font-family:monospace;padding:40px;">
        Invalid ID format. <a href="/idor" style="color:#8b949e;">← Back</a>
      </body>
    `);
  }
});

module.exports = router;
