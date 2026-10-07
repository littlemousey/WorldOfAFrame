/* The maze: where the onward door in each world leads.

   A world's door says `portal="href: next"` and this table decides where
   "next" is, so a branch can be reordered here in one place instead of
   hunting through the markup of every scene. A page that is not listed goes
   back to the hub. See IDEAS.md for the branches. */
var ROUTES = {
  /* Jungle branch: hub → jungle → … → a night under the stars. */
  'jungle.html':         'rainbow-bay.html',
  'rainbow-bay.html':    'balloon-meadow.html',
  'balloon-meadow.html': 'storm-forest.html',
  'storm-forest.html':   'starry-night.html',
  'starry-night.html':   'index.html',       /* the end of the branch, for now */

  /* Garden branch: only its first step is decided so far. */
  'japanese-garden.html': 'ballpit.html',
  'ballpit.html':         'index.html'
};

function nextWorld () {
  var page = location.pathname.split('/').pop() || 'index.html';
  /* GitHub Pages also serves `/jungle` for `/jungle.html`. */
  if (page.indexOf('.') < 0) { page += '.html'; }
  return ROUTES[page] || 'index.html';
}
