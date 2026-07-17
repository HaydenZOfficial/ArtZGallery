# HadenZ Commission Layout Fix

The broken-looking commission page was caused by the browser/GitHub Pages
loading an older `styles.css` that did not contain the commission-page rules.

## Upload these files

At minimum, replace these three root files in the GitHub repository:

- `styles.css`
- `commissions.html`
- `index.html`

The HTML files now request:

```text
styles.css?v=commission-inbox-layout-2
```

That version query forces the browser to load the new stylesheet instead of a
cached copy.

## Steps

1. Open the existing HadenZ GitHub repository.
2. Click **Add file -> Upload files**.
3. Upload everything inside this folder.
4. Commit the changes to `main`.
5. Wait for GitHub Pages to finish deploying.
6. Open `https://hadenz.studio/commissions.html`.
7. Press **Ctrl + Shift + R**.

Do not upload the outer folder itself. The files must remain at the repository
root, with `styles.css` next to `commissions.html`.
