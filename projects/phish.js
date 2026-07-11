/* Phishing Email Analyzer — paste (or load) an email and get heuristic flags
   for spoofed senders, mismatched links, urgency cues, and credential lures.
   Illustrative: a lightweight rule-based scan, not a production classifier.
   All analysis happens locally in the browser. */
function DEMO_PHISH(el) {
  const SAMPLE =
`From: PayPal Security <service@paypa1-secure.com>
Subject: URGENT: Your account has been limited!

Dear valued customer,

We detected unusual activity. Your account will be suspended within 24 hours
unless you verify your information immediately.

Click here to verify: http://paypal.account-verify.ru/login

Failure to act now will result in permanent account closure.

Regards,
PayPal Security Team`;

  el.innerHTML = `
    <h3>Phishing Email Analyzer</h3>
    <p class="desc">Paste a raw email. The analyzer flags common phishing signals — lookalike sender
      domains, links whose destination doesn't match their text, urgency/threat language, and requests
      for credentials. Heuristic and illustrative, not a definitive verdict. Runs entirely in your browser.</p>
    <div class="controls">
      <button id="ph-sample">load sample</button>
      <button id="ph-scan">analyze</button>
      <button id="ph-clear">clear</button>
    </div>
    <textarea id="ph-input" class="ph-input" rows="9" placeholder="paste an email (headers + body)…" aria-label="email to analyze"></textarea>
    <div class="ph-score" id="ph-score"></div>
    <div class="ph-flags" id="ph-flags"></div>
  `;

  const input = el.querySelector("#ph-input");
  const scoreBox = el.querySelector("#ph-score");
  const flagsBox = el.querySelector("#ph-flags");

  const URGENT = /\b(urgent|immediately|within \d+ hours?|suspend|suspended|verify (your )?(account|information)|act now|failure to|permanent|limited|unusual activity|final notice)\b/gi;
  const CRED = /\b(password|login|verify your identity|confirm your|ssn|social security|card number|cvv|bank details)\b/gi;
  const KNOWN_BRANDS = ["paypal", "apple", "microsoft", "amazon", "google", "netflix", "bank"];

  function esc(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function analyze() {
    const text = input.value.trim();
    flagsBox.innerHTML = "";
    if (!text) {
      scoreBox.className = "ph-score";
      scoreBox.textContent = "";
      flagsBox.innerHTML = `<div class="muted">Nothing to analyze — paste an email or load the sample.</div>`;
      return;
    }
    const flags = [];

    // 1. Sender domain: lookalike of a known brand?
    const fromMatch = text.match(/^From:.*?<?([\w.+-]+@[\w.-]+)>?/im);
    const fromDomain = fromMatch ? fromMatch[1].split("@")[1].toLowerCase() : null;
    if (fromDomain) {
      const brandHit = KNOWN_BRANDS.find((b) => fromDomain.includes(b) || lookalike(fromDomain, b));
      if (brandHit && !fromDomain.endsWith(brandHit + ".com")) {
        flags.push(["high", `Sender domain <code>${esc(fromDomain)}</code> imitates <b>${brandHit}</b> but isn't the official <code>${brandHit}.com</code> — likely a spoof/lookalike.`]);
      }
      if (/\d/.test(fromDomain.split(".")[0]) && KNOWN_BRANDS.some((b) => fromDomain.includes(b.replace("l", "1").replace("o", "0")))) {
        // covered by lookalike above in most cases
      }
    }

    // 2. Links: raw URLs, suspicious TLDs, IP hosts, brand-in-path tricks.
    const urls = text.match(/https?:\/\/[^\s"'<>)]+/gi) || [];
    urls.forEach((u) => {
      const host = (u.match(/^https?:\/\/([^\/]+)/i) || [])[1] || "";
      if (/^https?:\/\//i.test(u) && !/^https:/i.test(u)) {
        flags.push(["med", `Link uses insecure <code>http://</code>: <code>${esc(u)}</code>`]);
      }
      if (/\.(ru|tk|xyz|top|cn|zip)(\/|$|:)/i.test(host)) {
        flags.push(["high", `Link points to a suspicious/uncommon TLD: <code>${esc(host)}</code>`]);
      }
      if (/^\d{1,3}(\.\d{1,3}){3}/.test(host)) {
        flags.push(["high", `Link goes to a raw IP address instead of a domain: <code>${esc(host)}</code>`]);
      }
      const brandInPath = KNOWN_BRANDS.find((b) => u.toLowerCase().includes(b) && !host.toLowerCase().includes(b + ".com"));
      if (brandInPath) {
        flags.push(["med", `Brand name "<b>${brandInPath}</b>" appears in the URL path but the real host is <code>${esc(host)}</code> — a common disguise.`]);
      }
    });

    // 3. Urgency / threat language.
    const urgent = [...new Set((text.match(URGENT) || []).map((m) => m.toLowerCase()))];
    if (urgent.length >= 2) {
      flags.push(["med", `Urgency / threat language (${urgent.length} cues): ${urgent.slice(0, 5).map((u) => `<code>${esc(u)}</code>`).join(", ")}. Pressure to act fast is a classic manipulation tactic.`]);
    }

    // 4. Credential / sensitive-info requests.
    const cred = [...new Set((text.match(CRED) || []).map((m) => m.toLowerCase()))];
    if (cred.length) {
      flags.push(["high", `Requests sensitive information: ${cred.map((c) => `<code>${esc(c)}</code>`).join(", ")}. Legitimate providers don't ask for this by email.`]);
    }

    // 5. Generic greeting.
    if (/\b(dear (valued )?(customer|user|member)|dear account holder)\b/i.test(text)) {
      flags.push(["low", `Generic greeting ("Dear valued customer") instead of your name — mass-sent phish rarely personalize.`]);
    }

    render(flags);
  }

  // Cheap edit-distance-ish lookalike: same length-ish, brand recoverable by
  // undoing common homoglyph swaps (l→1, o→0, i→1).
  function lookalike(domain, brand) {
    const norm = domain.replace(/1/g, "l").replace(/0/g, "o");
    return norm.includes(brand);
  }

  function render(flags) {
    const score = flags.reduce((s, [sev]) => s + (sev === "high" ? 3 : sev === "med" ? 2 : 1), 0);
    let verdict, cls;
    if (score >= 6) { verdict = "Very likely phishing"; cls = "firing"; }
    else if (score >= 3) { verdict = "Suspicious — treat with caution"; cls = "warn-box"; }
    else if (score >= 1) { verdict = "Minor red flags"; cls = ""; }
    else { verdict = "No obvious phishing signals detected"; cls = "ok-box"; }

    scoreBox.className = "ph-score " + cls;
    scoreBox.innerHTML = `Risk score: <b>${score}</b> — ${verdict}`;

    if (!flags.length) {
      flagsBox.innerHTML = `<div class="muted">No heuristics triggered. (Absence of flags isn't proof it's safe — always verify the sender independently.)</div>`;
      return;
    }
    const order = { high: 0, med: 1, low: 2 };
    flags.sort((a, b) => order[a[0]] - order[b[0]]);
    flagsBox.innerHTML = flags.map(([sev, msg]) =>
      `<div class="ph-flag sev-${sev}"><span class="ph-sev">${sev.toUpperCase()}</span> ${msg}</div>`
    ).join("");
  }

  el.querySelector("#ph-sample").addEventListener("click", () => { input.value = SAMPLE; analyze(); });
  el.querySelector("#ph-scan").addEventListener("click", analyze);
  el.querySelector("#ph-clear").addEventListener("click", () => { input.value = ""; analyze(); });
  analyze();
}
