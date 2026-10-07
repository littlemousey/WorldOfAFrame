/* Turns an entity into a door: click it (or gaze at it in VR) to travel to
   another page. Used by the hub room and by the doors in each world.
   `href: next` asks js/routes.js where this world's onward door leads. */
AFRAME.registerComponent('portal', {
  schema: {
    href:  {type: 'string'},
    color: {type: 'color',  default: '#ffffff'},
    hover: {type: 'color',  default: '#ffffff'},
    grow:  {default: 1.06}
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    var self = this;

    el.setAttribute('material', 'color', data.color);

    /* Read the resting scale lazily: at init the scale component may not have
       been applied to the object3D yet. */
    function base () {
      if (!self.baseScale) { self.baseScale = el.object3D.scale.clone(); }
      return self.baseScale;
    }

    el.addEventListener('mouseenter', function () {
      var s = base();
      el.setAttribute('material', 'color', data.hover);
      el.object3D.scale.set(s.x * data.grow, s.y * data.grow, s.z * data.grow);
    });

    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'color', data.color);
      el.object3D.scale.copy(base());
    });

    el.addEventListener('click', function () {
      window.location.href = data.href !== 'next' ? data.href :
        typeof nextWorld === 'function' ? nextWorld() : 'index.html';
    });
  }
});
