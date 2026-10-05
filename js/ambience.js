/* Looping background sound for a world, with a mute button.

   Browsers refuse to start audio until the page has been interacted with, so a
   bare autoplay attempt fails silently and the room is simply quiet. This tries
   to play, and if it is blocked, waits for the first click or keypress and
   starts then — by which point the visitor has almost certainly already clicked
   or pressed a key to look around.

   Muting dips the sound out quickly and then pauses it outright, rather than
   only turning the volume down: iOS Safari ignores `volume` entirely, so a
   volume-only mute does nothing there. The choice is remembered, so muting in
   one world keeps the next one quiet too. */
var AMBIENCE_KEY = 'ambience-muted';

AFRAME.registerComponent('ambience', {
  schema: {
    src:     {type: 'string'},
    volume:  {default: 0.4},
    fade:    {default: 3000},   /* ms to fade up, so it does not begin abruptly */
    fadeOut: {default: 350}     /* ms to dip out on mute: quick, so it feels instant */
  },

  init: function () {
    var self = this;

    var audio = this.audio = new Audio(this.data.src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    /* iOS reports volume as 1 whatever it is set to; fading is impossible there. */
    this.fixedVolume = audio.volume !== 0;

    this.muted = false;
    try { this.muted = localStorage.getItem(AMBIENCE_KEY) === '1'; } catch (e) {}

    if (!document.getElementById('ambience-style')) {
      var css = document.createElement('style');
      css.id = 'ambience-style';
      css.textContent =
        /* Top right: A-Frame parks its own Enter VR button in the bottom-right. */
        '#ambience-toggle{position:fixed;right:16px;top:16px;z-index:999;' +
        'width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:15px;' +
        'line-height:1;color:#f2f6ff;background:rgba(10,12,26,.62);' +
        'border:1px solid rgba(150,170,255,.3);backdrop-filter:blur(6px);}' +
        '#ambience-toggle:hover{background:rgba(30,36,60,.8);}';
      document.head.appendChild(css);
    }

    var btn = this.btn = document.createElement('button');
    btn.id = 'ambience-toggle';
    btn.type = 'button';
    this.label();
    document.body.appendChild(btn);
    btn.addEventListener('click', function (e) {
      /* Keep the click off the scene, or it also fires the portal under it. */
      e.stopPropagation();
      self.muted = !self.muted;
      try { localStorage.setItem(AMBIENCE_KEY, self.muted ? '1' : '0'); } catch (err) {}
      self.label();
      if (self.muted) {
        if (self.fixedVolume) { self.audio.pause(); }
      } else {
        self.start();
      }
    });

    if (!this.muted) { this.start(); }
  },

  /* Try to start, and if the browser blocks it, retry on each user gesture
     until one is accepted. Not every event counts as a gesture: on touch
     screens a pointerdown does not (the touchend after it does), so giving up
     after the first event would leave a phone silent until the mute button was
     toggled. Not named `play`: that is an A-Frame lifecycle hook, which A-Frame
     wraps so a second call on a running component silently does nothing. */
  start: function () {
    var self = this;
    var events = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
    var attempt = this.audio.play();
    if (!attempt || !attempt.catch || this.waiting) { return; }
    attempt.catch(function () {
      if (self.waiting) { return; }
      var stop = function () {
        self.waiting = null;
        events.forEach(function (n) { window.removeEventListener(n, go); });
      };
      var go = function () {
        if (self.muted || !self.audio.paused) { stop(); return; }
        self.audio.play().then(stop, function () {});
      };
      self.waiting = stop;
      events.forEach(function (n) { window.addEventListener(n, go); });
    });
  },

  label: function () {
    this.btn.textContent = this.muted ? '✕' : '♪';
    this.btn.title = this.muted ? 'Unmute ambience' : 'Mute ambience';
  },

  tick: function (t, dt) {
    var audio = this.audio;
    /* Nothing to fade while paused, which includes while autoplay is blocked:
       ramping up then would make it start at full volume. */
    if (!audio || !dt || audio.paused || this.fixedVolume) { return; }
    var v = audio.volume;
    dt = Math.min(dt, 100);
    if (this.muted) {
      v -= (dt / this.data.fadeOut) * this.data.volume;
      if (v <= 0) { audio.volume = 0; audio.pause(); return; }
    } else {
      if (v >= this.data.volume) { return; }
      v = Math.min(this.data.volume, v + (dt / this.data.fade) * this.data.volume);
    }
    audio.volume = Math.max(0, Math.min(1, v));
  },

  remove: function () {
    if (this.waiting) { this.waiting(); }
    if (this.audio) { this.audio.pause(); }
    if (this.btn && this.btn.parentNode) { this.btn.parentNode.removeChild(this.btn); }
  }
});
