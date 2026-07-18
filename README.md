# SAFORA Marketing Site

A Citizen.com-style marketing page for SAFORA, built with React + TypeScript + Vite + Tailwind.

## Stack

- React 18 + TypeScript (.tsx components throughout — no plain .js/.ts logic files)
- Vite
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Runs at `http://localhost:5174` (port chosen to avoid clashing with `safora-frontend`,
the main product app, which runs on 5173).

## Structure

```
src/
  components/   — one component per section (Hero, Stories, Features, etc.)
  data/         — typed content (content.ts) — feed items, stories, feature copy, photo URLs
  App.tsx       — composes all sections in order
  main.tsx      — React entry point
  styles.css    — Tailwind directives + small global resets
```

## Design notes

- The circular "porthole" transitions (`components/Porthole.tsx`) are built with
  CSS `clip-path: ellipse(...)` rather than image masks, so they scale cleanly at
  any viewport width without needing pre-cut image assets.
- All photography is real, freely-licensed Unsplash photography (verified via direct
  fetch before use, not the same individual photos Citizen.com uses), loaded directly
  from `images.unsplash.com` — no local image assets to manage.
- Colors, copy, and incident examples are all SAFORA/Lucknow-specific, not copied from
  Citizen.com's actual text.

## Known gap

I built this without network access in my sandbox, so `npm install` / `npm run dev`
were not run live during development — only manually reviewed for import correctness
and type consistency. Please run `npm install && npm run dev` as the real first test,
and let me know if anything doesn't compile.
