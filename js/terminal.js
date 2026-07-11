/* Terminal engine: input, history, routing, output printing.
   Exposed as window.initTerminal(); runs once, the first time the
   terminal overlay is opened (see js/site.js). */
let __terminalInitialized = false;
window.initTerminal = function initTerminal() {
  if (__terminalInitialized) return;
  __terminalInitialized = true;

  const scrollback = document.getElementById("scrollback");
  const form = document.getElementById("inputForm");
  const input = document.getElementById("cmdInput");
  const motionToggle = document.getElementById("motionToggle");

  const history = [];
  let histIdx = -1;

  // Motion preference: OS default, overridable by the toggle.
  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function syncMotionLabel() {
    motionToggle.textContent = reduceMotion ? "motion: off" : "motion: on";
  }
  syncMotionLabel();
  motionToggle.addEventListener("click", () => {
    reduceMotion = !reduceMotion;
    syncMotionLabel();
  });
  window.TERM = { get reduceMotion() { return reduceMotion; }, scrollToBottom };

  function scrollToBottom() {
    scrollback.scrollTop = scrollback.scrollHeight;
  }

  /* ---- Draggable window, clamped to the viewport ----
     The window is switched to fixed positioning on first drag so it leaves
     document flow: dragging then can't grow the page, toggle a scrollbar, or
     feed back into the clamp (which was the source of the jitter). We clamp
     against clientWidth/clientHeight, which exclude any scrollbar. */
  (function enableDrag() {
    const term = document.getElementById("terminal");
    const bar = document.getElementById("titlebar");
    if (!term || !bar) return;

    let fixedMode = false;
    let startX = 0, startY = 0, startL = 0, startT = 0, dragging = false;

    function viewportW() { return document.documentElement.clientWidth; }
    function viewportH() { return document.documentElement.clientHeight; }

    // Constrain a desired top-left so the whole box stays inside the viewport.
    // Exposed for testing. (When the window is bigger than the viewport, pin to 0.)
    function clampPos(left, top, w, h, vw, vh) {
      const maxL = Math.max(0, vw - w);
      const maxT = Math.max(0, vh - h);
      return {
        left: Math.min(Math.max(0, left), maxL),
        top: Math.min(Math.max(0, top), maxT),
      };
    }
    window.__clampPos = clampPos; // test hook

    function goFixed() {
      const r = term.getBoundingClientRect();
      term.style.position = "fixed";
      term.style.margin = "0";
      term.style.width = r.width + "px";
      term.style.height = r.height + "px";
      term.style.left = r.left + "px";
      term.style.top = r.top + "px";
      fixedMode = true;
    }

    function setPos(left, top) {
      const r = term.getBoundingClientRect();
      const c = clampPos(left, top, r.width, r.height, viewportW(), viewportH());
      term.style.left = c.left + "px";
      term.style.top = c.top + "px";
    }

    function onDown(e) {
      // Ignore drags starting on interactive controls in the bar.
      if (e.target.closest("button, .winbtn")) return;
      if (!fixedMode) goFixed();
      dragging = true;
      bar.classList.add("dragging");
      startX = e.clientX;
      startY = e.clientY;
      startL = parseFloat(term.style.left) || 0;
      startT = parseFloat(term.style.top) || 0;
      if (bar.setPointerCapture && e.pointerId != null) {
        try { bar.setPointerCapture(e.pointerId); } catch (_) {}
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      setPos(startL + (e.clientX - startX), startT + (e.clientY - startY));
    }
    function onUp() {
      dragging = false;
      bar.classList.remove("dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    bar.addEventListener("pointerdown", onDown);
    // If the viewport shrinks, pull the window back inside.
    window.addEventListener("resize", () => {
      if (fixedMode) setPos(parseFloat(term.style.left) || 0, parseFloat(term.style.top) || 0);
    });
  })();

  function appendHTML(html) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    scrollback.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function echoCommand(cmd) {
    appendHTML(
      `<div class="line echo"><span class="p">guest@${"YOUR_NAME"}-portfolio:~$</span> ${escapeHTML(cmd)}</div>`
    );
  }

  function escapeHTML(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  window.terminalRun = run; // let the landing page drive the terminal
  function run(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    echoCommand(cmd);
    history.push(cmd);
    histIdx = history.length;

    const [name, ...args] = cmd.split(/\s+/);
    const lower = name.toLowerCase();

    if (lower === "clear") {
      scrollback.innerHTML = "";
      return;
    }
    if (lower === "projects") {
      appendHTML(renderProjectList());
      return;
    }
    if (lower === "open") {
      return openProject(args[0]);
    }
    // Multi-word easter egg
    if (COMMANDS[cmd.toLowerCase()]) {
      appendHTML(COMMANDS[cmd.toLowerCase()]());
      return;
    }
    if (COMMANDS[lower]) {
      appendHTML(COMMANDS[lower]());
      return;
    }
    appendHTML(
      `<div class="line err">command not found: ${escapeHTML(name)}</div><div class="line muted">type <span class="kbd">help</span> for options.</div>`
    );
  }

  function openProject(id) {
    if (!id) {
      appendHTML(`<div class="line err">usage: open &lt;id&gt;</div><div class="line muted">see <span class="kbd">projects</span></div>`);
      return;
    }
    const p = getProject(id);
    if (!p) {
      appendHTML(`<div class="line err">no such project: ${escapeHTML(id)}</div>`);
      return;
    }
    if (!p.mount) {
      appendHTML(
        `<div class="block"><span class="head">${p.title}</span> <span class="badge planned">planned</span>\n${p.summary}\n<span class="muted">Concept only for now — the interactive demo is on the roadmap.</span></div>`
      );
      return;
    }
    const wrap = appendHTML(`<div class="demo" id="demo-${p.id}"></div>`);
    const el = wrap.querySelector(".demo");
    p.mount(el);
    scrollToBottom();
  }

  // Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });

  // History navigation
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; moveCaretEnd(); }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
      else { histIdx = history.length; input.value = ""; }
      e.preventDefault();
    }
  });
  function moveCaretEnd() {
    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
  }

  // Clickable nav + inline open links (event delegation)
  document.querySelector(".quicknav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-cmd]");
    if (btn) { run(btn.dataset.cmd); input.focus(); }
  });
  scrollback.addEventListener("click", (e) => {
    const link = e.target.closest("[data-open]");
    if (link) { run("open " + link.dataset.open); }
  });

  // Keep focus in the input when clicking empty terminal space
  document.getElementById("terminal").addEventListener("click", (e) => {
    if (!e.target.closest("button, a, input, .demo, [data-open]")) input.focus();
  });

  // Boot banner
  appendHTML(`<div class="block muted">
 __ _  ___  ___
/ _\` |/ __|/ __|   <span class="ok">security portfolio v1.0</span>
\\__,_|\\___|\\___|   type <span class="kbd">help</span> to begin
</div>`);
  COMMANDS.about && appendHTML(COMMANDS.about());
  input.focus();
};
