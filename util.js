var util = (function() {
  function interpolateColors(color1, color2, weight1, weight2) {
    return {
      h: getWeightedAverage(color1.h, color2.h, weight1, weight2),
      s: getWeightedAverage(color1.s, color2.s, weight1, weight2),
      l: getWeightedAverage(color1.l, color2.l, weight1, weight2)
    };
  }

  function colorToString(color) {
    return 'hsl(' + color.h + ',' + color.s + '%,' + color.l + '%)';
  }

  function getWeightedAverage(number1, number2, weight1, weight2) {
    return number1 * weight1 + number2 * weight2;
  }

  function getRandom(min, max, easingFunction) {
    var r;
    if (typeof easingFunction != 'undefined') {
      r = applyEasing(Math.random(), easingFunction);
      return min + r * (max - min);
    } else {
      return min + Math.random() * (max - min);
    }
  }

  function applyEasing(t, easingFunction) {
    switch (easingFunction) {
      case 'linear': return t;
      case 'easeInQuad': return t * t;
      case 'easeOutQuad': return t * (2 - t);
      case 'easeInOutQuad': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'easeInCubic': return t * t * t;
      case 'easeOutCubic': return 1 + --t * t * t;
      case 'easeInOutCubic': return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      case 'easeInQuart': return t * t * t * t;
      case 'easeOutQuart': return 1 - --t * t * t * t;
      case 'easeInOutQuart': return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
      case 'easeInQuint': return t * t * t * t * t;
      case 'easeOutQuint': return 1 + --t * t * t * t * t;
      case 'easeInOutQuint': return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
      default: return t;
    }
  }

  function getDistance(x1, y1, x2, y2) {
    var deltaX, deltaY;
    deltaX = x2 - x1;
    deltaY = y2 - y1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // Awesomely helpful page: http://stackoverflow.com/questions/345838/ball-to-ball-collision-detection-and-handling
  function inellasticCollision(p1, vi1, m1, p2, vi2, m2) {
    var normalizedCoaxialVector, perpSpeedI1, perpSpeedI2, tangVelocity1, tangVelocity2, perpSpeedF1, perpSpeedF2, tmp1, tmp2, vf1, vf2;
    // Get the components of the velocity vectors that are parallel to the collision (the perpendicular components will
    // remain constant across the collision)
    normalizedCoaxialVector = normalize(vectorDifference(p2, p1));
    perpSpeedI1 = dotProduct(vi1, normalizedCoaxialVector);
    perpSpeedI2 = dotProduct(vi2, normalizedCoaxialVector);
    tangVelocity1 = vectorDifference(vi1, scalarVectorProduct(perpSpeedI1, normalizedCoaxialVector));
    tangVelocity2 = vectorDifference(vi2, scalarVectorProduct(perpSpeedI2, normalizedCoaxialVector));
    // Solve for new velocities using the 1-dimensional inelastic collision equation
    tmp1 = perpSpeedI1 * m1 + perpSpeedI2 * m2;
    tmp2 = m1 + m2;
    perpSpeedF1 = (PARAMS.COEFF_OF_RESTITUTION * m2 * (perpSpeedI2 - perpSpeedI1) + tmp1) / tmp2;
    perpSpeedF2 = (PARAMS.COEFF_OF_RESTITUTION * m1 * (perpSpeedI1 - perpSpeedI2) + tmp1) / tmp2;
    // Add the tangential velocity changes to the original velocities
    vf1 = vectorAddition(vi1, scalarVectorProduct((perpSpeedF1 - perpSpeedI1), normalizedCoaxialVector));
    vf2 = vectorAddition(vi2, scalarVectorProduct((perpSpeedF2 - perpSpeedI2), normalizedCoaxialVector));
    return {
      vf1: vf1,
      vf2: vf2,
      tangVelocity1: tangVelocity1,
      tangVelocity2: tangVelocity2,
      perpSpeedI1: perpSpeedI1,
      perpSpeedI2: perpSpeedI2,
      perpSpeedF1: perpSpeedF1,
      perpSpeedF2: perpSpeedF2
    };
  }

  function getTangVelocityAndPerpSpeed(p1, p2, v1) {
    var normalizedCoaxialVector, perpSpeed, tangVelocity;
    normalizedCoaxialVector = normalize(vectorDifference(p2, p1));
    perpSpeed = dotProduct(v1, normalizedCoaxialVector);
    tangVelocity = vectorDifference(v1, scalarVectorProduct(perpSpeed, normalizedCoaxialVector));
    return {
      tangVelocity: tangVelocity,
      perpSpeed: perpSpeed
    };
  }

  function reflect(v, reflectionLine) {
    reflectionLine = normalize(reflectionLine);
    return vectorDifference(v, scalarVectorProduct(2 * dotProduct(v, reflectionLine), reflectionLine));
  }

  function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  function scalarVectorProduct(s, v) {
    return {
      x: s * v.x,
      y: s * v.y
    };
  }

  function vectorDifference(v1, v2) {
    return {
      x: v1.x - v2.x,
      y: v1.y - v2.y
    };
  }

  function vectorAddition(v1, v2) {
    return {
      x: v1.x + v2.x,
      y: v1.y + v2.y
    };
  }

  function normalize(v) {
    var mag = magnitude(v);
    return {
      x: v.x / mag,
      y: v.y / mag
    };
  }

  function changeStartAndEndTimeFromBlur(transitionObj, timeLapse) {
    transitionObj.startTime = timeLapse + transitionObj.startTime;
    transitionObj.endTime = timeLapse + transitionObj.endTime;
  }

  function getPageXY(element) {
    var cumulativeX = 0,
        cumulativeY = 0;
    while (element !== null) {
      cumulativeX += element.offsetLeft;
      cumulativeY += element.offsetTop;
      element = element.offsetParent;
    }
    return { x: cumulativeX, y: cumulativeY };
  }

  function determineViewportDimensions(viewport) {
    viewport.width = document.documentElement.clientWidth;
    viewport.height = document.documentElement.clientHeight;
  }

  var myRequestAnimationFrame =
      window.requestAnimationFrame || // the standard
          window.webkitRequestAnimationFrame || // chrome/safari
          window.mozRequestAnimationFrame || // firefox
          window.oRequestAnimationFrame || // opera
          window.msRequestAnimationFrame || // ie
          function(callback) { // default
            window.setTimeout(callback, 16); // 60fps
          };

  return {
    interpolateColors: interpolateColors,
    colorToString: colorToString,
    getWeightedAverage: getWeightedAverage,
    getRandom: getRandom,
    applyEasing: applyEasing,
    getDistance: getDistance,
    inellasticCollision: inellasticCollision,
    getTangVelocityAndPerpSpeed: getTangVelocityAndPerpSpeed,
    reflect: reflect,
    dotProduct: dotProduct,
    magnitude: magnitude,
    scalarVectorProduct: scalarVectorProduct,
    vectorDifference: vectorDifference,
    vectorAddition: vectorAddition,
    normalize: normalize,
    changeStartAndEndTimeFromBlur: changeStartAndEndTimeFromBlur,
    getPageXY: getPageXY,
    determineViewportDimensions: determineViewportDimensions,
    myRequestAnimationFrame: function(callback) {
      myRequestAnimationFrame.call(window, callback);
    }
  };
})();