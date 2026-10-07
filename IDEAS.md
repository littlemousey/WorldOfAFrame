# World of A-Frame — ideas and direction

Notes on where this is going, so decisions already made don't get re-litigated.

## The big one: a "Doloris" maze

The hub stops being a menu you can browse and becomes **a single irreversible
choice**. You pick one doorway and walk one branch of a maze to its end. There is
no going back and no returning to the hub mid-branch.

Each branch is a *sequence* of worlds, not one room. Every world has exactly one
onward doorway, and the branch terminates in an endpoint.

### The jungle branch — built

```
hub → jungle
    → Rainbow Bay      a small sand beach; a rainbow over mountains across the
                       bay, rainbow and mountains both mirrored in the water
    → Balloon Meadow   green field, blue sky full of hot air balloons, cows grazing
    → Storm Forest     pines in the rain, thunder and lightning now and then
    → Starry Night     dark grass field full of flowers, a sky full of
                       flickering stars, mountains all round
    → (back to the hub, for now)
```

This replaced an earlier sketch (boat at sea → underwater → palm beach →
jungle). The ball pit used to hang off the jungle; it is now the first step of
the garden branch instead.

### The garden branch — started

```
hub → Japanese garden → Ball Pit Sky → (back to the hub, for now)
```

The branches for snow and the cave are still open. Each needs the same shape:
a run of connected scenes ending somewhere final.

### What this changes

- **No labels on the doors.** Decided and already implemented. The choice is made
  on the doorway itself — its colour, its light, what it feels like — not on a
  caption telling you where it goes. Do not reintroduce door text.
- **Back-doors become branch-forward doors.** Every world currently has a "Back to
  the hub" portal. Under the maze these become one-way links to the *next* scene
  in the branch. The hub link only makes sense from an endpoint, if at all.
- **Scenes have an order, kept in one table.** `js/routes.js` maps each page to
  the page its onward door leads to; doors say `portal="href: next"` instead of a
  hardcoded `href`. Reordering a branch is a one-line change there. Snow and the
  cave still link straight to the hub until their branches exist.
- **Endpoints need to be designed.** An ending that is just a dead end will feel
  like a bug. For now Starry Night and Ball Pit Sky end in a labelled door back
  to the hub. Open question: does the branch end in a reveal, a view, a return?
- **Onward doors are unlabelled; only the way home says where it goes.**

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
  cave and the four jungle-branch worlds have no audio yet — Storm Forest in
  particular wants rain and thunder.

## Backlog

- The torii and pond in `japanese-garden.html` float: they are hardcoded at
  `y=0` while the trees are placed through `terrainH()`.
- `japanese-garden.html` still has `wasd-controls` and `look-controls` on both
  the rig and the camera, so movement there runs at double rate. See
  `js/cosmos.js` users and the other scenes for the fix.
- Performance: the jungle is the heaviest scene (~70 trees at four draw calls
  each, plus the wall). It is the first thing that will struggle on a standalone
  headset. `populate` holds the dial.
