# crunchrock.games — the website

**This repo is the site. It is the only copy. Edit here, push here, done.**

Live at <https://crunchrock.games> via GitHub Pages (`main` branch, root). A push is a deploy —
the build takes about a minute. There is no staging copy anywhere else, and there must never be
one again: for a while the game repo carried a second `marketing/website/` tree, it drifted 857
lines behind this design, and updating it changed nothing about the live site.

If you came here from the game repo, that pointer is `marketing/website/README.md` and it is
correct — this is the place.

## Current state — 2026-09-29, demo live

The game page says the free demo is out now and sends people to the demo's Steam page
(`store.steampowered.com/app/5163790`). The full game (`app/4995150`) is the wishlist link. The page
was rebuilt on the 2026-09-26 owner direction (below) and replaces the rejected September 25
batch entirely; `img/launch-20260925/` and `vid/launch-20260925/` are no longer referenced and can
be deleted once this version is approved.

**Before pushing:** confirm the demo's Steam page really shows a download button. No claim on
this page may be stronger than the store. Release truth lives in `marketing/00_START_HERE.md` in
the game repo.

## Layout

```
index.html      the game page      privacy.html   eula.html
work.html       the studio page    CNAME          crunchrock.games
img/            logos, OG cards, older stills
img/demo/       2026-09-29 stills, loop posters, the Randy hero plate
img/work/       contract-work stills
vid/            older trailer + work clips
vid/demo/       2026-09-29 gameplay loops + the demo trailer encode
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

## The design — owner direction 2026-10-08

**The site is made of the game's new UI material.** The game is moving toward authored, handmade
surfaces in the Psychonauts 2 and Double Fine register, with its own mushrooms and alien
elements. The concepts are C1 Alien Chromatophore Ink and C2 Mycelial Cut-Paper
(`docs/art/ui-concepts/` in the game repo, `UI-BRAND-GUIDE.md` there): a pale mottled reading
field, teal-to-lime pigment at the edges, printed grain, near-black ink for type and wells. The
dark purple behind those concept boards is the board's backdrop, not the material. The owner does
not want purple as the site's main colour, and **there is no dark page**. Dark lives only in the
key art, the captures and the ink wells.

- **The sheet** is one continuous pale lime-cream field (`#F0EFD8`) with printed grain over
  everything (an SVG noise tile, multiply, low opacity) and ink type at full strength.
- **Pigment** is C1's chromatophore patch: an irregular lime-to-moss-to-teal shape, multiplied
  onto the sheet with a defined edge, placed at section edges and behind media. Never under body
  copy. One per section at most, sized and rotated differently each time.
- **Media are stickers.** Every capture has a 3px ink edge, a 14px radius and a hard offset ink
  shadow. Some sit a degree off level.
- **One slab per page.** The Randy line sits in the C1 reading field: a greener paper
  (`#E6ECC9`), lime-to-teal rim, ink shadow, Randy's name in an ink well. It is the one quote
  device and it ties the site to the game's dialogue UI. Do not add more.
- **One button.** Lime (`#B7E561`) pill, 3px ink border, hard offset ink shadow, pressed on hover.
  The wishlist button is the same pill in the greener paper.
- **Motifs** are the C1 vocabulary only: pore dots fading from one corner in deep teal, a ring or
  double ring in RandyBlue, one small spiral in the slab's cap.
- **Copy is short.** One or two sentences per game, one line under each big heading, the premise
  in one paragraph. Aggro Crab is the register: flat, uneven, no filler. If a line can go, it goes.

The skeleton is after [aggrocrab.com](https://aggrocrab.com): full-bleed key art with the wordmark
and one button, cut at an angle into the sheet; a huge statement in display type; one game per row
in alternating layout; lots of air; a short close. The hero plate is positioned at 40% so Randy
stands right of the wordmark; the phone crop sits at 12% for the same reason.

**One three per page.** The demo really has three games, so the three game rows are this page's
one three. Everything else runs at its natural uneven length.

Titan One for display, Baloo 2 for body, JetBrains Mono for the technical voice. No serif.

`work.html` is the same sheet through the override block at the end of its stylesheet: grain,
ink type, the lime pill, sticker media, two pigment patches.

This supersedes the white-on-black teal-gradient direction of 2026-09-26, and before it the
paper/ink sticker design of 2026-08-15. The flat, unframed, media-on-black page read as a generated
landing page and carried none of the game's identity. A dusk-purple page was tried on 2026-10-08
and rejected within the hour: giant purple fields with white text are the default, not the game.

### The clanker tells — banned, all of them

A design move that reads as machine-generated because it is what every model reaches for first.
Owner-set 2026-08-15, permanent, no exceptions. Full table with reasons and replacements:
`marketing/BRAND.md` §0.1 in the game repo.

1. **A sans-serif paired with a serif.** Titan One, Baloo 2, JetBrains Mono. No serif on this site.
2. **These • weird • dots • everywhere.** Write the sentence. Real punctuation, or a line break.
3. **An icon in a rounded square, inside a box that is also a rounded square.** No icons at all;
   images are real captures from the game.
4. **ALL-CAPS EYEBROW TEXT THAT ENDS WITH AN EM DASH.** The headline is the headline. `.kicker`
   is a plain sentence in mono and stays that way.
5. **The generic skeleton:** stats in the hero in a box, a numbered "our process" section, service
   cards. Structure follows what we actually have — the house, the three games, the jar, the
   trailer, the invitation.
6. **Small light-grey text.** The Grey Law, below.
7. **Everything in patterns of three.** Budget: one three per page, and only when the world
   actually has three of that thing. Subtraction test: delete one of the three. If nothing is
   lost, it was rhythm — leave it deleted.
8. **A skinny accent line on one edge of a card.** No hairline rules. The slab's rim goes all
   the way round; the sticker shadow is a block on two edges, not a line.

**Register reference: [aggrocrab.com](https://aggrocrab.com).** Flat, uneven, conversational game
copy, one game per row in alternating layout, one CTA.

**The test for anything not on the list: would a model produce this on its first try?** If yes, it
needs a reason to exist beyond looking finished.

### The Grey Law — binding

**No dimmed text. Anywhere. Ever.** No `opacity` on a text element, no faded white, no "muted" or
"secondary" role. Hierarchy comes from **size, weight, case and hue.** Low-alpha values are legal
only on non-text chrome: the gradients and the image lift under the hero type.

Source: `marketing/BRAND.md` §1 in the game repo, owner-directed 2026-08-15.

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
