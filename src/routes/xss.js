const express = require("express");
const router = express.Router();

let vulnerableList = [];
let patchedList = [];

router.get("/", (req, res) => {
  const vulnerableComments =
    vulnerableList
      .map(
        (c) => `
    <div class="comment">
      <span class="author">${c.author}</span>
      <p>${c.message}</p>
    </div>
  `,
      )
      .join("") ||
    '<p style="color:#8b949e">No comments yet. Add one above.</p>';

  const patchedComments =
    patchedList
      .map(
        (c) => `
    <div class="comment">
      <span class="author">${escapeHtml(c.author)}</span>
      <p>${escapeHtml(c.message)}</p>
    </div>
  `,
      )
      .join("") ||
    '<p style="color:#8b949e">No comments yet. Add one above.</p>';

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>02 - XSS</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#0d1117; color:#e6edf3; font-family:monospace; padding:40px; }
        h1 { color:#00ff88; margin-bottom:8px; }
        .subtitle { color:#8b949e; margin-bottom:32px; font-size:13px; }
        .hint { background:#1e2a1e; border:1px solid #00ff88; border-radius:6px; padding:12px; margin-bottom:24px; font-size:13px; color:#00ff88; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .section { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:24px; }
        .section h2 { margin-bottom:16px; font-size:15px; }
        .vuln h2 { color:#ff4444; }
        .patch h2 { color:#00ff88; }
        label { display:block; color:#8b949e; font-size:12px; margin-bottom:6px; margin-top:14px; }
        input, textarea { width:100%; background:#0d1117; border:1px solid #30363d; color:#e6edf3; padding:10px; border-radius:6px; font-family:monospace; font-size:13px; }
        textarea { height:80px; resize:vertical; }
        button { margin-top:12px; width:100%; padding:10px; border:none; border-radius:6px; font-family:monospace; font-size:13px; cursor:pointer; }
        .btn-vuln { background:#ff4444; color:white; }
        .btn-patch { background:#00ff88; color:#0d1117; font-weight:bold; }
        .comments { margin-top:16px; border-top:1px solid #30363d; padding-top:16px; }
        .comment { background:#0d1117; border:1px solid #30363d; border-radius:6px; padding:12px; margin-bottom:8px; }
        .author { color:#00ff88; font-size:12px; display:block; margin-bottom:4px; }
        .back { color:#8b949e; text-decoration:none; font-size:13px; }
        .back:hover { color:#00ff88; }
        a.clear { display:inline-block; margin-top:16px; color:#ff4444; font-size:12px; text-decoration:none; }
      </style>
    </head>
    <body>
      <a class="back" href="/">← Back to Lab</a>
      <br><br>
      <h1>02 — Cross-Site Scripting (XSS)</h1>
      <p class="subtitle">// Inject JavaScript that executes in the browser</p>

      <div class="hint">
        💡 <strong>Exploit hint:</strong> In the vulnerable form, try this as your message:<br><br>
        <code>&lt;script&gt;alert('XSS by ' + document.domain)&lt;/script&gt;</code><br><br>
        Or try stealing a cookie: <code>&lt;script&gt;alert('Cookie: ' + document.cookie)&lt;/script&gt;</code>
      </div>

      <div class="grid">

        <div class="section vuln">
          <h2>🔴 Vulnerable Comment Box</h2>
          <form action="/xss/vulnerable-comment" method="POST">
            <label>Your name</label>
            <input type="text" name="author" placeholder="Enter your name" />
            <label>Comment</label>
            <textarea name="message" placeholder="Try: <script>alert('XSS')</script>"></textarea>
            <button class="btn-vuln" type="submit">Post Comment (Vulnerable)</button>
          </form>
          <div class="comments">
            <p style="color:#8b949e;font-size:12px;margin-bottom:12px;">Comments (rendered raw):</p>
            ${vulnerableComments}
          </div>
        </div>

        <div class="section patch">
          <h2>🟢 Patched Comment Box</h2>
          <form action="/xss/patched-comment" method="POST">
            <label>Your name</label>
            <input type="text" name="author" placeholder="Enter your name" />
            <label>Comment</label>
            <textarea name="message" placeholder="Try the same script — it won't execute"></textarea>
            <button class="btn-patch" type="submit">Post Comment (Patched)</button>
          </form>
          <div class="comments">
            <p style="color:#8b949e;font-size:12px;margin-bottom:12px;">Comments (HTML escaped):</p>
            ${patchedComments}
          </div>
        </div>

      </div>

      <a class="clear" href="/xss/clear">🗑 Clear all comments</a>

    </body>
    </html>
  `);
});

router.post("/vulnerable-comment", (req, res) => {
  const { author, message } = req.body;
  // ❌ No sanitization — raw input rendered directly, allowing script injection
  vulnerableList.push({ author, message });
  res.redirect("/xss");
});

router.post("/patched-comment", (req, res) => {
  const { author, message } = req.body;
  // ✅ Stored raw but escaped on render via escapeHtml()
  patchedList.push({ author, message });
  res.redirect("/xss");
});

router.get("/clear", (req, res) => {
  vulnerableList = [];
  patchedList = [];
  res.redirect("/xss");
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = router;
