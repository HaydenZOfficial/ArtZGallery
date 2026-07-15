const artworks = [
  {
    title: "Red Signal",
    category: "character",
    image: "assets/art-01.svg",
    alt: "Stylized red portrait with angular shapes",
    description: "A character portrait built from sharp silhouettes and a limited red palette.",
    ratio: "4 / 5"
  },
  {
    title: "Quiet Orbit",
    category: "concept",
    image: "assets/art-02.svg",
    alt: "Abstract blue and cream orbital forms",
    description: "An abstract study of movement, distance, and repetition.",
    ratio: "1 / 1"
  },
  {
    title: "After the Rain",
    category: "environment",
    image: "assets/art-03.svg",
    alt: "Purple cityscape reflected in wet streets",
    description: "A neon city environment exploring reflection and nighttime atmosphere.",
    ratio: "3 / 4"
  },
  {
    title: "Gold Teeth",
    category: "character",
    image: "assets/art-04.svg",
    alt: "Graphic black and gold character silhouette",
    description: "A bold silhouette study focused on attitude, contrast, and expression.",
    ratio: "4 / 5"
  },
  {
    title: "Haven Fields",
    category: "environment",
    image: "assets/art-05.svg",
    alt: "Orange landscape with distant mountains and glowing field",
    description: "A warm landscape concept for a world touched by strange energy.",
    ratio: "16 / 10"
  },
  {
    title: "Blue Noise",
    category: "concept",
    image: "assets/art-06.svg",
    alt: "Blue abstract composition with black shapes",
    description: "A fast experimental piece using rhythm, interruption, and negative space.",
    ratio: "4 / 5"
  },
  {
    title: "Watcher",
    category: "character",
    image: "assets/art-07.svg",
    alt: "Green masked figure against a dark background",
    description: "A mysterious masked figure developed for a speculative story concept.",
    ratio: "3 / 4"
  },
  {
    title: "Boundary Line",
    category: "environment",
    image: "assets/art-08.svg",
    alt: "Surreal pink horizon split by a dark vertical line",
    description: "A surreal environment about separation, memory, and impossible horizons.",
    ratio: "16 / 9"
  }
];

const galleryGrid = document.querySelector("#gallery-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const visibleCount = document.querySelector("#visible-count");
const emptyState = document.querySelector("#empty-state");
const year = document.querySelector("#year");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxDescription = document.querySelector("#lightbox-description");
const closeButton = document.querySelector(".lightbox-close");
const previousButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector("#site-nav");

let currentFilter = "all";
let visibleArtworks = [...artworks];
let currentArtworkIndex = 0;

function createArtworkCard(artwork, index) {
  const article = document.createElement("article");
  article.className = "art-card";
  article.dataset.category = artwork.category;
  article.dataset.index = index;

  article.innerHTML = `
    <button class="art-card-button" type="button" aria-label="View ${artwork.title}">
      <span class="art-card-image-wrap" style="--ratio: ${artwork.ratio}">
        <img src="${artwork.image}" alt="${artwork.alt}" loading="lazy" decoding="async">
      </span>
      <span class="art-card-meta">
        <span class="art-card-title">${artwork.title}</span>
        <span class="art-card-category">${artwork.category}</span>
      </span>
    </button>
  `;

  article.querySelector("button").addEventListener("click", () => {
    const visibleIndex = visibleArtworks.findIndex((item) => item.title === artwork.title);
    openLightbox(Math.max(visibleIndex, 0));
  });

  return article;
}

function renderGallery() {
  galleryGrid.replaceChildren(...artworks.map(createArtworkCard));
  applyFilter(currentFilter);
}

function applyFilter(filter) {
  currentFilter = filter;
  visibleArtworks = filter === "all"
    ? [...artworks]
    : artworks.filter((artwork) => artwork.category === filter);

  document.querySelectorAll(".art-card").forEach((card) => {
    card.hidden = filter !== "all" && card.dataset.category !== filter;
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  visibleCount.textContent = visibleArtworks.length;
  emptyState.hidden = visibleArtworks.length !== 0;
}

function updateLightbox() {
  const artwork = visibleArtworks[currentArtworkIndex];
  if (!artwork) return;

  lightboxImage.src = artwork.image;
  lightboxImage.alt = artwork.alt;
  lightboxTitle.textContent = artwork.title;
  lightboxCategory.textContent = artwork.category;
  lightboxDescription.textContent = artwork.description;

  const hasMultiple = visibleArtworks.length > 1;
  previousButton.hidden = !hasMultiple;
  nextButton.hidden = !hasMultiple;
}

function openLightbox(index) {
  currentArtworkIndex = index;
  updateLightbox();
  lightbox.showModal();
  closeButton.focus();
}

function closeLightbox() {
  lightbox.close();
}

function showPreviousArtwork() {
  currentArtworkIndex = (currentArtworkIndex - 1 + visibleArtworks.length) % visibleArtworks.length;
  updateLightbox();
}

function showNextArtwork() {
  currentArtworkIndex = (currentArtworkIndex + 1) % visibleArtworks.length;
  updateLightbox();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyFilter(button.dataset.filter));
});

closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", showPreviousArtwork);
nextButton.addEventListener("click", showNextArtwork);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPreviousArtwork();
  if (event.key === "ArrowRight") showNextArtwork();
});

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

year.textContent = new Date().getFullYear();
renderGallery();
