# ArtZ Gallery — GitHub Pages + Supabase

This folder is ready to publish. It is already connected to your Supabase project.

## What it does

- Public responsive art gallery
- Artist login using your Supabase email and password
- Click or drag an image from your computer
- Add a title, category, and description
- Publish instantly without editing GitHub each time
- Edit artwork details
- Delete artwork and its stored image
- Full-screen lightbox and category filters

## Upload this website to GitHub

1. Extract the ZIP file.
2. Open the extracted `ArtZGallery-Supabase` folder.
3. In your empty GitHub repository, click **uploading an existing file**.
4. Drag everything inside this folder onto GitHub:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
   - `.nojekyll`
   - the `assets` folder
5. Click **Commit changes**.

`index.html` must be at the top level of the repository, not inside another folder.

## Turn on GitHub Pages

1. Open the repository's **Settings**.
2. Click **Pages** in the left sidebar.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/(root)**.
5. Click **Save**.

GitHub will show the public website address after deployment finishes.

## Upload artwork

1. Open your published website.
2. Click **Artist login** or **Upload artwork**.
3. Sign in with the email and password you created under Supabase Authentication.
4. Click the image area and select an image from your computer, or drag the image onto it.
5. Enter its title, category, and optional description.
6. Click **Publish artwork**.

Images are limited to 6 MB in this version for reliable browser uploads.

## Customize your public text

Open `index.html` on GitHub and click the pencil icon to edit it. Search for:

- `ArtZ Gallery` to change the gallery name
- `Your Name` to change the footer name
- `artist@example.com` to change the contact email
- `Replace this paragraph` to change the artist statement

Commit the edit and GitHub Pages will update automatically.

## Security notes

- The publishable Supabase key in `app.js` is intended to be public.
- Never place a Supabase secret key or service-role key in this website.
- Your existing Row Level Security policies are what restrict upload, edit, and delete actions to your user account.
