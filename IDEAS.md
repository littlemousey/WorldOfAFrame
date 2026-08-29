# World of A-Frame — ideas and direction

Notes on where this is going, so decisions already made don't get re-litigated.

## The big one: a "Doloris" maze

The hub stops being a menu you can browse and becomes **a single irreversible
choice**. You pick one doorway and walk one branch of a maze to its end. There is
no going back and no returning to the hub mid-branch.

Each branch is a *sequence* of worlds, not one room. Every world has exactly one
onward doorway, and the branch terminates in an endpoint.

### Worked example — the jungle branch

```
hub → boat sailing on the open sea
    → underwater, among fish and sharks
    → a beach with palm trees
    → the jungle
    → (endpoint)
```

The branches for snow, the garden and the cave are still open. Each needs the
same shape: a run of connected scenes ending somewhere final.

### What this changes

- **No labels on the doors.** Decided and already implemented. The choice is made
  on the doorway itself — its colour, its light, what it feels like — not on a
  caption telling you where it goes. Do not reintroduce door text.
- **Back-doors become branch-forward doors.** Every world currently has a "Back to
  the hub" portal. Under the maze these become one-way links to the *next* scene
  in the branch. The hub link only makes sense from an endpoint, if at all.
- **Scenes need an order.** Right now `jungle.html`, `cave.html`, `snow.html` and
  `japanese-garden.html` are siblings hanging off the hub. They will become nodes
  in four chains, so something has to own the routing — probably a small table in
  JS rather than hardcoded `href`s scattered through the markup.
- **Endpoints need to be designed.** An ending that is just a dead end will feel
  like a bug. Open question: does the branch end in a reveal, a view, a return?

### Scenes the jungle branch still needs

- a boat on open sea (moving deck, horizon, sail)
- underwater (caustics, fish schools, sharks, surface seen from below)
- a palm beach (sand, surf line, palms)

## Done, and why

- **Christmas is decoupled.** `christmas.html` is no longer reachable from the
  hub. The file is still in the repo — it is not deleted, just unlinked — and its
  own "back to the hub" portal still works if opened directly. Its slot became
  the snow world (`snow.html`), which fits the mountains-and-maze direction
  better than a living room does.
- **Doorways are open arches**, no doors — and each one is a different piece of
  architecture, after the Doloris maze's four colour-coded entrances. Snow is a
  pointed ice arch hung with icicles, jungle a round wooden arch overgrown with
  leaves and lianas, the garden a torii, the cave a hole broken through rock with
  crystals in the rim. Geometry lives in `js/cosmos.js` (`arch`, `gothic`,
  `cave-mouth`, plus a `-frame` variant of each); the torii is primitives in the
  markup. Four identical arches in four colours is a colour swatch, not a choice.
- **Each world has looping ambience** via `js/ambience.js` (`ambience` component
  on `a-scene`), with a mute button top-right. Browsers block autoplay until the
  page is interacted with, so it retries on the first click or keypress. The
  garden and cave have no audio yet.

## Backlog

- The torii and pond in `japanese-garden.html` float: they are hardcoded at
  `y=0` while the trees are placed through `terrainH()`.
- `japanese-garden.html` still has `wasd-controls` and `look-controls` on both
  the rig and the camera, so movement there runs at double rate. See
  `js/cosmos.js` users and the other scenes for the fix.
- Performance: the jungle is the heaviest scene (~70 trees at four draw calls
  each, plus the wall). It is the first thing that will struggle on a standalone
  headset. `populate` holds the dial.
