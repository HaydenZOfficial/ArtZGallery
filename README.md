# Nightframe Art Gallery

A responsive, dependency-free art portfolio designed for GitHub Pages.

## What is included

- Responsive gallery layout
- Artwork category filters
- Full-screen lightbox
- Keyboard navigation in the lightbox
- Mobile navigation
- Accessible labels and reduced-motion support
- Local placeholder art, so the site works without external image hosting

## Customize the site

### 1. Change the gallery name and text

Open `index.html` and replace:

- `Nightframe`
- `Your Name`
- The hero introduction
- The artist statement
- `artist@example.com`

### 2. Add your own artwork

Put your image files inside the `assets` folder. JPG, PNG, WebP, AVIF, SVG, and GIF files all work in modern browsers.

Then open `script.js` and edit the `artworks` array near the top:

```js
{
  title: "Artwork title",
  category: "character",
  image: "assets/your-image.webp",
  alt: "A useful visual description of the artwork",
  description: "A short caption or note about the piece.",
  ratio: "4 / 5"
}
```

Available categories in the starter site are:

- `character`
- `environment`
- `concept`

To create another category, add another filter button in `index.html` and use the same value in your artwork entry.

### 3. Recommended image preparation

For faster loading:

- Export display images around 1600–2400 pixels on the longest side.
- Use WebP or AVIF where possible.
- Keep each gallery image below roughly 1–2 MB.
- Keep original high-resolution files somewhere private if you do not want visitors downloading them directly.

Anything published on a public website can ultimately be saved or screenshotted. A visible watermark can help identify ownership, but it cannot fully prevent copying.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload every file and folder from this project to the repository root.
3. Open the repository's **Settings**.
4. Select **Pages** in the sidebar.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and the `/(root)` folder, then save.
7. GitHub will show the public site address after deployment finishes.

A project repository is normally published at:

`https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

A repository named `YOUR-USERNAME.github.io` is normally published at:

`https://YOUR-USERNAME.github.io/`

## Test locally

You can open `index.html` directly in a browser. For a more accurate local preview, run a small local web server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.
