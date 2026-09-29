# Handoff prompt — paste this to start the new session

You are continuing work on **Hala Baheyeldin Hozayen's** artist portfolio/shop website for Joe. Read this whole brief before doing anything — it replaces re-discovery.

## What this project is
A Next.js (App Router) + Supabase site for oil painter Hala Baheyeldin Hozayen — portfolio, one flat collection of paintings, bilingual (EN/AR) Q&A, and a WhatsApp-based buy flow. No shopping cart, no checkout, no shipping calculator.

**Location:** `/home/joe/Projects/hala-baheyeldin-hozayen`
**Not a git repo yet** — no version control has been set up.

## Critical: a sibling project exists — never touch it
`/home/joe/Projects/Magazine_prototype_backup` is a **separate, unrelated** site for a different artist, Hala Salah Elhosary. This project was built by copying that one as a starting point, then diverging heavily. Never edit, reference-write, or run destructive commands against that path. If you need to compare against "the original," read-only is fine; never modify it.

## Dev server
Runs on **port 3001** (not 3000 — that's the other project). Start with:
```
cd /home/joe/Projects/hala-baheyeldin-hozayen && PORT=3001 npm run dev
```
Node is managed via nvm — if `npm` isn't found, run `source ~/.nvm/nvm.sh && nvm use default` first. A `next dev` process may already be running in the background from the prior session (check `ps aux | grep "next dev"` before starting a second one on the same port).

## Backend — real Supabase project, already live
- Project ref `ajsnohspthxlyizhpzuj`, keys are in `.env.local` (already filled in, real values — not placeholders)
- Schema (`supabase-schema.sql` + `supabase-admin-invites.sql`, both in the project root) has been run against the live project already
- Tables: `artist_profile` (seeded with name/phone/whatsapp/instagram), `artworks`, `artwork_images`, `qna`, `admin_invites`
- `artworks` and `qna` currently hold **placeholder** rows (clearly labeled "Placeholder — replace via /admin") that Joe or Hala will edit/replace through the admin panel — don't treat this content as real
- Joe already has an admin login (created via a one-time invite link generated earlier). Do not attempt to log in or create another account. If a new invite is ever needed, generate one via the Supabase Management API (Joe previously provided a personal access token for this — check if one is still valid before asking him for a new one; treat it as sensitive, don't echo it back)
- Mock-data fallback (`lib/mockData.js`) exists and auto-activates if `NEXT_PUBLIC_SUPABASE_URL` is ever unset/placeholder — not currently in use since real Supabase is wired up

## Design system — this is the important part
The homepage has a **dev-only palette + layout switcher** (bottom-left floating widget, gated by `NEXT_PUBLIC_ENABLE_PALETTE_SWITCHER=true` in `.env.local`). It is NOT a public feature — it's there so Joe can preview options before locking one in. Do not remove it or treat its presence as a bug.

- **6 color palettes** (`[data-palette="1"]` through `"6"`) defined in `app/globals.css` as CSS custom properties (`--bg`, `--bg-alt`, `--ink`, `--ink-soft`, `--accent`, `--accent-strong`, `--accent-2`, `--on-bg-alt`, `--line`, `--sold`, plus legacy aliases like `--coffee`/`--tan`/etc. for backward compat). Every component must reference these variables, never literal colors, so all 6 palettes stay consistent.
- **3 layout versions** (`[data-version="1"]` default/unset, `"2"`, `"3"`) — V1 is alternating light/dark section bands (shipped default), V2 is a unified single-tone layout, V3 is an all-dark "bold ink" poster look. All three reuse the same JSX; version differences are CSS-only overrides layered at the bottom of `globals.css`. **Whenever you change a shared component's markup or classes, check whether V2/V3 overrides need updating too** — this has been a repeated source of bugs.
- Fonts: Cormorant Garamond (display/serif), Jost (body), Cairo (Arabic).

## Key architecture facts
- **No collections** — one flat, admin-orderable list of artworks (`sort_order`, drag-and-drop in admin)
- **Dimensions**: stored in inches (`length_in`, `width_in`) in the DB (that's what the admin form asks for), but **displayed in cm as primary** everywhere, with inches shown secondary (1 decimal) only on the painting detail page. Conversion logic lives in `lib/db.js` (`inToCm`, `round1`).
- **Medium** is a managed dropdown in admin (`DEFAULT_MEDIUMS` constant + whatever's already in use), with a "+ Add new medium…" escape hatch. Gallery filter checkboxes are generated dynamically from whatever distinct medium values exist in the data — never hardcoded.
- **Title is optional** — Hala won't be naming most paintings. Every place that displays a title falls back to `artwork.medium || 'Untitled'` (see `label` pattern in `ArtworkCard.js`, painting detail page, `WhatsAppBuyBox.js`). Year field similarly removed from the admin UI (kept in schema, unused).
- **Buy flow**: `components/WhatsAppBuyBox.js` — single click, no modal/form, immediately opens `wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}` with a prefilled message (painting title/medium/size/price + page URL, which becomes a link-preview card with the image in WhatsApp — that's the closest thing to "attaching an image" that `wa.me` links support; there is no way to force-attach an actual file).
- **Masonry grid**: `components/MasonryGrid.js` is a client component doing **deterministic round-robin column placement** (`artworks.forEach((a,i) => buckets[i % colCount].push(a))`) — NOT CSS `column-count` (tried that, rejected — it fills whichever column is shortest/whole-column-at-a-time, which scrambles reading order) and NOT CSS Grid with `align-items:start` (tried that too — technically correct reading order but rejected because it's "a horizontal grid," not the vertical Pinterest-style masonry Joe wants). Round-robin was the answer that satisfied both "vertical masonry, no horizontal grid" AND "left-to-right reading order on every row." Used on both the homepage preview (`app/page.js`) and `/gallery` (`components/GalleryClient.js`, which also drives the 2-button compact/comfortable view toggle and defaults to "comfortable" on mobile).
- Homepage preview renders **all** artworks (not just 4) into `MasonryGrid`, then relies on `.work-preview-grid { max-height; overflow:hidden }` + a `::after` gradient overlay on `.work-preview-wrap` to fade out everything past the first row. This has needed retuning more than once as the masonry logic changed — see open task below.
- Contacts section: only Phone/WhatsApp + Instagram (no email, no TikTok — Joe said so explicitly). Real Instagram handle is `instagram.com/artinfelicity_2023`, already in the DB.
- Icons: `components/icons.js` exports `InstagramIcon` and `PhoneIcon` as inline SVGs — use these, never emoji or unicode glyphs, for any icon need.
- Bilingual text: any Arabic string needs `dir="rtl"`. Watch for **bidi bugs** when mixing an English label + a dash + Arabic text in one line — if the dash ends up inside the RTL span it visually jumps to the wrong side. Keep punctuation that should stay "anchored to the English side" outside the RTL span. Already fixed once in the hero subtitle (`app/page.js`) — same class of bug could recur elsewhere.

## Open tasks for this session (Joe's exact words, most recent first)

1. **"there is still a fade gap under the hero"** — a fade/gap issue near the bottom of the hero section (`app/page.js` `.hero-v2` + its `::after` overlay in `globals.css`), distinct from the work-preview fade (that one was already fixed — widened mask + smoothed gradient, confirmed good). Investigate the hero's own scrim/overlay and the transition into the section right below it. Use Playwright, take a tight cropped screenshot of that boundary, diagnose precisely before guessing at a fix (that approach worked well for the last fade bug).

2. **Q&A needs to look more consistent and clearer — Joe says it's currently bad.** Current implementation: `components/QnaSection.js` + `.qna-*` CSS in `globals.css` — a `<details>/<summary>` accordion, Arabic question first (bigger), English question second (smaller), numbered 01/02/03. Something about the visual hierarchy/consistency isn't working for him. Don't just tweak font-sizes again — look at it fresh with Playwright, consider whether the accordion pattern itself, the EN/AR size relationship, spacing, or alignment is the real problem, and redesign accordingly. Ask him what's bad about it if it's not obvious after inspecting, rather than guessing repeatedly (this area has already had 2-3 rounds of small tweaks that didn't land).

3. **"when i said the hamburger menu needs working i meant like what appears when u open it, it looks bland"** — Joe previously asked to improve "the hamburger" and the fix applied was to the toggle *button* (added a 3-bar-to-X morph animation) — that was a misread. The actual complaint is about the **drawer panel that opens** (`.nav-drawer-panel` in `components/Navbar.js` / `globals.css`): a flat dark rectangle with stacked italic links. Needs real visual work — consider layout, spacing, maybe imagery/texture, hover states, entrance choreography (stagger?), not just color swaps.

4. **"you should put the close button of it in the same position it was opened from"** — the drawer's close (×) button currently sits in a fixed top-right corner of the panel. It should instead appear in the same screen position where the hamburger toggle button was (top-right of the navbar, roughly), so the close action feels spatially anchored to where the open action happened, not just "top-right of whatever the drawer's bounding box is." Verify at multiple viewport widths since the drawer panel width and toggle button position both vary.

## Working style notes for this session
- Joe wants **playwright used liberally** to actually look at things before claiming a fix — several past rounds went in circles because a fix was applied without visually confirming what was actually wrong first. Screenshot, crop tight on the relevant region if needed, diagnose, then fix, then re-screenshot to confirm.
- Joe iterates fast and sometimes clarifies/reverses a prior instruction (e.g. masonry vs grid went back and forth twice). When a fix doesn't land, don't just tweak the same knob again — ask what specifically looks wrong, or try a structurally different approach.
- Keep changes scoped to this project only. Never touch `Magazine_prototype_backup`.
- No need to ask before routine implementation work; Joe has been letting the agent proceed autonomously through most of this build. Do ask when a request is genuinely ambiguous (he's said so explicitly at least once — "ask me questions abt that").
