/*
 --- TODO --------------------------------------
 ***** - refactor the code
 **** - move all of the color-transition code into its own separate module
 *** - add a simple GUI for all of the params
 ** - add blur/focus listeners to the window to prevent crazy-ball syndrome
 * - fix the bug that causes the system to gain energy
 * - fix the bug that causes the parent balls to be wedged in the corner sometimes (and the children balls in the center of the window)
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
 -- aggregate awareness/behaviors: -----------
  -- sardines: --------
    -
  -- butterflies: --------
    - flap wings that can be any arbitrary shape
    - simply reflect the shape to create the second wing
    - simply skew the shapes to imitate flapping
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

    COEFF_OF_RESTITUTION: 0.7, // 0 = perfectly INELASTIC collision, 1 = perfectly ELASTIC collision
    COEFF_OF_FRICTION: 0.00001,

    MIN_SQUISHINESS: 0, // how much the ball compresses on impact (from 0 to 1)
    MAX_SQUISHINESS: 0.7,

    COEFF_OF_SQUISHINESS: 0.4,
    INTRA_BALL_COLLISION_SQUISH_STRENGTH_COEFF: 0.7,

    BASE: {
      BALL_COUNT: 6,
      RECURSIVE_DEPTH: 0,

      OPACITY: 0.999,

      MIN_RADIUS: 40, // pixels
      MAX_RADIUS: 100,

      MIN_VELOCITY: -0.36,//-0.3, // pixels/millis
      MAX_VELOCITY: 0.36//0.3
    },
    CHILD: {
      MIN_BALL_COUNT: 1,
      MAX_BALL_COUNT: 5,

      MIN_SIZE_RATIO: 0.06,
      MAX_SIZE_RATIO: 0.3,

      MIN_VELOCITY_RATIO: 0.1,
      MAX_VELOCITY_RATIO: 0.5
    },

    TOUCH: {
      MAX_SPEED_CHANGE: 1, // pixel / millis
      MAX_DISTANCE: 150, // pixels
      EFFECT_EASING_FUNCTION: 'linear',
      WHOOSH: {
        DURATION: 300, // millis
        EASING_FUNCTION: 'linear',
        STROKE_WIDTH: 4,
        STROKE_TO_GRADIENT_OPACITY_RATIO: 0.8,
        STOP_2_PERCENTAGE: 55,
        START_RADIUS: 1, // pixels
        END_RADIUS: 110,
        START_COLOR: { // percentages
          h: 250,
          s: 100,
          l: 100
        },
        END_COLOR: {
          h: 250,
          s: 100,
          l: 88
        },
        START_OPACITY: 0.3, // from 0 to 1
        END_OPACITY: 0.05
      },
      FLASH: {
        DURATION: 180, // millis
        EASING_FUNCTION: 'easeOutQuad',
        START_RADIUS: 30, // pixels
        END_RADIUS: 10,
        START_COLOR: { // percentages
          h: 60,
          s: 100,
          l: 100
        },
        END_COLOR: {
          h: 60,
          s: 100,
          l: 88
        },
        START_OPACITY: 0.9, // from 0 to 1
        END_OPACITY: 0.0
      }
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
      SQUISH_COMPRESS_EASING_FUNCTION = 'easeOutQuad',
      SQUISH_EXPAND_EASING_FUNCTION = 'easeInQuad',
      SQUISH_MIN_RADIUS_EASING_FUNCTION = 'easeOutQuad';

  var balls, svg, svgPos, majorTransition, viewport, previousTime;

  window.addEventListener('load', init, false);

  function init() {
    var currentTime;

    viewport = { width: 0, height: 0 };
    util.determineViewportDimensions(viewport);
    window.addEventListener('resize', function() {
      util.determineViewportDimensions(viewport);
    }, false);

    currentTime = Date.now();
    createMajorTransition(currentTime);
    createElements(currentTime);
    touchAnimationManager.init(svg);

    // Handle touch events
    svgPos = util.getPageXY(svg);
    svg.addEventListener('mousedown', function(e) {
      onTouch({
        x: e.pageX + svgPos.x,
        y: e.pageY + svgPos.y
      });
    }, false);
    svg.addEventListener('touchstart', function(e) {
      onTouch({
        x: e.changedTouches[0].pageX + svgPos.x,
        y: e.changedTouches[0].pageY + svgPos.y
      });
    }, false);

    // Start the animation loop
    previousTime = currentTime;
    util.myRequestAnimationFrame(animationLoop);
  }

  function animationLoop() {
    var currentTime, deltaTime;
    currentTime = Date.now();
    deltaTime = currentTime - previousTime;

    updateMajorTransition(currentTime);
    touchAnimationManager.update(currentTime);

    balls.forEach(function(ball) {
      updateBall(ball, currentTime, deltaTime);
    });

    previousTime = currentTime;
    util.myRequestAnimationFrame(animationLoop);
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

  function createElements(time) {
    var body, i;

    body = document.getElementsByTagName('body')[0];
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.margin = '0px';
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
      color = util.createNewColor();
      radius = util.getRandom(PARAMS.CHILD.MIN_SIZE_RATIO, PARAMS.CHILD.MAX_SIZE_RATIO) * parent.radius;
      angle = util.getRandom(0, TWO_PI);
      distance = util.getRandom(0, radius);
      posX = parent.pos.x + distance * Math.cos(angle);
      posY = parent.pos.y + distance * Math.sin(angle);
      velX = util.getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.x;
      velY = util.getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.y;
      mass = util.getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;
    } else {
      color = util.createNewColor();
      radius = util.getRandom(PARAMS.BASE.MIN_RADIUS, PARAMS.BASE.MAX_RADIUS);
      posX = viewport.width / 2;
      posY = viewport.height / 2;
      velX = util.getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
      velY = util.getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
      mass = util.getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;
    }

    element = document.createElementNS(SVG_NAMESPACE, 'ellipse');
    svg.appendChild(element);

    ball = {
      parent: parent,
      children: children,
      index: index,
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
      childCount = util.getRandom(PARAMS.CHILD.MIN_BALL_COUNT, PARAMS.CHILD.MAX_BALL_COUNT);
      for (i = 0; i < childCount; i++) {
        children[i] = createBall(time, svg, ball, i, recursiveDepth);
      }
      ball.children = children;
    }

    return ball;
  }

  function createMajorTransition(time) {
    var h1, h2, s1, s2, l1, l2;
    h1 = util.getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
    h2 = util.getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
    s1 = util.getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
    s2 = util.getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
    l1 = util.getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);
    l2 = util.getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);

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

  // --- NOTES ABOUT MY COLLISION ALGORITHM: --- //
  // - I consider two balls to be colliding when they are overlapping.
  // - When a collision is detected, the balls have obviously moved past the actual point of intersection--i.e., the
  //   moment of intersection occurred between timesteps. My simple and efficient solution to this problem, is to
  //   position one of the balls exactly on the edge of the other (or the wall), and to then calculate the resulting
  //   properties from the collision.
  function handleBallMotion(ball, time, deltaTime) {
    var newPos, maxPosX, maxPosY, newVel, distance, maxDistance, collisionAngle, offset, relativeBalls, i, velocities, count,
        ballsAreNearing, relativeVelocity, coaxialVector, speeds, squishHandledPositioning, wasCollisionWithWall;

    // Account for acceleration and velocity
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
    if (PARAMS.INTER_BALL_COLLISIONS) {
      relativeBalls = ball.parent ? ball.parent.children : balls;
      count = relativeBalls.length;
      for (i = ball.index + 1; i < count; i++) {
        distance = util.getDistance(newPos.x, newPos.y, relativeBalls[i].pos.x, relativeBalls[i].pos.y);
        // Is there overlap between the balls?
        if (distance < ball.radius + relativeBalls[i].radius) {
          // Are the balls actually nearing each other?
          relativeVelocity = util.vectorDifference(newVel, relativeBalls[i].vel);
          coaxialVector = util.vectorDifference(relativeBalls[i].pos, newPos);
          ballsAreNearing = util.dotProduct(relativeVelocity, coaxialVector) > 0;
          if (ballsAreNearing) {
            // Calculate some properties of the collision
            collisionAngle = Math.atan2(relativeBalls[i].pos.y - newPos.y, relativeBalls[i].pos.x - newPos.x);
            velocities = util.inellasticCollision(
                newPos, newVel, ball.mass,
                relativeBalls[i].pos, relativeBalls[i].vel, relativeBalls[i].mass);

            // Record the new velocity
            newVel = velocities.vf1;
            newPos = ball.pos;
            wasCollisionWithWall = false;

            // Squish the other ball
            squishHandledPositioning = handleSquish(relativeBalls[i], false, collisionAngle + Math.PI, velocities && velocities.tangVelocity2, velocities && velocities.perpSpeedI2, velocities && velocities.perpSpeedF2, time, deltaTime, false);
            saveNewBallParams(relativeBalls[i], squishHandledPositioning, relativeBalls[i].pos, velocities.vf2);
            break;
          }
        }
      }
    }

    // --- Handle collisions with the walls --- //
    if (ball.parent) {
      distance = util.getDistance(newPos.x, newPos.y, ball.parent.pos.x, ball.parent.pos.y);
      maxDistance = ball.parent.radius - ball.radius;
      if (distance >= maxDistance) {
        // NOTE: This re-positioning of the inner ball makes only a rough approximation of where the child ball my have
        // exited the parent
        collisionAngle = Math.atan2(newPos.y - ball.parent.pos.y, newPos.x - ball.parent.pos.x);
        offset.x = maxDistance * Math.cos(collisionAngle);
        offset.y = maxDistance * Math.sin(collisionAngle);
        newPos.x = ball.parent.pos.x + offset.x;
        newPos.y = ball.parent.pos.y + offset.y;
        if (PARAMS.PARENT_CHILD_MOMENTUM_TRANSFER) {
          velocities = util.inellasticCollision(
            newPos, newVel, ball.mass,
            ball.parent.pos, ball.parent.vel, ball.parent.mass);
          newVel = velocities.vf1;
        } else {
          newVel = util.reflect(newVel, offset);
          speeds = util.getTangVelocityAndPerpSpeed(newPos, ball.parent.pos, newVel);
          velocities = {
            tangVelocity1: speeds.tangVelocity,
            perpSpeedI1: speeds.perpSpeed,
            perpSpeedF1: -speeds.perpSpeed
          };
        }
        collisionAngle += Math.PI;
        wasCollisionWithWall = false;
      }
    } else {
      // NOTE: This collision policy makes the ball jump to the collision point
      maxPosX = viewport.width - ball.radius;
      maxPosY = viewport.height - ball.radius;
      if (newPos.x >= maxPosX) {
        collisionAngle = 0;
        newPos.x = maxPosX;
        newVel.x = -Math.abs(ball.vel.x);
        velocities = {
          tangVelocity1: { x: 0, y: newVel.y },
          perpSpeedI1: -newVel.x,
          perpSpeedF1: newVel.x
        };
        wasCollisionWithWall = true;
      } else if (newPos.x <= ball.radius) {
        collisionAngle = Math.PI;
        newPos.x = ball.radius;
        newVel.x = Math.abs(ball.vel.x);
        velocities = {
          tangVelocity1: { x: 0, y: newVel.y },
          perpSpeedI1: -newVel.x,
          perpSpeedF1: newVel.x
        };
        wasCollisionWithWall = true;
      }
      if (newPos.y >= maxPosY) {
        collisionAngle = HALF_PI;
        newPos.y = maxPosY;
        newVel.y = -Math.abs(ball.vel.y);
        velocities = {
          tangVelocity1: { x: newVel.x, y: 0 },
          perpSpeedI1: -newVel.y,
          perpSpeedF1: newVel.y
        };
        wasCollisionWithWall = true;
      } else if (newPos.y <= ball.radius) {
        collisionAngle = THREE_HALVES_PI;
        newPos.y = ball.radius;
        newVel.y = Math.abs(ball.vel.y);
        velocities = {
          tangVelocity1: { x: newVel.x, y: 0 },
          perpSpeedI1: -newVel.y,
          perpSpeedF1: newVel.y
        };
        wasCollisionWithWall = true;
      }
    }

    squishHandledPositioning = handleSquish(ball, wasCollisionWithWall, collisionAngle, velocities && velocities.tangVelocity1, velocities && velocities.perpSpeedI1, velocities && velocities.perpSpeedF1, time, deltaTime, true);
    saveNewBallParams(ball, squishHandledPositioning, newPos, newVel);
  }

  function saveNewBallParams(ball, squishHandledPositioning, newPos, newVel) {
    var offset;
    if (!squishHandledPositioning) {
      if (ball.children) {
        // --- Update each of this ball's children with its new offset --- //
        offset = util.vectorDifference(newPos, ball.pos);
        ball.children.forEach(function(child) {
          addOffset(child, offset);
        });
      }
      ball.pos = newPos;
    }
    ball.vel = newVel;
  }

  // NOTE: This squishing algorithm is fairly simple. A ball only squishes in one direction at a time. So it will
  // appear unnatural when a new collision occurs with a ball that is already squishing.
  function handleSquish(ball, wasCollisionWithWall, collisionAngle, tangVelocity, perpSpeedI, perpSpeedF, time, deltaTime, handleContinuedSquish) {
    var duration, halfDuration, progress, weight1, weight2, squishStrength, minRx, endTime, handledPositioning, avgSpeed;
    handledPositioning = false;
    if (SQUISH_ENABLED) {
      if (ball.squish.isSquishing) {
        if (handleContinuedSquish) {
          // Continue the old squish
          duration = ball.squish.endTime - ball.squish.startTime;
          halfDuration = duration * 0.5;
          progress = time - ball.squish.startTime;
          if (progress > duration) {
            // Done squishing
            ball.squish.isSquishing = false;
            ball.squish.currentRx = ball.radius;
          } else {
            if (progress < halfDuration) {
              // Compressing
              weight2 = progress / halfDuration;
              weight2 = util.applyEasing(weight2, SQUISH_COMPRESS_EASING_FUNCTION);
              weight1 = 1 - weight2;
              ball.squish.currentRx = util.getWeightedAverage(
                ball.radius,
                ball.squish.minRx,
                weight1,
                weight2);
              handledPositioning = true;
            } else {
              // Expanding
              weight2 = (progress - halfDuration) / halfDuration;
              weight2 = util.applyEasing(weight2, SQUISH_EXPAND_EASING_FUNCTION);
              weight1 = 1 - weight2;
              ball.squish.currentRx = util.getWeightedAverage(
                ball.squish.minRx,
                ball.radius,
                weight1,
                weight2);
              handledPositioning = true;
            }
            // While squishing, slide the ball in the direction tangent to the collision
            ball.pos.x += ball.squish.tangVelocity.x * deltaTime;
            ball.pos.y += ball.squish.tangVelocity.y * deltaTime;
          }
          ball.element.setAttribute('rx', ball.squish.currentRx);
        }
      } else if (typeof collisionAngle !== 'undefined') {
        squishStrength = Math.abs(perpSpeedF - perpSpeedI);
        squishStrength = wasCollisionWithWall ? squishStrength : squishStrength * PARAMS.INTRA_BALL_COLLISION_SQUISH_STRENGTH_COEFF;
        avgSpeed = (Math.abs(perpSpeedI) + Math.abs(perpSpeedF)) / 2;
        if (squishStrength) {
          // Start a new squish
          minRx = getSquishMinRx(squishStrength, ball.radius);
          endTime = getSquishEndTime(ball.radius, minRx, avgSpeed, time);
          ball.squish.isSquishing = true;
          ball.squish.rotation = collisionAngle;
          ball.squish.currentRx = ball.radius;
          ball.squish.minRx = minRx;
          ball.squish.tangVelocity = tangVelocity;
          ball.squish.startTime = time;
          ball.squish.endTime = endTime;
          ball.rotation = ball.squish.rotation * RAD_TO_DEG;
        }
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
    // TODO: I get NaNs here occasionally...
    if (isNaN(posX)) {
      console.log("?1: " + posX);
    }
    if (isNaN(posY)) {
      console.log("?2: " + posY);
    }
    if (isNaN(ball.squish.currentRx)) {
      console.log("?3: " + ball.squish.currentRx);
    }
    if (!ball.parent) {
      ball.element.style.opacity = PARAMS.BASE.OPACITY;
    }
    ball.element.setAttribute('fill', util.colorToString(ball.color.current));
    ball.element.setAttribute('cx', posX);
    ball.element.setAttribute('cy', posY);
    ball.element.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');
  }

  function onTouch(touchPos) {
    var time = Date.now();
    balls.forEach(function(ball) {
      applyTouchSpeedChange(ball, touchPos, time);
    });
    touchAnimationManager.newTouch(touchPos, time);
  }

  function applyTouchSpeedChange(ball, touchPos, time) {
    var distance, touchSpeedChange, touchVelocityChange, normalizedCoaxialVector, weight1, weight2, collisionAngle,
        tangVelocityAndPerpSpeed;

    distance = util.getDistance(touchPos.x, touchPos.y, ball.pos.x, ball.pos.y);
    if (distance < PARAMS.TOUCH.MAX_DISTANCE) {
      // Calculate the strength of the touch
      weight2 = distance / PARAMS.TOUCH.MAX_DISTANCE;
      weight2 = util.applyEasing(weight2, PARAMS.TOUCH.EFFECT_EASING_FUNCTION);
      weight1 = 1 - weight2;
      touchSpeedChange = util.getWeightedAverage(PARAMS.TOUCH.MAX_SPEED_CHANGE, 0, weight1, weight2);

      // Apply the velocity vector change
      normalizedCoaxialVector = util.normalize(util.vectorDifference(ball.pos, touchPos));
      touchVelocityChange = util.scalarVectorProduct(touchSpeedChange, normalizedCoaxialVector);
      ball.vel = util.vectorAddition(ball.vel, touchVelocityChange);

      // Squish the ball
      collisionAngle = Math.atan2(ball.pos.y - touchPos.y, ball.pos.x - touchPos.x);
      tangVelocityAndPerpSpeed = util.getTangVelocityAndPerpSpeed(ball.pos, touchPos, ball.vel);
      handleSquish(ball, false, collisionAngle,
          tangVelocityAndPerpSpeed.tangVelocity,
          tangVelocityAndPerpSpeed.perpSpeed,
          tangVelocityAndPerpSpeed.perpSpeed + touchSpeedChange,
          time, 0, false);
    }
  }

  function handleBallTransition(ball, time) {
    var duration, weight1, weight2;

    if (ball.color.endTime < time) {
      createNewBallTransition(ball);
    }

    duration = ball.color.endTime - ball.color.startTime;
    weight2 = (time - ball.color.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.MINOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    ball.color.current = util.interpolateColors(ball.color.start, ball.color.end, weight1, weight2);
  }

  function createNewBallTransition(ball) {
    ball.color.startTime = ball.color.endTime;
    ball.color.endTime = ball.color.endTime + util.getRandom(PARAMS.MIN_MINOR_TRANSITION_TIME, PARAMS.MAX_MINOR_TRANSITION_TIME);
    ball.color.start = ball.color.end;
    ball.color.end = util.createNewColor();
  }

  function updateMajorTransition(time) {
    var duration, weight1, weight2;

    handleMajorTransitionCompletion('hue', time);
    handleMajorTransitionCompletion('saturation', time);
    handleMajorTransitionCompletion('lightness', time);

    duration = majorTransition.hue.endTime - majorTransition.hue.startTime;
    weight2 = (time - majorTransition.hue.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    majorTransition.hue.currentMin = util.getWeightedAverage(
      majorTransition.hue.startMin,
      majorTransition.hue.endMin,
      weight1,
      weight2);
    majorTransition.hue.currentMax = util.getWeightedAverage(
      majorTransition.hue.startMax,
      majorTransition.hue.endMax,
      weight1,
      weight2);

    duration = majorTransition.saturation.endTime - majorTransition.saturation.startTime;
    weight2 = (time - majorTransition.saturation.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    majorTransition.saturation.currentMin = util.getWeightedAverage(
      majorTransition.saturation.startMin,
      majorTransition.saturation.endMin,
      weight1,
      weight2);
    majorTransition.saturation.currentMax = util.getWeightedAverage(
      majorTransition.saturation.startMax,
      majorTransition.saturation.endMax,
      weight1,
      weight2);

    duration = majorTransition.lightness.endTime - majorTransition.lightness.startTime;
    weight2 = (time - majorTransition.lightness.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.MAJOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    majorTransition.lightness.currentMin = util.getWeightedAverage(
      majorTransition.lightness.startMin,
      majorTransition.lightness.endMin,
      weight1,
      weight2);
    majorTransition.lightness.currentMax = util.getWeightedAverage(
      majorTransition.lightness.startMax,
      majorTransition.lightness.endMax,
      weight1,
      weight2);
  }

  function handleMajorTransitionCompletion(property, time) {
    var r1, r2;

    if (majorTransition[property].endTime < time) {
      majorTransition[property].startTime = majorTransition[property].endTime;
      majorTransition[property].endTime = majorTransition[property].endTime + util.getRandom(PARAMS.MIN_MAJOR_TRANSITION_TIME, PARAMS.MAX_MAJOR_TRANSITION_TIME);

      switch (property) {
        case 'hue':
          r1 = util.getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
          r2 = util.getRandom(PARAMS.MIN_HUE, PARAMS.MAX_HUE);
          break;
        case 'saturation':
          r1 = util.getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
          r2 = util.getRandom(PARAMS.MIN_SATURATION, PARAMS.MAX_SATURATION);
          break;
        case 'lightness':
          r1 = util.getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);
          r2 = util.getRandom(PARAMS.MIN_LIGHTNESS, PARAMS.MAX_LIGHTNESS);
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
    weight2 = util.applyEasing(weight2, SQUISH_MIN_RADIUS_EASING_FUNCTION);
    weight1 = 1 - weight2;
    return radius * (1 - util.getWeightedAverage(
      PARAMS.MIN_SQUISHINESS, PARAMS.MAX_SQUISHINESS, weight1, weight2));
  }

  function getSquishEndTime(maxRadius, minRadius, avgSpeed, time) {
    // TODO: It is most important to keep the initial and end radius deltas equal to the component of the initial and
    // TODO:   final velocities that is perpendicular to the squish
    return time + (maxRadius - minRadius) / avgSpeed;
  }

  var touchAnimationManager = (function() {
    var animations, svg, defs, currentGradientID;

    function init(svgElement) {
      svg = svgElement;
      animations = [];
      currentGradientID = 1;
      defs = document.createElementNS(SVG_NAMESPACE, 'defs');
      svg.appendChild(defs);
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

        // TODO: move all of this gradient creation code into some sort of helper function so I can easily re-use it with the Flash class
        this.gradient = document.createElementNS(SVG_NAMESPACE, 'radialGradient');
        this.gradient.id = 'gradient' + currentGradientID++;
        this.gradient.setAttribute('cx', '50%');
        this.gradient.setAttribute('cy', '50%');
        this.gradient.setAttribute('r', '50%');
        this.gradient.setAttribute('fx', '50%');
        this.gradient.setAttribute('fy', '50%');
        defs.appendChild(this.gradient);

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
        svg.removeChild(this.circle);// TODO: check this function on Google
        this.gradient.removeChild(this.stop1);
        this.gradient.removeChild(this.stop2);
        defs.removeChild(this.gradient);
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
        defs.appendChild(this.gradient);

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
        defs.removeChild(this.gradient);
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

  var util = (function() {
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
      createNewColor: createNewColor,
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
      getPageXY: getPageXY,
      determineViewportDimensions: determineViewportDimensions,
      myRequestAnimationFrame: function(callback) {
        myRequestAnimationFrame.call(window, callback);
      }
    };
  })();
})();
