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

Inverted canon palette: **BoneCream is the paper, CaveInk is the ink.** ToxicLime and SunsetOrange
are too light to carry text on cream, so they are fills only. ShroomPurple is the one accent that
works as type. AlienTeal appears only on the dark plates, where Zlorp lives. Titan One for display,
Baloo 2 for body, JetBrains Mono for the technical voice — facts, labels, dates, nav.

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

- **Art masters live in the game repo**, at `Assets/_BadShrooms/Art/Generated/` (wordmark, cover,
  studio mark). Web copies here are exports. Re-export; never redraw.
- **Stills** come from owner-selected capture sets, currently
  `marketing/assets/steam/review/final-10-owner-selected-2026-08-14/` in the game repo — the same
  ten that went to Valve. Export at ~1600px, JPEG q≈4.
- Every capture has the score bar burned into the top, and some carry a Zlorp dialogue box. The
  plates zoom-frame inside a fixed window (`transform:scale(1.5)` plus a per-plate
  `transform-origin`) to push that chrome out of shot. Replace the mechanism the day there are
  clean captures.

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

The public schedule lives in **one place**: the `.state` list under the trailer. One line changes
per stage; nothing else on the page has to.

- **Valve approves the store page** → the Wishlist buttons simply start working (they 404 until
  then). Remove the "in review" note under the closing button, and update the first `.state` item.
- **Demo released** → second `.state` item becomes the demo link; the Steam page has a matching
  before/after copy switch in `marketing/assets/steam/copy-drafts.md`.

Release truth comes from `marketing/00_START_HERE.md` in the game repo. Never let this page get
ahead of it — no claim here is stronger than the build.
