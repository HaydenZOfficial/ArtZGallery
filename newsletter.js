(() => {
  "use strict";

  const CONFIG = Object.freeze({
    supabaseUrl: "https://tgcprvavaazeyzxwnjxa.supabase.co",
    supabaseKey: "sb_publishable_PC89E5N1Kr0JZ45ILlahHQ_J9ZRnX1A",
    table: "newsletter_subscribers"
  });

  const FRAME = document.getElementById("gallery-frame");
  if (!FRAME) return;

  function frameDocument() {
    return FRAME.contentDocument;
  }

  function getClient(doc) {
    const supabase = doc?.defaultView?.supabase || window.supabase;
    return supabase?.createClient
      ? supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        })
      : null;
  }

  function inject(doc) {
    if (!doc?.body || doc.getElementById("newsletter-signup")) return;

    const db = getClient(doc);
    if (!db) return;

    const section = doc.createElement("section");
    section.id = "newsletter-signup";
    section.className = "newsletter-signup scene-section";
    section.setAttribute("aria-labelledby", "newsletter-title");
    section.innerHTML = `
      <div class="newsletter-copy">
        <p class="eyebrow"><span>006</span> Incoming transmissions</p>
        <h2 id="newsletter-title">JOIN THE <em>NEWSLETTER.</em></h2>
        <p>Get new artwork, announcements, commissions, and other HadenZ updates sent straight to your inbox.</p>
      </div>
      <form class="newsletter-form" novalidate>
        <label for="newsletter-email">Email address</label>
        <div class="newsletter-input-row">
          <input id="newsletter-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="you@example.com" required>
          <input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="newsletter-honeypot">
          <button type="submit" class="button button-primary"><span>SUBSCRIBE</span><i>↗</i></button>
        </div>
        <p class="newsletter-status" role="status" aria-live="polite"></p>
        <small>You can unsubscribe anytime.</small>
      </form>`;

    const linksSection = doc.getElementById("links");
    if (linksSection) linksSection.insertAdjacentElement("afterend", section);
    else doc.querySelector("main")?.append(section);

    const form = section.querySelector("form");
    const email = section.querySelector("#newsletter-email");
    const status = section.querySelector(".newsletter-status");
    const button = form.querySelector("button");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "";
      status.className = "newsletter-status";

      if (form.website.value) return;
      if (!email.checkValidity()) {
        status.textContent = "Enter a valid email address.";
        status.classList.add("is-error");
        email.focus();
        return;
      }

      button.disabled = true;
      button.querySelector("span").textContent = "SUBSCRIBING…";

      const normalizedEmail = email.value.trim().toLowerCase();
      const { error } = await db.from(CONFIG.table).insert({ email: normalizedEmail });

      button.disabled = false;
      button.querySelector("span").textContent = "SUBSCRIBE";

      if (error) {
        if (error.code === "23505") {
          status.textContent = "That email is already subscribed.";
          status.classList.add("is-success");
        } else {
          console.error("Newsletter signup failed:", error);
          status.textContent = "Something went wrong. Please try again.";
          status.classList.add("is-error");
        }
        return;
      }

      form.reset();
      status.textContent = "You're subscribed. Welcome aboard!";
      status.classList.add("is-success");
    });

    if (!doc.getElementById("newsletter-styles")) {
      const style = doc.createElement("style");
      style.id = "newsletter-styles";
      style.textContent = `
        .newsletter-signup { position:relative; display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,1fr); gap:clamp(2rem,6vw,6rem); align-items:end; padding:clamp(4rem,8vw,8rem) clamp(1.25rem,5vw,5rem); border-top:1px solid rgba(255,255,255,.1); background:linear-gradient(135deg,rgba(255,196,0,.06),transparent 55%); }
        .newsletter-copy h2 { margin:.4rem 0 1rem; }
        .newsletter-copy p:last-child { max-width:600px; color:var(--muted,#a9a0b5); line-height:1.7; }
        .newsletter-form { display:grid; gap:.65rem; }
        .newsletter-form label { color:var(--gold,#ffc400); font:600 .62rem "DM Mono",monospace; letter-spacing:.14em; text-transform:uppercase; }
        .newsletter-input-row { display:flex; gap:.65rem; align-items:stretch; }
        .newsletter-input-row input[type=email] { flex:1; min-width:0; padding:1rem; border:1px solid rgba(255,255,255,.18); background:rgba(0,0,0,.22); color:#fff; font:inherit; }
        .newsletter-input-row input[type=email]:focus { outline:2px solid var(--gold,#ffc400); outline-offset:2px; }
        .newsletter-input-row button { flex:0 0 auto; }
        .newsletter-form small { color:var(--muted,#a9a0b5); }
        .newsletter-status { min-height:1.3em; margin:0; font-size:.8rem; }
        .newsletter-status.is-success { color:#83f5b0; }
        .newsletter-status.is-error { color:#ff8d8d; }
        .newsletter-honeypot { position:absolute!important; left:-10000px!important; width:1px!important; height:1px!important; opacity:0!important; pointer-events:none!important; }
        @media (max-width:760px) { .newsletter-signup { grid-template-columns:1fr; } .newsletter-input-row { flex-direction:column; } }
      `;
      doc.head.append(style);
    }
  }

  FRAME.addEventListener("load", () => setTimeout(() => inject(frameDocument()), 0));
})();
