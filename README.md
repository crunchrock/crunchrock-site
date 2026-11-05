# crunchrock.games — the website

**This repo is the site. It is the only copy. Edit here, push here, done.**

Live at <https://crunchrock.games> via GitHub Pages (`main` branch, root). A push is a deploy —
the build takes about a minute. There is no staging copy anywhere else, and there must never be
one again: for a while the game repo carried a second `marketing/website/` tree, it drifted 857
lines behind this design, and updating it changed nothing about the live site.

If you came here from the game repo, that pointer is `marketing/website/README.md` and it is
correct — this is the place.

## Current state

The game page is one scroll through a 3D constellation of six minigame orbs. The free demo is out
(`store.steampowered.com/app/5163790`); the full game (`app/4995150`) is the wishlist link. Early
Access has no date on this page. No claim here may be stronger than the store. Release truth lives
in `marketing/00_START_HERE.md` in the game repo.

## Layout

```
index.html      the game page: words and orb data   privacy.html   eula.html
js/stage.js     the WebGL constellation             js/three.module.min.js  three r160, vendored
work.html       the studio page    CNAME          crunchrock.games
img/            logos, OG cards, older stills
img/demo/       2026-09-29 stills, loop posters, the Randy hero plate
img/work/       contract-work stills
vid/            older trailer + work clips
vid/demo/       the demo trailer encode + older loops
vid/orbs/       one 960x540 silent clip per orb, 3 to 6 seconds; also what the orb's lightbox plays
img/orbs/       one poster per orb and the selected minigame title logos
```

## Deploying

```
git add -A && git commit -m "..." && git push
```

That is the whole runbook. Watch the build with
`gh api repos/crunchrock/crunchrock-site/pages/builds/latest --jq .status` — it returns `building`
then `built`.

To check something before it is public, serve the folder and open it — `file://` will not do,
because the page loads video:

```
python -m http.server 8901 --bind 127.0.0.1
```

Headless proof without a browser window (Chrome or Edge):

```
chrome --headless=new --hide-scrollbars --window-size=1440,7400 --screenshot=desktop.png http://127.0.0.1:8901/
```

Desktop Chrome will not open a window narrower than about 500px, so a 390-wide `--window-size`
quietly lays the page out at 500 and crops. To prove the phone layout, screenshot a scratch page
that embeds the site in a 390px iframe:

```
echo '<iframe src="/" style="border:0;width:390px;height:7200px"></iframe>' > _phone.html
chrome --headless=new --hide-scrollbars --window-size=600,7200 --screenshot=phone.png http://127.0.0.1:8901/_phone.html
del _phone.html
```

## The design

**Less is more. Light page, dark type, and the footage does the talking.** A fixed WebGL canvas sits
behind ordinary HTML sections; native scroll flies the camera, so the words, links and fallbacks
stay real page content.

- **The sheet** is pale paper (`#f3f1dc`) with hard-edged pigment bands radiating from the orb in
  focus. The band tint comes from that section's `data-tint` and must stay pale, because ink type
  sits on it. No dark page.
- **An orb** is one `<section data-stop>` in `index.html`: `data-name`, `data-clip`, `data-poster`,
  `data-side` (which side of the screen), `data-tint`, `data-halo`, `data-halo2`, and `data-size` when
  the clip is not 960x540. Add a section and
  the stage adds the orb; update the angle list `turn` in `layout()` to match.
- **Mystery planets** are the unannounced games, listed in `planetSpots` in `js/stage.js`: two for the
  7 minigames Early Access starts with, eight more for the 15 at 1.0. They are not clickable and have
  no names. The `data-scale` section is the pull-back that shows them all. When a game is revealed,
  remove its planet and add its section.
- **Clips** come from the demo trailer and the owner's recordings, cropped by the orb, so pick a shot
  whose centre carries the idea and whose source really runs near 60 fps; some of the recordings do not, so measure before using one. Keep recordings free of the desktop. A click on the focused orb
  opens its clip at full frame.
- **Words win.** Floating toys shrink away from the text column and threads fade near a close-up.
- **Copy** is one line and one fact per game, from approved Steam text or shipped game strings. No
  taglines. If a line can go, it goes.
- **Phones** decode only the orb in focus. Desktop plays every clip while the whole ring is on screen.
  Resolution drops before framerate does. No WebGL2 means plain sections with round stills.

The wordmark on this page is `img/logo_bad_shrooms_ink.webp`, the real logo gradient-mapped to ink
with a magenta extrude, because the cream master disappears on the light sheet.

Titan One for display, Baloo 2 for body, JetBrains Mono for the tags. No serif.

`work.html` keeps its own pale sticker-sheet style.

To prove motion, capture frames across a real scroll and look at them in order; one still does not
show the flight.

## Copy

Player-facing words are the owner's. The premise and the game rows are cut down from the demo copy
the owner approved for Steam on 2026-09-14 (`docs/steam/store-refresh-2026-09-14/05_DEMO_PASTE_READY.txt`
in the game repo); nothing on the page is a new sentence of his voice except the one-line ledes.
Randy's slab line is his in-game intro from the demo build. The tagline "Your friends are the difficulty setting." and the flingable
word "friends" survive from the previous design on purpose: the game's verb is grab-and-throw,
so that is the one interactive thing on the page. Zero em dashes in player-facing copy.

