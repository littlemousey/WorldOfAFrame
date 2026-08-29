/* Looping background sound for a world, with a mute button.

   Browsers refuse to start audio until the page has been interacted with, so a
   bare autoplay attempt fails silently and the room is simply quiet. This tries
   to play, and if it is blocked, waits for the first click or keypress and
   starts then — by which point the visitor has almost certainly already clicked
   or pressed a key to look around. */
AFRAME.registerComponent('ambience', {
  schema: {
    src:    {type: 'string'},
    volume: {default: 0.4},
    fade:   {default: 3000}     /* ms to fade up, so it does not begin abruptly */
  },

  init: function () {
    var self = this;

    var audio = this.audio = new Audio(this.data.src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    this.muted = false;

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
      self.label();
      if (!self.muted) { self.play(); }
    });

    this.play();
  },

  /* Try to start, and fall back to waiting for the first user gesture. */
  play: function () {
    var self = this;
    var attempt = this.audio.play();
    if (!attempt || !attempt.catch) { return; }
    attempt.catch(function () {
      var go = function () {
        window.removeEventListener('pointerdown', go);
        window.removeEventListener('keydown', go);
        self.audio.play().catch(function () {});
      };
      window.addEventListener('pointerdown', go);
      window.addEventListener('keydown', go);
    });
  },

  label: function () {
    this.btn.textContent = this.muted ? '✕' : '♪';
    this.btn.title = this.muted ? 'Unmute ambience' : 'Mute ambience';
  },

  tick: function (t, dt) {
    if (!this.audio || !dt) { return; }
    var want = this.muted ? 0 : this.data.volume;
    var v = this.audio.volume;
    if (Math.abs(v - want) < 0.004) { return; }
    var step = (Math.min(dt, 100) / this.data.fade) * this.data.volume;
    this.audio.volume = Math.max(0, Math.min(1, v + (want > v ? step : -step)));
  },

  remove: function () {
    if (this.audio) { this.audio.pause(); }
    if (this.btn && this.btn.parentNode) { this.btn.parentNode.removeChild(this.btn); }
  }
});
