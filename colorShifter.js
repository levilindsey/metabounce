var colorShifter = (function() {
  var svgDefs, transition, currentGradientID;

  function init(defsElement, time) {
    var h1, h2, s1, s2, l1, l2;

    svgDefs = defsElement;

    currentGradientID = 1;

    h1 = util.getRandom(PARAMS.COLOR.MIN_HUE, PARAMS.COLOR.MAX_HUE);
    h2 = util.getRandom(PARAMS.COLOR.MIN_HUE, PARAMS.COLOR.MAX_HUE);
    s1 = util.getRandom(PARAMS.COLOR.MIN_SATURATION, PARAMS.COLOR.MAX_SATURATION);
    s2 = util.getRandom(PARAMS.COLOR.MIN_SATURATION, PARAMS.COLOR.MAX_SATURATION);
    l1 = util.getRandom(PARAMS.COLOR.MIN_LIGHTNESS, PARAMS.COLOR.MAX_LIGHTNESS);
    l2 = util.getRandom(PARAMS.COLOR.MIN_LIGHTNESS, PARAMS.COLOR.MAX_LIGHTNESS);

    transition = {
      hue: {
        startMin: h1,
        startMax: h2,
        endMin: h1,
        endMax: h2,
        currentMin: h1,
        currentMax: h2,
        startTime: time,
        endTime: time
      },
      saturation: {
        startMin: s1,
        startMax: s2,
        endMin: s1,
        endMax: s2,
        currentMin: s1,
        currentMax: s2,
        startTime: time,
        endTime: time
      },
      lightness: {
        startMin: l1,
        startMax: l2,
        endMin: l1,
        endMax: l2,
        currentMin: l1,
        currentMax: l2,
        startTime: time,
        endTime: time
      }
    };

    update(time + 1);
  }

  function createShineGradientTransitions(time) {
    var iridescenceTransitions, specularityTransitions, i;

    iridescenceTransitions = [];
    specularityTransitions = [];

    if (PARAMS.SHINE_ON) {
      // The ball circumference gradient
      iridescenceTransitions.push(createBallEdgeGradientTransition(time));

      // The iridescence gradients
      for (i = 0; i < PARAMS.SHINE.IRIDESCENCE.COUNT; i++) {
        iridescenceTransitions.push(createIridescenceTransition(time, false, true, false));
      }

      // The specular highlight gradients
      for (i = 0; i < PARAMS.SHINE.SPECULARITY.COUNT; i++) {
        specularityTransitions.push(createSpecularityTransition(time, false, false));
      }
    }

    return {
      iridescenceTransitions: iridescenceTransitions,
      specularityTransitions: specularityTransitions
    };
  }

  function createBallEdgeGradientTransition(time) {
    var shineTransition = createIridescenceTransition(time, true, true, true);

    shineTransition.radius.end = 50;
    shineTransition.centerAngle.end = 0;
    shineTransition.centerRadius.end = 0;
    shineTransition.focusDeltaAngle.end = 0;
    shineTransition.focusDeltaRadiusRatio.end = 0;

    shineTransition.stop2.setAttribute('offset', PARAMS.SHINE.IRIDESCENCE.BORDER_GRADIENT_STOP_OFFSET + '%');

    return shineTransition;
  }

  function createIridescenceTransition(time, fixedDimensions, isIridescence, reverseGradientDirection) {
    var h, o, r, ca, cr, fDeltaAngle, fDeltaRadius;

    h = util.getRandom(0, 360);
    o = util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_OPACITY, PARAMS.SHINE.IRIDESCENCE.MAX_OPACITY);
    r = util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_RADIUS, PARAMS.SHINE.IRIDESCENCE.MAX_RADIUS);
    ca = util.getRandom(0, TWO_PI);
    cr = util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_CENTER_RADIUS, PARAMS.SHINE.IRIDESCENCE.MAX_CENTER_RADIUS, 'easeOutQuad');
    fDeltaAngle = util.getRandom(-Math.PI, Math.PI);
    fDeltaRadius = util.getRandom(0, PARAMS.SHINE.IRIDESCENCE.MAX_F_DELTA_RATIO);

    return createShineTransition(h, o, r, ca, cr, fDeltaAngle, fDeltaRadius, time, fixedDimensions, isIridescence, reverseGradientDirection);
  }

  function createSpecularityTransition(time, isIridescence, reverseGradientDirection) {
    var h, o, r, ca, cr, fDeltaAngle, fDeltaRadius;

    h = util.getRandom(0, 360);
    o = util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_OPACITY, PARAMS.SHINE.SPECULARITY.MAX_OPACITY);
    r = util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_RADIUS, PARAMS.SHINE.SPECULARITY.MAX_RADIUS);
    ca = util.getRandom(0, TWO_PI);
    cr = util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_CENTER_RADIUS, PARAMS.SHINE.SPECULARITY.MAX_CENTER_RADIUS, 'easeOutQuad');
    fDeltaAngle = util.getRandom(-Math.PI, Math.PI);
    fDeltaRadius = util.getRandom(0, PARAMS.SHINE.SPECULARITY.MAX_F_DELTA_RATIO);

    return createShineTransition(h, o, r, ca, cr, fDeltaAngle, fDeltaRadius, time, false, isIridescence, reverseGradientDirection);
  }

  function createShineTransition(h, o, r, ca, cr, fDeltaAngle, fDeltaRadius, time, fixedDimensions, isIridescence, reverseGradientDirection) {
    var shineTransition = {
      gradient: null,
      stop1: null,
      stop2: null,
      isIridescence: isIridescence,
      reverseGradientDirection: reverseGradientDirection,
      fixedDimensions: fixedDimensions,
      hue: {
        start: h,
        end: h,
        startTime: time,
        endTime: time
      },
      opacity: {
        start: o,
        end: o,
        startTime: time,
        endTime: time
      },
      radius: {
        start: r,
        end: r,
        startTime: time,
        endTime: time
      },
      centerAngle: {
        start: ca,
        end: ca,
        startTime: time,
        endTime: time
      },
      centerRadius: {
        start: cr,
        end: cr,
        startTime: time,
        endTime: time
      },
      focusDeltaAngle: {
        start: fDeltaAngle,
        end: fDeltaAngle,
        startTime: time,
        endTime: time
      },
      focusDeltaRadiusRatio: {
        start: fDeltaRadius,
        end: fDeltaRadius,
        startTime: time,
        endTime: time
      }
    };
    createShineGradient(shineTransition);
    return shineTransition;
  }

  function createShineGradient(shineTransitionObj) {
    var gradient, stop1, stop2, cx, cy, r, fx, fy, gradientOpacity, stopColor;

    cx = shineTransitionObj.centerRadius.start * Math.cos(shineTransitionObj.centerAngle.start) + 50;
    cy = shineTransitionObj.centerRadius.start * Math.sin(shineTransitionObj.centerAngle.start) + 50;
    r = shineTransitionObj.radius.start;
    fx = shineTransitionObj.focusDeltaRadiusRatio.start * Math.cos(shineTransitionObj.focusDeltaAngle.start) + cx;
    fy = shineTransitionObj.focusDeltaRadiusRatio.start * Math.sin(shineTransitionObj.focusDeltaAngle.start) + cy;
    gradientOpacity = shineTransitionObj.opacity.start;
    if (shineTransitionObj.isIridescence) {
      stopColor = {
        h: shineTransitionObj.hue.start,
        s: PARAMS.SHINE.IRIDESCENCE.SATURATION,
        l: PARAMS.SHINE.IRIDESCENCE.LIGHTNESS
      };
    } else {
      stopColor = {
        h: shineTransitionObj.hue.start,
        s: PARAMS.SHINE.SPECULARITY.SATURATION,
        l: PARAMS.SHINE.SPECULARITY.LIGHTNESS
      };
    }
    stopColor = util.colorToString(stopColor);

    gradient = document.createElementNS(SVG_NAMESPACE, 'radialGradient');
    gradient.id = 'gradient' + currentGradientID++;
    gradient.setAttribute('cx', cx + '%');
    gradient.setAttribute('cy', cy + '%');
    gradient.setAttribute('r', r + '%');
    gradient.setAttribute('fx', fx + '%');
    gradient.setAttribute('fy', fy + '%');
    gradient.setAttribute('opacity', gradientOpacity);
    svgDefs.appendChild(gradient);

    stop1 = document.createElementNS(SVG_NAMESPACE, 'stop');
    stop1.setAttribute('stop-color', stopColor);
    stop2 = document.createElementNS(SVG_NAMESPACE, 'stop');
    stop2.setAttribute('stop-color', stopColor);

    if (shineTransitionObj.reverseGradientDirection) {
      stop1.setAttribute('offset', '100%');
      stop1.setAttribute('stop-opacity', '1');
      stop2.setAttribute('offset', '0%');
      stop2.setAttribute('stop-opacity', '0');
      gradient.appendChild(stop2);
      gradient.appendChild(stop1);
    } else {
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-opacity', '1');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-opacity', '0');
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
    }

    shineTransitionObj.gradient = gradient;
    shineTransitionObj.stop1 = stop1;
    shineTransitionObj.stop2 = stop2;

    return gradient;
  }

  function update(time) {
    handleHSLComponentTransitionCompletion('hue', time);
    handleHSLComponentTransitionCompletion('saturation', time);
    handleHSLComponentTransitionCompletion('lightness', time);

    computeCurrentHSLComponentMinMax('hue', time);
    computeCurrentHSLComponentMinMax('saturation', time);
    computeCurrentHSLComponentMinMax('lightness', time);
  }

  function updateShine(iridescenceTransitions, specularityTransitions, time, rotation) {
    var radius, center;

    iridescenceTransitions.forEach(function(iridescenceTransition) {
      handleIridescenceTransitionCompletion(iridescenceTransition, 'hue', time);
      handleIridescenceTransitionCompletion(iridescenceTransition, 'opacity', time);
      handleIridescenceTransitionCompletion(iridescenceTransition, 'radius', time);
      handleIridescenceTransitionCompletion(iridescenceTransition, 'centerAngle', time);
      handleIridescenceTransitionCompletion(iridescenceTransition, 'centerRadius', time);
      handleIridescenceTransitionCompletion(iridescenceTransition, 'focusDeltaAngle', time);
      handleIridescenceTransitionCompletion(iridescenceTransition, 'focusDeltaRadiusRatio', time);

      updateCurrentShineValue(iridescenceTransition, 'hue', time, true);
      updateCurrentShineValue(iridescenceTransition, 'opacity', time, true);
      radius = updateCurrentShineValue(iridescenceTransition, 'radius', time, true);
      center = updateCurrentShineCenter(iridescenceTransition, time, rotation);
      updateCurrentShineFocus(iridescenceTransition, radius, center, time, rotation);
    });
    specularityTransitions.forEach(function(specularityTransition) {
      handleSpecularityTransitionCompletion(specularityTransition, 'hue', time);
      handleSpecularityTransitionCompletion(specularityTransition, 'opacity', time);
      handleSpecularityTransitionCompletion(specularityTransition, 'radius', time);
      handleSpecularityTransitionCompletion(specularityTransition, 'centerAngle', time);
      handleSpecularityTransitionCompletion(specularityTransition, 'centerRadius', time);
      handleSpecularityTransitionCompletion(specularityTransition, 'focusDeltaAngle', time);
      handleSpecularityTransitionCompletion(specularityTransition, 'focusDeltaRadiusRatio', time);

      updateCurrentShineValue(specularityTransition, 'hue', time, false);
      updateCurrentShineValue(specularityTransition, 'opacity', time, false);
      radius = updateCurrentShineValue(specularityTransition, 'radius', time, false);
      center = updateCurrentShineCenter(specularityTransition, time, rotation);
      updateCurrentShineFocus(specularityTransition, radius, center, time, rotation);
    });
  }

  function handleIridescenceTransitionCompletion(shineTransitionObj, property, time) {
    var value;

    if (shineTransitionObj[property].endTime < time) {
      shineTransitionObj[property].startTime = shineTransitionObj[property].endTime;
      shineTransitionObj[property].endTime = shineTransitionObj[property].endTime +
          util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_TRANSITION_TIME, PARAMS.SHINE.IRIDESCENCE.MAX_TRANSITION_TIME);

      switch (property) {
        case 'hue':
          value = util.getRandom(0, 360);
          break;
        case 'opacity':
          value = util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_OPACITY, PARAMS.SHINE.IRIDESCENCE.MAX_OPACITY);
          if (shineTransitionObj.reverseGradientDirection) {
            value *= PARAMS.SHINE.IRIDESCENCE.BORDER_GRADIENT_OPACITY_RATIO;
          }
          break;
        case 'radius':
          if (PARAMS.SHINE.IRIDESCENCE.GRADIENT_SIZE_CHANGES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_RADIUS, PARAMS.SHINE.IRIDESCENCE.MAX_RADIUS);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'centerAngle':
          if (PARAMS.SHINE.IRIDESCENCE.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = shineTransitionObj[property].end +
                util.getRandom(-PARAMS.SHINE.IRIDESCENCE.MAX_CENTER_ANGLE_DIFF, PARAMS.SHINE.IRIDESCENCE.MAX_CENTER_ANGLE_DIFF);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'centerRadius':
          if (PARAMS.SHINE.IRIDESCENCE.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(PARAMS.SHINE.IRIDESCENCE.MIN_CENTER_RADIUS, PARAMS.SHINE.IRIDESCENCE.MAX_CENTER_RADIUS, 'easeOutQuad');
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'focusDeltaAngle':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(-Math.PI, Math.PI);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'focusDeltaRadiusRatio':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(0, PARAMS.SHINE.SPECULARITY.MAX_F_DELTA_RATIO);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        default:
          return;
      }

      shineTransitionObj[property].start = shineTransitionObj[property].end;
      shineTransitionObj[property].end = value;
    }
  }

  function handleSpecularityTransitionCompletion(shineTransitionObj, property, time) {
    var value;

    if (shineTransitionObj[property].endTime < time) {
      shineTransitionObj[property].startTime = shineTransitionObj[property].endTime;
      shineTransitionObj[property].endTime = shineTransitionObj[property].endTime +
          util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_TRANSITION_TIME, PARAMS.SHINE.SPECULARITY.MAX_TRANSITION_TIME);

      switch (property) {
        case 'hue':
          value = util.getRandom(0, 360);
          break;
        case 'opacity':
          value = util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_OPACITY, PARAMS.SHINE.SPECULARITY.MAX_OPACITY);
          break;
        case 'radius':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_SIZE_CHANGES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_RADIUS, PARAMS.SHINE.SPECULARITY.MAX_RADIUS);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'centerAngle':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = shineTransitionObj[property].end +
                util.getRandom(-PARAMS.SHINE.SPECULARITY.MAX_CENTER_ANGLE_DIFF, PARAMS.SHINE.SPECULARITY.MAX_CENTER_ANGLE_DIFF);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'centerRadius':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(PARAMS.SHINE.SPECULARITY.MIN_CENTER_RADIUS, PARAMS.SHINE.SPECULARITY.MAX_CENTER_RADIUS, 'easeOutQuad');
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'focusDeltaAngle':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(-Math.PI, Math.PI);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        case 'focusDeltaRadiusRatio':
          if (PARAMS.SHINE.SPECULARITY.GRADIENT_MOVES && !shineTransitionObj.fixedDimensions) {
            value = util.getRandom(0, PARAMS.SHINE.SPECULARITY.MAX_F_DELTA_RATIO);
          } else {
            value = shineTransitionObj[property].end;
          }
          break;
        default:
          return;
      }

      shineTransitionObj[property].start = shineTransitionObj[property].end;
      shineTransitionObj[property].end = value;
    }
  }

  function updateCurrentShineValue(shineTransitionObj, property, time, isIridescence) {
    var duration, weight1, weight2, currentValue;

    duration = shineTransitionObj[property].endTime - shineTransitionObj[property].startTime;
    weight2 = (time - shineTransitionObj[property].startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.SHINE.EASING_FUNCTION);
    weight1 = 1 - weight2;
    currentValue = util.getWeightedAverage(
        shineTransitionObj[property].start, shineTransitionObj[property].end, weight1, weight2);

    switch (property) {
      case 'hue':
        if (isIridescence) {
          currentValue = {
            h: currentValue,
            s: PARAMS.SHINE.IRIDESCENCE.SATURATION,
            l: PARAMS.SHINE.IRIDESCENCE.LIGHTNESS
          };
        } else {
          currentValue = {
            h: currentValue,
            s: PARAMS.SHINE.SPECULARITY.SATURATION,
            l: PARAMS.SHINE.SPECULARITY.LIGHTNESS
          };
        }
        currentValue = util.colorToString(currentValue);
        shineTransitionObj.stop1.setAttribute('stop-color', currentValue);
        shineTransitionObj.stop2.setAttribute('stop-color', currentValue);
        break;
      case 'opacity':
        shineTransitionObj.stop1.setAttribute('stop-opacity', currentValue);
        break;
      case 'radius':
        shineTransitionObj.gradient.setAttribute('r', currentValue + '%');
        break;
      default:
        return null;
    }

    return currentValue;
  }

  function updateCurrentShineCenter(shineTransitionObj, time, rotation) {
    var duration, weight1, weight2, currentAngle, currentRadius, currentX, currentY;

    duration = shineTransitionObj.centerAngle.endTime - shineTransitionObj.centerAngle.startTime;
    weight2 = (time - shineTransitionObj.centerAngle.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.SHINE.EASING_FUNCTION);
    weight1 = 1 - weight2;
    currentAngle = util.getWeightedAverage(
        shineTransitionObj.centerAngle.start, shineTransitionObj.centerAngle.end, weight1, weight2);

    duration = shineTransitionObj.centerRadius.endTime - shineTransitionObj.centerRadius.startTime;
    weight2 = (time - shineTransitionObj.centerRadius.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.SHINE.EASING_FUNCTION);
    weight1 = 1 - weight2;
    currentRadius = util.getWeightedAverage(
        shineTransitionObj.centerRadius.start, shineTransitionObj.centerRadius.end, weight1, weight2);

    currentX = currentRadius * Math.cos(currentAngle - rotation) + 50;
    currentY = currentRadius * Math.sin(currentAngle - rotation) + 50;

    shineTransitionObj.gradient.setAttribute('cx', currentX + '%');
    shineTransitionObj.gradient.setAttribute('cy', currentY + '%');

    return { x: currentX, y: currentY };
  }

  function updateCurrentShineFocus(shineTransitionObj, currentRadius, currentCenter, time, rotation) {
    var duration, weight1, weight2, currentFocusDeltaAngle, currentFocusDeltaRadius, currentX, currentY;

    duration = shineTransitionObj.focusDeltaAngle.endTime - shineTransitionObj.focusDeltaAngle.startTime;
    weight2 = (time - shineTransitionObj.focusDeltaAngle.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.SHINE.EASING_FUNCTION);
    weight1 = 1 - weight2;
    currentFocusDeltaAngle = util.getWeightedAverage(
        shineTransitionObj.focusDeltaAngle.start, shineTransitionObj.focusDeltaAngle.end, weight1, weight2);

    duration = shineTransitionObj.focusDeltaRadiusRatio.endTime - shineTransitionObj.focusDeltaRadiusRatio.startTime;
    weight2 = (time - shineTransitionObj.focusDeltaRadiusRatio.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.SHINE.EASING_FUNCTION);
    weight1 = 1 - weight2;
    currentFocusDeltaRadius = currentRadius * util.getWeightedAverage(
        shineTransitionObj.focusDeltaRadiusRatio.start, shineTransitionObj.focusDeltaRadiusRatio.end, weight1, weight2);

    currentX = currentFocusDeltaRadius * Math.cos(currentFocusDeltaAngle - rotation) + currentCenter.x;
    currentY = currentFocusDeltaRadius * Math.sin(currentFocusDeltaAngle - rotation) + currentCenter.y;

    shineTransitionObj.gradient.setAttribute('fx', currentX + '%');
    shineTransitionObj.gradient.setAttribute('fy', currentY + '%');
  }

  function handleHSLComponentTransitionCompletion(property, time) {
    var r1, r2;

    if (transition[property].endTime < time) {
      transition[property].startTime = transition[property].endTime;
      transition[property].endTime = transition[property].endTime +
          util.getRandom(PARAMS.COLOR.MIN_MAJOR_TRANSITION_TIME, PARAMS.COLOR.MAX_MAJOR_TRANSITION_TIME);

      switch (property) {
        case 'hue':
          r1 = util.getRandom(PARAMS.COLOR.MIN_HUE, PARAMS.COLOR.MAX_HUE);
          r2 = util.getRandom(PARAMS.COLOR.MIN_HUE, PARAMS.COLOR.MAX_HUE);
          break;
        case 'saturation':
          r1 = util.getRandom(PARAMS.COLOR.MIN_SATURATION, PARAMS.COLOR.MAX_SATURATION);
          r2 = util.getRandom(PARAMS.COLOR.MIN_SATURATION, PARAMS.COLOR.MAX_SATURATION);
          break;
        case 'lightness':
          r1 = util.getRandom(PARAMS.COLOR.MIN_LIGHTNESS, PARAMS.COLOR.MAX_LIGHTNESS);
          r2 = util.getRandom(PARAMS.COLOR.MIN_LIGHTNESS, PARAMS.COLOR.MAX_LIGHTNESS);
          break;
        default:
          return;
      }

      transition[property].startMin = transition[property].endMin;
      transition[property].startMax = transition[property].endMax;
      if (r1 > r2) {
        transition[property].endMin = r2;
        transition[property].endMax = r1;
      } else {
        transition[property].endMin = r1;
        transition[property].endMax = r2;
      }
    }
  }

  function computeCurrentHSLComponentMinMax(property, time) {
    var duration, weight1, weight2;

    duration = transition[property].endTime - transition[property].startTime;
    weight2 = (time - transition[property].startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.COLOR.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    transition[property].currentMin = util.getWeightedAverage(
        transition[property].startMin,
        transition[property].endMin,
        weight1,
        weight2);
    transition[property].currentMax = util.getWeightedAverage(
        transition[property].startMax,
        transition[property].endMax,
        weight1,
        weight2);
  }

  function recoverFromWindowBlur(timeLapse) {
    util.changeStartAndEndTimeFromBlur(transition.hue, timeLapse);
    util.changeStartAndEndTimeFromBlur(transition.saturation, timeLapse);
    util.changeStartAndEndTimeFromBlur(transition.lightness, timeLapse);
  }

  function recoverShineTransitionsFromWindowBlur(shineTransitions, timeLapse) {
    shineTransitions.forEach(function(transitionObj) {
      util.changeStartAndEndTimeFromBlur(transitionObj.hue, timeLapse);
      util.changeStartAndEndTimeFromBlur(transitionObj.opacity, timeLapse);
      util.changeStartAndEndTimeFromBlur(transitionObj.radius, timeLapse);
      util.changeStartAndEndTimeFromBlur(transitionObj.centerAngle, timeLapse);
      util.changeStartAndEndTimeFromBlur(transitionObj.centerRadius, timeLapse);
      util.changeStartAndEndTimeFromBlur(transitionObj.focusDeltaAngle, timeLapse);
      util.changeStartAndEndTimeFromBlur(transitionObj.focusDeltaRadiusRatio, timeLapse);
    });
  }

  function createNewColor() {
    return {
      h: util.getRandom(transition.hue.currentMin, transition.hue.currentMax),
      s: util.getRandom(transition.saturation.currentMin, transition.saturation.currentMax),
      l: util.getRandom(transition.lightness.currentMin, transition.lightness.currentMax)
    };
  }

  return {
    init: init,
    update: update,
    updateShine: updateShine,
    recoverFromWindowBlur: recoverFromWindowBlur,
    recoverShineTransitionsFromWindowBlur: recoverShineTransitionsFromWindowBlur,
    createNewColor: createNewColor,
    createShineGradientTransitions: createShineGradientTransitions
  }
})();