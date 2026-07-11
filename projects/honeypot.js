/* Mini Honeypot Explainer — a fake SSH service that "captures" attacker
   connections into a table. Illustrative: the attacker traffic is simulated
   in the browser; nothing listens on a real port. */
function DEMO_HONEYPOT(el) {
  el.innerHTML = `
    <h3>Mini Honeypot Explainer</h3>
    <p class="desc">A honeypot is a decoy service with no real users, so <em>every</em> connection to it is
      suspicious by definition. This one poses as an open SSH server: it accepts logins, logs the
      credentials the attacker tries, then drops them. Watch captured attempts pile up. Simulated — no
      real service is exposed.</p>
    <div class="hp-diagram" aria-hidden="true">
      <div class="hp-node hp-attacker">🌐 attacker</div>
      <div class="hp-arrow" id="hp-arrow">───▶</div>
      <div class="hp-node hp-pot" id="hp-pot">🍯 decoy sshd<span>:22 (fake)</span></div>
    </div>
    <div class="controls">
      <button id="hp-run">start honeypot</button>
      <button id="hp-stop" disabled>stop</button>
      <span class="muted" id="hp-count">0 attempts captured</span>
    </div>
    <table class="hp-table">
      <thead><tr><th>time</th><th>source IP</th><th>username</th><th>password tried</th></tr></thead>
      <tbody id="hp-body"></tbody>
    </table>
  `;

  const arrow = el.querySelector("#hp-arrow");
  const pot = el.querySelector("#hp-pot");
  const body = el.querySelector("#hp-body");
  const count = el.querySelector("#hp-count");
  const runBtn = el.querySelector("#hp-run");
  const stopBtn = el.querySelector("#hp-stop");

  const IPS = ["45.155.205.211", "185.220.101.44", "193.32.162.9", "80.94.92.20", "141.98.11.5"];
  const USERS = ["root", "admin", "ubuntu", "pi", "oracle", "postgres", "test", "user"];
  const PASS = ["123456", "admin", "root", "password", "12345678", "qwerty", "P@ssw0rd", "1234", "toor"];

  let timer = null;
  let n = 0;

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fmt() { return new Date().toTimeString().slice(0, 8); }

  function capture() {
    const reduce = window.TERM && window.TERM.reduceMotion;
    if (!reduce) {
      arrow.classList.add("pulse");
      pot.classList.add("hit");
      setTimeout(() => { arrow.classList.remove("pulse"); pot.classList.remove("hit"); }, 300);
    }
    const row = document.createElement("tr");
    row.innerHTML = `<td>${fmt()}</td><td>${pick(IPS)}</td><td>${pick(USERS)}</td><td>${pick(PASS)}</td>`;
    body.insertBefore(row, body.firstChild);
    while (body.children.length > 12) body.removeChild(body.lastChild);
    n++;
    count.textContent = `${n} attempt${n === 1 ? "" : "s"} captured`;
  }

  function start() {
    stop();
    body.innerHTML = "";
    n = 0;
    count.textContent = "0 attempts captured";
    const reduce = window.TERM && window.TERM.reduceMotion;
    runBtn.disabled = true;
    stopBtn.disabled = false;
    capture();
    timer = setInterval(capture, reduce ? 250 : 900);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    runBtn.disabled = false;
    stopBtn.disabled = true;
  }

  runBtn.addEventListener("click", start);
  stopBtn.addEventListener("click", stop);
  el.__cleanup = stop;
}
