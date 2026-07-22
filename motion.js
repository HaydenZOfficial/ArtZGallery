(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const gsapReady = Boolean(window.gsap);
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const body = document.body;
  const menuButton = q(".menu-button");
  const nav = q("#site-nav");
  const navWord = q(".nav-giant-word");
  const navCharacter = q(".nav-character");
  const transition = q(".page-transition");
  const transitionWord = q(".page-transition-word");

  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  function syncMenuState() {
    const open = nav?.classList.contains("is-open") || menuButton?.getAttribute("aria-expanded") === "true";
    body.classList.toggle("menu-open", Boolean(open));
  }

  function initializeMenu() {
    if (!menuButton || !nav) return;

    menuButton.addEventListener("click", () => requestAnimationFrame(syncMenuState));
    new MutationObserver(syncMenuState).observe(nav, { attributes: true, attributeFilter: ["class"] });

    qa(".nav-link").forEach((link) => {
      link.addEventListener("mouseenter", () => {
        const word = link.dataset.navWord || "HADENZ";
        const theme = link.dataset.navTheme || "gallery";
        body.dataset.menuTheme = theme;
        if (navWord) navWord.textContent = word;

        if (gsapReady && navCharacter && !reducedMotion) {
          window.gsap.to(navCharacter, {
            xPercent: theme === "artist" ? -18 : theme === "commission" ? -6 : -12,
            yPercent: theme === "signal" ? 15 : 12,
            rotation: theme === "admin" ? -3 : 0,
            duration: 0.7,
            ease: "power3.out"
          });
        }
      });
    });

    const adminTarget = q("#open-admin");
    const adminNavButton = adminTarget?.closest(".nav-admin");
    adminTarget?.addEventListener("click", closeMenu);
    adminNavButton?.addEventListener("click", (event) => {
      if (event.target === adminTarget || event.target.closest("#open-admin")) return;
      adminTarget.click();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu();
    });
  }

  function initializePreloader() {
    const preloader = q("#preloader");
    if (!preloader) return;

    if (reducedMotion || !gsapReady) {
      preloader.remove();
      qa("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const gsap = window.gsap;
    const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });
    timeline
      .from(".preloader-mark img", { scale: 0.2, rotation: -35, opacity: 0, duration: 0.8 })
      .from(".preloader-slash", { x: -80, opacity: 0, duration: 0.55 }, "<")
      .from(".preloader-word", { x: 100, skewX: -20, opacity: 0, duration: 0.65 }, "<.08")
      .to(".preloader-mark", { scale: 1.08, duration: 0.18, ease: "power2.inOut" }, "+=.25")
      .to(".preloader-mark", { scale: 1, duration: 0.28 })
      .to(preloader, { clipPath: "polygon(0 0,100% 0,100% 0,0 0)", duration: 0.9, ease: "power4.inOut" })
      .set(preloader, { display: "none" })
      .from(".site-header", { yPercent: -110, duration: 0.75 }, "-=.5")
      .from(".hero-title > span", { y: 90, opacity: 0, stagger: 0.08, duration: 0.85 }, "-=.6")
      .from(".hero-text, .hero-actions, .hero .eyebrow", { y: 35, opacity: 0, stagger: 0.08, duration: 0.65 }, "-=.55")
      .from(".hero-character", { xPercent: 30, yPercent: 12, rotation: 7, opacity: 0, duration: 1.15 }, "-=1")
      .from(".character-nameplate, .character-sticker, .scroll-breach", { scale: 0.5, opacity: 0, stagger: 0.08, duration: 0.55 }, "-=.65");
  }

  function initializeCursor() {
    if (!finePointer || reducedMotion) return;
    const ring = q(".cursor");
    const dot = q(".cursor-dot");
    if (!ring || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      document.documentElement.style.setProperty("--mx", `${(mouseX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty("--my", `${(mouseY / window.innerHeight) * 100}%`);
    }, { passive: true });

    const render = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    document.addEventListener("mouseover", (event) => {
      if (event.target.closest("a, button, input, select, textarea, label")) body.classList.add("cursor-active");
      if (event.target.closest(".art-card")) body.classList.add("cursor-view");
    });
    document.addEventListener("mouseout", (event) => {
      if (event.target.closest("a, button, input, select, textarea, label")) body.classList.remove("cursor-active");
      if (event.target.closest(".art-card")) body.classList.remove("cursor-view");
    });
  }

  function initializeMagnetism() {
    if (!finePointer || reducedMotion) return;

    qa(".magnetic").forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        if (gsapReady) {
          window.gsap.to(element, { x: x * 0.18, y: y * 0.18, duration: 0.35, ease: "power3.out" });
        } else {
          element.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
        }
      });
      element.addEventListener("mouseleave", () => {
        if (gsapReady) window.gsap.to(element, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.35)" });
        else element.style.transform = "";
      });
    });

    qa(".magnetic-card").forEach((element) => {
      element.addEventListener("mousemove", (event) => {
        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.transform = `perspective(900px) rotateX(${py * -5}deg) rotateY(${px * 6}deg) translateZ(7px)`;
      });
      element.addEventListener("mouseleave", () => {
        element.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
      });
    });
  }

  function initializeReveals() {
    const revealElements = qa("[data-reveal]");
    if (!revealElements.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8%" });

    revealElements.forEach((element) => observer.observe(element));
  }

  function initializeHeroMotion() {
    if (reducedMotion) return;
    const hero = q(".hero");
    const character = q(".hero-character");
    const echoes = qa(".hero-character-echo");
    const backTop = q(".hero-backtype-top");
    const backBottom = q(".hero-backtype-bottom");
    if (!hero || !character || !finePointer) return;

    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const move = (element, x, y, rotation = 0) => {
        if (!element) return;
        if (gsapReady) window.gsap.to(element, { x, y, rotation, duration: 1, ease: "power3.out", overwrite: "auto" });
        else element.style.transform = `translate(${x}px,${y}px) rotate(${rotation}deg)`;
      };
      move(character, px * 24, py * 16, px * 1.2);
      move(echoes[0], px * -12 - 18, py * -7);
      move(echoes[1], px * 17 + 22, py * 9);
      move(backTop, px * -28, py * -16);
      move(backBottom, px * 20, py * 12);
    });

    if (gsapReady && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.to(".hero-character-stage", {
        yPercent: 18,
        scale: 0.94,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 }
      });
      window.gsap.to(".hero-backtype", {
        yPercent: 24,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.2 }
      });
    }
  }

  function enhanceArtCard(card, index) {
    if (card.dataset.motionReady === "true") return;
    card.dataset.motionReady = "true";
    card.dataset.index = String(index + 1).padStart(2, "0");
    const button = q(".art-card-button", card);
    if (!button || reducedMotion || !finePointer) return;

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      button.style.transform = `rotateX(${py * -7}deg) rotateY(${px * 8}deg) translateZ(8px)`;
    });
    card.addEventListener("mouseleave", () => {
      button.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
    });
  }

  function initializeGalleryEnhancement() {
    const grid = q("#gallery-grid");
    if (!grid) return;

    const enhance = () => qa(".art-card", grid).forEach(enhanceArtCard);
    enhance();
    new MutationObserver(() => requestAnimationFrame(enhance)).observe(grid, { childList: true });
  }

  function initializeSceneColors() {
    const scenes = [
      [q(".hero"), ["#9d4edd", "#ffc400"]],
      [q("#gallery"), ["#c86cff", "#62efff"]],
      [q("#about"), ["#ff70b7", "#ffc400"]],
      [q("#contact"), ["#9d4edd", "#ff70b7"]],
      [q("#links"), ["#62efff", "#c86cff"]]
    ].filter(([section]) => section);

    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
        const scene = scenes.find(([section]) => section === entry.target);
        if (!scene) return;
        document.documentElement.style.setProperty("--purple", scene[1][0]);
        document.documentElement.style.setProperty("--gold", scene[1][1]);
      });
    }, { threshold: [0.35, 0.55] });
    scenes.forEach(([section]) => observer.observe(section));
  }

  function initializePageTransitions() {
    if (!transition) return;
    qa("a[data-transition]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#")) return;
        event.preventDefault();
        if (transitionWord) transitionWord.textContent = link.dataset.transition || "ENTER";

        if (reducedMotion || !gsapReady) {
          window.location.href = href;
          return;
        }

        closeMenu();
        const gsap = window.gsap;
        gsap.set(transition, { clipPath: "polygon(0 0,0 0,0 100%,0 100%)" });
        gsap.timeline({ onComplete: () => { window.location.href = href; } })
          .to(transition, { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)", duration: 0.75, ease: "power4.inOut" })
          .fromTo(transitionWord, { xPercent: -18, skewX: -12, opacity: 0 }, { xPercent: 0, skewX: -8, opacity: 1, duration: 0.45, ease: "power3.out" }, "-=.35");
      });
    });
  }

  function initializeSmoothAnchors() {
    qa('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const selector = link.getAttribute("href");
        if (!selector || selector === "#") return;
        const target = q(selector);
        if (!target) return;
        event.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  function initializeIdleCharacter() {
    const stage = q(".hero-character-stage");
    if (!stage || reducedMotion || !gsapReady) return;
    let idleTimer;
    const triggerIdle = () => {
      window.gsap.timeline()
        .to(stage, { rotation: -0.8, y: -5, duration: 0.7, ease: "sine.inOut" })
        .to(stage, { rotation: 0.7, y: 2, duration: 0.9, ease: "sine.inOut" })
        .to(stage, { rotation: 0, y: 0, duration: 0.7, ease: "sine.inOut" });
    };
    const reset = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(triggerIdle, 4500);
    };
    ["mousemove", "scroll", "keydown", "touchstart"].forEach((type) => window.addEventListener(type, reset, { passive: true }));
    reset();
  }

  function initialize() {
    initializeMenu();
    initializePreloader();
    initializeCursor();
    initializeMagnetism();
    initializeReveals();
    initializeHeroMotion();
    initializeGalleryEnhancement();
    initializeSceneColors();
    initializePageTransitions();
    initializeSmoothAnchors();
    initializeIdleCharacter();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
