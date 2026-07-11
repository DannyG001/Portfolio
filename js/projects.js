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
    status: "planned",
    summary: "A fake login where payloads build the live query — then a 'patched' toggle shows parameterized queries blocking it.",
  },
  {
    id: "ctf",
    title: "CTF Writeups",
    tags: ["offensive", "writeups"],
    status: "planned",
    summary: "Challenge cards (category / difficulty / points) that expand into step-by-step solutions with reveal-flag.",
  },
  {
    id: "honeypot",
    title: "Mini Honeypot Explainer",
    tags: ["defensive", "deception"],
    status: "planned",
    summary: "Animated diagram of a fake service capturing attacker input, with a captured-attempts table.",
  },
  {
    id: "phish",
    title: "Phishing Email Analyzer",
    tags: ["defensive", "awareness"],
    status: "planned",
    summary: "Paste an email; the tool flags spoofed senders, mismatched links, and urgency cues with explanations.",
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
