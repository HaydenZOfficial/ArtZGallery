(() => {
  "use strict";

  const VIDEO_ID = "t9nSiMtt2dc";
  const AUTO_CLOSE_MS = 6500;

  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector("#primary-nav");
  const year = document.querySelector("#year");
  const secretTrigger = document.querySelector("#secret-trigger");
  const easterEgg = document.querySelector("#easter-egg");
  const closeEggButton = document.querySelector("#close-egg");

  let youtubePlayer = null;
  let youtubeApiPromise = null;
  let closeTimer = null;

  year.textContent = String(new Date().getFullYear());

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }
  });

  function loadYouTubeApi() {
    if (window.YT?.Player) {
      return Promise.resolve(window.YT);
    }

    if (youtubeApiPromise) return youtubeApiPromise;

    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === "function") previousReady();
        resolve(window.YT);
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.addEventListener("error", () => {
        youtubeApiPromise = null;
        reject(new Error("The YouTube player could not load."));
      });
      document.head.append(script);
    });

    return youtubeApiPromise;
  }

  async function startSound() {
    try {
      await loadYouTubeApi();

      if (youtubePlayer) {
        youtubePlayer.seekTo(0, true);
        youtubePlayer.playVideo();
        return;
      }

      youtubePlayer = new window.YT.Player("youtube-player", {
        width: 220,
        height: 200,
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady(event) {
            event.target.setVolume(100);
            event.target.playVideo();
          }
        }
      });
    } catch (error) {
      console.warn(error);
    }
  }

  function openEasterEgg() {
    window.clearTimeout(closeTimer);
    easterEgg.classList.add("is-active");
    easterEgg.setAttribute("aria-hidden", "false");
    document.body.classList.add("egg-open");
    closeEggButton.focus();
    startSound();

    closeTimer = window.setTimeout(closeEasterEgg, AUTO_CLOSE_MS);
  }

  function closeEasterEgg() {
    window.clearTimeout(closeTimer);
    easterEgg.classList.remove("is-active");
    easterEgg.setAttribute("aria-hidden", "true");
    document.body.classList.remove("egg-open");

    if (youtubePlayer?.stopVideo) {
      youtubePlayer.stopVideo();
    }

    secretTrigger.focus();
  }

  secretTrigger.addEventListener("click", openEasterEgg);
  closeEggButton.addEventListener("click", closeEasterEgg);

  easterEgg.addEventListener("click", event => {
    if (event.target === easterEgg || event.target.classList.contains("egg-static")) {
      closeEasterEgg();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && easterEgg.classList.contains("is-active")) {
      closeEasterEgg();
    }
  });
})();
