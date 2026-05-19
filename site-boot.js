/* Performance-first boot: one scroll handler, pause when hidden, lighter canvas */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const isTouch =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  const isMobile = window.innerWidth < 900;
  const lowPower = reducedMotion || (isMobile && isTouch);

  let pageActive = !document.hidden;
  document.addEventListener("visibilitychange", () => {
    pageActive = !document.hidden;
  });

  /* ─── Debounce ─── */
  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  /* ─── Custom cursor (desktop only) ─── */
  function initCursor() {
    const cur = document.getElementById("cur");
    const ring = document.getElementById("cur-ring");
    const dot = document.getElementById("cur-dot");
    if (!cur || !ring || !dot || isTouch) {
      [cur, ring, dot].forEach((el) => el && (el.style.display = "none"));
      return;
    }
    let mx = innerWidth / 2,
      my = innerHeight / 2,
      rx = mx,
      ry = my;
    document.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        cur.style.left = mx + "px";
        cur.style.top = my + "px";
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      },
      { passive: true }
    );
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cur.style.transform = "translate(-50%,-50%) scale(3)";
        cur.style.opacity = "0.5";
        ring.style.transform = "translate(-50%,-50%) scale(1.6)";
      });
      el.addEventListener("mouseleave", () => {
        cur.style.transform = "translate(-50%,-50%) scale(1)";
        cur.style.opacity = "1";
        ring.style.transform = "translate(-50%,-50%) scale(1)";
      });
    });
    return function cursorTick() {
      if (!pageActive) return;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
    };
  }

  /* ─── Canvas loop registry ─── */
  const ticks = [];
  function registerTick(fn) {
    ticks.push(fn);
  }

  function startMainLoop() {
    function frame() {
      if (pageActive && !lowPower) {
        for (let i = 0; i < ticks.length; i++) ticks[i]();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function observeVisible(el, onVisible) {
    if (!el || lowPower) return () => {};
    let visible = false;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) onVisible(true);
      },
      { rootMargin: "80px", threshold: 0.05 }
    );
    io.observe(el);
    return () => visible;
  }

  /* ─── Background particles (lighter) ─── */
  function initBgParticles() {
    const bgC = document.getElementById("bg-canvas");
    if (!bgC || lowPower) return;
    const bgX = bgC.getContext("2d", { alpha: true });
    const count = isMobile ? 35 : 55;
    const maxLink = isMobile ? 80 : 100;
    const particles = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bgC.width = Math.floor(innerWidth * dpr);
      bgC.height = Math.floor(innerHeight * dpr);
      bgC.style.width = innerWidth + "px";
      bgC.style.height = innerHeight + "px";
      bgX.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", debounce(resize, 200));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.5 + 0.15
      });
    }

    registerTick(function drawBg() {
      bgX.clearRect(0, 0, innerWidth, innerHeight);
      const n = particles.length;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const q = particles[j];
          const dx = p.x - q.x,
            dy = p.y - q.y;
          const dist = dx * dx + dy * dy;
          if (dist < maxLink * maxLink) {
            const d = Math.sqrt(dist);
            bgX.beginPath();
            bgX.strokeStyle = "rgba(0,240,255," + (0.05 * (1 - d / maxLink)) + ")";
            bgX.lineWidth = 0.5;
            bgX.moveTo(p.x, p.y);
            bgX.lineTo(q.x, q.y);
            bgX.stroke();
          }
        }
      }
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = innerWidth;
        if (p.x > innerWidth) p.x = 0;
        if (p.y < 0) p.y = innerHeight;
        if (p.y > innerHeight) p.y = 0;
        bgX.beginPath();
        bgX.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        bgX.fillStyle = "rgba(0,240,255," + p.a + ")";
        bgX.fill();
      });
    });
  }

  /* ─── Hero network (only when hero visible) ─── */
  function initHeroNet() {
    const canvas = document.getElementById("hero-net-canvas");
    const hero = document.getElementById("hero");
    if (!canvas || !hero || lowPower) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let running = false;
    const nodeCount = isMobile ? 22 : 38;
    const nodes = [];
    const packets = [];
    let spawnAcc = 0;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", debounce(resize, 200));

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2
      });
    }

    observeVisible(hero, (v) => {
      running = v;
    });

    registerTick(function drawHero() {
      if (!running) return;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const linkDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x,
            dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = "rgba(0,240,255," + (0.06 * (1 - d / linkDist)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        n.pulse += 0.02;
        const ps = 0.5 + 0.5 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,240,255," + (0.35 + ps * 0.25) + ")";
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = innerWidth;
        if (n.x > innerWidth) n.x = 0;
        if (n.y < 0) n.y = innerHeight;
        if (n.y > innerHeight) n.y = 0;
      });
      spawnAcc++;
      if (spawnAcc > 30 && packets.length < 12) {
        spawnAcc = 0;
        const a = nodes[(Math.random() * nodes.length) | 0];
        const b = nodes[(Math.random() * nodes.length) | 0];
        if (a !== b) packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.008 });
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) {
          packets.splice(i, 1);
          continue;
        }
        const px = p.a.x + (p.b.x - p.a.x) * p.t;
        const py = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,240,255,0.85)";
        ctx.fill();
      }
    });
  }

  /* ─── About net canvas (visible only) ─── */
  function initNetPanel() {
    const c = document.getElementById("net-canvas");
    const panel = c && c.closest(".net-panel");
    if (!c || !panel || lowPower) return;
    const ctx = c.getContext("2d", { alpha: true });
    let running = false;
    const nodes = [];
    const count = 10;

    function resize() {
      c.width = c.offsetWidth || 400;
      c.height = 160;
    }
    resize();

    for (let i = 0; i < count; i++) {
      nodes.push({
        x: 20 + Math.random() * (c.width - 40),
        y: 20 + Math.random() * 140,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI * 2
      });
    }

    observeVisible(panel, (v) => {
      running = v;
      if (v) resize();
    });

    registerTick(function drawNet() {
      if (!running) return;
      ctx.clearRect(0, 0, c.width, c.height);
      nodes.forEach((n, i) => {
        nodes.forEach((m, j) => {
          if (j <= i) return;
          const dx = n.x - m.x,
            dy = n.y - m.y,
            d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = "rgba(0,240,255," + (0.2 * (1 - d / 100)) + ")";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
        n.pulse += 0.04;
        const ps = 0.5 + 0.5 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,240,255," + (0.35 + ps * 0.4) + ")";
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 5 || n.x > c.width - 5) n.vx *= -1;
        if (n.y < 5 || n.y > c.height - 5) n.vy *= -1;
      });
    });
  }

  /* ─── Shield canvas (visible only) ─── */
  function initShield() {
    const c = document.getElementById("shield-canvas");
    const wrap = document.getElementById("shield-canvas-wrap");
    if (!c || !wrap || lowPower) return;
    const ctx = c.getContext("2d", { alpha: true });
    const W = 280,
      H = 280,
      cx = W / 2,
      cy = H / 2;
    let t = 0;
    let running = false;

    observeVisible(wrap, (v) => {
      running = v;
    });

    registerTick(function drawShield() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,240,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t);
      ctx.beginPath();
      ctx.arc(0, 0, 100, -Math.PI / 2, Math.PI * 1.5);
      ctx.strokeStyle = "rgba(0,240,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 16]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy);
      const s = 0.95 + 0.05 * Math.sin(t * 2);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -65);
      ctx.lineTo(55, -35);
      ctx.lineTo(55, 10);
      ctx.quadraticCurveTo(55, 60, 0, 80);
      ctx.quadraticCurveTo(-55, 60, -55, 10);
      ctx.lineTo(-55, -35);
      ctx.closePath();
      const grd = ctx.createLinearGradient(0, -65, 0, 80);
      grd.addColorStop(0, "rgba(0,240,255,0.15)");
      grd.addColorStop(1, "rgba(0,100,160,0.05)");
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,240,255,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      const pct = Math.round(85 + 10 * Math.sin(t * 0.5));
      ctx.font = "900 28px Orbitron,monospace";
      ctx.fillStyle = "rgba(0,240,255,0.9)";
      ctx.textAlign = "center";
      ctx.fillText(pct + "%", cx, cy + 52);
      ctx.font = "600 9px Space Mono,monospace";
      ctx.fillStyle = "rgba(0,240,255,0.4)";
      ctx.fillText("SECURITY SCORE", cx, cy + 68);
      t += 0.012;
    });
  }

  /* ─── Typing ─── */
  function initTyping() {
    const tel = document.getElementById("typed");
    if (!tel || lowPower) return;
    const phrases = [
      "Cybersecurity Enthusiast focused on Ethical Hacking & Network Security.",
      "Building secure systems through hands-on learning.",
      "CTF Player | Note Sharer | Lifelong Learner.",
      "Think like an attacker. Defend like a guardian.",
      "From Lahore — Building a Cyber Career."
    ];
    let pi = 0,
      ci = 0,
      del = false;
    function type() {
      const p = phrases[pi];
      if (!del) {
        tel.textContent = p.slice(0, ++ci);
        if (ci === p.length) {
          del = true;
          setTimeout(type, 2500);
          return;
        }
      } else {
        tel.textContent = p.slice(0, --ci);
        if (ci === 0) {
          del = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      setTimeout(type, del ? 38 : 78);
    }
    setTimeout(type, 4000);
  }

  /* ─── Scroll: progress + active nav (one listener) ─── */
  function initScroll() {
    const bar = document.getElementById("scroll-progress");
    const secs = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    function onScroll() {
      const winScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (bar && height > 0) {
        bar.style.width = (winScroll / height) * 100 + "%";
      }
      let cur = "";
      secs.forEach((s) => {
        if (winScroll >= s.offsetTop - 140) cur = s.id;
      });
      navLinks.forEach((a) => {
        a.style.color =
          a.getAttribute("href") === "#" + cur ? "var(--cyan)" : "";
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ─── Reveals & UI ─── */
  function initUI() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-right")
      .forEach((el) => obs.observe(el));

    const bObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target.querySelectorAll(".skill-fill").forEach((b) => {
              b.style.width = b.dataset.w + "%";
            });
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".skill-cat").forEach((el) => bObs.observe(el));

    const certObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target.querySelectorAll(".cert-p-fill").forEach((b) => {
              b.style.width = b.dataset.w + "%";
            });
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".cert-grid").forEach((el) => certObs.observe(el));

    document.querySelectorAll(".f-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".f-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        document.querySelectorAll(".note-card").forEach((card) => {
          card.style.display =
            cat === "all" || card.dataset.cat === cat ? "block" : "none";
        });
      });
    });

    const ham = document.getElementById("hamBtn");
    const nav = document.getElementById("navlinks");
    if (ham && nav) {
      ham.addEventListener("click", () => nav.classList.toggle("open"));
      document.querySelectorAll(".nav-links a").forEach((a) => {
        a.addEventListener("click", () => nav.classList.remove("open"));
      });
    }
  }

  /* ─── Feedback modal + public reviews ─── */
  const PENDING_KEY = "sg_feedback_pending";

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function savePending(name, email, message) {
    try {
      const list = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
      list.push({
        id: Date.now().toString(),
        name,
        email,
        message,
        date: new Date().toISOString()
      });
      localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function initFeedback() {
    const modal = document.getElementById("feedbackModal");
    const openBtn = document.getElementById("openFeedbackBtn");
    const closeBtn = document.getElementById("closeFeedbackBtn");
    const overlay = document.getElementById("feedbackOverlay");
    const form = document.getElementById("feedbackForm");
    const statusEl = document.getElementById("fbStatus");
    const submitBtn = document.getElementById("fbSubmitBtn");
    const toggleBtn = document.getElementById("togglePublicFeedback");
    const panel = document.getElementById("publicFeedbackPanel");
    const listEl = document.getElementById("publicFeedbackList");
    const emptyEl = document.getElementById("publicFeedbackEmpty");
    const loadEl = document.getElementById("publicFeedbackLoading");
    const hintEl = document.getElementById("publicFeedbackHint");
    if (!modal || !openBtn || !form) return;

    let approvedLoaded = false;

    function openModal() {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const nameEl = document.getElementById("fbName");
      if (nameEl) setTimeout(() => nameEl.focus(), 200);
    }
    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });

    function renderApproved(reviews) {
      if (!listEl) return;
      if (loadEl) loadEl.hidden = true;
      listEl.innerHTML = "";
      if (!reviews.length) {
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;
      reviews.forEach((r) => {
        const card = document.createElement("div");
        card.className = "review-card";
        card.innerHTML =
          '<div class="rv-name">' +
          escapeHtml(r.name || "Visitor") +
          "</div>" +
          '<div class="rv-text">' +
          escapeHtml(r.message || "") +
          "</div>" +
          (r.date
            ? '<div class="rv-date">' + escapeHtml(r.date) + "</div>"
            : "");
        listEl.appendChild(card);
      });
    }

    async function loadApproved() {
      if (!listEl) return;
      if (loadEl) {
        loadEl.hidden = false;
        loadEl.textContent = "Loading feedback...";
      }
      if (emptyEl) emptyEl.hidden = true;
      let reviews = [];
      try {
        const local = JSON.parse(
          localStorage.getItem("sg_feedback_approved") || "[]"
        );
        if (local.length) reviews = local;
      } catch (e) {}
      if (!reviews.length) {
        try {
          const res = await fetch("approved-feedback.json?" + Date.now());
          if (res.ok) {
            const data = await res.json();
            reviews = data.reviews || [];
          }
        } catch (e) {}
      }
      if (!reviews.length) {
        reviews = [
          {
            name: "Ahmed Khan",
            message:
              "Clean cybersecurity portfolio with useful learning resources.",
            date: "2025"
          },
          {
            name: "Ali Raza",
            message:
              "Professional design and impressive cybersecurity journey.",
            date: "2025"
          }
        ];
      }
      renderApproved(reviews);
      approvedLoaded = true;
    }

    if (toggleBtn && panel) {
      toggleBtn.addEventListener("click", () => {
        const show = panel.hidden;
        panel.hidden = !show;
        toggleBtn.setAttribute("aria-expanded", show ? "true" : "false");
        toggleBtn.textContent = show
          ? "Hide People's Feedback"
          : "See People's Feedback";
        if (hintEl) hintEl.hidden = !show;
        if (show && !approvedLoaded) loadApproved();
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("fbName").value.trim();
      const email = document.getElementById("fbEmail").value.trim();
      const message = document.getElementById("fbMessage").value.trim();
      statusEl.className = "fb-status";
      statusEl.textContent = "";
      if (!name || !email || !message) {
        statusEl.classList.add("err");
        statusEl.textContent = "Please fill all fields.";
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      try {
        const res = await fetch(
          "https://formsubmit.co/ajax/syedghxous177@gmail.com",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              name,
              email,
              message,
              _subject: "Portfolio Feedback (pending) — " + name,
              _template: "table"
            })
          }
        );
        if (!res.ok) throw new Error("fail");
        savePending(name, email, message);
        statusEl.classList.add("ok");
        statusEl.textContent =
          "Thank you! Sent for review. It will show publicly after admin approval.";
        form.reset();
        setTimeout(closeModal, 2500);
      } catch (err) {
        statusEl.classList.add("err");
        statusEl.textContent =
          "Could not send. Email me at syedghxous177@gmail.com";
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Feedback";
    });
  }

  /* ─── Boot ─── */
  const cursorTick = initCursor();
  if (cursorTick) registerTick(cursorTick);
  initBgParticles();
  initHeroNet();
  initNetPanel();
  initShield();
  initTyping();
  initScroll();
  initUI();
  initFeedback();
  startMainLoop();
})();
