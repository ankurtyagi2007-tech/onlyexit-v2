# CLAUDE.md

Before starting ANY work in this repo, read `MOTHER.md` in the repo root and follow every rule in it.

Always develop on branch: claude/anim8-5IM8V

## Critical: Minified Files

The site serves minified files (referenced in `index.html`). The unminified sources are for editing only.

Minified file pairs:
- `style.css` → `style.min.css`
- `base.css` → `base.min.css`
- `calc-modal.css` → `calc-modal.min.css`
- `app.js` → `app.min.js`
- `calc-engine.js` → `calc-engine.min.js`

**When editing CSS or JS, ALWAYS regenerate the corresponding `.min` file using `terser` (JS) or inline minification (CSS). The `.min` files are what the site actually loads. Never skip them.**
