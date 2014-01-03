var colorShifter = (function() {
  var svgDefs, transition, iridescenceGradients;

  function init(defsElement, time) {
    var h1, h2, s1, s2, l1, l2, i1, i2, i3, i4;

    svgDefs = defsElement;

    h1 = util.getRandom(PARAMS.COLOR.MIN_HUE, PARAMS.COLOR.MAX_HUE);
    h2 = util.getRandom(PARAMS.COLOR.MIN_HUE, PARAMS.COLOR.MAX_HUE);
    s1 = util.getRandom(PARAMS.COLOR.MIN_SATURATION, PARAMS.COLOR.MAX_SATURATION);
    s2 = util.getRandom(PARAMS.COLOR.MIN_SATURATION, PARAMS.COLOR.MAX_SATURATION);
    l1 = util.getRandom(PARAMS.COLOR.MIN_LIGHTNESS, PARAMS.COLOR.MAX_LIGHTNESS);
    l2 = util.getRandom(PARAMS.COLOR.MIN_LIGHTNESS, PARAMS.COLOR.MAX_LIGHTNESS);
    i1 = util.getRandom(0, 360);// TODO: um, I did this before I had decided to make the iridescence gradients more flexible. refactor this to fit the new scheme.
    i2 = util.getRandom(0, 360);
    i3 = util.getRandom(0, 360);
    i4 = util.getRandom(0, 360);

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
      },
      iridescence: {// TODO: um, I did this before I had decided to make the iridescence gradients more flexible. refactor this to fit the new scheme.
        hue1: {
          start: i1,
          end: i1,
          startTime: time,
          endTime: time
        },
        hue2: {
          start: i2,
          end: i2,
          startTime: time,
          endTime: time
        },
        hue3: {
          start: i3,
          end: i3,
          startTime: time,
          endTime: time
        },
        hue4: {
          start: i4,
          end: i4,
          startTime: time,
          endTime: time
        }
      }
    };

    createIridescenceGradients();

    update(time + 1);
  }

  function createIridescenceGradients() {
    var i;

    iridescenceGradients = [];

    // TODO:
    if (PARAMS.IRIDESCENCE_ON) {
      // The ball circumference gradient
      gradient = ;

      // The specular highlight gradients
      for (i = 0; i < PARAMS.IRIDESCENCE_GRADIENT_COUNT; i++) {
        gradient = ;
      }
    }

    return iridescenceGradients;
  }

  function update(time) {
    handleHSLComponentTransitionCompletion('hue', time);
    handleHSLComponentTransitionCompletion('saturation', time);
    handleHSLComponentTransitionCompletion('lightness', time);

    computeCurrentHSLComponentMinMax('hue', time);
    computeCurrentHSLComponentMinMax('saturation', time);
    computeCurrentHSLComponentMinMax('lightness', time);

    if (PARAMS.IRIDESCENCE_ON) {
      computeCurrentIridescenceHue('hue1', time);// TODO: um, I did this before I had decided to make the iridescence gradients more flexible. refactor this to fit the new scheme.
      computeCurrentIridescenceHue('hue2', time);
      computeCurrentIridescenceHue('hue3', time);
      computeCurrentIridescenceHue('hue4', time);

      handleIridescenceHueTransitionCompletion('hue1', time);// TODO: um, I did this before I had decided to make the iridescence gradients more flexible. refactor this to fit the new scheme.
      handleIridescenceHueTransitionCompletion('hue2', time);
      handleIridescenceHueTransitionCompletion('hue3', time);
      handleIridescenceHueTransitionCompletion('hue4', time);
    }

    // TODO: shift the gradients' sizes (stop percentages), positions, and rotations (I should integrate these properties into the overall transition object)
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

  function handleIridescenceHueTransitionCompletion(hueNumber, time) {// TODO: um, I did this before I had decided to make the iridescence gradients more flexible. refactor this to fit the new scheme.
    if (transition.iridescence[hueNumber].endTime < time) {
      transition.iridescence[hueNumber].startTime = transition.iridescence[hueNumber].endTime;
      transition.iridescence[hueNumber].endTime = transition.iridescence[hueNumber].endTime +
        util.getRandom(PARAMS.COLOR.MIN_MAJOR_TRANSITION_TIME, PARAMS.COLOR.MAX_MAJOR_TRANSITION_TIME);

      transition.iridescence[hueNumber].start = transition.iridescence[hueNumber].end;
      transition.iridescence[hueNumber].end = util.getRandom(0, 360);
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

  function computeCurrentIridescenceHue(hueNumber, time) {// TODO: um, I did this before I had decided to make the iridescence gradients more flexible. refactor this to fit the new scheme.
    var duration, weight1, weight2;

    duration = transition.iridescence[hueNumber].endTime - transition.iridescence[hueNumber].startTime;
    weight2 = (time - transition.iridescence[hueNumber].startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.COLOR.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    transition.iridescence[hueNumber].current = util.getWeightedAverage(
      transition.iridescence[hueNumber].start,
      transition.iridescence[hueNumber].end,
      weight1,
      weight2);
  }

  function createNewColor() {
    return {
      h: util.getRandom(transition.hue.currentMin, transition.hue.currentMax),
      s: util.getRandom(transition.saturation.currentMin, transition.saturation.currentMax),
      l: util.getRandom(transition.lightness.currentMin, transition.lightness.currentMax)
    };
  }

  function getIridescenceGradients() {
    return iridescenceGradients;
  }

  return {
    init: init,
    update: update,
    createNewColor: createNewColor,
    getIridescenceGradients: getIridescenceGradients
  }
})();