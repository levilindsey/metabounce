/*
 --- TODO --------------------------------------
 ***** - fix the bug that causes the parent balls to be wedged in the corner sometimes (and the children balls in the center of the window)
 **** - add squishiness
 *** - add mouse
 ** - add a simple GUI for all of the params
 * - add blur/focus listeners to the window to prevent crazy-ball syndrome
 --- LATER PROJECTS --------------------------------
 - create a couple copies of this project with different parameter settings
  - MetaBounce: Simple
    - no recursion (basically the other project, but with it's code replaced by this)
  **- make the following projects FORK off of this one
  - MetaBounce: Continuum
    - meta, no friction, no restitution, independent children
  - MetaBounce: Gravity
    - meta, tiny friction, small restitution, dependent children
  - MetaBounce: Resistance
    - meta, friction, restitution, independent children, tiny gravity
 -- interactive balls: -----------
  - mouse down, move, and up all add velocity to the balls in the opposite direction from the mouse (make this reflect real force behavior) (and touch)
  -
 -- bubbles: -----------
  - tap to pop
  - or get a combination of too large and too fast to pop
  - balls all gradually increase in size
  - popping causes nearby bubbles to increase in speed away from the pop
  - larger bubbles have more force when popping
  - make bubbles transparent and irridescent
  - google javascript irridescence
  - maybe use three shifting radial gradiants?
 -- squishy balls: -----------
  - will need to pause normal ball motion while it is changing eccentricity during collision squish
  -
 -----------------------------------------------
 */
