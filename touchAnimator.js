var touchAnimator = (function() {
  var animations, svg, svgDefs, currentGradientID;

  function init(svgElement, defsElement) {
    svg = svgElement;
    svgDefs = defsElement;
    animations = [];
    currentGradientID = 32768;
  }

  function newTouch(touchPos, time) {
    var whoosh, flash;
    whoosh = new Whoosh(touchPos, PARAMS.ANIMATION.WHOOSH.END_RADIUS, 1, svg, time);
    flash = new Flash(touchPos, svg, time);
    animations.push(whoosh);
    animations.push(flash);
  }

  function newPop(ball, time) {
    var whoosh, dissolve, color, colorString;
    color = {
      h: ball.color.start.h,
      s: PARAMS.ANIMATION.DISSOLVE.SATURATION,
      l: PARAMS.ANIMATION.DISSOLVE.LIGHTNESS
    };
    colorString = util.colorToString(color);
    whoosh = new Whoosh(ball.pos, ball.radius * PARAMS.POP.ANIMATION_TO_BALL_RADIUS_RATIO, PARAMS.POP.WHOOSH_OPACITY_RATIO, svg, time);
    dissolve = new Dissolve(ball.pos, ball.radius, colorString, svg, time);
    animations.push(whoosh);
    animations.push(dissolve);
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
      this.endTime = this.startTime + PARAMS.ANIMATION.FLASH.DURATION;

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
      this.stop1.setAttribute('stop-color', PARAMS.ANIMATION.FLASH.START_COLOR);
      this.stop1.setAttribute('stop-opacity', '1');
      this.gradient.appendChild(this.stop1);

      this.stop2 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop2.setAttribute('offset', '100%');
      this.stop2.setAttribute('stop-color', PARAMS.ANIMATION.FLASH.START_COLOR);
      this.stop2.setAttribute('stop-opacity', '0');
      this.gradient.appendChild(this.stop2);

      this.circle = document.createElementNS(SVG_NAMESPACE, 'circle');
      this.circle.setAttribute('cx', touchPos.x);
      this.circle.setAttribute('cy', touchPos.y);
      this.circle.setAttribute('r', PARAMS.ANIMATION.FLASH.START_RADIUS.toString());
      this.circle.setAttribute('fill', 'url(#' + this.gradient.id + ')');
      svg.appendChild(this.circle);
    }

    function update(time) {
      var duration, weight1, weight2, radius, color, colorString, opacity;

      duration = this.endTime - this.startTime;
      weight2 = (time - this.startTime) / duration;
      weight2 = util.applyEasing(weight2, PARAMS.ANIMATION.FLASH.EASING_FUNCTION);
      weight1 = 1 - weight2;

      radius = util.getWeightedAverage(
          PARAMS.ANIMATION.FLASH.START_RADIUS, PARAMS.ANIMATION.FLASH.END_RADIUS, weight1, weight2);
      color = util.interpolateColors(
          PARAMS.ANIMATION.FLASH.START_COLOR, PARAMS.ANIMATION.FLASH.END_COLOR, weight1, weight2);
      colorString = util.colorToString(color);
      opacity = util.getWeightedAverage(
          PARAMS.ANIMATION.FLASH.START_OPACITY, PARAMS.ANIMATION.FLASH.END_OPACITY, weight1, weight2);

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

  var Whoosh = function(touchPos, endRadius, opacityRatio, svg, time) {
    function start(time) {
      this.startTime = time;
      this.endTime = this.startTime + PARAMS.ANIMATION.WHOOSH.DURATION;

      this.startOpacity = PARAMS.ANIMATION.WHOOSH.START_OPACITY * opacityRatio;
      this.endOpacity = PARAMS.ANIMATION.WHOOSH.END_OPACITY * opacityRatio;

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
      this.stop1.setAttribute('stop-color', PARAMS.ANIMATION.WHOOSH.START_COLOR);
      this.stop1.setAttribute('stop-opacity', '0');
      this.gradient.appendChild(this.stop1);

      this.stop2 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop2.setAttribute('offset', PARAMS.ANIMATION.WHOOSH.STOP_2_PERCENTAGE + '%');
      this.stop2.setAttribute('stop-color', PARAMS.ANIMATION.WHOOSH.START_COLOR);
      this.stop2.setAttribute('stop-opacity', '0');
      this.gradient.appendChild(this.stop2);

      this.stop3 = document.createElementNS(SVG_NAMESPACE, 'stop');
      this.stop3.setAttribute('offset', '100%');
      this.stop3.setAttribute('stop-color', PARAMS.ANIMATION.WHOOSH.START_COLOR);
      this.stop3.setAttribute('stop-opacity', (this.startOpacity * PARAMS.ANIMATION.WHOOSH.STROKE_TO_GRADIENT_OPACITY_RATIO).toString());
      this.gradient.appendChild(this.stop3);

      this.circle = document.createElementNS(SVG_NAMESPACE, 'circle');
      this.circle.setAttribute('cx', touchPos.x);
      this.circle.setAttribute('cy', touchPos.y);
      this.circle.setAttribute('r', PARAMS.ANIMATION.WHOOSH.START_RADIUS.toString());
      this.circle.setAttribute('fill', 'url(#' + this.gradient.id + ')');
      this.circle.setAttribute('stroke', PARAMS.ANIMATION.WHOOSH.START_COLOR);
      this.circle.setAttribute('stroke-width', PARAMS.ANIMATION.WHOOSH.STROKE_WIDTH + 'px');
      this.circle.setAttribute('stroke-opacity', this.startOpacity);
      svg.appendChild(this.circle);
    }

    function update(time) {
      var duration, weight1, weight2, radius, color, colorString, opacity;

      duration = this.endTime - this.startTime;
      weight2 = (time - this.startTime) / duration;
      weight2 = util.applyEasing(weight2, PARAMS.ANIMATION.WHOOSH.EASING_FUNCTION);
      weight1 = 1 - weight2;

      radius = util.getWeightedAverage(
          PARAMS.ANIMATION.WHOOSH.START_RADIUS, endRadius, weight1, weight2);
      color = util.interpolateColors(
          PARAMS.ANIMATION.WHOOSH.START_COLOR, PARAMS.ANIMATION.WHOOSH.END_COLOR, weight1, weight2);
      colorString = util.colorToString(color);
      opacity = util.getWeightedAverage(
          this.startOpacity, this.endOpacity, weight1, weight2);

      this.circle.setAttribute('r', radius);
      this.stop2.setAttribute('stop-color', colorString);
      this.stop3.setAttribute('stop-color', colorString);
      this.stop3.setAttribute('stop-opacity', (opacity * PARAMS.ANIMATION.WHOOSH.STROKE_TO_GRADIENT_OPACITY_RATIO).toString());
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

  var Dissolve = function(touchPos, radius, colorString, svg, time) {
    function start(time) {
      this.startTime = time;
      this.endTime = this.startTime + PARAMS.ANIMATION.DISSOLVE.DURATION;

      createEdgeDots(this);
    }

    function createEdgeDots(self) {
      var i, count, thetaRad, deltaThetaRad, thetaDeg, deltaThetaDeg, endRadius, cosTheta, sinTheta, startX, startY, endX, endY, ellipse;

      self.dots = [];
      self.startPositions = [];
      self.endPositions = [];
      self.rotations = [];

      count = 2 * Math.PI * radius * DISSOLVE_ANIMATION_DOTS_PER_CIRCUMFERENCE_UNIT;
      deltaThetaRad = TWO_PI / count;
      deltaThetaDeg = 360 / count;
      endRadius = radius * PARAMS.ANIMATION.DISSOLVE.END_RADIUS_RATIO;

      for (i = 0, thetaRad = 0, thetaDeg = 0; i < count; i++, thetaRad += deltaThetaRad, thetaDeg += deltaThetaDeg) {
        cosTheta = Math.cos(thetaRad);
        sinTheta = Math.sin(thetaRad);
        startX = radius * cosTheta + touchPos.x;
        startY = radius * sinTheta + touchPos.y;
        endX = endRadius * cosTheta + touchPos.x;
        endY = endRadius * sinTheta + touchPos.y;

        ellipse = document.createElementNS(SVG_NAMESPACE, 'ellipse');
        ellipse.setAttribute('fill', colorString);
        applyDotParams(ellipse, startX, startY, PARAMS.ANIMATION.DISSOLVE.DOT_HALF_HEIGHT_START, PARAMS.ANIMATION.DISSOLVE.DOT_HALF_WIDTH_START, thetaDeg, PARAMS.ANIMATION.DISSOLVE.START_OPACITY);
        svg.appendChild(ellipse);

        self.dots[i] = ellipse;
        self.startPositions[i] = { x: startX, y: startY };
        self.endPositions[i] = { x: endX, y: endY };
        self.rotations[i] = thetaDeg;
      }
    }

    function update(time) {
      var linearWeight2, weight1, weight2, rx, ry, opacity, i, count;

      linearWeight2 = (time - this.startTime) / PARAMS.ANIMATION.DISSOLVE.DURATION;

      weight2 = util.applyEasing(linearWeight2, PARAMS.ANIMATION.DISSOLVE.DOT_HEIGHT_EASING_FUNCTION);
      weight1 = 1 - weight2;
      rx = util.getWeightedAverage(PARAMS.ANIMATION.DISSOLVE.DOT_HALF_HEIGHT_START, PARAMS.ANIMATION.DISSOLVE.DOT_HALF_HEIGHT_END, weight1, weight2);

      weight2 = util.applyEasing(linearWeight2, PARAMS.ANIMATION.DISSOLVE.DOT_WIDTH_EASING_FUNCTION);
      weight1 = 1 - weight2;
      ry = util.getWeightedAverage(PARAMS.ANIMATION.DISSOLVE.DOT_HALF_WIDTH_START, PARAMS.ANIMATION.DISSOLVE.DOT_HALF_WIDTH_END, weight1, weight2);

      weight2 = util.applyEasing(linearWeight2, PARAMS.ANIMATION.DISSOLVE.EASING_FUNCTION);
      weight1 = 1 - weight2;
      opacity = util.getWeightedAverage(PARAMS.ANIMATION.DISSOLVE.START_OPACITY, PARAMS.ANIMATION.DISSOLVE.END_OPACITY, weight1, weight2);

      for (i = 0, count = this.dots.length; i < count; i++) {
        updateDot(this, i, weight1, weight2, rx, ry, opacity);
      }
    }

    function updateDot(self, index, weight1, weight2, rx, ry, opacity) {
      var cx, cy;
      cx = util.getWeightedAverage(self.startPositions[index].x, self.endPositions[index].x, weight1, weight2);
      cy = util.getWeightedAverage(self.startPositions[index].y, self.endPositions[index].y, weight1, weight2);
      applyDotParams(self.dots[index], cx, cy, rx, ry, self.rotations[index], opacity);
    }

    function applyDotParams(ellipse, cx, cy, rx, ry, rotationDeg, opacity) {
      ellipse.setAttribute('cx', cx);
      ellipse.setAttribute('cy', cy);
      ellipse.setAttribute('rx', rx);
      ellipse.setAttribute('ry', ry);
      ellipse.setAttribute('transform', 'rotate(' + rotationDeg + ' ' + cx + ' ' + cy + ')');
      ellipse.setAttribute('opacity', opacity);
    }

    function cleanUp() {
      this.dots.forEach(function(ellipse) {
        svg.removeChild(ellipse);
      });
      this.dots = null;
      this.startPositions = null;
      this.endPositions = null;
      this.rotations = null;
    }

    function isDone(time) {
      return time > this.endTime;
    }

    start.call(this, time);

    this.update = update;
    this.cleanUp = cleanUp;
    this.isDone = isDone;
  };

  function recoverFromWindowBlur(timeLapse) {
    animations.forEach(function(animation) {
      util.changeStartAndEndTimeFromBlur(animation, timeLapse);
    });
  }

  return {
    init: init,
    newTouch: newTouch,
    newPop: newPop,
    update: update,
    recoverFromWindowBlur: recoverFromWindowBlur
  };
})();