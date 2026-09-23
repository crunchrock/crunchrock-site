# crunchrock.games — the website

**This repo is the site. It is the only copy. Edit here, push here, done.**

Live at <https://crunchrock.games> via GitHub Pages (`main` branch, root). A push is a deploy —
the build takes about a minute. There is no staging copy anywhere else, and there must never be
one again: for a while the game repo carried a second `marketing/website/` tree, it drifted 857
lines behind this design, and updating it changed nothing about the live site.

If you came here from the game repo, that pointer is `marketing/website/README.md` and it is
correct — this is the place.

## Layout

```
index.html      the game page      privacy.html   eula.html
work.html       the studio page    CNAME          crunchrock.games
img/            stills, logos, OG cards
img/work/       contract-work stills
vid/            the trailer + work clips
```

## Deploying

```
git add -A && git commit -m "..." && git push
```

That is the whole runbook. Watch the build with
`gh api repos/crunchrock/crunchrock-site/pages/builds/latest --jq .status` — it returns `building`
then `built`.

To check something before it is public, serve the folder and open it — `file://` will not do,
because the page loads a video:

```
python -m http.server 8901 --bind 127.0.0.1
```

## The design

Inverted canon palette: **BoneCream is the paper, CaveInk is the ink.**

**All text on the paper field is ink.** Not purple, not lime, not orange — owner ruling,
2026-08-15. The colours are fills, borders, knockouts and underlines only: a lime highlight *behind*
ink type is right, lime type is not. Emphasis comes from weight, and links are identified by an
underline rather than a hue. On the dark plates, cream carries the type and AlienTeal belongs to
Zlorp alone.

**No background pattern on the paper.** The dot grid is gone and does not come back.

Titan One for display, Baloo 2 for body, JetBrains Mono for the technical voice — facts, labels,
dates, nav.

Sticker language throughout: 2.5px ink borders with a hard offset shadow, no blur, no gradient
except the poster's foot.

### The clanker tells — banned, all six

A design move that reads as machine-generated because it is what every model reaches for first.
Owner-set 2026-08-15, permanent, no exceptions. Full table with reasons and replacements:
`marketing/BRAND.md` §0.1 in the game repo.

1. **A sans-serif paired with a serif.** Titan One, Baloo 2, JetBrains Mono. No serif on this site.
2. **These • weird • dots • everywhere.** Write the sentence. Real punctuation, or a line break.
3. **An icon in a rounded square, inside a box that is also a rounded square.** Our chrome is square
   — 2.5px ink borders, hard offset shadows, `border-radius:2px` at most. Images are real captures
   from the game, never icons.
4. **ALL-CAPS EYEBROW TEXT THAT ENDS WITH AN EM DASH —.** The headline is the headline. `.kicker`
   is a plain sentence in mono and stays that way.
5. **The generic skeleton:** stats in the hero in a box, a numbered "our process" section, service
   cards. Structure follows what we actually have — the trailer, the three games, the jar, the
   schedule. Numbers live in sentences, not in bordered rectangles.
6. **Small light-grey text.** The Grey Law, below.
7. **Everything in patterns of three.** Tricolon sentences, three-sentence staccato, three-item
   lists, three-column grids, three-beat taglines. **Budget: one three per page**, and only when the
   world actually has three of that thing — the demo really does have three minigames, so the three
   plates are legitimate and they are this page's one. **Subtraction test: delete one of the three.
   If nothing is lost, it was rhythm — leave it deleted.** Then write the line at its natural uneven
   length instead of clipping it to two.

