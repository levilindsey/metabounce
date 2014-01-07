/* --- THIS PROJECT IS STILL A WORK IN PROGRESS --- */
(function() {

// ------------------------------------------------ //
// Params

  var PARAMS = {
    // -------------------------------------------- //
    //            v   Play with me!!   v            //
    INTER_BALL_COLLISIONS_ON: true,
    SQUISH_ON: false,
    INDEPENDENT_CHILD_MOVEMENT_ON: false,
    PARENT_CHILD_MOMENTUM_TRANSFER_ON: false,
    SHINE_ON: true,
    POPPING_ON: true,
    GROWING_ON: true,

    GRAVITATIONAL_ACCELERATION: 0.00001, // pixels / millis^2

    MIN_DENSITY: 4.75,
    MAX_DENSITY: 5.25,

    COEFF_OF_RESTITUTION: 0.65, // 0 = perfectly INELASTIC collision, 1 = perfectly ELASTIC collision
    COEFF_OF_FRICTION: 0.00001,

    MIN_SQUISHINESS: 0, // how much the ball compresses on impact (from 0 to 1)
    MAX_SQUISHINESS: 0.7,

    COEFF_OF_SQUISHINESS: 0.37,
    INTRA_BALL_COLLISION_SQUISH_STRENGTH_COEFF: 0.9,

    MIN_RADIUS_GROWTH_RATE: 0.0005, // pixels/millis
    MAX_RADIUS_GROWTH_RATE: 0.003, // pixels/millis

    BASE: {
      BALL_COUNT: 5,
      RECURSIVE_DEPTH: 0,

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
    POP: {
      VELOCITY_CHANGE_MAGNITUDE_TIMES_RADIUS_THRESHOLD: 80, // pixels^2/millis
      RADIUS_UPPER_THRESHOLD: 120,
      RADIUS_LOWER_THRESHOLD: 10,
      NEW_BALL_SPAWN_COUNT: 3,
      NEW_BALL_SPEED_RATIO: 0.35,
      NEW_BALL_MAX_RADIUS_RATIO: 0.6,
      ANIMATION_TO_BALL_RADIUS_RATIO: 1.7,
      POP_TO_TOUCH_MAX_SPEED_CHANGE_RATIO: 1.8,
      WHOOSH_OPACITY_RATIO: 0.2
    },
    TOUCH: {
      MAX_SPEED_CHANGE: 1.5, // pixel / millis
      MAX_DISTANCE: 320, // pixels
      EFFECT_EASING_FUNCTION: 'linear'
    },
    COLOR: {
      MINOR_EASING_FUNCTION: 'easeInOutQuad',
      MIN_MINOR_TRANSITION_TIME: 2000, // milliseconds
      MAX_MINOR_TRANSITION_TIME: 4000,

      MAJOR_EASING_FUNCTION: 'easeInOutQuad',
      MIN_MAJOR_TRANSITION_TIME: 4000, // milliseconds
      MAX_MAJOR_TRANSITION_TIME: 7000,

      MIN_HUE: 0, // from 0 to 360
      MAX_HUE: 360,

      MIN_SATURATION: 0, // percentage
      MAX_SATURATION: 100,

      MIN_LIGHTNESS: 0, // percentage
      MAX_LIGHTNESS: 100,

      OPACITY: 0.05,

      BACKGROUND_IMAGE: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADVSURBVHic7duxDYAwAANBiNgDsf+OgQ1oviBIdxNY33s/z+veFjbG+HrCq7XX/YCAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYDRsfoPY8759YRXa9f7AQEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjAaMHQNgFBphZsIkAAAAASUVORK5CYII=)'
    },
    SHINE: {
      EASING_FUNCTION: 'easeInOutQuad',
      IRIDESCENCE: {
        COUNT: 6,

        GRADIENT_MOVES: true,
        GRADIENT_SIZE_CHANGES: true,

        BORDER_GRADIENT_STOP_OFFSET: 60, // percentage
        BORDER_GRADIENT_OPACITY_RATIO: 0.4,

        MIN_TRANSITION_TIME: 3000,
        MAX_TRANSITION_TIME: 5000,

        MIN_OPACITY: 0.01, // from 0 to 1
        MAX_OPACITY: 0.17,

        MIN_RADIUS: 25, // percentage
        MAX_RADIUS: 40,

        SATURATION: 100, // percentage
        LIGHTNESS: 60, // percentage

        MIN_CENTER_RADIUS: 0, // from 0 to 50
        MAX_CENTER_RADIUS: 45, // from 0 to 50

        MAX_CENTER_ANGLE_DIFF: Math.PI * 0.5, // from 0 to 2PI
        MAX_F_DELTA_RATIO: 0.5 // from 0 to 1
      },
      SPECULARITY: {
        COUNT: 0,

        GRADIENT_MOVES: false,
        GRADIENT_SIZE_CHANGES: false,

        MIN_TRANSITION_TIME: 3000,
        MAX_TRANSITION_TIME: 5000,

        MIN_OPACITY: 0.1, // from 0 to 1
        MAX_OPACITY: 0.999,

        MIN_RADIUS: 1, // percentage
        MAX_RADIUS: 15,

        SATURATION: 100, // percentage
        LIGHTNESS: 90, // percentage

        MIN_CENTER_RADIUS: 0, // from 0 to 50
        MAX_CENTER_RADIUS: 50, // from 0 to 50

        MAX_CENTER_ANGLE_DIFF: Math.PI / 2, // from 0 to 2PI
        MAX_F_DELTA_RATIO: 0.66 // from 0 to 1
      }
    },
    ANIMATION: {
      WHOOSH: {
        DURATION: 300, // millis
        EASING_FUNCTION: 'linear',
        STROKE_WIDTH: 2,
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
        START_OPACITY: 0.4, // from 0 to 1
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
      },
      DISSOLVE: {
        DURATION: 210, // millis
        EASING_FUNCTION: 'easeInQuad',
        END_RADIUS_RATIO: 0.33,
        DOT_DENSITY: 1.0,
        START_OPACITY: 0.5, // from 0 to 1
        END_OPACITY: 0.05,
        SATURATION: 20, // percentage
        LIGHTNESS: 40, // percentage
        DOT_WIDTH_EASING_FUNCTION: 'easeOutQuad',
        DOT_HALF_WIDTH_START: 9,
        DOT_HALF_WIDTH_END: 1,
        DOT_HEIGHT_EASING_FUNCTION: 'easeInQuad',
        DOT_HALF_HEIGHT_START: 1,
        DOT_HALF_HEIGHT_END: 7
      }
    }
    // -------------------------------------------- //
  };

  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg',
    HALF_PI = Math.PI * 0.5,
    THREE_HALVES_PI = Math.PI * 1.5,
    TWO_PI = Math.PI * 2,
    RAD_TO_DEG = 180 / Math.PI,
    COEFF_OF_FRICTION_INVERSE = 1 - PARAMS.COEFF_OF_FRICTION,
    SQUISH_ENABLED = PARAMS.SQUISH_ON && PARAMS.MAX_SQUISHINESS > 0 && PARAMS.COEFF_OF_SQUISHINESS > 0,
    SQUISH_COMPRESS_EASING_FUNCTION = 'easeOutQuad',
    SQUISH_EXPAND_EASING_FUNCTION = 'easeInQuad',
    SQUISH_MIN_RADIUS_EASING_FUNCTION = 'easeOutQuad',
    DISSOLVE_ANIMATION_DOTS_PER_CIRCUMFERENCE_UNIT = 1 / (PARAMS.ANIMATION.DISSOLVE.DOT_HALF_WIDTH_START * 2) * PARAMS.ANIMATION.DISSOLVE.DOT_DENSITY;

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
    createMiscElements();
    colorShifter.init(svgDefs, currentTime);
    createBalls(currentTime);
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
    updateBalls(balls, currentTime, deltaTime);

    previousTime = currentTime;
    util.myRequestAnimationFrame(animationLoop);
  }

  function updateBalls(balls, time, deltaTime) {
    var newBallSets;

    updateBallsOldVelocities(balls);
    updateBallsRadii(balls, deltaTime);
    updateBallsMotions(balls, time, deltaTime);
    newBallSets = handleBallsPops(balls, time);
    updateBallsColors(balls, time);
    applyBallsParams(balls);
    // TODO: I probably want to reincorporate all of these functions back into a single loop, and then merge the collections returned from handlePop back into the main collection afterward, but would these functions still work for recursion? (do a speed comparison between the two?) (or just google whether multiple loops would hurt?)

    // Recurse
    balls.forEach(function(ball) {
      if (ball.children) {
        updateBalls(ball.children, time, deltaTime);
      }
    });

    addNewBallSets(newBallSets, balls);
  }

  function updateBallsOldVelocities(balls) {
    balls.forEach(function(ball) {
      ball.previousVel.x = ball.vel.x;
      ball.previousVel.y = ball.vel.y;

      if (ball.children) {
        updateBallsOldVelocities(ball.children);
      }
    });
  }

  function updateBallsRadii(balls, deltaTime) {
    balls.forEach(function(ball) {
      if (PARAMS.GROWING_ON) {
        ball.radius += ball.radiusGrowthRate * deltaTime;
      }
    });
  }

  function updateBallsMotions(balls, time, deltaTime) {
    balls.forEach(function(ball) {
      handleBallMotion(ball, time, deltaTime, balls);
    });
  }

  function handleBallsPops(balls, time) {
    var i, newBallSets, newBallSet;

    newBallSets = [];

    for (i = 0; i < balls.length; i++) {
      newBallSet = handlePop(balls[i], balls, time, false);
      if (newBallSet) {
        newBallSets.push(newBallSet);
        i--;
      }
    }

    return newBallSets;
  }

  function updateBallsColors(balls, time) {
    balls.forEach(function(ball) {
      handleBallColorTransition(ball, time);
    });
  }

  function applyBallsParams(balls) {
    balls.forEach(function(ball) {
      applyBallParams(ball);
    });
  }

  function addNewBallSets(newBallSets, balls) {
    newBallSets.forEach(function(newBallSet) {
      addNewBallSet(newBallSet, balls);
    });
  }

  function addNewBallSet(newBallSet, balls) {
    newBallSet.forEach(function(ball) {
      ball.index = balls.length;
      balls.push(ball);
    });
  }

  function createMiscElements() {
    var body;

    body = document.getElementsByTagName('body')[0];
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.margin = '0px';
    body.style.backgroundImage = PARAMS.COLOR.BACKGROUND_IMAGE;
    //body.style.background = '#222';

    svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '2147483647';
    body.appendChild(svg);

    svgDefs = document.createElementNS(SVG_NAMESPACE, 'defs');
    svg.appendChild(svgDefs);
  }

  function createBalls(time) {
    var i;

    balls = [];
    for (i = 0; i < PARAMS.BASE.BALL_COUNT; i++) {
      balls[i] = createBall(time, svg, null, i, PARAMS.BASE.RECURSIVE_DEPTH, null, null);
    }
  }

  function createBall(time, svg, parent, index, recursiveDepth, forcedPos, maxRadius) {
    var ball, children, element, color, radius, angle, distance, posX, posY, velX, velY, mass, shineGradientTransitions,
      shineElement, i, childCount, spawnNewBallsOnPop, radiusGrowthRate;

    children = null;

    if (parent) {
      if (maxRadius) {
        maxRadius = Math.min(maxRadius, PARAMS.CHILD.MAX_SIZE_RATIO * parent.radius);
        radius = util.getRandom(PARAMS.CHILD.MIN_SIZE_RATIO * parent.radius, maxRadius);
      } else {
        radius = util.getRandom(PARAMS.CHILD.MIN_SIZE_RATIO, PARAMS.CHILD.MAX_SIZE_RATIO) * parent.radius;
      }
      angle = util.getRandom(0, TWO_PI);
      distance = util.getRandom(0, radius);
      if (forcedPos) {
        posX = forcedPos.x;
        posY = forcedPos.y;
      } else {
        posX = parent.pos.x + distance * Math.cos(angle);
        posY = parent.pos.y + distance * Math.sin(angle);
      }
      velX = util.getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.x;
      velY = util.getRandom(PARAMS.CHILD.MIN_VELOCITY_RATIO, PARAMS.CHILD.MAX_VELOCITY_RATIO) * parent.vel.y;
    } else {
      if (maxRadius) {
        maxRadius = Math.min(maxRadius, PARAMS.BASE.MAX_RADIUS);
        radius = util.getRandom(PARAMS.BASE.MIN_RADIUS, maxRadius);
      } else {
        radius = util.getRandom(PARAMS.BASE.MIN_RADIUS, PARAMS.BASE.MAX_RADIUS);
      }
      if (forcedPos) {
        posX = forcedPos.x;
        posY = forcedPos.y;
      } else {
        posX = viewport.width / 2;
        posY = viewport.height / 2;
      }
      velX = util.getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
      velY = util.getRandom(PARAMS.BASE.MIN_VELOCITY, PARAMS.BASE.MAX_VELOCITY);
    }
    color = colorShifter.createNewColor();
    mass = util.getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;

    spawnNewBallsOnPop = PARAMS.POPPING_ON && index % PARAMS.POP.NEW_BALL_SPAWN_COUNT === 0;

    radiusGrowthRate = PARAMS.GROWING_ON ?
      util.getRandom(PARAMS.MIN_RADIUS_GROWTH_RATE, PARAMS.MAX_RADIUS_GROWTH_RATE) : 0;

    element = document.createElementNS(SVG_NAMESPACE, 'ellipse');
    svg.appendChild(element);

    shineGradientTransitions = colorShifter.createShineGradientTransitions(time);
    shineGradientTransitions.iridescenceTransitions.forEach(function(gradientTransition) {
      shineElement = document.createElementNS(SVG_NAMESPACE, 'ellipse');
      shineElement.setAttribute('fill', 'url(#' + gradientTransition.gradient.id + ')');
      svg.appendChild(shineElement);
      gradientTransition.element = shineElement;
    });
    shineGradientTransitions.specularityTransitions.forEach(function(gradientTransition) {
      shineElement = document.createElementNS(SVG_NAMESPACE, 'ellipse');
      shineElement.setAttribute('fill', 'url(#' + gradientTransition.gradient.id + ')');
      svg.appendChild(shineElement);
      gradientTransition.element = shineElement;
    });

    ball = {
      parent: parent,
      children: children,
      index: index,
      element: element,
      iridescenceTransitions: shineGradientTransitions.iridescenceTransitions,
      specularityTransitions: shineGradientTransitions.specularityTransitions,
      spawnNewBallsOnPop: spawnNewBallsOnPop,
      radiusGrowthRate: radiusGrowthRate,
      recursiveDepth: recursiveDepth,
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
      previousVel: {
        x: velX,
        y: velY
      },
      mass: mass
    };

    handleBallColorTransition(ball, time + 1);
    applyBallParams(ball);

    // Recursively create child balls
    if (--recursiveDepth >= 0) {
      children = [];
      childCount = util.getRandom(PARAMS.CHILD.MIN_BALL_COUNT, PARAMS.CHILD.MAX_BALL_COUNT);
      for (i = 0; i < childCount; i++) {
        children[i] = createBall(time, svg, ball, i, recursiveDepth, null, null);
      }
      ball.children = children;
    }

    return ball;
  }

  function removeBall(ball, balls) {
    var i, count;

    if (balls) {
      // Update the other balls indices
      for (i = ball.index + 1, count = balls.length; i < count; i++) {
        balls[i].index--;
      }
      balls.splice(ball.index, 1);
    }

    svg.removeChild(ball.element);
    ball.iridescenceTransitions.forEach(cleanUpGradientDOMElements);
    ball.specularityTransitions.forEach(cleanUpGradientDOMElements);

    // Recursively remove any child balls
    if (ball.children) {
      ball.children.forEach(function(child) {
        removeBall(child, null);
      });
    }

    function cleanUpGradientDOMElements(gradientTransition) {
      gradientTransition.gradient.removeChild(gradientTransition.stop1);
      gradientTransition.gradient.removeChild(gradientTransition.stop2);
      svgDefs.removeChild(gradientTransition.gradient);
      svg.removeChild(gradientTransition.element);
    }
  }

  // --- NOTES ABOUT MY COLLISION ALGORITHM: --- //
  // - I consider two balls to be colliding when they are overlapping.
  // - When a collision is detected, the balls have obviously moved past the actual point of intersection--i.e., the
  //   moment of intersection occurred between timesteps. My simple and efficient solution to this problem, is to
  //   position one of the balls exactly on the edge of the other (or the wall), and to then calculate the resulting
  //   properties from the collision.
  function handleBallMotion(ball, time, deltaTime, balls) {
    var newPos, maxPosX, maxPosY, newVel, distance, maxDistance, collisionAngle, offset, i, velocities, count,
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
    if (PARAMS.INTER_BALL_COLLISIONS_ON) {
      for (i = ball.index + 1, count = balls.length; i < count; i++) {
        distance = util.getDistance(newPos.x, newPos.y, balls[i].pos.x, balls[i].pos.y);
        // Is there overlap between the balls?
        if (distance < ball.radius + balls[i].radius) {
          // Are the balls actually nearing each other?
          relativeVelocity = util.vectorDifference(newVel, balls[i].vel);
          coaxialVector = util.vectorDifference(balls[i].pos, newPos);
          ballsAreNearing = util.dotProduct(relativeVelocity, coaxialVector) > 0;
          if (ballsAreNearing) {
            // Calculate some properties of the collision
            collisionAngle = Math.atan2(balls[i].pos.y - newPos.y, balls[i].pos.x - newPos.x);
            velocities = util.inellasticCollision(
                newPos, newVel, ball.mass,
              balls[i].pos, balls[i].vel, balls[i].mass);

            // Record the new velocity
            newVel = velocities.vf1;
            newPos = ball.pos;
            wasCollisionWithWall = false;

            // Squish the other ball
            squishHandledPositioning = handleSquish(balls[i], false, collisionAngle + Math.PI, velocities && velocities.tangVelocity2, velocities && velocities.perpSpeedI2, velocities && velocities.perpSpeedF2, time, deltaTime, false);
            saveNewBallParams(balls[i], squishHandledPositioning, balls[i].pos, velocities.vf2);

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
        if (PARAMS.PARENT_CHILD_MOMENTUM_TRANSFER_ON) {
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

  function handlePop(ball, balls, time, forcePop) {
    var i, newBall, parentHalfVel, maxRadius, maxSpeedChangeFromPush, newBallSet;

    newBallSet = null;

    if (PARAMS.POPPING_ON) {
      if ((forcePop ||
            ball.radius > PARAMS.POP.RADIUS_UPPER_THRESHOLD ||
            util.magnitude(util.vectorDifference(ball.vel, ball.previousVel)) *
              ball.radius >= PARAMS.POP.VELOCITY_CHANGE_MAGNITUDE_TIMES_RADIUS_THRESHOLD) &&
          ball.radius > PARAMS.POP.RADIUS_LOWER_THRESHOLD) {
        // Spawn new balls?
        if (ball.spawnNewBallsOnPop) {
          newBallSet = [];
          parentHalfVel = util.scalarVectorProduct(util.magnitude(ball.vel) * PARAMS.POP.NEW_BALL_SPEED_RATIO, util.normalize(ball.vel));
          maxRadius = ball.radius * PARAMS.POP.NEW_BALL_MAX_RADIUS_RATIO;
          for (i = 0; i < PARAMS.POP.NEW_BALL_SPAWN_COUNT; i++) {
            newBall = createBall(time - 1, svg, ball.parent, i, ball.recursiveDepth, ball.pos, maxRadius);
            newBallSet.push(newBall);

            // Base the new ball's position and velocity off of the parent
            newBall.vel = util.vectorAddition(newBall.vel, parentHalfVel);
          }
        }

        removeBall(ball, balls);

        maxSpeedChangeFromPush = PARAMS.TOUCH.MAX_SPEED_CHANGE * PARAMS.POP.POP_TO_TOUCH_MAX_SPEED_CHANGE_RATIO * ball.radius / PARAMS.POP.RADIUS_UPPER_THRESHOLD;
        pushBallsAway(ball.pos, maxSpeedChangeFromPush, balls, time);

        touchAnimator.newPop(ball, time);
      }
    }

    return newBallSet;
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
    if (PARAMS.INDEPENDENT_CHILD_MOVEMENT_ON || ball.squish.isSquishing) {
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
    var posX, posY, deltaR, rx;

    posX = ball.pos.x;
    posY = ball.pos.y;
    if (ball.squish.isSquishing) {
      deltaR = ball.radius - ball.squish.currentRx;
      posX += deltaR * Math.cos(ball.squish.rotation);
      posY += deltaR * Math.sin(ball.squish.rotation);
      rx = ball.squish.currentRx;
    } else {
      rx = ball.radius;
    }

    ball.element.style.opacity = PARAMS.COLOR.OPACITY;
    ball.element.setAttribute('fill', util.colorToString(ball.color.current));
    ball.element.setAttribute('cx', posX);
    ball.element.setAttribute('cy', posY);
    ball.element.setAttribute('rx', rx);
    ball.element.setAttribute('ry', ball.radius);
    ball.element.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');

    ball.specularityTransitions.forEach(function(gradientTransition) {
      // Update the svg element that holds the gradient
      gradientTransition.element.setAttribute('cx', posX);
      gradientTransition.element.setAttribute('cy', posY);
      gradientTransition.element.setAttribute('rx', rx);
      gradientTransition.element.setAttribute('ry', ball.radius);
      gradientTransition.element.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');
    });

    ball.iridescenceTransitions.forEach(function(gradientTransition) {
      // Update the svg element that holds the gradient
      gradientTransition.element.setAttribute('cx', posX);
      gradientTransition.element.setAttribute('cy', posY);
      gradientTransition.element.setAttribute('rx', rx);
      gradientTransition.element.setAttribute('ry', ball.radius);
      gradientTransition.element.setAttribute('transform', 'rotate(' + ball.rotation + ' ' + posX + ' ' + posY + ')');
    });
  }

  function onTouch(touchPos) {
    var time, intersectedBall, newBallSet;

    time = Date.now();
    intersectedBall = getIntersectedBall(touchPos);

    if (intersectedBall) {
      newBallSet = handlePop(intersectedBall, balls, time, true);
      if (newBallSet) {
        addNewBallSet(newBallSet, balls);
      }
    } else {
      pushBallsAway(touchPos, PARAMS.TOUCH.MAX_SPEED_CHANGE, balls, time);
      touchAnimator.newTouch(touchPos, time);
    }
  }

  function getIntersectedBall(touchPos) {
    var i, count, distance;

    for (i = 0, count = balls.length; i < count; i++) {
      distance = util.getDistance(touchPos.x, touchPos.y, balls[i].pos.x, balls[i].pos.y);
      if (distance < balls[i].radius) {
        return balls[i];
      }
    }

    return null;
  }

  function pushBallsAway(touchPos, maxSpeedChange, balls, time) {
    var newBallSets;

    updateBallsOldVelocities(balls);

    balls.forEach(function(ball) {
      applyTouchSpeedChange(ball, touchPos, maxSpeedChange, time);
    });

    newBallSets = handleBallsPops(balls, time);
    addNewBallSets(newBallSets, balls);
  }

  function applyTouchSpeedChange(ball, touchPos, maxSpeedChange, time) {
    var distance, touchSpeedChange, touchVelocityChange, normalizedCoaxialVector, weight1, weight2, collisionAngle,
        tangVelocityAndPerpSpeed;

    distance = util.getDistance(touchPos.x, touchPos.y, ball.pos.x, ball.pos.y);
    if (distance < PARAMS.TOUCH.MAX_DISTANCE) {
      // Calculate the strength of the touch
      weight2 = distance / PARAMS.TOUCH.MAX_DISTANCE;
      weight2 = util.applyEasing(weight2, PARAMS.TOUCH.EFFECT_EASING_FUNCTION);
      weight1 = 1 - weight2;
      touchSpeedChange = util.getWeightedAverage(maxSpeedChange, 0, weight1, weight2);
      // TODO: the touchSpeedChange should also take into account the mass of the ball

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

  function handleBallColorTransition(ball, time) {
    var duration, weight1, weight2;

    if (ball.color.endTime < time) {
      createNewBallColorTransition(ball);
    }

    duration = ball.color.endTime - ball.color.startTime;
    weight2 = (time - ball.color.startTime) / duration;
    weight2 = util.applyEasing(weight2, PARAMS.COLOR.MINOR_EASING_FUNCTION);
    weight1 = 1 - weight2;
    ball.color.current = util.interpolateColors(ball.color.start, ball.color.end, weight1, weight2);

    colorShifter.updateShine(ball.iridescenceTransitions, ball.specularityTransitions, time, ball.squish.rotation);
  }

  function createNewBallColorTransition(ball) {
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

    return {
      init: init,
      newTouch: newTouch,
      newPop: newPop,
      update: update
    };
  })();

  // ---------------------------------------------- //
  // colorShifter

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

      if (PARAMS.SHINE_ON) { // TODO: move this test elsewhere (and in general, think of where to put tests like this)
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
      createNewColor: createNewColor,
      createShineGradientTransitions: createShineGradientTransitions
    }
  })();

  // ---------------------------------------------- //
  // util

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
      getPageXY: getPageXY,
      determineViewportDimensions: determineViewportDimensions,
      myRequestAnimationFrame: function(callback) {
        myRequestAnimationFrame.call(window, callback);
      }
    };
  })();

  // ---------------------------------------------- //
})();
/*
 --- TODO --------------------------------------
 ***** - create three artificial taps at equidistant locations off-center at the start (PARAMS.INITIAL_TAPS_ON)
 *** - the touchSpeedChange should also take into account the mass of the ball
 ** - pop internal balls (PARAMS.POP.CHILD_RADIUS_RATIO_UPPER_THRESHOLD, PARAMS.POP.CHILD_RADIUS_RATIO_GROWTH)
 ** - add blur/focus listeners to the window to prevent crazy-ball syndrome?
      - can I just manually change the deltaTime when this happens? or will any of the functions break with the crazy long time param itself?
 * - refactor the code
     - where I place if statements, so I prevent extra computations
     - re-package code, so that things are more clumped into modules, and functions do NOT need to reference external member variables whenever possible
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