## Assets

- **The studio mark** is Pet Rock (chosen 2026-09-22). `img/logo_crunchrock_wide_white.svg` and
  `img/logo_crunchrock_stacked_white.svg` are the dark-surface exports: the SVG masters with the
  ink type (`#0B0B0C`) set to white and the rock colours untouched. The paper versions
  (`img/logo_crunchrock_wide.svg`, `_stacked.svg`, `img/logo_crunchrock.png`) still serve
  `work.html`. `img/crunchrock_mark.png` is the face that replaces the lockup under 560px.
  `img/favicon.svg` / `img/favicon-32.png` / `img/apple-touch-icon.png` / `/favicon.ico` are the
  icon set. Masters are the SVGs in the Pet Rock kit; keep a copy in the game repo under
  `marketing/assets/studio-logo/`. Never redraw; re-export from the SVG masters.
- **The wordmark** is `img/logo_bad_shrooms.png`: the keeper (logo_B_01, 2026-08-28) from
  `Assets/_BadShrooms/Art/Generated/logo_bad_shrooms_dott.png` in the game repo. Never redraw.
- **The hero** is the demo's Steam capsule plate, in engine: Randy in the kitchen with the corrected
  knives, `marketing/assets/steam/demo/library_hero_3840x1240.png` in the game repo, exported to
  `img/demo/hero_randy_kitchen.jpg` (2400 wide) and a phone crop centred on Randy. `img/og-game.jpg`
  is a 1200×630 crop of the same plate with the wordmark.
- **Stills** (`img/demo/still_*.jpg`) are the nine 1080p captures from the 2026-09-29 Steam
  screenshot set (`marketing/approval-queue/2026-09-29-steam-launch/screenshots/`), exported at
  1600px JPEG q86, HUD left in.

### The loops

`vid/demo/loop_*.mp4` are muted 1.6 to 3.4 second single cuts from the owner's clean recordings
in `C:\Users\pc\Videos\trailer` (`longer full play current.mp4`, `good gameplay.mp4`), 960px,
CRF 27, 50 to 450 KB each, 30 fps. They play only while on screen (never under reduced-motion or
on a metered connection; the `img/demo/loop_*.jpg` posters carry the content otherwise).
Where the HUD adds nothing the encode crops it (top 13%, bottom 7%); where the label is the point
(RUN, GET OFF THE PAD, the combo bank) the frame is left whole.

| Loop | Source | What it shows |
|---|---|---|
| lanes | long 225.3 + 3.05 s | the living room grows bowling lanes |
| combo | long 491.5 + 3.3 s | lane, release, pins, the chain banks |
| shrink | long 360.9 + 2.1 s | two friends shrink |
| lava | long 368.6 + 2.2 s | Randy says LAVA, the floor floods |
| maze | long 42.0 + 2.9 s | the bathroom becomes the maze |
| stall | long 112.4 + 2.4 s | RUN, corridor, stall door |
| sword | long 812.0 + 2.4 s | Randy closes in with the sword |
| eggs | long 825.4 + 2.5 s | You lost. I'm still making eggs. |
| jar | long 446.9 + 1.6 s | Randy's quota counts up |
| pad | long 712.3 + 2.0 s | GET OFF THE PAD, into the lava |
| radio | general 316.4 + 2.6 s | the station changes |

Recut with `ffmpeg -ss S -t T -i src.mp4 -an -vf "crop=iw:ih*0.80:0:ih*0.13,scale=960:-2,fps=30" -crf 27`
(drop the crop for label shots).

### The trailer

`vid/demo/badshrooms_demo_trailer.mp4` is a 20 MB CRF-26 encode of the One Night take
(58 s, 1080p60). The master is `C:\Users\pc\Videos\trailer\_fable_takes\BadShrooms_Take1_OneNight_Demo_16x9.mp4`
and its recipe is `marketing/editing/projects/demo-trailer-onenight-2026-09-29/` in the game
repo. Self-hosted on purpose: no YouTube embed means no third-party cookies and no "watch on
YouTube" wall between a visitor and the game. `preload="none"` means nothing downloads until
someone presses play. Swap the file when the owner approves a different cut; the poster is
`img/demo/trailer_poster.jpg`.

Rebuild the encode after any master change:

```
ffmpeg -y -i MASTER.mp4 -c:v libx264 -profile:v high -preset slow -crf 26 -maxrate 3500k -bufsize 7000k \
  -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k -ac 2 vid/demo/badshrooms_demo_trailer.mp4
```

Keep it under ~25 MB. GitHub hard-limits a file at 100 MB.

## What changes when a release stage moves

- **Demo live (now)** → hero button and close button point at the demo page and say "Play the
  free demo"; the mono fact line under the tagline says "Out now on Steam".
- **Early Access live** → the close swaps to the full game's buy link, the "Bring somebody"
  paragraph about Early Access becomes the current roster, and `work.html`'s status line changes
  with it.

Never let this page get ahead of the store.
