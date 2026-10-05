# World of A-Frame

A small WebVR project: you arrive in a room floating in space, pick one of four
doorways, and step into the world behind it. Built with
[A-Frame](https://aframe.io/) — plain HTML and JavaScript, no build step and
nothing to install.

**▶ [Try it](https://littlemousey.github.io/WorldOfAFrame/)** — works in any
browser, mouse and keyboard, or in a headset via the VR button.

<img width="1824" height="920" alt="image" src="https://github.com/user-attachments/assets/1e03dc42-636e-425c-8213-5dad42edb7f9" />


## The worlds

| | |
|---|---|
| **Snow Peaks** | A valley walled in by mountains, snow-laden pines, a frozen tarn, falling snow. |
| **Jungle Hollow** | A lagoon in a forest hollow — butterflies, birds, fish, fireflies, light through the canopy. |
| **Japanese Garden** | Rolling hills, cherry trees and drifting blossom. |
| **Crystal Cave** | A dark chamber lit only by the crystals growing in it, around a still black pool. |

There is a fifth world that is not in the hub: look around the jungle for a round
doorway ringed with ball-pit balls. It leads to **Ball Pit Sky** — a ball pit
floating on a cloud in a blue sky, with balls of every colour bouncing all around it.

Each doorway is its own piece of architecture — a pointed ice arch, an overgrown
wooden one, a torii, a hole broken through rock — and none of them are labelled.
The choice is meant to be made on the doorway itself.

## Running it locally

It has to be served over HTTP. Opening `index.html` from the file system looks
broken: browsers give every `file://` URL an opaque origin, so the models fail to
load while images and audio still work.

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## How it is built

Almost everything is generated in code rather than loaded as an asset — the
terrain, trees, crystals, water, creatures, the starfield and the nebula sky are
all procedural, seeded so they come out the same every time. That keeps the
download tiny and means the scenes have no art dependencies.

```
index.html              the hub — the room in space with the four doorways
snow.html   jungle.html
cave.html   japanese-garden.html
ballpit.html            reached through a door in jungle.html, not from the hub
christmas.html          the original scene, kept but no longer linked from the hub

js/portal.js            makes an entity a clickable door to another page
js/cosmos.js            starfield, nebula sky shader, doorway geometries
js/ambience.js          looping background sound, with a mute button

img/                    the hub's floor texture, plus christmas.html's textures
objects/                models, used only by christmas.html
sounds/                 ambience, plus christmas.html's Jingle Bells
```

Where it is going next — a branching maze where one door commits you to a whole
sequence of worlds — is written up in [IDEAS.md](IDEAS.md).

## Credits

Ambient sound from [Pixabay](https://pixabay.com/), with thanks to the artists:

- **Universfield** — *Silent Universe* (`351473`) — the hub
- **Soul_Serenity_Sounds** — *Jungle Nature* (`229896`) — Jungle Hollow
- **mightuser** — *Sound of Howling Wind Through a Mountain Pass* (`261324`) — Snow Peaks
- **Soumages** — *Boing Bounce Sound Effect* (`427577`) — Ball Pit Sky
- **Yuliana Yurukova** — *Bird Chirps* (`343624`) — Japanese Garden

Built with [A-Frame](https://aframe.io/) by Mozilla and the A-Frame community.
