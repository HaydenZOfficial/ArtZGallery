# Limonene // Web Mutt Portfolio

A static GitHub Pages portfolio with a Bernese mountain dog palette, punk-print
styling, two featured website projects, social links, and a hidden easter egg.

## Included

- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`
- `assets/limonene-logo.png`
- `assets/pointing-cat.png`
- `assets/favicon.svg`

## Publish on GitHub Pages

1. Create a new public GitHub repository.
2. Extract `Limonene-Punk-Portfolio.zip`.
3. Upload everything **inside** the extracted folder to the repository root.
4. Open **Settings -> Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose `main` and `/(root)`.
7. Save and wait for the site link.

## Customize the text

Open `index.html` in Visual Studio Code or Notepad++.

The portfolio links and social links are already filled in.

The empty contact link is:

```html
<a class="nav-contact" href="mailto:">Contact</a>
```

Add an email after `mailto:` or replace it with another contact URL.

## Hidden easter egg

The concealed paw-print button is in the footer. It:

1. loads the official YouTube IFrame Player
2. plays video ID `t9nSiMtt2dc`
3. fades in the pointing-cat image
4. closes automatically after 6.5 seconds

The source player remains visible in the overlay because YouTube embeds are
audiovisual players rather than downloadable audio files. The effect needs an
internet connection and depends on the supplied video allowing embedding.

Change the video in `script.js`:

```js
const VIDEO_ID = "t9nSiMtt2dc";
```

## Local testing

Because the YouTube player uses the page origin, test through a local server
rather than opening `index.html` directly:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```
