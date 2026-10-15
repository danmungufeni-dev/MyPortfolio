# GTNationDEV — Dan Mungufeni Portfolio

A modern, fully responsive single-page portfolio for **Dan Mungufeni** (brand: **GTNationDEV**).
Built with plain **HTML5, CSS3 and vanilla JavaScript** — no build step, no heavy libraries.

Visual identity: yellow `#FDB827`, charcoal `#4A4A4A`, light grey `#D9D9D9` and black `#111111`,
with a fixed left sidebar, a right-hand icon timeline, chunky condensed headings and black circular buttons.

---

## 1. Run it locally

Because the portfolio loads `data/portfolio.json` with `fetch()`, you need to serve the folder
over HTTP (opening `index.html` directly with `file://` will block the request, though the rest of
the page still works).

```bash
# Option A — Python (usually pre-installed)
python3 -m http.server 8080

# Option B — Node
npx serve .
```

Then open `http://localhost:8080`.

---

## 2. Project structure

```
index.html                  all markup + content + SEO
css/style.css               design system, layout, responsive rules
js/main.js                  navigation, scroll-spy, filters, lightbox, audio, form
data/portfolio.json         the portfolio items (edit this to add work)
assets/
  images/profile.svg        your profile photo (replace this)
  images/og-cover.svg       social share image
  images/favicon.svg        yellow "G" favicon
  images/portfolio/*        portfolio thumbnails (placeholders)
  images/testimonials/*     testimonial avatars (placeholders)
  audio/                    drop your music files here
  docs/                     drop your CV here (Dan-Mungufeni-CV.pdf)
```

---

## 3. Where to edit things

Every editable spot is marked with an HTML comment (search the codebase for `EDIT`).

### 3.1 Profile photo (shown twice)
1. Drop your photo into `assets/images/`. A square crop of at least **800×800px** works best.
2. Either keep the name `profile.svg`, or update the two `<img class="...profile..."` tags in
   `index.html` (sidebar + hero orbit).
3. Give it meaningful `alt` text.

### 3.2 Text, numbers and links
| What | Where in `index.html` |
|------|------------------------|
| Hero headline, tags, intro | the `#home` section |
| About text + "What I Do" | the `#about` section |
| Fun fact numbers | `data-count="3"` etc. — replace with your real numbers |
| Education / Experience | the `#resume` section |
| Skills chips | the `.skills` list |
| Testimonials | the `#testimonials` section |
| Email / WhatsApp / socials | the `#contact` section |

### 3.3 Portfolio items
Edit `data/portfolio.json`. Each item looks like:

```json
{
  "id": "unique-id",
  "title": "Project title",
  "category": "graphic-design",
  "categoryLabel": "Graphic Design",
  "image": "assets/images/portfolio/my-image.jpg",
  "description": "Short description shown in the lightbox."
}
```

`category` must be one of `graphic-design`, `software-networking`, `media-music`
(the same ids used by the filter pills in `index.html`).

### 3.4 Contact form + WhatsApp
Open `js/main.js` and edit `CONFIG` at the top:

```js
var CONFIG = {
  whatsapp: "256778625624",   // no "+", no spaces
  formMode: "whatsapp",       // "whatsapp" or "formspree"
  formspreeEndpoint: "https://formspree.io/f/your-form-id"
};
```

- `"whatsapp"` (default): the form opens WhatsApp with a prefilled message.
- `"formspree"`: set `formMode` to `"formspree"`, paste your Formspree endpoint, and it POSTs instead.
  (Create a free form at https://formspree.io.)

### 3.5 CV download
Save your CV as `assets/docs/Dan-Mungufeni-CV.pdf` (see `assets/docs/README.md`).

### 3.6 Music player
Save tracks into `assets/audio/` and update the `data-audio` paths in `index.html`
(see `assets/audio/README.md`).

### 3.7 SEO / social sharing
In `index.html` `<head>`, update:
- `<title>` and `<meta name="description">`
- the Open Graph / Twitter URLs and image
- the `<link rel="canonical">`
- the JSON-LD `Person` block (name, social URLs)

Replace the placeholder domain `https://gtnationdev.example.com/` with your real one.

---

## 4. Deploy

### Vercel
1. Push this folder to a GitHub/GitLab repo.
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Build command: **none**. Output directory: **`.`** (root).
4. **Deploy**. Add your custom domain under **Settings → Domains** if you have one.

### Netlify
1. Push to a Git repo, or just drag-and-drop the folder onto https://app.netlify.com/drop.
2. For Git deploys: **Add new site → Import an existing project**. Build command: **none**.
   Publish directory: **`.`**.
3. Add a custom domain under **Site settings → Domain management**.

Either host serves the static files and `data/portfolio.json` correctly — no server needed in production.

---

## 5. Accessibility & performance notes
- Semantic landmarks, skip link, visible focus rings, `aria-*` on interactive controls.
- Lightbox and mobile menu trap focus context and close on `Esc`.
- Images are lazy-loaded; `prefers-reduced-motion` disables animations.
- No JavaScript libraries — just one small `main.js`.

## 6. Browser support
Evergreen Chrome, Edge, Firefox and Safari. The `.monkeycode-ai.live` style hosts are supported
via standard `allowedHosts`-free static hosting (no dev-server config required).
