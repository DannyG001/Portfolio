/* Port Scanner Visualizer — animated mock nmap-style scan.
   Purely illustrative: no real network activity happens. */
function DEMO_PORTSCAN(el) {
  const HOST = "10.10.14.7 (mock-target)";
  // Ports the "scan" will probe; result is scripted for a believable demo.
  const PORTS = [
    { port: 22, svc: "ssh", state: "open" },
    { port: 80, svc: "http", state: "open" },
    { port: 443, svc: "https", state: "open" },
    { port: 21, svc: "ftp", state: "closed" },
    { port: 23, svc: "telnet", state: "filtered" },
    { port: 25, svc: "smtp", state: "closed" },
    { port: 139, svc: "netbios", state: "filtered" },
    { port: 445, svc: "smb", state: "open" },
    { port: 3306, svc: "mysql", state: "closed" },
    { port: 3389, svc: "rdp", state: "filtered" },
    { port: 8080, svc: "http-alt", state: "open" },
    { port: 53, svc: "dns", state: "closed" },
  ];

  el.innerHTML = `
    <h3>Port Scanner Visualizer</h3>
    <p class="desc">A scan probes each port and classifies it: <span class="ok">open</span> (service listening),
      <span class="muted">closed</span> (reachable but nothing there), or <span class="err">filtered</span>
      (a firewall dropped the probe — no reply). This is the first step of recon: map the attack surface.</p>
    <div class="controls">
      <label>Scan type
        <select id="ps-type">
          <option value="syn">-sS SYN (stealth)</option>
          <option value="connect">-sT full connect</option>
        </select>
      </label>
      <button id="ps-run">run scan</button>
      <span class="muted" id="ps-status"></span>
    </div>
    <div class="ports" id="ps-grid"></div>
    <div class="scanlog" id="ps-log"></div>
  `;

  const grid = el.querySelector("#ps-grid");
  const log = el.querySelector("#ps-log");
  const status = el.querySelector("#ps-status");
  const runBtn = el.querySelector("#ps-run");
  const typeSel = el.querySelector("#ps-type");

  const cells = PORTS.map((p) => {
    const d = document.createElement("div");
    d.className = "port";
    d.innerHTML = `${p.port}<span class="svc">${p.svc}</span>`;
    grid.appendChild(d);
    return d;
  });

  function logline(text, cls) {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  async function scan() {
    runBtn.disabled = true;
    log.innerHTML = "";
    cells.forEach((c) => (c.className = "port"));
    const type = typeSel.value;
    const flag = type === "syn" ? "-sS" : "-sT";
    logline(`$ nmap ${flag} ${HOST}`, "ok");
    logline(
      type === "syn"
        ? "SYN scan: send SYN, infer state from SYN-ACK / RST — never completes the handshake (stealthier)."
        : "Connect scan: full TCP handshake via the OS — more logged, no raw-socket privileges needed."
    );

    const reduce = window.TERM && window.TERM.reduceMotion;
    const step = reduce ? 0 : 220;
    let open = 0;

    for (let i = 0; i < PORTS.length; i++) {
      const p = PORTS[i];
      cells[i].classList.add("scanning");
      status.textContent = `probing ${p.port}/tcp…`;
      if (step) await wait(step);
      cells[i].classList.remove("scanning");
      cells[i].classList.add(p.state);
      if (p.state === "open") {
        open++;
        logline(`${p.port}/tcp open    ${p.svc}`, "");
      } else if (p.state === "filtered") {
        logline(`${p.port}/tcp filtered ${p.svc}`, "");
      }
      window.TERM && window.TERM.scrollToBottom();
    }
    status.textContent = "done.";
    logline(`Scan complete: ${open} open ports found. Next step → enumerate the services.`, "ok");
    runBtn.disabled = false;
  }

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
  runBtn.addEventListener("click", scan);
}