**Register reference: [aggrocrab.com](https://aggrocrab.com).** Flat, uneven, conversational game
copy, one game per row in alternating layout rather than a symmetric card grid, one CTA, and no
balanced-for-the-sake-of-balance anything. That is the target voice for this site.

**The test for anything not on the list: would a model produce this on its first try?** If yes, it
needs a reason to exist beyond looking finished.

### The Grey Law — binding

**No dimmed text. Anywhere. Ever.** No faded cream on the dark plates, no `--ink-70` on the paper,
no `opacity` on a text element, no "muted" or "secondary" role. It is the default register of
machine-generated pages and it reads as software, not as this game.

Hierarchy comes from **size, weight, case and hue.** Low-alpha values are legal only on non-text
chrome — hairlines, borders, image opacity.

Full-strength cream on dark and full-strength ink on cream are the house look. The ban is on
dimming them. Source: `marketing/BRAND.md` §1 in the game repo, owner-directed 2026-08-15.

## Assets

- **The studio mark** is Pet Rock (chosen 2026-09-22): `img/logo_crunchrock_wide.svg` is the bar
  lockup (centred, 48px tall; `img/crunchrock_mark.png` is the face that replaces it under 560px),
  `img/logo_crunchrock_stacked.svg` the sign-off above the footer on both pages,
  `img/logo_crunchrock.png` a PNG of the horizontal lockup (colour rock, ink type, for paper),
  `img/favicon.svg` / `img/favicon-32.png` / `img/apple-touch-icon.png` / `/favicon.ico` the icon set,
  `img/og-crunchrock.png` a 1200×630 studio card. Masters are the SVGs in the Pet Rock kit
  (`crunchrock-petrock-kit/01-masters-svg`, 2026-09-22); keep a copy in the game repo under
  `marketing/assets/studio-logo/`. Never redraw; re-export from the SVG masters.
- **The wordmark** is `img/logo_bad_shrooms.png`: the keeper (logo_B_01, 2026-08-28) from
  `Assets/_BadShrooms/Art/Generated/logo_bad_shrooms_dott.png` in the game repo, with the same
  subtle deep-navy silhouette the Steam capsule exporter puts under it (offset ~1.2% x / 2.2% y,
  blurred, 85% ink). Never redraw; re-export from the master if the keeper changes.
- **The hero** is in-engine, not painted: Zlorp in the kitchen, the approved capsule plate
  (`marketing/assets/steam/2026-08-28-cig3-approved/`). The 4K source is
  `marketing/assets/steam/raw/2026-08-28-kitchen-owner-v3/cigarette-mid3_o0-owner_4k.png` and the
  phone crop is its `_port` sibling. The painted dusk house (`cover_dusk_house.jpg`) was retired
  on 2026-08-29 and is no longer referenced.
- **Stills** (`img/new_*.jpg`) are frames pulled from the owner's clip folders
  (`Videos/Bad Shrooms Trailer Clips` and `Videos/Bad Shrooms Clips`), chosen by eye off contact
  sheets, HUD cropped out (score bar top ~13%, dialogue box bottom), exported at ~1600px JPEG q86.
  The old `shot_*.jpg` and `plate_*.jpg` files are no longer referenced.

### The loops

`vid/loop_*.mp4` are muted 2.5 to 5 second cuts from the same clip folders, 960px, CRF 27,
150 to 550 KB each, HUD cropped in the encode. They sit in the mosaic, the second slot of each
game row, and the finale, and play only while on screen (never under reduced-motion or on a
metered connection; the `img/loop_*.jpg` posters carry the content otherwise). Recut with
`ffmpeg -ss S -t T -i clip.mp4 -an -vf "crop=iw:ih*0.80:0:ih*0.13,scale=960:-2,fps=30" -crf 27`.

### The trailer

`vid/badshrooms_trailer_a.mp4` is a 16 MB CRF-26 encode. The master is 139 MB and lives outside
git at `C:\Users\pc\Videos\rough trailer.mp4`. Self-hosted on purpose: no YouTube embed means no
third-party cookies and no "watch on YouTube" wall between a visitor and the game. `preload="none"`
means nothing downloads until someone presses play.

Rebuild it after any master change, from the game repo root:

```
./tmp/audio_lava/ffmpeg/bin/ffmpeg.exe -y -i "C:/Users/pc/Videos/rough trailer.mp4" \
  -c:v libx264 -profile:v high -preset slow -crf 26 -maxrate 3500k -bufsize 7000k \
  -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k -ac 2 \
  vid/badshrooms_trailer_a.mp4
```

Keep it under ~25 MB. GitHub hard-limits a file at 100 MB.

## What changes when a release stage moves

The public schedule lives in **one place**: the `.state` line under the poster. One line changes
per stage; nothing else on the page has to.

- **Demo submitted, in Valve review** → the `.state` line says so and the close says the demo goes
  public when Valve clears it. This is the current state (submitted 2026-08-29).
- **Demo released** → the `.state` line becomes the demo link, the close button can point at it,
  and the trailer section swaps to Trailer B when it is cut. The Steam page has a matching
  before/after copy switch in `marketing/assets/steam/copy-drafts.md`.

Release truth comes from `marketing/00_START_HERE.md` in the game repo. Never let this page get
ahead of it — no claim here is stronger than the build.
