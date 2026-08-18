(() => {
  "use strict";

  const FRAME = document.getElementById("gallery-frame");
  if (!FRAME) return;

  function addQueueLink() {
    const doc = FRAME.contentDocument;
    if (!doc) return false;
    const navLinks = doc.querySelector(".nav-links");
    if (!navLinks) return false;
    if (navLinks.querySelector("[data-queue-link]")) return true;

    const link = doc.createElement("a");
    link.className = "nav-link";
    link.href = "/queue/";
    link.setAttribute("data-queue-link", "true");
    link.setAttribute("data-nav-theme", "commission");
    link.setAttribute("data-nav-word", "QUEUE");
    link.innerHTML = `<span class="nav-number">04</span><span class="nav-label">Commission Queue <small class="queue-live-label">LIVE</small></span><span class="nav-arrow">↗</span>`;

    const items = Array.from(navLinks.querySelectorAll(".nav-link"));
    const commissionLink = items.find(item => /open commissions/i.test(item.textContent || ""));
    const signalsLink = items.find(item => /follow the signals/i.test(item.textContent || ""));
    if (commissionLink) commissionLink.after(link);
    else if (signalsLink) signalsLink.before(link);
    else navLinks.appendChild(link);

    navLinks.querySelectorAll(".nav-link").forEach((item, index) => {
      const number = item.querySelector(".nav-number");
      if (number) number.textContent = String(index + 1).padStart(2, "0");
    });

    if (!doc.getElementById("queue-nav-style")) {
      const style = doc.createElement("style");
      style.id = "queue-nav-style";
      style.textContent = `.nav-link[data-queue-link] .queue-live-label{display:inline-block;margin-left:.5rem;font-size:.42em;line-height:1;letter-spacing:.16em;color:#9cffcf;vertical-align:middle;opacity:.9}`;
      doc.head.appendChild(style);
    }
    return true;
  }

  function start() {
    const doc = FRAME.contentDocument;
    if (!doc) return;
    let attempts = 0;
    const retry = setInterval(() => {
      attempts += 1;
      addQueueLink();
      if (attempts >= 80) clearInterval(retry);
    }, 250);

    const observe = () => {
      const nav = doc.querySelector(".nav-links");
      if (!nav || nav.dataset.queueObserver === "true") return;
      nav.dataset.queueObserver = "true";
      new MutationObserver(() => {
        if (!nav.querySelector("[data-queue-link]")) addQueueLink();
      }).observe(nav, { childList: true, subtree: true });
      addQueueLink();
    };
    observe();
    [500, 1500, 3000].forEach(ms => setTimeout(observe, ms));
  }

  FRAME.addEventListener("load", start);
  if (FRAME.contentDocument?.readyState === "complete") start();
})();
