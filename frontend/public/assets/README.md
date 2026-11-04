# FAJ Stockwise brand assets

The bundled logo design is:

- `faj-stockwise-logo.svg` — the default FAJ Stockwise lockup (navy mark, gold
  accent, blue wordmark).

To replace the design without touching code, drop a PNG here as:

- `faj-stockwise-logo.png` — optional override / fallback.

The shared `Logo` component (`frontend/src/components/brand/Logo.tsx`) loads the
SVG first, then falls back to the PNG. If neither file is present it renders a
clearly marked placeholder instead of inventing artwork.

Keep the artwork's original proportions. The component scales the image by height
with `object-contain`, so the logo is never stretched or cropped. Do not add a
duplicate logo file elsewhere in the app.
