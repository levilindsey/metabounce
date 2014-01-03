var touchAnimator = (function() {
  var animations, svg, svgDefs, currentGradientID;

  function init(svgElement, defsElement) {
    svg = svgElement;
    svgDefs = defsElement;
    animations = [];
    currentGradientID = 1;
  }

  function newTouch(touchPos, time) {
    var whoosh, flash;
    whoosh = new Whoosh(touchPos, svg, time);
    flash = new Flash(touchPos, svg, time);
    animations.push(whoosh);
    animations.push(flash);
  }

  function update(time) {
    var i;
    for (i = 0; i < animations.length; i++) {
      if (animations[i].isDone(time)) {
        // Remove the completed animation
        animations[i].cleanUp();
        animations.splice(i, 1);
        i--;
      } else {
        // Change the parameters of the in-progress animation
        animations[i].update(time);
      }
    }
  }

  var Flash = function(touchPos, svg, time) {
    function start(time) {
      this.startTime = time;
      this.endTime = this.startTime + PARAMS.TOUCH.FLASH.DURATION;

      this.gradient = document.createElementNS(SVG_NAMESPACE, 'radialGradient');
      this.gradient.id = 'gradient' + currentGradientID++;
      this.gradient.setAttribute('cx', '50%');
      this.gradient.setAttribute('cy', '50%');
      this.gradient.setAttribute('r', '50%');
      this.gradient.setAttribute('fx', '50%');
      this.gradient.setAttribute('fy', '50%');
      svgDefs.appendChild(this.gradient);

      this.stop1 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop1.setAttribute('offset', '0%');
      this.stop1.setAttribute('stop-color', PARAMS.TOUCH.WHOOSH.START_COLOR);
      this.stop1.setAttribute('stop-opacity', 1);
      this.gradient.appendChild(this.stop1);

      this.stop2 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop2.setAttribute('offset', '100%');
      this.stop2.setAttribute('stop-color', PARAMS.TOUCH.WHOOSH.START_COLOR);
      this.stop2.setAttribute('stop-opacity', 0);
      this.gradient.appendChild(this.stop2);

      this.circle = document.createElementNS(SVG_NAMESPACE, 'circle');
      this.circle.setAttribute('cx', touchPos.x);
      this.circle.setAttribute('cy', touchPos.y);
      this.circle.setAttribute('r', PARAMS.TOUCH.FLASH.START_RADIUS);
      this.circle.setAttribute('fill', 'url(#' + this.gradient.id + ')');
      svg.appendChild(this.circle);
    }

    function update(time) {
      var duration, weight1, weight2, radius, color, colorString, opacity;

      duration = this.endTime - this.startTime;
      weight2 = (time - this.startTime) / duration;
      weight2 = util.applyEasing(weight2, PARAMS.TOUCH.FLASH.EASING_FUNCTION);
      weight1 = 1 - weight2;

      radius = util.getWeightedAverage(
        PARAMS.TOUCH.FLASH.START_RADIUS, PARAMS.TOUCH.FLASH.END_RADIUS, weight1, weight2);
      color = util.interpolateColors(
        PARAMS.TOUCH.FLASH.START_COLOR, PARAMS.TOUCH.FLASH.END_COLOR, weight1, weight2);
      colorString = util.colorToString(color);
      opacity = util.getWeightedAverage(
        PARAMS.TOUCH.FLASH.START_OPACITY, PARAMS.TOUCH.FLASH.END_OPACITY, weight1, weight2);

      this.circle.setAttribute('r', radius);
      this.stop1.setAttribute('stop-color', colorString);
      this.stop2.setAttribute('stop-color', colorString);
      this.stop1.setAttribute('stop-opacity', opacity);
    }

    function cleanUp() {
      svg.removeChild(this.circle);
      this.gradient.removeChild(this.stop1);
      this.gradient.removeChild(this.stop2);
      svgDefs.removeChild(this.gradient);
      this.stop1 = null;
      this.stop2 = null;
      this.gradient = null;
      this.circle = null;
    }

    function isDone(time) {
      return time > this.endTime;
    }

    start.call(this, time);

    this.update = update;
    this.cleanUp = cleanUp;
    this.isDone = isDone;
  };

  var Whoosh = function(touchPos, svg, time) {
    function start(time) {
      this.startTime = time;
      this.endTime = this.startTime + PARAMS.TOUCH.WHOOSH.DURATION;

      this.gradient = document.createElementNS(SVG_NAMESPACE, 'radialGradient');
      this.gradient.id = 'gradient' + currentGradientID++;
      this.gradient.setAttribute('cx', '50%');
      this.gradient.setAttribute('cy', '50%');
      this.gradient.setAttribute('r', '50%');
      this.gradient.setAttribute('fx', '50%');
      this.gradient.setAttribute('fy', '50%');
      svgDefs.appendChild(this.gradient);

      this.stop1 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop1.setAttribute('offset', '0%');
      this.stop1.setAttribute('stop-color', PARAMS.TOUCH.WHOOSH.START_COLOR);
      this.stop1.setAttribute('stop-opacity', 0);
      this.gradient.appendChild(this.stop1);

      this.stop2 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop2.setAttribute('offset', PARAMS.TOUCH.WHOOSH.STOP_2_PERCENTAGE + '%');
      this.stop2.setAttribute('stop-color', PARAMS.TOUCH.WHOOSH.START_COLOR);
      this.stop2.setAttribute('stop-opacity', 0);
      this.gradient.appendChild(this.stop2);

      this.stop3 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop3.setAttribute('offset', '100%');
      this.stop3.setAttribute('stop-color', PARAMS.TOUCH.WHOOSH.START_COLOR);
      this.stop3.setAttribute('stop-opacity', PARAMS.TOUCH.WHOOSH.START_OPACITY * PARAMS.TOUCH.WHOOSH.STROKE_TO_GRADIENT_OPACITY_RATIO);
      this.gradient.appendChild(this.stop3);

      this.circle = document.createElementNS(SVG_NAMESPACE, 'circle');
      this.circle.setAttribute('cx', touchPos.x);
      this.circle.setAttribute('cy', touchPos.y);
      this.circle.setAttribute('r', PARAMS.TOUCH.WHOOSH.START_RADIUS);
      this.circle.setAttribute('fill', 'url(#' + this.gradient.id + ')');
      this.circle.setAttribute('stroke', PARAMS.TOUCH.WHOOSH.START_COLOR);
      this.circle.setAttribute('stroke-width', PARAMS.TOUCH.WHOOSH.STROKE_WIDTH + 'px');
      this.circle.setAttribute('stroke-opacity', PARAMS.TOUCH.WHOOSH.START_OPACITY);
      svg.appendChild(this.circle);
    }

    function update(time) {
      var duration, weight1, weight2, radius, color, colorString, opacity;

      duration = this.endTime - this.startTime;
      weight2 = (time - this.startTime) / duration;
      weight2 = util.applyEasing(weight2, PARAMS.TOUCH.WHOOSH.EASING_FUNCTION);
      weight1 = 1 - weight2;

      radius = util.getWeightedAverage(
        PARAMS.TOUCH.WHOOSH.START_RADIUS, PARAMS.TOUCH.WHOOSH.END_RADIUS, weight1, weight2);
      color = util.interpolateColors(
        PARAMS.TOUCH.WHOOSH.START_COLOR, PARAMS.TOUCH.WHOOSH.END_COLOR, weight1, weight2);
      colorString = util.colorToString(color);
      opacity = util.getWeightedAverage(
        PARAMS.TOUCH.WHOOSH.START_OPACITY, PARAMS.TOUCH.WHOOSH.END_OPACITY, weight1, weight2);

      this.circle.setAttribute('r', radius);
      this.stop2.setAttribute('stop-color', colorString);
      this.stop3.setAttribute('stop-color', colorString);
      this.stop3.setAttribute('stop-opacity', opacity * PARAMS.TOUCH.WHOOSH.STROKE_TO_GRADIENT_OPACITY_RATIO);
      this.circle.setAttribute('stroke', colorString);
      this.circle.setAttribute('stroke-opacity', opacity);
    }

    function cleanUp() {
      svg.removeChild(this.circle);
      this.gradient.removeChild(this.stop1);
      this.gradient.removeChild(this.stop2);
      this.gradient.removeChild(this.stop3);
      svgDefs.removeChild(this.gradient);
      this.stop1 = null;
      this.stop2 = null;
      this.stop3 = null;
      this.gradient = null;
      this.circle = null;
    }

    function isDone(time) {
      return time > this.endTime;
    }

    start.call(this, time);

    this.update = update;
    this.cleanUp = cleanUp;
    this.isDone = isDone;
  };

  return {
    init: init,
    newTouch: newTouch,
    update: update
  };
})();