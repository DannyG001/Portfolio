/* Project registry. Data-driven: add a real project by adding an entry.
   `mount(el)` for built demos renders into the given container.
   `status`: "done" | "progress" | "planned". */

const PROJECTS = [
  {
    id: "portscan",
    title: "Port Scanner Visualizer",
    tags: ["offensive", "recon", "networking"],
    status: "done",
    summary: "Animated nmap-style scan of a mock host — watch ports resolve open/closed/filtered.",
    writeup:
      "Shows what a TCP port scan actually tells you: each port resolves to open, closed, or filtered, mirroring how nmap reports a host's attack surface. I built it to turn raw scanner output — which is dense and easy to misread — into something you can watch happen. Writing it forced me to understand what each port state really means at the packet level (SYN/ACK vs RST vs silence) rather than just reading nmap's summary. Illustrative demo: it scans a mock host in the browser, not a real network.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/portscan.js",
    mount: (el) => DEMO_PORTSCAN(el),
  },
  {
    id: "logdetect",
    title: "Brute-Force Log Detector",
    tags: ["defensive", "detection", "SIEM"],
    status: "done",
    summary: "A live auth-log feed with a tunable detection rule that fires alerts on repeated failures.",
    writeup:
      "A miniature SIEM detection: a streaming auth log plus a threshold rule (N failed logins in a window) that fires alerts, exactly the shape of a real brute-force detection. I built it to explore detection engineering's core tradeoff — tighten the rule and you miss slow attacks, loosen it and you drown in false positives — and the tunable threshold lets you feel that tradeoff live. Illustrative demo: the log feed is simulated in the browser.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/logdetector.js",
    mount: (el) => DEMO_LOGDETECT(el),
  },
  {
    id: "passwd",
    title: "Password Entropy & Crack-Time",
    tags: ["crypto", "auth"],
    status: "done",
    summary: "Type a password: see entropy, estimated crack time, and why hashing choice matters.",
    writeup:
      "Demonstrates why password strength is really about entropy and hashing cost: type a password and watch its entropy, estimated crack time, and how the hash algorithm (fast MD5 vs slow bcrypt) changes the math by orders of magnitude. I built it because 'use a strong password' is advice people ignore until they see the numbers. Working out the crack-time estimates taught me how attacker hardware assumptions and hash choice dominate the calculation far more than adding a symbol does. Illustrative demo: estimates run entirely client-side.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/passwordentropy.js",
    mount: (el) => DEMO_PASSWD(el),
  },
  {
    id: "sqli",
    title: "SQL Injection Sandbox",
    tags: ["web", "exploitation", "secure-coding"],
    status: "done",
    summary: "A fake login where payloads build the live query — then a 'patched' toggle shows parameterized queries blocking it.",
    writeup:
      "Makes SQL injection concrete by showing your input become part of the query in real time: in vulnerable mode a classic <code>' OR '1'='1' --</code> payload rewrites the WHERE clause and logs you in with no password, and the patched toggle switches to a parameterized query where the same payload is just an inert string. I built it because injection is easy to memorize and hard to actually picture — seeing the query assemble is what makes it click. It also drove home the fix: the vulnerability isn't “bad input,” it's mixing code and data, which parameterization separates. Illustrative demo: there's no real database, the outcome is decided by inspecting the assembled string.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/sqli.js",
    mount: (el) => DEMO_SQLI(el),
  },
  {
    id: "ctf",
    title: "CTF Writeups",
    tags: ["offensive", "writeups"],
    status: "done",
    summary: "Challenge cards (category / difficulty / points) that expand into step-by-step solutions with reveal-flag.",
    writeup:
      "Presents Capture-the-Flag solves the way I think through them: each card names the category, difficulty, and points, then expands into the reasoning that gets from the prompt to the flag — cookie tampering, cleartext-credential forensics, single-byte XOR, and path traversal. I built it because a good writeup is as much a skill as the solve itself: explaining <em>why</em> a step works is how you turn a lucky hunch into a repeatable method. Writing these forced me to articulate the root cause behind each bug, not just the exploit. Illustrative: these are example writeups in the style of real solves, not a claim of specific competition placements.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/ctf.js",
    mount: (el) => DEMO_CTF(el),
  },
  {
    id: "honeypot",
    title: "Mini Honeypot Explainer",
    tags: ["defensive", "deception"],
    status: "done",
    summary: "Animated diagram of a fake service capturing attacker input, with a captured-attempts table.",
    writeup:
      "Explains the core insight of a honeypot: a decoy service has no legitimate users, so every single connection to it is inherently suspicious — no false-positive tuning required. This one poses as an open SSH server and logs the usernames and passwords attackers throw at it into a live table. I built it to show why deception is such a high-signal detection strategy compared to sifting real traffic. Watching the captured credentials accumulate (root/123456, admin/admin…) is also a blunt lesson in what automated attackers actually try. Illustrative: the attacker traffic is simulated in the browser; nothing is exposed on a real port.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/honeypot.js",
    mount: (el) => DEMO_HONEYPOT(el),
  },
  {
    id: "phish",
    title: "Phishing Email Analyzer",
    tags: ["defensive", "awareness"],
    status: "done",
    summary: "Paste an email; the tool flags spoofed senders, mismatched links, and urgency cues with explanations.",
    writeup:
      "Turns 'look for the red flags' into something you can measure: paste an email and it highlights lookalike sender domains, links whose host doesn't match the brand they claim, urgency and threat language, and requests for credentials — each with a plain-English reason and a combined risk score. I built it to make the analyst's mental checklist explicit, because most people can spot a bad email but can't say exactly <em>what</em> tipped them off. Writing the heuristics taught me how much phishing detection is pattern-matching on sender/link/urgency signals rather than any single smoking gun. Illustrative: a lightweight rule-based scan, not a production classifier, and it runs entirely in your browser.",
    repoUrl: "https://github.com/DannyG001/Portfolio/blob/main/projects/phish.js",
    mount: (el) => DEMO_PHISH(el),
  },
  {
    id: "jwt",
    title: "JWT Tamper Lab",
    tags: ["web", "auth", "exploitation"],
    status: "planned",
    summary: "Decode a JSON Web Token, flip the payload's role to admin, and see how an 'alg: none' or unverified signature lets it through.",
  },
  {
    id: "xss",
    title: "XSS Playground",
    tags: ["web", "exploitation", "secure-coding"],
    status: "planned",
    summary: "A mock comment box that renders your input raw, then a sanitized toggle — watch a &lt;script&gt; payload fire, then get neutralized by output encoding.",
  },
  {
    id: "hashid",
    title: "Hash Identifier & Cracker",
    tags: ["crypto", "offensive"],
    status: "planned",
    summary: "Paste a hash; it guesses the algorithm from length/format and runs a dictionary attack against a small wordlist to show why unsalted fast hashes fall fast.",
  },
  {
    id: "netflow",
    title: "Network Traffic Anomaly Map",
    tags: ["defensive", "detection", "networking"],
    status: "planned",
    summary: "A live flow map where normal chatter hums along and a beaconing C2 host or port-scan sweep lights up against a learned baseline.",
  },
];

const STATUS_LABEL = { done: "done", progress: "in progress", planned: "planned" };

function renderProjectList() {
  const rows = PROJECTS.map((p) => {
    const badge = `<span class="badge ${p.status}">${STATUS_LABEL[p.status]}</span>`;
    const opener = p.mount
      ? `<span class="open-link" data-open="${p.id}">open ${p.id}</span>`
      : `<span class="muted">[concept]</span>`;
    return `<div class="project-item">
<span class="ok">${p.id}</span> — ${p.title} ${badge}
  <span class="tag">${p.tags.join(" · ")}</span>
  ${p.summary}
  ${opener}
</div>`;
  }).join("\n");
  return `<div class="block"><span class="head">// projects</span>\n${rows}\n<span class="muted">Open one with <span class="kbd">open &lt;id&gt;</span> or click its link.</span></div>`;
}

function getProject(id) {
  return PROJECTS.find((p) => p.id === id);
}
