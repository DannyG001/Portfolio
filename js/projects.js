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
    mount: (el) => DEMO_PORTSCAN(el),
  },
  {
    id: "logdetect",
    title: "Brute-Force Log Detector",
    tags: ["defensive", "detection", "SIEM"],
    status: "done",
    summary: "A live auth-log feed with a tunable detection rule that fires alerts on repeated failures.",
    mount: (el) => DEMO_LOGDETECT(el),
  },
  {
    id: "passwd",
    title: "Password Entropy & Crack-Time",
    tags: ["crypto", "auth"],
    status: "done",
    summary: "Type a password: see entropy, estimated crack time, and why hashing choice matters.",
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
