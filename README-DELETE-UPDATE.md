# Commission Inbox Delete and Button Contrast Update

This update adds:

- A permanent **Delete request** button to each commission request
- A confirmation prompt before deletion
- Stronger colors for **Archive / Restore**
- Stronger colors for **Refresh inbox**
- A fix that restores the original Archive button text after saving

No new SQL is required. The existing commission setup already includes the
artist-only DELETE policy.

## Upload

At minimum, replace these root files in GitHub:

- `app.js`
- `styles.css`
- `index.html`

The package also contains the full current website.

After committing to `main`, wait for GitHub Pages and press:

```text
Ctrl + Shift + R
```

The delete button permanently removes the request and cannot be undone.
