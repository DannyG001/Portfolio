/* Content + static commands. Edit IDENTITY once to personalize the whole site. */

const IDENTITY = {
  name: "YOUR_NAME",
  role: "Cybersecurity Student · Aspiring Pentester / Blue Teamer",
  university: "YOUR_UNIVERSITY",
  email: "you@example.com",
  github: "https://github.com/YOUR_HANDLE",
  linkedin: "https://linkedin.com/in/YOUR_HANDLE",
  resume: "assets/resume.pdf",
};

const SKILLS = [
  { group: "Offensive", items: ["Network recon (nmap)", "Web exploitation (OWASP Top 10)", "Burp Suite", "Privilege escalation", "CTF challenges"] },
  { group: "Defensive", items: ["Log analysis / SIEM thinking", "Detection engineering", "Incident response basics", "Honeypots", "Wireshark"] },
  { group: "Tooling & Code", items: ["Python", "Bash", "Linux", "Git", "JavaScript", "SQL"] },
  { group: "Concepts", items: ["Cryptography basics", "TCP/IP networking", "Threat modeling", "Secure coding"] },
];

/* Each command returns an HTML string appended to scrollback.
   Commands needing custom DOM (project demos) live in projects.js. */
const COMMANDS = {
  help() {
    return `<div class="block">
<span class="head">Available commands</span>
  <span class="kbd">about</span>     who I am
  <span class="kbd">whoami</span>    one-line intro
  <span class="kbd">skills</span>    technical skills
  <span class="kbd">projects</span>  list projects (then <span class="kbd">open &lt;id&gt;</span>)
  <span class="kbd">open</span>      open a project demo, e.g. <span class="kbd">open portscan</span>
  <span class="kbd">contact</span>   how to reach me
  <span class="kbd">clear</span>     clear the screen
  <span class="kbd">help</span>      this menu
<span class="muted">Try the buttons above too. ↑/↓ recalls history.</span>
</div>`;
  },

  about() {
    return `<div class="block">
<span class="head">// about</span>
Hi — I'm <span class="ok">${IDENTITY.name}</span>, a ${IDENTITY.role.toLowerCase()} at ${IDENTITY.university}.
I like breaking things to understand them, then figuring out how to defend them.
This portfolio is itself a demo: everything runs client-side, and each project below
includes an interactive piece so you can <span class="warn">see the process</span>, not just read about it.

Type <span class="kbd">projects</span> to explore, or <span class="kbd">skills</span> for the stack.
</div>`;
  },

  whoami() {
    return `<div class="line"><span class="ok">${IDENTITY.name}</span> — ${IDENTITY.role}</div>`;
  },

  skills() {
    const blocks = SKILLS.map(
      (s) =>
        `<span class="head">${s.group}</span>\n  ${s.items.join("\n  ")}`
    ).join("\n\n");
    return `<div class="block">${blocks}</div>`;
  },

  contact() {
    return `<div class="block">
<span class="head">// contact</span>
  email     <a href="mailto:${IDENTITY.email}">${IDENTITY.email}</a>
  github    <a href="${IDENTITY.github}" target="_blank" rel="noopener">${IDENTITY.github}</a>
  linkedin  <a href="${IDENTITY.linkedin}" target="_blank" rel="noopener">${IDENTITY.linkedin}</a>
  resume    <a href="${IDENTITY.resume}" target="_blank" rel="noopener">${IDENTITY.resume}</a>
<span class="muted">(placeholders — swap them in js/commands.js → IDENTITY)</span>
</div>`;
  },

  // Easter eggs
  sudo() {
    return `<div class="line err">user is not in the sudoers file. This incident will be reported. 😏</div>`;
  },
  ls() {
    return `<div class="line muted">about.txt  skills.txt  projects/  contact.txt  resume.pdf</div>`;
  },
  "nmap localhost"() {
    return `<div class="line muted">Nice try. Run <span class="kbd">open portscan</span> for the real interactive scan.</div>`;
  },
};
