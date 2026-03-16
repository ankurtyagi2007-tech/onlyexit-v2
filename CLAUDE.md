# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OnlyExit V2 — Seattle's founder engine website. A landing page built with HTML, CSS, and vanilla JavaScript. The site promotes OnlyExit's mission of finding builders and helping them ship startups.

## Tech Stack

- **HTML/CSS/JS** — Static site with no build system
- **Fonts**: Space Grotesk, Inter, JetBrains Mono (Google Fonts)
- **Styling**: Custom CSS (`base.css`, `style.css`, `calc-modal.css`)
- **JavaScript**: `app.js` (main), `calc-engine.js` (calculator modal)

## File Structure

```
index.html          # Main landing page
base.css            # Reset and base styles
style.css           # Main styles
calc-modal.css      # Calculator modal styles
app.js              # Main JavaScript
calc-engine.js      # Calculator engine
assets/             # Images, logos, favicon
```

## UI/UX Design Intelligence (Installed Skill)

This repo includes the **UI/UX Pro Max** skill for AI-powered design recommendations.

### Search Command

```bash
python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain> [-n <max_results>]
```

**Domains:** `product`, `style`, `typography`, `color`, `landing`, `chart`, `ux`, `google-fonts`, `prompt`

**Stack search:**
```bash
python3 src/ui-ux-pro-max/scripts/search.py "<query>" --stack html-tailwind
```

**Design system generation:**
```bash
python3 src/ui-ux-pro-max/scripts/search.py "<product_type> <keywords>" --design-system -p "OnlyExit"
```

### Prerequisites

Python 3.x (no external dependencies required)
