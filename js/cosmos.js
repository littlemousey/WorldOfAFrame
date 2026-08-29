/* Procedural deep space for the hub room: a nebula sky and a real starfield.
   No textures — everything here is generated, so there is nothing to download
   and the stars keep their parallax as you walk around. */

/* ---- Sky: vertical gradient with slow-drifting nebula clouds. ------------ */
AFRAME.registerShader('cosmos-sky', {
  schema: {
    timeMsec:     {type: 'time',  is: 'uniform'},
    zenithColor:  {type: 'color', default: '#04060f', is: 'uniform'},
    horizonColor: {type: 'color', default: '#141033', is: 'uniform'},
    nebulaA:      {type: 'color', default: '#6d3fb0', is: 'uniform'},
    nebulaB:      {type: 'color', default: '#1f6f8b', is: 'uniform'}
  },

  vertexShader: [
    'varying vec3 vWorldPosition;',
    'void main() {',
    '  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),

  fragmentShader: [
    'precision mediump float;',
    'uniform float timeMsec;',
    'uniform vec3 zenithColor;',
    'uniform vec3 horizonColor;',
    'uniform vec3 nebulaA;',
    'uniform vec3 nebulaB;',
    'varying vec3 vWorldPosition;',

    'float hash(vec3 p) {',
    '  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));',
    '  p *= 17.0;',
    '  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));',
    '}',

    'float noise(vec3 x) {',
    '  vec3 i = floor(x);',
    '  vec3 f = fract(x);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),',
    '                 mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),',
    '             mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),',
    '                 mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);',
    '}',

    'float fbm(vec3 p) {',
    '  float v = 0.0;',
    '  float a = 0.5;',
    '  for (int i = 0; i < 5; i++) {',
    '    v += a * noise(p);',
    '    p *= 2.03;',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',

    'void main() {',
    '  vec3 dir = normalize(vWorldPosition);',
    '  float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);',
    '  vec3 col = mix(horizonColor, zenithColor, pow(t, 0.8));',

    /* Very slow drift: the clouds should breathe, not swirl. */
    '  float tm = timeMsec * 0.000018;',
    '  vec3 p = dir * 2.2;',
    '  float n = fbm(p + vec3(tm, tm * 0.35, -tm * 0.6));',
    '  float m = fbm(p * 1.9 + vec3(-tm * 0.7, 3.1, tm * 0.5));',

    '  float cloudA = smoothstep(0.46, 0.92, n);',
    '  float cloudB = smoothstep(0.54, 1.0, m) * smoothstep(0.18, 0.68, n);',
    '  col += nebulaA * cloudA * 0.48;',
    '  col += nebulaB * cloudB * 0.36;',

    /* A faint galactic band tilted just off the horizon. */
    '  float band = exp(-pow((dir.y - 0.06) * 3.0, 2.0));',
    '  col += mix(nebulaA, nebulaB, 0.5) * band * n * 0.18;',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n')
});

/* ---- Stars and dust motes: one point cloud, two shapes. ------------------
   shape: shell   -> a hollow sphere of stars far out, slowly rotating.
   shape: volume  -> a box of motes near the player, drifting upward.        */
AFRAME.registerComponent('starfield', {
  schema: {
    count:   {default: 1600},
    inner:   {default: 260},
    outer:   {default: 620},
    size:    {default: 2.4},
    spin:    {default: 0.006},
    rise:    {default: 0},
    shape:   {default: 'shell', oneOf: ['shell', 'volume']},
    extent:  {type: 'vec3', default: {x: 22, y: 7, z: 22}},
    palette: {default: '#ffffff,#dbe7ff,#a9c6ff,#ffe4bd,#e2c4ff'}
  },

  init: function () {
    var data = this.data;
    var count = data.count;
    var positions = new Float32Array(count * 3);
    var colors = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var phases = new Float32Array(count);

    var palette = data.palette.split(',').map(function (hex) {
      return new THREE.Color(hex.trim());
    });

    for (var i = 0; i < count; i++) {
      if (data.shape === 'shell') {
        /* Uniform directions: acos keeps them from clumping at the poles. */
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        var r = data.inner + Math.random() * (data.outer - data.inner);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.cos(phi);
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      } else {
        positions[i * 3]     = (Math.random() - 0.5) * data.extent.x;
        positions[i * 3 + 1] = (Math.random() - 0.5) * data.extent.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * data.extent.z;
      }

      var c = palette[(Math.random() * palette.length) | 0];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      /* Cube the roll so most stars stay small and a few burn bright. */
      sizes[i] = data.size * (0.35 + Math.pow(Math.random(), 3) * 1.9);
      phases[i] = Math.random() * Math.PI * 2;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    var renderer = this.el.sceneEl.renderer;
    var material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0},
        uPixelRatio: {value: renderer ? renderer.getPixelRatio() : (window.devicePixelRatio || 1)}
      },
      vertexShader: [
        'attribute vec3 aColor;',
        'attribute float aSize;',
        'attribute float aPhase;',
        'uniform float uTime;',
        'uniform float uPixelRatio;',
        'varying vec3 vColor;',
        'varying float vTwinkle;',
        'void main() {',
        '  vColor = aColor;',
        '  vTwinkle = 0.62 + 0.38 * sin(uTime * 1.6 + aPhase);',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = min(aSize * uPixelRatio * (600.0 / max(-mv.z, 1.0)) * vTwinkle, 26.0);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;',
        'varying vec3 vColor;',
        'varying float vTwinkle;',
        'void main() {',
        '  float d = length(gl_PointCoord - 0.5);',
        '  float core = smoothstep(0.5, 0.0, d);',
        '  float glow = pow(core, 3.0);',
        '  float a = core * vTwinkle;',
        '  if (a < 0.01) { discard; }',
        '  gl_FragColor = vec4(vColor * (glow + core * 0.4), a);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.el.setObject3D('starfield', this.points);
  },

  tick: function (time, timeDelta) {
    if (!this.points) { return; }
    var data = this.data;
    var dt = timeDelta / 1000;
    this.points.material.uniforms.uTime.value = time / 1000;
    this.points.rotation.y += data.spin * dt;

    if (data.rise) {
      var attr = this.points.geometry.attributes.position;
      var top = data.extent.y / 2;
      for (var i = 1; i < attr.array.length; i += 3) {
        attr.array[i] += data.rise * dt;
        if (attr.array[i] > top) { attr.array[i] = -top; }
      }
      attr.needsUpdate = true;
    }
  },

  remove: function () {
    if (!this.points) { return; }
    this.el.removeObject3D('starfield');
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.points = null;
  }
});

/* ---- Arched doorways -----------------------------------------------------
   A doorway with no door: a stone arch standing open, with the portal surface
   filling the opening. Registered as geometries rather than built in a
   component so the markup stays declarative and the existing `portal`
   component keeps working (it drives the material, which A-Frame owns).     */

/* Outline of an arch: straight jambs up to `straightHeight`, then a
   semicircle of radius `halfWidth` closing the top. */
function archOutline (halfWidth, straightHeight) {
  var shape = new THREE.Shape();
  shape.moveTo(-halfWidth, 0);
  shape.lineTo(-halfWidth, straightHeight);
  /* From the left springing point over the crown to the right one. */
  shape.absarc(0, straightHeight, halfWidth, Math.PI, 0, true);
  shape.lineTo(halfWidth, 0);
  shape.closePath();
  return shape;
}

/* The opening itself — a flat arched panel. This is the clickable portal. */
AFRAME.registerGeometry('arch', {
  schema: {
    halfWidth:      {default: 1.35, min: 0.1},
    straightHeight: {default: 2.4,  min: 0.1}
  },
  init: function (data) {
    this.geometry = new THREE.ShapeGeometry(
      archOutline(data.halfWidth, data.straightHeight));
  }
});

/* The surround — the same arch as a hole in a slightly larger one, extruded
   to give the stonework depth. */
AFRAME.registerGeometry('arch-frame', {
  schema: {
    halfWidth:      {default: 1.35, min: 0.1},
    straightHeight: {default: 2.4,  min: 0.1},
    thickness:      {default: 0.34, min: 0.01},
    depth:          {default: 0.5,  min: 0.01}
  },
  init: function (data) {
    var outer = archOutline(data.halfWidth + data.thickness, data.straightHeight);
    outer.holes.push(archOutline(data.halfWidth, data.straightHeight));
    var geo = new THREE.ExtrudeGeometry(outer, {
      depth: data.depth, bevelEnabled: false, curveSegments: 24
    });
    /* Extrusion runs +z from the plane; centre it on the entity instead. */
    geo.translate(0, 0, -data.depth / 2);
    this.geometry = geo;
  }
});

/* ---- Two more doorway silhouettes ----------------------------------------
   Four identical arches in four colours is a colour swatch, not a choice. Each
   world gets its own architecture, so the doors read as different places
   before you know anything about them.                                      */

/* A pointed, ogival arch — narrower and taller than the round one. */
function gothicOutline (halfWidth, straightHeight, rise) {
  var s = new THREE.Shape();
  s.moveTo(-halfWidth, 0);
  s.lineTo(-halfWidth, straightHeight);
  s.quadraticCurveTo(-halfWidth * 0.62, straightHeight + rise * 0.7, 0, straightHeight + rise);
  s.quadraticCurveTo(halfWidth * 0.62, straightHeight + rise * 0.7, halfWidth, straightHeight);
  s.lineTo(halfWidth, 0);
  s.closePath();
  return s;
}

AFRAME.registerGeometry('gothic', {
  schema: {
    halfWidth:      {default: 1.2, min: 0.1},
    straightHeight: {default: 2.3, min: 0.1},
    rise:           {default: 1.45, min: 0.1}
  },
  init: function (data) {
    this.geometry = new THREE.ShapeGeometry(
      gothicOutline(data.halfWidth, data.straightHeight, data.rise));
  }
});

AFRAME.registerGeometry('gothic-frame', {
  schema: {
    halfWidth:      {default: 1.2, min: 0.1},
    straightHeight: {default: 2.3, min: 0.1},
    rise:           {default: 1.45, min: 0.1},
    thickness:      {default: 0.3, min: 0.01},
    depth:          {default: 0.45, min: 0.01}
  },
  init: function (data) {
    var outer = gothicOutline(data.halfWidth + data.thickness, data.straightHeight,
                              data.rise + data.thickness * 1.1);
    outer.holes.push(gothicOutline(data.halfWidth, data.straightHeight, data.rise));
    var geo = new THREE.ExtrudeGeometry(outer, {
      depth: data.depth, bevelEnabled: false, curveSegments: 20 });
    geo.translate(0, 0, -data.depth / 2);
    this.geometry = geo;
  }
});

/* A hole knocked through rock: a rough dome on an uneven rim. Seeded from a
   plain hash so the silhouette is identical on every load. */
function jitter (i, seed) {
  var n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function caveOutline (halfWidth, height, grow, floorY, seed) {
  var N = 22, s = new THREE.Shape(), first = null;
  for (var i = 0; i <= N; i++) {
    var ang = Math.PI * (i / N);                  /* right rim, over, left rim */
    var w = 0.8 + jitter(i, seed) * 0.34;
    var x = Math.cos(ang) * (halfWidth * w + grow);
    var y = Math.max(Math.sin(ang) * (height * w + grow), floorY);
    if (i === 0) { first = [x, floorY]; s.moveTo(x, floorY); }
    s.lineTo(x, y);
  }
  s.lineTo(first[0], floorY);
  s.closePath();
  return s;
}

AFRAME.registerGeometry('cave-mouth', {
  schema: {
    halfWidth: {default: 1.45, min: 0.1},
    height:    {default: 3.4,  min: 0.1},
    seed:      {default: 3}
  },
  init: function (data) {
    this.geometry = new THREE.ShapeGeometry(
      caveOutline(data.halfWidth, data.height, 0, 0, data.seed));
  }
});

AFRAME.registerGeometry('cave-mouth-frame', {
  schema: {
    halfWidth: {default: 1.45, min: 0.1},
    height:    {default: 3.4,  min: 0.1},
    thickness: {default: 0.42, min: 0.01},
    depth:     {default: 0.55, min: 0.01},
    seed:      {default: 3}
  },
  init: function (data) {
    var outer = caveOutline(data.halfWidth, data.height, data.thickness, 0, data.seed);
    /* The hole sits a little above the outer floor line, leaving a threshold —
       without it the two outlines share an edge and triangulate badly. */
    outer.holes.push(caveOutline(data.halfWidth, data.height, 0, 0.16, data.seed));
    var geo = new THREE.ExtrudeGeometry(outer, {
      depth: data.depth, bevelEnabled: false, curveSegments: 4 });
    geo.translate(0, 0, -data.depth / 2);
    this.geometry = geo;
  }
});
