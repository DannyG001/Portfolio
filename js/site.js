/* Landing-page controller: fills sections from the shared data
   (IDENTITY, SKILLS, PROJECTS) and wires the terminal overlay + demo modal. */
(function () {
  /* ---------- Populate content ---------- */
  document.getElementById("heroName").textContent = IDENTITY.name;
  document.getElementById("heroRole").textContent = IDENTITY.role;
  document.getElementById("heroResume").href = IDENTITY.resume;
  document.getElementById("footerName").textContent = IDENTITY.name;

  document.getElementById("aboutText").innerHTML =
    `I'm <strong>${IDENTITY.name}</strong>, a ${IDENTITY.role.toLowerCase()} at ${IDENTITY.university}. ` +
    `I like breaking things to understand them, then figuring out how to defend them. ` +
    `My focus spans offensive work — recon, web exploitation, CTFs — and the defensive side: ` +
    `log analysis, detection engineering, and incident response. Every project below includes ` +
    `a live, in-browser demo so you can see the process, not just read about it.`;

  document.getElementById("aboutFacts").innerHTML = [
    ["Focus", "Offensive + Defensive security"],
    ["Studying", IDENTITY.university],
    ["Toolbelt", "Python · Bash · Linux · Burp · Wireshark"],
    ["Open to", "Internships & entry-level security roles"],
  ].map(([k, v]) => `<li><span class="fact-k">${k}</span><span class="fact-v">${v}</span></li>`).join("");

  document.getElementById("skillsGrid").innerHTML = SKILLS.map(
    (s) => `<div class="skill-card">
      <h3>${s.group}</h3>
      <div class="chips">${s.items.map((i) => `<span class="chip">${i}</span>`).join("")}</div>
    </div>`
  ).join("");

  document.getElementById("contactLinks").innerHTML = `
    <a class="contact-item" href="mailto:${IDENTITY.email}"><span>✉</span> ${IDENTITY.email}</a>
    <a class="contact-item" href="${IDENTITY.github}" target="_blank" rel="noopener"><span>⌥</span> GitHub</a>
    <a class="contact-item" href="${IDENTITY.linkedin}" target="_blank" rel="noopener"><span>in</span> LinkedIn</a>
    <a class="contact-item" href="${IDENTITY.resume}" target="_blank" rel="noopener"><span>⇩</span> Résumé</a>`;

  /* ---------- Project cards ---------- */
  const STATUS = { done: "done", progress: "in progress", planned: "planned" };
  document.getElementById("projectCards").innerHTML = PROJECTS.map((p) => {
    const demoBtn = p.mount
      ? `<button class="btn btn-sm btn-primary" data-demo="${p.id}">▷ Live demo</button>`
      : `<span class="btn btn-sm btn-disabled" aria-disabled="true">Concept</span>`;
    return `<article class="card">
      <div class="card-top">
        <h3>${p.title}</h3>
        <span class="badge ${p.status}">${STATUS[p.status]}</span>
      </div>
      <div class="card-tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <p class="card-summary">${p.summary}</p>
      <div class="card-actions">
        ${demoBtn}
        <button class="btn btn-sm btn-ghost" data-open-terminal data-term-cmd="open ${p.id}">In terminal</button>
      </div>
    </article>`;
  }).join("");

  /* ---------- Terminal overlay ---------- */
  const termOverlay = document.getElementById("termOverlay");
  let pendingTermCmd = null;

  function openTerminal(cmd) {
    termOverlay.hidden = false;
    document.body.classList.add("no-scroll");
    window.initTerminal(); // safe to call repeatedly; runs once
    pendingTermCmd = cmd || null;
    // Defer so the terminal DOM is laid out before we focus / run a command.
    requestAnimationFrame(() => {
      const input = document.getElementById("cmdInput");
      if (pendingTermCmd && window.terminalRun) window.terminalRun(pendingTermCmd);
      if (input) input.focus();
    });
  }
  function closeTerminal() {
    termOverlay.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  /* ---------- Demo modal ---------- */
  const demoModal = document.getElementById("demoModal");
  const demoMount = document.getElementById("demoMount");
  const demoTitle = document.getElementById("demoModalTitle");

  function openDemo(id) {
    const p = getProject(id);
    if (!p || !p.mount) return;
    teardownDemo();
    demoTitle.textContent = p.title;
    demoMount.innerHTML = "";
    p.mount(demoMount);
    demoModal.hidden = false;
    document.body.classList.add("no-scroll");
  }
  function teardownDemo() {
    // Demos may register a cleanup (e.g. stop a setInterval) on their container.
    const first = demoMount.firstElementChild;
    if (first && typeof first.__cleanup === "function") first.__cleanup();
    if (typeof demoMount.__cleanup === "function") demoMount.__cleanup();
    demoMount.__cleanup = null;
    demoMount.innerHTML = "";
  }
  function closeDemo() {
    teardownDemo();
    demoModal.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  /* ---------- Global event wiring (delegation) ---------- */
  document.addEventListener("click", (e) => {
    const term = e.target.closest("[data-open-terminal]");
    if (term) { e.preventDefault(); openTerminal(term.dataset.termCmd); return; }
    if (e.target.closest("[data-close-terminal]")) { closeTerminal(); return; }
    const demo = e.target.closest("[data-demo]");
    if (demo) { openDemo(demo.dataset.demo); return; }
    if (e.target.closest("[data-close-demo]")) { closeDemo(); return; }
  });

  // Keyboard: Enter/Space activates the big terminal CTA card; Esc closes overlays.
  document.querySelector(".term-cta-card").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTerminal(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!demoModal.hidden) closeDemo();
      else if (!termOverlay.hidden) closeTerminal();
    }
  });

  // Sticky-nav shadow on scroll.
  const nav = document.getElementById("siteNav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
