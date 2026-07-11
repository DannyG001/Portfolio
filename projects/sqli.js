/* SQL Injection Sandbox — a fake login where you watch your input become
   part of the live query. A "patched" toggle switches to a parameterized
   query so the same payload no longer changes the query's meaning.
   Purely illustrative: no database, no server — the "query result" is
   decided by inspecting the assembled string in the browser. */
function DEMO_SQLI(el) {
  el.innerHTML = `
    <h3>SQL Injection Sandbox</h3>
    <p class="desc">A login builds a SQL query from your input. In <span class="err">vulnerable</span>
      mode the input is concatenated straight into the query, so a payload can rewrite its logic and
      log you in without a password. Flip to <span class="ok">patched</span> to see a parameterized
      query treat the same payload as literal data. Nothing runs server-side — this is illustrative.</p>
    <div class="controls">
      <label>Mode
        <select id="sq-mode">
          <option value="vuln">vulnerable (string concat)</option>
          <option value="safe">patched (parameterized)</option>
        </select>
      </label>
      <button id="sq-fill">insert payload</button>
    </div>
    <div class="controls">
      <input type="text" id="sq-user" placeholder="username" style="min-width:200px" aria-label="username" />
      <input type="text" id="sq-pass" placeholder="password" style="min-width:160px" aria-label="password" />
      <button id="sq-login">log in</button>
    </div>
    <div class="sqli-query" id="sq-query"></div>
    <div class="alertbox" id="sq-result">Enter credentials and log in.</div>
  `;

  const modeSel = el.querySelector("#sq-mode");
  const userIn = el.querySelector("#sq-user");
  const passIn = el.querySelector("#sq-pass");
  const queryBox = el.querySelector("#sq-query");
  const resultBox = el.querySelector("#sq-result");

  const PAYLOAD = "' OR '1'='1' --";
  // The one legitimate row in our pretend users table.
  const REAL = { user: "admin", pass: "s3cr3t" };

  function esc(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function render() {
    const u = userIn.value;
    const p = passIn.value;
    const safe = modeSel.value === "safe";

    if (safe) {
      // Parameters are shown separately from the query text.
      queryBox.innerHTML =
        `<span class="muted">// user input is bound as parameters, never parsed as SQL</span>\n` +
        `SELECT * FROM users\nWHERE username = <span class="ok">?</span> AND password = <span class="ok">?</span>;\n` +
        `<span class="muted">params:</span> [<span class="warn">${esc(u) || "∅"}</span>, <span class="warn">${esc(p) || "∅"}</span>]`;
    } else {
      const raw = `SELECT * FROM users WHERE username = '${u}' AND password = '${p}';`;
      // Highlight the attacker-controlled span so the injection is visible.
      queryBox.innerHTML =
        `SELECT * FROM users WHERE username = '<span class="warn">${esc(u)}</span>' ` +
        `AND password = '<span class="warn">${esc(p)}</span>';`;
      queryBox.dataset.raw = raw;
    }
  }

  function injects(str) {
    // A crude "does this break out of the string literal and neutralize the
    // rest of the clause" check — enough to demonstrate the concept.
    return /'\s*(or|and)\s+/i.test(str) && (/--/.test(str) || /'\s*=\s*'/.test(str));
  }

  function login() {
    const u = userIn.value;
    const p = passIn.value;
    const safe = modeSel.value === "safe";
    render();

    let authed;
    if (safe) {
      // Parameterized: input only matches if it equals a real stored value.
      authed = u === REAL.user && p === REAL.pass;
      resultBox.className = "alertbox";
      resultBox.innerHTML = authed
        ? `<span class="ok">✓ Logged in as ${esc(u)}</span> — correct credentials.`
        : `Access denied. The payload was treated as a literal username/password, so it matched no row.`;
    } else {
      // Vulnerable: real creds OR a successful injection both authenticate.
      const legit = u === REAL.user && p === REAL.pass;
      const injected = injects(u) || injects(p);
      authed = legit || injected;
      if (injected) {
        resultBox.className = "alertbox firing";
        resultBox.innerHTML = `⚠ <span class="err">Authentication bypassed via SQL injection.</span>
The <code>OR '1'='1'</code> makes the WHERE clause always true, and <code>--</code> comments out the
password check — the database returns the first user (admin) with no valid password.`;
      } else if (legit) {
        resultBox.className = "alertbox";
        resultBox.innerHTML = `<span class="ok">✓ Logged in as ${esc(u)}</span> — correct credentials.`;
      } else {
        resultBox.className = "alertbox";
        resultBox.textContent = "Access denied. Wrong username or password.";
      }
    }
  }

  el.querySelector("#sq-fill").addEventListener("click", () => {
    userIn.value = PAYLOAD;
    passIn.value = "anything";
    render();
  });
  el.querySelector("#sq-login").addEventListener("click", login);
  userIn.addEventListener("input", render);
  passIn.addEventListener("input", render);
  modeSel.addEventListener("change", render);
  render();
}
