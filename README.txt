HADENZ COMPLETE WEBSITE — CLEAN URL + UI FIX BUILD
==================================================

PUBLIC ROUTES
- https://hadenz.studio/home/
- https://hadenz.studio/comissions/
- https://hadenz.studio/commissions/ also redirects to /comissions/
- https://hadenz.studio/ redirects to /home/
- Old /commissions.html links redirect automatically.

FIXES INCLUDED
1. The custom cursor now works inside the creator dashboard, edit dialog,
   and artwork lightbox by placing synchronized cursor layers inside each
   browser modal top layer.
2. The fullscreen menu now owns a high isolated stacking layer, hides page
   content while open, and uses an opaque header state so background elements
   cannot bleed or clip through it.
3. Home and commissions use directory-based GitHub Pages routes, removing
   .html filenames from visible URLs.

UPLOAD INSTRUCTIONS
1. Extract this ZIP.
2. Upload EVERYTHING inside this folder to the ROOT of the GitHub repository.
3. Do not upload the outer folder itself.
4. Keep GitHub Pages publishing from the repository root.
5. Hard-refresh the website after deployment (Ctrl+Shift+R).

IMPORTANT
The user-requested route is spelled /comissions/ with one "m" after "co".
The correctly spelled /commissions/ route is included as an automatic alias.
GitHub Pages may display a trailing slash for directory routes. That is normal;
the .html filename is still gone.
