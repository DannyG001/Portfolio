/* CTF Writeups — challenge cards that expand into step-by-step solutions
   with a reveal-flag control. The writeups are illustrative examples in the
   style of real CTF solves, not claims of specific competition placements. */
function DEMO_CTF(el) {
  const CHALLENGES = [
    {
      title: "Cookie Monster",
      category: "web",
      difficulty: "easy",
      points: 100,
      prompt: "The admin panel checks a cookie named `role`. Can you get in?",
      steps: [
        "Log in as a normal user and inspect cookies — there's `role=dXNlcg==`.",
        "That decodes from base64 to `user`. The check is client-trusted.",
        "Re-encode `admin` → `YWRtaW4=` and set `role=YWRtaW4=`.",
        "Reload the admin panel — access granted. Root cause: trusting a client-side value for authorization.",
      ],
      flag: "flag{n3ver_trust_the_c00kie}",
    },
    {
      title: "Leaky Logs",
      category: "forensics",
      difficulty: "medium",
      points: 250,
      prompt: "A packet capture contains a leaked credential. Find it.",
      steps: [
        "Open the .pcap in Wireshark; filter `http.request.method == POST`.",
        "One POST to /login is over plain HTTP — the body carries form fields.",
        "Follow the HTTP stream: `user=svc&pass=...` is visible in cleartext.",
        "The password field is the flag. Lesson: unencrypted auth leaks everything on the wire.",
      ],
      flag: "flag{http_is_not_your_friend}",
    },
    {
      title: "XOR Me Once",
      category: "crypto",
      difficulty: "medium",
      points: 300,
      prompt: "Ciphertext was XOR'd with a single repeating byte. Recover the plaintext.",
      steps: [
        "Single-byte XOR has only 256 keys — brute force all of them.",
        "For each key, XOR the ciphertext and score the output by English letter frequency.",
        "The key 0x42 yields readable ASCII; the rest is noise.",
        "Decoded text contains the flag. Single-byte XOR provides no real security.",
      ],
      flag: "flag{frequency_analysis_wins}",
    },
    {
      title: "Path of Least Resistance",
      category: "pwn",
      difficulty: "hard",
      points: 450,
      prompt: "A web app downloads files by name. Read /etc/passwd.",
      steps: [
        "The endpoint is /download?file=report.pdf — it reads the name off disk.",
        "Try `../` sequences: /download?file=../../../../etc/passwd.",
        "The app doesn't canonicalize the path, so directory traversal escapes the intended folder.",
        "The response returns the passwd file; the flag is appended as a comment. Fix: resolve and validate the real path against an allowlisted directory.",
      ],
      flag: "flag{dot_dot_slash_all_the_way}",
    },
  ];

  const cards = CHALLENGES.map((c, i) => `
    <div class="ctf-card" data-i="${i}">
      <button class="ctf-head" type="button" aria-expanded="false">
        <span class="ctf-title">${c.title}</span>
        <span class="ctf-meta">
          <span class="ctf-cat cat-${c.category}">${c.category}</span>
          <span class="ctf-diff diff-${c.difficulty}">${c.difficulty}</span>
          <span class="ctf-pts">${c.points} pts</span>
        </span>
      </button>
      <div class="ctf-body" hidden>
        <p class="ctf-prompt">${c.prompt}</p>
        <ol class="ctf-steps">${c.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
        <div class="ctf-flag">
          <button class="ctf-reveal" type="button">reveal flag</button>
          <code class="ctf-flagval" hidden>${c.flag}</code>
        </div>
      </div>
    </div>
  `).join("");

  el.innerHTML = `
    <h3>CTF Writeups</h3>
    <p class="desc">Capture-the-Flag challenges by category and difficulty. Click a card to expand the
      step-by-step solution, then reveal the flag. These are illustrative writeups in the style of real
      solves — meant to show the problem-solving approach, not to claim specific competition results.</p>
    <div class="ctf-grid">${cards}</div>
  `;

  el.querySelectorAll(".ctf-head").forEach((head) => {
    head.addEventListener("click", () => {
      const body = head.nextElementSibling;
      const open = !body.hidden;
      body.hidden = open;
      head.setAttribute("aria-expanded", String(!open));
      head.closest(".ctf-card").classList.toggle("expanded", !open);
    });
  });
  el.querySelectorAll(".ctf-reveal").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.nextElementSibling;
      val.hidden = false;
      btn.hidden = true;
    });
  });
}
