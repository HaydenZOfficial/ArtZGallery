(() => {
  "use strict";

  const FRAME = document.getElementById("gallery-frame");
  if (!FRAME) return;

  function addQueueLink() {
    const doc = FRAME.contentDocument;
    if (!doc) return;

    const navLinks = doc.querySelector(".nav-links");
    if (!navLinks || navLinks.querySelector('[data-queue-link]')) return;

    const link = doc.createElement("a");
    link.className = "nav-link";
    link.href = "/queue/";
    link.setAttribute("data-queue-link", "true");
    link.setAttribute("data-nav-theme", "commission");
    link.setAttribute("data-nav-word", "QUEUE");
    link.innerHTML = `
      <span class="nav-number">04</span>
      <span class="nav-label">Commission Queue</span>
      <span class="nav-arrow">↗</span>
    `;

    const signalsLink = navLinks.querySelector('a[href="#links"]');
    if (signalsLink) navLinks.insertBefore(link, signalsLink);
    else navLinks.appendChild(link);

    const admin = navLinks.querySelector(".nav-admin");
    if (admin) {
      const number = admin.querySelector(".nav-number");
      if (number) number.textContent = "06";
    }

    const style = doc.createElement("style");
    style.textContent = `
      .nav-link[data-queue-link] .nav-label::after {
        content: " LIVE";
        display: inline-block;
        margin-left: .45rem;
        font-size: .5em;
        letter-spacing: .12em;
        color: #9cffcf;
        vertical-align: middle;
      }
    `;
    doc.head.appendChild(style);
  }

  FRAME.addEventListener("load", () => setTimeout(addQueueLink, 50));
  if (FRAME.contentDocument?.readyState === "complete") setTimeout(addQueueLink, 50);
})();
