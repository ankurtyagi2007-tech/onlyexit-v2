# OnlyExit Site QA Checklist

Run this checklist against every deploy, version bump, or significant change. Any coding agent working on this repo MUST check relevant sections before pushing to production.

---

## 1. FORMS — CRITICAL

### 1.1 Google Sheets Submission (SILENT FAILURE RISK)

**Context:** All forms submit to a Google Apps Script endpoint via `fetch` with `mode: 'no-cors'`. This means the browser CANNOT read the response body. If the Apps Script has a bug, the user sees a success screen but NO data is captured. There is no way to detect this from the frontend.

**Rules:**
- [ ] After ANY change to form fields in `index.html`, you MUST submit a test entry for every affected form and verify data arrives in the Google Sheet
- [ ] After ANY change to `submitToSheets()` or `collectFormData()` in `app.js`, test ALL 4 forms
- [ ] After ANY change to the Google Apps Script code itself, test ALL 4 forms
- [ ] Never assume a form works just because the success screen appeared — check the Sheet

### 1.2 Form Field ↔ Apps Script Column Sync

The Google Apps Script has hardcoded column mappings for each form type. If you add, remove, or rename a field in `index.html`, the Apps Script must be updated too or that field's data will be silently dropped.

**Current form types and their fields:**

**hacker-house-application** (`index.html` hidden input `formType="hacker-house-application"`):
- name, email, phone, linkedin, city, startup_status, what_building, stage, technical, superpower, background, needs, source, builder_link, builder_story, why, interview_avail, interview_time

**flyin-application** (`formType="flyin-application"`):
- name, email, linkedin, city, what_building, preferred_dates, source

**cofounder-match** (`formType="cofounder-match"`):
- linkedin, building, cofounder_type

**merch-preorder** (`formType="merch-preorder"`):
- name, email, phone, size, item, price

**Rules:**
- [ ] If you add a new `<input>`, `<select>`, or `<textarea>` with a `name` attribute inside a form, add the matching column to the Apps Script `config` object
- [ ] If you rename a field's `name` attribute, rename it in the Apps Script too
- [ ] If you remove a field, remove it from the Apps Script (or leave it — it'll just be empty)
- [ ] If you add a NEW form, add a new entry in the Apps Script `config` object with the `formType` value and column list

### 1.3 Form UX

- [ ] Every form submit button shows "Submitting..." loading state while the request is in flight
- [ ] Button re-enables on network failure with an alert
- [ ] Success screen displays after submission completes
- [ ] Form resets properly if the user closes and reopens the modal

---

## 2. IMAGES — PERFORMANCE

### 2.1 File Format & Size

- [ ] No PNG or JPEG larger than 500KB in `assets/`. Convert to WebP (quality 80, max 1920px wide)
- [ ] Only exception: logos/icons under 50KB can remain PNG for transparency
- [ ] Run `ls -lhS assets/` to check — anything over 500KB is a flag

### 2.2 Loading Strategy

- [ ] Only images above the fold use `loading="eager"` (currently: hero image, logo)
- [ ] ALL other images use `loading="lazy"`
- [ ] Check with: `grep -n 'loading="eager"' index.html` — should only match hero + logo

---

## 3. ACCESSIBILITY — WCAG 2.2 Level A

- [ ] Skip-to-content link exists as first element after `<body>`, targets `<main id="main">`
- [ ] All `<img>` tags have meaningful `alt` text (not empty, not filename)
- [ ] All form inputs have associated `<label>` elements
- [ ] Color contrast meets 4.5:1 for body text, 3:1 for large text
- [ ] Interactive elements (buttons, links) are keyboard-focusable and have visible focus styles

---

## 4. CONTENT ACCURACY

### 4.1 Claims & Numbers

- [ ] Any numerical claims (founder count, city count, etc.) can be substantiated
- [ ] Dates in hero badge, CTAs, and application sections are consistent with each other
- [ ] City expansion timelines (e.g., "Hacker House 2027") are still accurate

### 4.2 Links

- [ ] All external links (`target="_blank"`) have `rel="noopener noreferrer"`
- [ ] All Luma event links point to valid events (not expired)
- [ ] Social media links in footer resolve correctly
- [ ] No broken anchor links (`href="#..."` should match an existing `id`)

---

## 5. PERFORMANCE

- [ ] Total page weight under 5MB (check with browser DevTools → Network tab)
- [ ] No render-blocking resources besides critical CSS/fonts
- [ ] Fonts use `font-display: swap` or are preloaded
- [ ] No unused CSS/JS files loaded

---

## 6. SEO & META

- [ ] `<title>` is set and under 60 characters
- [ ] `<meta name="description">` is set and under 160 characters
- [ ] Open Graph tags (`og:title`, `og:description`, `og:type`) are present
- [ ] Favicon is set and loads correctly

---

## 7. DEPLOYMENT SMOKE TEST

After every deploy, manually verify:

1. [ ] Homepage loads without console errors
2. [ ] Hero image renders (not broken)
3. [ ] Nav links scroll to correct sections
4. [ ] At least ONE form submission reaches the Google Sheet
5. [ ] Mobile layout renders correctly (check 375px width)
6. [ ] All modals open and close properly

---

## HOW TO USE THIS FILE

**For humans:** Run through relevant sections before any deploy. Check the boxes.

**For AI coding agents:** Before pushing changes, programmatically verify all rules in sections that overlap with your changes. At minimum:
- Changed `index.html` form fields → Run Section 1 checks
- Changed/added images → Run Section 2 checks
- Changed any visible text → Run Section 4 checks
- Any change → Run Section 5 and remind the human to do Section 7
