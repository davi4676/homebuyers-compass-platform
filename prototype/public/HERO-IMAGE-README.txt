To use your own landscape + home photo as the front page hero background:

1. Add your image to this folder (public/) with one of these names:
   - hero-landscape.jpg  (or .png, .webp)

2. In app/page.tsx, find the hero <section> and in the style={{ backgroundImage: '...' }}:
   - Replace the Unsplash URL with: url(/hero-landscape.jpg)
   - Keep the linear-gradient(...) part so the overlay keeps text readable.

Example: ... linear-gradient(...), url(/hero-landscape.jpg)

Recommended: landscape orientation, at least 1920px wide, so it looks sharp on large screens.
