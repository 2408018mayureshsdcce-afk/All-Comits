# TechNation 2026

Event website for TechNation, built on the design system and motion of the `techfest.org` folder, with an organiser dashboard.

## Run it

You need [Node.js](https://nodejs.org) 18.11 or newer. There is nothing to install.

```bash
npm run dev     # while working on the site: restarts the server when backend.js or admin/schema.js change
npm start       # on a real server
```

Edits to pages, styles and `assets/js/*` show up with a normal browser refresh in either mode.

| What | Address |
| --- | --- |
| Website | http://localhost:3000/ |
| Dashboard | http://localhost:3000/admin/ |

**Admin password:** on the first start a password is generated, printed in the terminal and saved to `.env`. Change it there (see `.env.example`) and restart. Stop the server with `Ctrl + C`.

To use another port: `PORT=4000 npm run dev` (PowerShell: `$env:PORT=4000; npm run dev`), or put `PORT=4000` in `.env`.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | Preloader, WebGL aether background, astrolabe hero with countdown to the fest, event-name marquee, scroll-lit About text, counters, the five ways to take part, flagship events, fest countdown band, team registration band, rules codex, FAQ |
| `events.html` | Event and category counters, category/status filters, search, tilt cards |
| `event.html?id=…` | Event page: brief, fact tiles, rules and judging, coordinators, timeline, questions box, team entry form |
| `schedule.html` | Day tabs, hour-by-hour timeline, type filters, "Live now" highlight |
| `gallery.html` | Filterable masonry of your photos with a lightbox |
| `sponsors.html` | Tiered partner cards, benefits, process steps, sponsorship enquiry |
| `team.html` | Faculty coordinators, student coordinators and core team with animated avatars |
| `about.html` | Brochure story, timeline, globe, college milestones, venue map, accommodation & travel, contact form |
| `legals.html`, `404.html` | Terms/privacy tabs, not-found page |

Every page also has the HUD navigation, mobile sidebar, page-wipe transitions, cursor ring, film grain, scroll progress bar and the college team registration form. The TechNation Assistant chatbot is built in but hidden (see `bot()` in `assets/js/core.js`).

## Editing content

- **With the server running, use the dashboard.** It edits events, the schedule, city qualifiers, sponsors, team, gallery, FAQs and festival settings (name, dates, venue, confirm-by date, brochure link). Changes are live as soon as you save.
- **Registrations:** every form on the site (college team registration, event entries, questions, sponsorship, accommodation help, contact) lands in the dashboard’s **Registrations** inbox. Export it as CSV.
- **Everything else** (about text, stats, history, stay details, the chatbot's answers, legal text) is in `assets/js/data.js`.
- On first start the server copies `assets/js/data.js` into `storage/db.json`; from then on the dashboard is the source of truth. Delete `storage/db.json` to re-import from `data.js`.
- **Images:** replace the files in `assets/gallery/` with real photos (same names), or add new ones and enter their path in the dashboard. Put sponsor logos in `assets/sponsors/` and team photos in `assets/team/`.

All names, dates, numbers and contact details are placeholders. Replace them before going live.

## Hosting

- **With the dashboard and registrations:** any host that runs Node.js (a VPS, Render, Railway…). Set `HOST=0.0.0.0` and a long `ADMIN_PASSWORD`, serve over HTTPS, and keep `storage/` on persistent disk. It holds registrations (personal data); back it up and never commit it.
- **Vercel (static):** connected to this GitHub repo; every push to `main` redeploys. `vercel.json` runs `npm run build`, which copies the pages and `assets/` into `dist/` and turns `storage/db.json` (if committed) into `dist/api/data.js`, so dashboard edits made locally go live once `storage/db.json` is committed and pushed. The dashboard and registration forms don't run on Vercel: forms show a "preview mode" note. Set an event's *External registration link* (e.g. a Google Form) to take registrations there.
  - The server file is called `backend.js`, not `server.js`, on purpose: Vercel automatically runs a root `server.js` as a Node server, which crashes on its read-only disk (`FUNCTION_INVOCATION_FAILED`).
- **Other static hosts:** run `npm run build` and upload `dist/`. Or in the dashboard go to **Settings → Export data.js**, replace `assets/js/data.js` with it, and upload the site folder.

## Structure

```
assets/css/main.css   design tokens, HUD frame, every component and animation
assets/js/data.js     all content
assets/js/aether.js   WebGL nebula background
assets/js/core.js     shell: nav, footer, preloader, transitions, motion system, forms, chatbot
assets/js/pages.js    one render()/mount() per page, plus the particle, laser, globe and pyramid effects
assets/mascots/       the TechNation robot mascots
admin/                dashboard (schema.js describes every editable field)
backend.js            static server + JSON API, writes storage/db.json
_backup/              zip of the previous version of the site
techfest.org/         the design reference this version is built from
```


## Event images

- Default covers live in `assets/events/<event id>.jpg` and are used automatically.
- In the dashboard, open an event (or add a new one) and use **Upload image** under *Appearance*. Uploads are saved to `assets/uploads/` and override the default. **Use default** removes the override.
- When hosting without `backend.js`, copy `assets/uploads/` along with the exported `data.js`.
