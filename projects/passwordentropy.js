/* Password Entropy & Crack-Time demo.
   Estimates entropy from the character-set size and length, converts to an
   offline crack-time estimate, and contrasts a fast hash (MD5) with a slow
   one (bcrypt) to show why the KDF choice dominates real-world resistance.
   Everything is computed locally; nothing is sent anywhere. */
function DEMO_PASSWD(el) {
  el.innerHTML = `
    <h3>Password Entropy &amp; Crack-Time</h3>
    <p class="desc">Entropy measures unpredictability in bits. Crack time depends on entropy
      <em>and</em> how the password is stored: a fast hash (MD5) lets an attacker try billions/sec,
      while a deliberately slow hash (bcrypt) throttles them to thousands/sec. Type below —
      nothing leaves your browser.</p>
    <div class="controls">
      <input type="password" id="pw-input" placeholder="type a password…" style="min-width:220px" aria-label="password to analyze" />
      <label><input type="checkbox" id="pw-show" /> show</label>
    </div>
    <div class="meter"><span id="pw-bar"></span></div>
    <div class="pw-stats" id="pw-stats"></div>
    <div class="crack-anim" id="pw-anim"></div>
  `;

  const input = el.querySelector("#pw-input");
  const show = el.querySelector("#pw-show");
  const bar = el.querySelector("#pw-bar");
  const stats = el.querySelector("#pw-stats");
  const anim = el.querySelector("#pw-anim");

  // Guesses/sec for a well-resourced offline attacker (order-of-magnitude).
  const RATES = { MD5: 1e10, bcrypt: 2e4 };

  const COMMON = new Set(["password", "123456", "qwerty", "letmein", "admin", "iloveyou", "111111", "password1"]);

  function charsetSize(pw) {
    let n = 0;
    if (/[a-z]/.test(pw)) n += 26;
    if (/[A-Z]/.test(pw)) n += 26;
    if (/[0-9]/.test(pw)) n += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) n += 33;
    return n || 1;
  }

  function humanTime(seconds) {
    if (seconds < 1) return "instantly";
    const units = [
      ["year", 31557600], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
    ];
    if (seconds > 31557600 * 1e6) return "millions of years";
    for (const [name, s] of units) {
      if (seconds >= s) {
        const v = Math.floor(seconds / s);
        return `${v.toLocaleString()} ${name}${v === 1 ? "" : "s"}`;
      }
    }
    return "instantly";
  }

  function strengthColor(bits) {
    if (bits < 28) return "var(--red)";
    if (bits < 50) return "var(--amber)";
    if (bits < 80) return "var(--cyan)";
    return "var(--green)";
  }
  function strengthLabel(bits) {
    if (bits < 28) return "very weak";
    if (bits < 50) return "weak";
    if (bits < 80) return "reasonable";
    return "strong";
  }

  function update() {
    const pw = input.value;
    if (!pw) {
      bar.style.width = "0";
      stats.innerHTML = `<div class="muted">Waiting for input…</div>`;
      anim.textContent = "";
      return;
    }
    const size = charsetSize(pw);
    const bits = pw.length * Math.log2(size);
    const isCommon = COMMON.has(pw.toLowerCase());
    // Average guesses to crack = half the keyspace.
    const guesses = Math.pow(2, bits) / 2;

    bar.style.width = Math.min(100, (bits / 90) * 100) + "%";
    bar.style.background = strengthColor(bits);

    const md5 = humanTime(guesses / RATES.MD5);
    const bcrypt = humanTime(guesses / RATES.bcrypt);

    stats.innerHTML = `
      <div>length: <span class="ok">${pw.length}</span> · charset: <span class="ok">${size}</span> symbols</div>
      <div>entropy: <span class="ok">${bits.toFixed(1)} bits</span> — <span style="color:${strengthColor(bits)}">${strengthLabel(bits)}</span></div>
      <div>offline crack (MD5, ~10B/s): <span class="warn">${md5}</span></div>
      <div>offline crack (bcrypt, ~20k/s): <span class="ok">${bcrypt}</span></div>
      ${isCommon ? `<div class="err">⚠ appears in common-password lists — cracked instantly by a dictionary attack regardless of entropy.</div>` : ""}
    `;

    animate(pw, isCommon);
  }

  let animTimer = null;
  function animate(pw, isCommon) {
    if (animTimer) clearInterval(animTimer);
    const reduce = window.TERM && window.TERM.reduceMotion;
    if (reduce) { anim.textContent = ""; return; }
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#";
    if (isCommon) {
      anim.innerHTML = `<span class="err">dictionary attack: ${pw} … MATCH ✓</span>`;
      return;
    }
    let ticks = 0;
    animTimer = setInterval(() => {
      const guess = Array.from(pw).map((c, i) =>
        i < Math.floor(ticks / 3) ? c : chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      anim.textContent = `brute forcing: ${guess}`;
      ticks++;
      if (ticks / 3 >= pw.length) {
        clearInterval(animTimer);
        anim.textContent = `brute forcing: ${pw}  (illustrative only)`;
      }
    }, 90);
  }

  show.addEventListener("change", () => {
    input.type = show.checked ? "text" : "password";
  });
  input.addEventListener("input", update);
  update();
}
