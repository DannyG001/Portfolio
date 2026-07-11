/* Brute-Force Log Detector — streams a mock auth log and fires an alert
   when one source IP exceeds N failed logins within a sliding window. */
function DEMO_LOGDETECT(el) {
  el.innerHTML = `
    <h3>Brute-Force Log Detector</h3>
    <p class="desc">A stream of SSH auth events scrolls in. A detection rule counts failed logins per
      source IP inside a sliding time window — when one IP crosses the threshold, it fires an alert.
      This is the core idea behind SIEM correlation rules and tools like fail2ban.</p>
    <div class="controls">
      <label>Threshold (fails / window)
        <input type="number" id="ld-thresh" min="2" max="15" value="5" style="width:60px" />
      </label>
      <button id="ld-run">stream logs</button>
      <button id="ld-stop" disabled>stop</button>
    </div>
    <div class="logfeed" id="ld-feed"></div>
    <div class="alertbox" id="ld-alert">No alerts. Detection idle.</div>
  `;

  const feed = el.querySelector("#ld-feed");
  const alertBox = el.querySelector("#ld-alert");
  const runBtn = el.querySelector("#ld-run");
  const stopBtn = el.querySelector("#ld-stop");
  const threshInput = el.querySelector("#ld-thresh");

  const attacker = "185.220.101.44";
  const normals = ["10.0.0.5", "10.0.0.9", "192.168.1.20", "172.16.4.3"];
  const users = ["root", "admin", "svc-backup", "jdoe", "postgres", "test"];
  const WINDOW_MS = 30000; // simulated 30s window
  let timer = null;
  let simTime = Date.now();
  const failsByIp = {}; // ip -> [timestamps]
  const alertedIps = new Set();

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fmtTime(t) { return new Date(t).toTimeString().slice(0, 8); }

  function emit() {
    // Bias toward the attacker IP producing failures to make detection visible.
    const isAttack = Math.random() < 0.55;
    const ip = isAttack ? attacker : pick(normals);
    const success = !isAttack && Math.random() < 0.75;
    const user = pick(users);
    simTime += 800 + Math.random() * 700;

    const entry = document.createElement("div");
    if (success) {
      entry.className = "entry ok";
      entry.textContent = `${fmtTime(simTime)} sshd: Accepted password for ${user} from ${ip}`;
    } else {
      entry.className = "entry fail";
      entry.textContent = `${fmtTime(simTime)} sshd: Failed password for ${user} from ${ip}`;
      recordFailure(ip, entry);
    }
    feed.appendChild(entry);
    if (feed.children.length > 60) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
  }

  function recordFailure(ip, entry) {
    const thresh = Math.max(2, parseInt(threshInput.value, 10) || 5);
    const arr = (failsByIp[ip] = failsByIp[ip] || []);
    arr.push(simTime);
    // Drop timestamps outside the sliding window.
    while (arr.length && simTime - arr[0] > WINDOW_MS) arr.shift();
    if (arr.length >= thresh) {
      entry.classList.add("flagged");
      if (!alertedIps.has(ip)) {
        alertedIps.add(ip);
        fireAlert(ip, arr.length, thresh);
      }
    }
  }

  function fireAlert(ip, count, thresh) {
    alertBox.classList.add("firing");
    alertBox.innerHTML = `⚠ ALERT — possible SSH brute force
Source <b>${ip}</b>: ${count} failed logins in the last 30s (threshold ${thresh}).
Recommended: block IP at the firewall, review whether any auth succeeded, enable rate-limiting / fail2ban.`;
  }

  function start() {
    stop();
    feed.innerHTML = "";
    alertBox.className = "alertbox";
    alertBox.textContent = "Streaming… watching for repeated failures.";
    for (const k in failsByIp) delete failsByIp[k];
    alertedIps.clear();
    simTime = Date.now();
    const reduce = window.TERM && window.TERM.reduceMotion;
    const interval = reduce ? 120 : 550;
    runBtn.disabled = true;
    stopBtn.disabled = false;
    timer = setInterval(emit, interval);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    runBtn.disabled = false;
    stopBtn.disabled = true;
  }

  runBtn.addEventListener("click", start);
  stopBtn.addEventListener("click", stop);

  // Let the host (demo modal / terminal) stop the stream when the demo closes.
  el.__cleanup = stop;
}
