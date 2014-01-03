/* --- THIS PROJECT IS STILL A WORK IN PROGRESS --- */
(function() {

// ------------------------------------------------ //
// Params



// ------------------------------------------------ //

  var balls, svg, svgPos, svgDefs, viewport, previousTime;

  window.addEventListener('load', init, false);

  function init() {
    var currentTime;

    viewport = { width: 0, height: 0 };
    util.determineViewportDimensions(viewport);
    window.addEventListener('resize', function() {
      util.determineViewportDimensions(viewport);
    }, false);

    currentTime = Date.now();
    colorShifter.init(svgDefs, currentTime);
    createElements(currentTime);
    touchAnimator.init(svg, svgDefs);

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

    colorShifter.update(currentTime);
    touchAnimator.update(currentTime);

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
    var body, i, iridescenceGradients;

    body = document.getElementsByTagName('body')[0];
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.margin = '0px';
    body.style.background = PARAMS.COLOR.BACKGROUND;

    svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '2147483647';
    body.appendChild(svg);

    svgDefs = document.createElementNS(SVG_NAMESPACE, 'defs');
    svg.appendChild(svgDefs);

    iridescenceGradients = colorShifter.createIridescenceGradients();

    balls = [];
    for (i = 0; i < PARAMS.BASE.BALL_COUNT; i++) {
      balls[i] = createBall(time, svg, iridescenceGradients, null, i, PARAMS.BASE.RECURSIVE_DEPTH);
    }
  }

  function createBall(time, svg, iridescenceGradients, parent, index, recursiveDepth) {
    var ball, children, element, color, radius, angle, distance, posX, posY, velX, velY, mass, iridescenceElements,
      iridescenceElement, i, childCount;

    children = null;

    if (parent) {
      radius = util.getRandom(PARAMS.CHILD.MIN_SIZE_RATIO, PARAMS.CHILD.MAX_SIZE_RATIO) * parent.radius;
      angle = util.getRandom(0, TWO_PI);
      distance = util.getRandom(0, radius);
      posX = parent.pos.x + distance * Math.cos(angle);
      posY = parent.pos.y + distance * Math.sin(angle);
      velX = util.getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.x;
      velY = util.getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.y;
    } else {
      radius = util.getRandom(PARAMS.BASE.MIN_RADIUS, PARAMS.BASE.MAX_RADIUS);
      posX = viewport.width / 2;
      posY = viewport.height / 2;
      velX = util.getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
      velY = util.getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
    }
    color = colorShifter.createNewColor();
    mass = util.getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;

    element = document.createElementNS(SVG_NAMESPACE, 'ellipse');
    svg.appendChild(element);

    iridescenceElements = [];
    iridescenceGradients.forEach(function(gradient) {
      iridescenceElement = document.createElementNS(SVG_NAMESPACE, 'ellipse');
      iridescenceElement.setAttribute('fill', 'url(#' + gradient.id + ')');
      svg.appendChild(iridescenceElement);
      iridescenceElements.push(iridescenceElement);
    });

    ball = {
      parent: parent,
      children: children,
      index: index,
      element: element,
      iridescenceElements: iridescenceElements,
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

    ball.element.style.opacity = PARAMS.BASE.OPACITY;
    ball.element.setAttribute('fill', util.colorToString(ball.color.current));
    ball.element.setAttribute('cx', posX);
    ball.element.setAttribute('cy', posY);
    ball.element.setAttribute('rx', ball.squish.currentRx);
    ball.element.setAttribute('ry', ball.radius);
    ball.element.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');

    ball.iridescenceElements.forEach(function(iridescenceElement) {
      iridescenceElement.setAttribute('cx', posX);
      iridescenceElement.setAttribute('cy', posY);
      iridescenceElement.setAttribute('rx', ball.squish.currentRx);
      iridescenceElement.setAttribute('ry', ball.radius);
      iridescenceElement.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');
    });
  }

  function onTouch(touchPos) {
    var time = Date.now();
    balls.forEach(function(ball) {
      applyTouchSpeedChange(ball, touchPos, time);
    });
    touchAnimator.newTouch(touchPos, time);
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
    weight2 = util.applyEasing(weight2, PARAMS.COLOR.MINOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    ball.color.current = util.interpolateColors(ball.color.start, ball.color.end, weight1, weight2);
  }

  function createNewBallTransition(ball) {
    ball.color.startTime = ball.color.endTime;
    ball.color.endTime = ball.color.endTime + util.getRandom(PARAMS.COLOR.MIN_MINOR_TRANSITION_TIME, PARAMS.COLOR.MAX_MINOR_TRANSITION_TIME);
    ball.color.start = ball.color.end;
    ball.color.end = colorShifter.createNewColor();
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
    return time + (maxRadius - minRadius) / avgSpeed;
  }

  // ---------------------------------------------- //
  // touchAnimator



  // ---------------------------------------------- //
  // colorShifter



  // ---------------------------------------------- //
  // util



  // ---------------------------------------------- //
})();
/*
 --- TODO --------------------------------------
 ****** - refactor the code
 ***** - move all of the color-transition code into its own separate module
 **** - create three artificial taps at equidistant locations off-center at the start (PARAMS.INITIAL_TAPS_ON)
 *** - (PARAMS.BUBBLES_GROW_ON)
 *** - (PARAMS.IRIDESCENCE_ON)
     - use four shifting radial gradients:
       - one large one as a border to the entire bubble
       - three smaller ones as a specular highlights:
         - these independently randomly shift:
           - relative positions
           - size (stop2 percentage)
           - hue
         - these share the same overall size/dimensions of the parent ball (even when squishing)
         - play with the f values and other properties of the radial gradient
         - create a separate project just for this
       - each ball should have the same colors and relative positions for their highlights
       - I will need to create new parameters in the colorShifter in order to transition the HUE for these four gradients
 *** - (PARAMS.POPPING_ON, PARAMS.POP_SPEED, PARAMS.MIN_POP_CHILDREN, PARAMS.MAX_POP_CHILDREN)
     - when tapping within the bounds of a bubble, pop it automatically
     - popping causes nearby bubbles to increase in speed away from the pop
     - larger bubbles have more force when popping
 ** - add a simple GUI for all of the params (PARAMS.GUI_CONTROLS_ON)
 * - add blur/focus listeners to the window to prevent crazy-ball syndrome?
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
 -- aggregate awareness/behaviors: -----------
 -- sardines: --------
 -
 -- butterflies: --------
 - flap wings that can be any arbitrary shape
 - simply reflect the shape to create the second wing
 - simply skew the shapes to imitate flapping
 -----------------------------------------------
 */