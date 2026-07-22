HADENZ // BEYOND THE FRAME — REDESIGN BUILD 1
================================================

WHAT THIS PACKAGE CHANGES
-------------------------
REPLACE in the repository root:
  - index.html
  - commissions.html
  - styles.css

ADD to the repository root:
  - motion.js

MERGE into the existing assets folder:
  - assets/Hadenz_Logo.png
  - assets/ZenTailWag_YCH.gif

DO NOT DELETE OR REPLACE
------------------------
The redesign was built to keep the current working backend files:
  - app.js
  - commission-form.js
  - Supabase configuration and Edge Functions
  - CNAME
  - any other repository files not included in this package

SAFEST DEPLOYMENT
-----------------
1. Create a new GitHub branch such as: beyond-the-frame-redesign
2. Upload the package files into that branch, preserving the same paths.
3. Test index.html and commissions.html.
4. Merge the branch into main only after the gallery, artist login, uploads,
   commission submission, and mobile layout have been checked.

WHAT IS INCLUDED
----------------
- Animated opening sequence
- Fullscreen reactive game-style navigation
- Oversized layered character presentation
- Cursor reactions, magnetic controls, parallax, and tweened transitions
- Dynamic gallery card enhancement around the existing Supabase renderer
- Responsive desktop, tablet, and mobile layouts
- Redesigned artist dashboard styling without replacing its logic
- Full commission experience with pricing, boundaries, terms, and private form
- Reduced-motion accessibility support

CURRENT ASSET NOTE
------------------
This build uses the existing HadenZ logo and Zen animated GIF. Transparent
character PNGs/WebPs can later be added as additional scene layers without
rebuilding the interface.