(function() {

  var PARAMS = {
    // -------------------------------------------------- //
    //               v   Play with me!!   v               //
    MINOR_EASING_FUNCTION: 'easeInOutQuad',
    MAJOR_EASING_FUNCTION: 'easeInOutQuad',

    MIN_MINOR_TRANSITION_TIME: 1000, // milliseconds
    MAX_MINOR_TRANSITION_TIME: 3000,

    MIN_MAJOR_TRANSITION_TIME: 2000, // milliseconds
    MAX_MAJOR_TRANSITION_TIME: 5000,

    MIN_HUE: 0, // from 0 to 360
    MAX_HUE: 360,

    MIN_SATURATION: 0, // percentage
    MAX_SATURATION: 100,

    MIN_LIGHTNESS: 0, // percentage
    MAX_LIGHTNESS: 100,

    BACKGROUND_COLOR: '#222222',

    INTER_BALL_COLLISIONS: true,
    INDEPENDENT_CHILD_MOVEMENT: false,
    PARENT_CHILD_MOMENTUM_TRANSFER: false,

    GRAVITATIONAL_ACCELERATION: 0.00005, // pixels / millis^2
    MOUSE_POWER: 10,

    MIN_DENSITY: 4,
    MAX_DENSITY: 6,

    COEFF_OF_RESTITUTION: 1, // 0 = perfectly INELASTIC collision, 1 = perfectly ELASTIC collision
    COEFF_OF_FRICTION: 0.0000,

    MIN_SQUISHINESS: 0, // how much the ball compresses on impact (from 0 to 1)
    MAX_SQUISHINESS: 0.5,// TODO: tweak these

    COEFF_OF_SQUISHINESS: 1.5,// TODO: tweak this

    BASE: {
      BALL_COUNT: 6,
      RECURSIVE_DEPTH: 1,

      MIN_RADIUS: 40, // pixels
      MAX_RADIUS: 100,

      MIN_VELOCITY: -0.3, // pixels/millis
      MAX_VELOCITY: 0.3
    },
    CHILD: {
      MIN_BALL_COUNT: 0,
      MAX_BALL_COUNT: 0,

      MIN_SIZE_RATIO: 0.06,
      MAX_SIZE_RATIO: 0.3,

      MIN_VELOCITY_RATIO: 0.1,
      MAX_VELOCITY_RATIO: 0.5
    }
    // -------------------------------------------------- //
  };

  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
      HALF_PI = Math.PI * 0.5,
      THREE_HALVES_PI = Math.PI * 1.5,
      TWO_PI = Math.PI * 2,
      RAD_TO_DEG = 180 / Math.PI,
      COEFF_OF_FRICTION_INVERSE = 1 - PARAMS.COEFF_OF_FRICTION,
      SQUISH_ENABLED = PARAMS.MAX_SQUISHINESS > 0 && PARAMS.COEFF_OF_SQUISHINESS > 0,
      SQUISH_EASING_FUNCTION = 'easeInOutQuad';

  var balls, majorTransition, viewport, previousTime;

  window.addEventListener('load', init, false);

  function init() {
    var currentTime;

    viewport = { width: 0, height: 0 };
    determineViewportDimensions(viewport);
    window.addEventListener('resize', function() {
      determineViewportDimensions(viewport);
    }, false);

    currentTime = Date.now();
    createMajorTransition(currentTime);
    createElements(currentTime);

    previousTime = currentTime;
    myRequestAnimationFrame(animationLoop);
  }

  function createElements(time) {
    var body, svg, i;

    body = document.getElementsByTagName('body')[0];
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.background = PARAMS.BACKGROUND_COLOR;

    svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '2147483647';
    body.appendChild(svg);

    balls = [];
    for (i = 0; i < PARAMS.BASE.BALL_COUNT; i++) {
      balls[i] = createBall(time, svg, null, i, PARAMS.BASE.RECURSIVE_DEPTH);
    }
  }

  function createBall(time, svg, parent, index, recursiveDepth) {
    var ball, children, element, color, radius, angle, distance, posX, posY, velX, velY, mass, i, childCount;

    children = null;

    if (parent) {
      color = createNewColor();
      radius = getRandom(PARAMS.CHILD.MIN_SIZE_RATIO, PARAMS.CHILD.MAX_SIZE_RATIO) * parent.radius;
      angle = getRandom(0, TWO_PI);
      distance = getRandom(0, radius);
      posX = parent.pos.x + distance * Math.cos(angle);
      posY = parent.pos.y + distance * Math.sin(angle);
      velX = getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.x;
      velY = getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.y;
      mass = getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;
    } else {
      color = createNewColor();
      radius = getRandom(PARAMS.BASE.MIN_RADIUS, PARAMS.BASE.MAX_RADIUS);
      posX = viewport.width / 2;
      posY = viewport.height / 2;
      velX = getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
      velY = getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
      mass = getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;
    }

    element = document.createElementNS(SVG_NAMESPACE, 'ellipse');
    svg.appendChild(element);

    ball = {
      parent: parent,
      children: children,
      index: index,
      previousCollision: -1,
      element: element,
      color: {
        startTime: time,
        endTime: time,
        start: color,
        end: color,
        current: color
      },
      squish: {
        isSquishing: false,
        rotation: 0,
        minRx: radius,
        currentRx: radius,
        startTime: time,
        endTime: time
      },
      radius: radius,
      rotation: 0,
      pos: {
        x: posX,
        y: posY
      },
      vel: {
        x: velX,
        y: velY
      },
      mass: mass
    };

    ball.element.setAttribute('rx', ball.radius);
    ball.element.setAttribute('ry', ball.radius);

    handleBallTransition(ball, time + 1);
    applyBallParams(ball);

    // Recursively create child balls
    if (--recursiveDepth >= 0) {
      children = [];
      childCount = getRandom(PARAMS.CHILD.MIN_BALL_COUNT, PARAMS.CHILD.MAX_BALL_COUNT);
      for (i = 0; i < childCount; i++) {
        children[i] = createBall(time, svg, ball, i, recursiveDepth);
      }
      ball.children = children;
    }

    return ball;
  }

  function createMajorTransition(time) {
    var h1, h2, s1, s2, l1, l2;
    h1 = getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
    h2 = getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
    s1 = getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
    s2 = getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
    l1 = getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);
    l2 = getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);

    majorTransition = {
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

    updateMajorTransition(time + 1);
  }

  function animationLoop() {
    var currentTime, deltaTime;
    currentTime = Date.now();
    deltaTime = currentTime - previousTime;

    updateMajorTransition(currentTime);

    balls.forEach(function(ball) {
      updateBall(ball, currentTime, deltaTime);
    });

    previousTime = currentTime;
    myRequestAnimationFrame(animationLoop);
  }

  function updateBall(ball, time, deltaTime) {
    var i, childCount;

    handleBallTransition(ball, time);
    handleBallMotion(ball, time, deltaTime);

    applyBallParams(ball);

    if (ball.children) {
      // Recursively update each of the children balls
      childCount = ball.children.length;
      for (i = 0; i < childCount; i++) {
        updateBall(ball.children[i], time, deltaTime);
      }
    }
  }

  // --- NOTES ABOUT MY COLLISION ALGORITHM: --- //
  // - I consider two balls to be colliding when they are overlapping.
  // - When a collision is detected, the balls have obviously moved past the actual point of intersection--i.e., the
  //   moment of intersection occurred between timesteps. My simple and efficient solution to this problem, is to
  //   position one of the balls exactly on the edge of the other (or the wall), and to then calculate the resulting
  //   properties from the collision.
  function handleBallMotion(ball, time, deltaTime) {
    var newPos, maxPosX, maxPosY, newVel, distance, maxDistance, collisionDirection, offset, relativeBalls, i, velocities, count,
      interBallCollision, speed;

    offset = {};
    newVel = {
      x: ball.vel.x * COEFF_OF_FRICTION_INVERSE,
      y: ball.vel.y * COEFF_OF_FRICTION_INVERSE + PARAMS.GRAVITATIONAL_ACCELERATION * deltaTime
    };
    ball.vel = newVel;
    newPos = {
      x: ball.pos.x + ball.vel.x * deltaTime,
      y: ball.pos.y + ball.vel.y * deltaTime
    };

    // --- Handle collisions with other balls --- //
    // NOTE: This collision policy makes the earlier ball in the collection jump to the collision point, and makes the
    // later ball immediately start bouncing away before ever reaching that point
    if (PARAMS.INTER_BALL_COLLISIONS) {
      relativeBalls = ball.parent ? ball.parent.children : balls;
      interBallCollision = false;
      count = relativeBalls.length;
      for (i = ball.index + 1; i < count; i++) {
        distance = getDistance(newPos.x, newPos.y, relativeBalls[i].pos.x, relativeBalls[i].pos.y);
        if (distance < ball.radius + relativeBalls[i].radius) {
          if (ball.parent === null) {
            if (ball.previousCollision !== i) {
              velocities = inellasticCollision(
                newPos, newVel, ball.mass,
                relativeBalls[i].pos, relativeBalls[i].vel, relativeBalls[i].mass);
              newVel = velocities.vf1;
              // TODO: squish the other ball
              relativeBalls[i].vel = velocities.vf2;
              collisionDirection = Math.atan2(relativeBalls[i].pos.y - newPos.y, relativeBalls[i].pos.x - newPos.x);
              newPos = ball.pos;
            }
          } else {
            collisionDirection = Math.atan2(relativeBalls[i].pos.y - newPos.y, relativeBalls[i].pos.x - newPos.x);
            velocities = inellasticCollision(
              newPos, newVel, ball.mass,
              relativeBalls[i].pos, relativeBalls[i].vel, relativeBalls[i].mass);
            newPos.x = relativeBalls[i].pos.x - (relativeBalls[i].radius + ball.radius) * Math.cos(collisionDirection);
            newPos.y = relativeBalls[i].pos.y - (relativeBalls[i].radius + ball.radius) * Math.sin(collisionDirection);
          }
          ball.previousCollision = i;
          interBallCollision = true;
          break;
        }
      }

      if (!interBallCollision) {
        ball.previousCollision = -1;
      }
    }

    // --- Handle collisions with the walls --- //
    if (ball.parent) {
      distance = getDistance(newPos.x, newPos.y, ball.parent.pos.x, ball.parent.pos.y);
      maxDistance = ball.parent.radius - ball.radius;
      if (distance >= maxDistance) {
        // NOTE: This re-positioning of the inner ball makes only a rough approximation of where the child ball my have
        // exited the parent
        collisionDirection = Math.atan2(newPos.y - ball.parent.pos.y, newPos.x - ball.parent.pos.x);
        offset.x = maxDistance * Math.cos(collisionDirection);
        offset.y = maxDistance * Math.sin(collisionDirection);
        newPos.x = ball.parent.pos.x + offset.x;
        newPos.y = ball.parent.pos.y + offset.y;
        if (PARAMS.PARENT_CHILD_MOMENTUM_TRANSFER) {
          velocities = inellasticCollision(
            newPos, newVel, ball.mass,
            ball.parent.pos, ball.parent.vel, ball.parent.mass);
          newVel = velocities.vf1;
        } else {
          newVel = reflect(newVel, offset);
          speed = getSpeedInDirection(newPos, ball.parent.pos, newVel);
          velocities = {
            perpSpeedI1: speed,
            perpSpeedF1: -speed
          };
        }
        collisionDirection += Math.PI;
      }
    } else {
      // NOTE: This collision policy makes the ball jump to the collision point
      maxPosX = viewport.width - ball.radius;
      maxPosY = viewport.height - ball.radius;
      if (newPos.x >= maxPosX) {
        collisionDirection = 0;
        newPos.x = maxPosX;
        newVel.x = -Math.abs(ball.vel.x);
        velocities = {
          perpSpeedI1: -newVel.x,
          perpSpeedF1: newVel.x
        };
      } else if (newPos.x <= ball.radius) {
        collisionDirection = Math.PI;
        newPos.x = ball.radius;
        newVel.x = Math.abs(ball.vel.x);
        velocities = {
          perpSpeedI1: -newVel.x,
          perpSpeedF1: newVel.x
        };
      }
      if (newPos.y >= maxPosY) {
        collisionDirection = HALF_PI;
        newPos.y = maxPosY;
        newVel.y = -Math.abs(ball.vel.y);
        velocities = {
          perpSpeedI1: -newVel.y,
          perpSpeedF1: newVel.y
        };
      } else if (newPos.y <= ball.radius) {
        collisionDirection = THREE_HALVES_PI;
        newPos.y = ball.radius;
        newVel.y = Math.abs(ball.vel.y);
        velocities = {
          perpSpeedI1: -newVel.y,
          perpSpeedF1: newVel.y
        };
      }
    }

    if (!SQUISH_ENABLED || !handleSquish(ball, collisionDirection, velocities && velocities.perpSpeedI1, velocities && velocities.perpSpeedF1, time)) {
      if (ball.children) {
        // --- Update each of this ball's children with its new offset --- //
        offset = vectorDifference(newPos, ball.pos);
        ball.children.forEach(function(child) {
          addOffset(child, offset);
        });
      }
      ball.pos = newPos;
    }
    ball.vel = newVel;
  }

  function handleSquish(ball, collisionDirection, perpSpeedI, perpSpeedF, time) {
    var duration, halfDuration, progress, weight1, weight2, squishStrength, minRx, endTime, handledPositioning, avgSpeed;
    handledPositioning = false;
    if (ball.squish.isSquishing) {
      // Continue the old squish
      duration = ball.squish.endTime - ball.squish.startTime;
      halfDuration = duration * 0.5;
      progress = time - ball.squish.startTime;
      if (progress > duration) {
        // Done squishing
        ball.squish.isSquishing = false;
        ball.squish.currentRx = ball.radius;
      } else if (progress < halfDuration) {
        // Compressing
        weight2 = progress / halfDuration;
        weight2 = applyEasing(weight2, SQUISH_EASING_FUNCTION);
        weight1 = 1 - weight2;
        ball.squish.currentRx = getWeightedAverage(
          ball.radius,
          ball.squish.minRx,
          weight1,
          weight2);
        handledPositioning = true;
      } else {
        // Expanding
        weight2 = (progress - halfDuration) / halfDuration;
        weight2 = applyEasing(weight2, SQUISH_EASING_FUNCTION);
        weight1 = 1 - weight2;
        ball.squish.currentRx = getWeightedAverage(
          ball.squish.minRx,
          ball.radius,
          weight1,
          weight2);
        handledPositioning = true;
      }
      ball.element.setAttribute('rx', ball.squish.currentRx);
    } else if (typeof collisionDirection !== 'undefined') {
      squishStrength = Math.abs(perpSpeedF - perpSpeedI);
      avgSpeed = (Math.abs(perpSpeedI) + Math.abs(perpSpeedF)) / 2;
      if (squishStrength) {
        // Start a new squish
        minRx = getSquishMinRx(squishStrength, ball.radius);
        endTime = getSquishEndTime(ball.radius, minRx, avgSpeed, time);
        ball.squish.isSquishing = true;
        ball.squish.rotation = collisionDirection;
        ball.squish.currentRx = ball.radius;
        ball.squish.minRx = minRx;
        ball.squish.startTime = time;
        ball.squish.endTime = endTime;
        ball.rotation = ball.squish.rotation * RAD_TO_DEG;
      }
    }
    return handledPositioning;
  }

  function addOffset(ball, offset) {
    if (PARAMS.INDEPENDENT_CHILD_MOVEMENT || ball.squish.isSquishing) {
      if (ball.children) {
        ball.children.forEach(function(child) {
          addOffset(child, offset);
        });
      }
      ball.pos.x += offset.x;
      ball.pos.y += offset.y;
    }
  }

  function applyBallParams(ball) {
    var posX, posY, deltaR;
    posX = ball.pos.x;
    posY = ball.pos.y;
    if (ball.squish.isSquishing) {
      deltaR = ball.radius - ball.squish.currentRx;
      posX += deltaR * Math.cos(ball.squish.rotation);
      posY += deltaR * Math.sin(ball.squish.rotation);
    }
    // TODO: I was getting NaNs here...
    if (isNaN(posX)) {
      console.log("?1: " + posX);
    }
    if (isNaN(posY)) {
      console.log("?2: " + posY);
    }
    if (isNaN(ball.squish.currentRx)) {
      console.log("?3: " + ball.squish.currentRx);
    }
    ball.element.setAttribute('fill', colorToString(ball.color.current));
    ball.element.setAttribute('cx', posX);
    ball.element.setAttribute('cy', posY);
    ball.element.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');
  }

  function handleBallTransition(ball, time) {
    var duration, weight1, weight2;

    if (ball.color.endTime < time) {
      createNewBallTransition(ball);
    }

    duration = ball.color.endTime - ball.color.startTime;
    weight2 = (time - ball.color.startTime) / duration;
    weight2 = applyEasing(weight2, PARAMS.MINOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    ball.color.current = interpolateColors(ball.color.start, ball.color.end, weight1, weight2);
  }

  function createNewBallTransition(ball) {
    ball.color.startTime = ball.color.endTime;
    ball.color.endTime = ball.color.endTime + getRandom(PARAMS.MIN_MINOR_TRANSITION_TIME, PARAMS.MAX_MINOR_TRANSITION_TIME);
    ball.color.start = ball.color.end;
    ball.color.end = createNewColor();
  }

  function updateMajorTransition(time) {
    var duration, weight1, weight2;

    handleMajorTransitionCompletion('hue', time);
    handleMajorTransitionCompletion('saturation', time);
    handleMajorTransitionCompletion('lightness', time);

    duration = majorTransition.hue.endTime - majorTransition.hue.startTime;
    weight2 = (time - majorTransition.hue.startTime) / duration;
    weight2 = applyEasing(weight2, PARAMS.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    majorTransition.hue.currentMin = getWeightedAverage(
      majorTransition.hue.startMin,
      majorTransition.hue.endMin,
      weight1,
      weight2);
    majorTransition.hue.currentMax = getWeightedAverage(
      majorTransition.hue.startMax,
      majorTransition.hue.endMax,
      weight1,
      weight2);

    duration = majorTransition.saturation.endTime - majorTransition.saturation.startTime;
    weight2 = (time - majorTransition.saturation.startTime) / duration;
    weight2 = applyEasing(weight2, PARAMS.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    majorTransition.saturation.currentMin = getWeightedAverage(
      majorTransition.saturation.startMin,
      majorTransition.saturation.endMin,
      weight1,
      weight2);
    majorTransition.saturation.currentMax = getWeightedAverage(
      majorTransition.saturation.startMax,
      majorTransition.saturation.endMax,
      weight1,
      weight2);

    duration = majorTransition.lightness.endTime - majorTransition.lightness.startTime;
    weight2 = (time - majorTransition.lightness.startTime) / duration;
    weight2 = applyEasing(weight2, PARAMS.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    majorTransition.lightness.currentMin = getWeightedAverage(
      majorTransition.lightness.startMin,
      majorTransition.lightness.endMin,
      weight1,
      weight2);
    majorTransition.lightness.currentMax = getWeightedAverage(
      majorTransition.lightness.startMax,
      majorTransition.lightness.endMax,
      weight1,
      weight2);
  }

  function handleMajorTransitionCompletion(property, time) {
    var r1, r2;

    if (majorTransition[property].endTime < time) {
      majorTransition[property].startTime = majorTransition[property].endTime;
      majorTransition[property].endTime = majorTransition[property].endTime + getRandom(PARAMS.MIN_MAJOR_TRANSITION_TIME, PARAMS.MAX_MAJOR_TRANSITION_TIME);

      switch (property) {
        case 'hue':
          r1 = getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
          r2 = getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
          break;
        case 'saturation':
          r1 = getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
          r2 = getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
          break;
        case 'lightness':
          r1 = getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);
          r2 = getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);
          break;
        default:
          return;
      }

      majorTransition[property].startMin = majorTransition[property].endMin;
      majorTransition[property].startMax = majorTransition[property].endMax;
      if (r1 > r2) {
        majorTransition[property].endMin = r2;
        majorTransition[property].endMax = r1;
      } else {
        majorTransition[property].endMin = r1;
        majorTransition[property].endMax = r2;
      }
    }
  }

  function getSquishMinRx(squishStrength, radius) {
    var weight1, weight2;
    squishStrength = squishStrength * PARAMS.COEFF_OF_SQUISHINESS;
    weight2 = squishStrength > 1 ? 1 : squishStrength;
    weight2 = applyEasing(weight2, SQUISH_EASING_FUNCTION);
    weight1 = 1 - weight2;
    return radius * (1 - getWeightedAverage(
      PARAMS.MIN_SQUISHINESS, PARAMS.MAX_SQUISHINESS, weight1, weight2));
  }

  function getSquishEndTime(maxRadius, minRadius, avgSpeed, time) {
    // TODO: It is most important to keep the initial and end radius deltas equal to the component of the initial and
    // TODO:   final velocities that is perpendicular to the squish
    return time + (maxRadius - minRadius) / avgSpeed;
  }

  function createNewColor() {
    return {
      h: getRandom(majorTransition.hue.currentMin, majorTransition.hue.currentMax),
      s: getRandom(majorTransition.saturation.currentMin, majorTransition.saturation.currentMax),
      l: getRandom(majorTransition.lightness.currentMin, majorTransition.lightness.currentMax)
    };
  }

  function interpolateColors(color1, color2, weight1, weight2) {
    return {
      h: getWeightedAverage(color1.h, color2.h, weight1, weight2),
      s: getWeightedAverage(color1.s, color2.s, weight1, weight2),
      l: getWeightedAverage(color1.l, color2.l, weight1, weight2)
    };
  }

  function colorToString(color) {
    return 'hsla(' + color.h + ',' + color.s + '%,' + color.l + '%, 1.0)';
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
    var normalizedCoaxialVector, perpSpeedI1, perpSpeedI2, perpSpeedF1, perpSpeedF2, tmp1, tmp2, vf1, vf2;
    // Get the components of the velocity vectors that are parallel to the collision (the perpendicular components will
    // remain constant across the collision)
    normalizedCoaxialVector = normalize(vectorDifference(p2, p1));
    perpSpeedI1 = dotProduct(vi1, normalizedCoaxialVector);
    perpSpeedI2 = dotProduct(vi2, normalizedCoaxialVector);
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
      perpSpeedI1: perpSpeedI1,
      perpSpeedI2: perpSpeedI2,
      perpSpeedF1: perpSpeedF1,
      perpSpeedF2: perpSpeedF2
    };
  }

  function getSpeedInDirection(p1, p2, v1) {
    var normalizedCoaxialVector;
    normalizedCoaxialVector = normalize(vectorDifference(p2, p1));
    return dotProduct(v1, normalizedCoaxialVector);
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
})();
