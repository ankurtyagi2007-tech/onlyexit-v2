# CLAUDE.md

Before starting ANY work in this repo, read `MOTHER.md` in the repo root and follow every rule in it.

Always develop on branch: claude/anim8-5IM8V

## Critical: Minified Files

The site serves `style.min.css` and `app.min.js` (referenced in `index.html`). The unminified `style.css` and `app.js` are source files only.

**When editing CSS or JS, ALWAYS update the `.min` files first — they are what the site actually loads.** Then sync the unminified source files to match. Never skip the `.min` files.
