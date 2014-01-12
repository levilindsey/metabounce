var ballHandler = (function() {
  var balls, svg, svgDefs, viewport;

  function init(svgElement, defsElement, viewportDimensions, time) {
    var i;

    svg = svgElement;
    svgDefs = defsElement;
    viewport = viewportDimensions;

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

      radiusGrowthRate = PARAMS.GROWING_ON ? parent.radiusGrowthRate * PARAMS.CHILD.RADIUS_GROWTH_RATIO : 0;
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

      radiusGrowthRate = PARAMS.GROWING_ON ?
          util.getRandom(PARAMS.BASE.MIN_RADIUS_GROWTH_RATE, PARAMS.BASE.MAX_RADIUS_GROWTH_RATE) : 0;
    }
    color = colorShifter.createNewColor();
    mass = util.getRandom(PARAMS.MIN_DENSITY, PARAMS.MAX_DENSITY) * Math.PI * radius * radius;

    spawnNewBallsOnPop = PARAMS.POPPING_ON && index % PARAMS.POP.NEW_BALL_SPAWN_COUNT === 0;

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
    colorShifter.updateShine(ball.iridescenceTransitions, ball.specularityTransitions, time + 1, ball.squish.rotation);
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

  function update(time, deltaTime) {
    updateBalls(balls, time, deltaTime);
  }

  function updateBalls(balls, time, deltaTime) {
    var newBallSets;

    updateBallsOldVelocities(balls);
    updateBallsRadii(balls, deltaTime);
    updateBallsMotions(balls, time, deltaTime);
    newBallSets = handleBallsPops(balls, time);
    updateBallsColors(balls, time);
    updateBallsShines(balls, time);
    applyBallsParams(balls);

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
    if (PARAMS.GROWING_ON) {
      balls.forEach(function(ball) {
          ball.radius += ball.radiusGrowthRate * deltaTime;
      });
    }
  }

  function updateBallsMotions(balls, time, deltaTime) {
    balls.forEach(function(ball) {
      handleBallMotion(ball, time, deltaTime, balls);
    });
  }

  function handleBallsPops(balls, time) {
    var i, newBallSets, newBallSet;

    newBallSets = [];

    if (PARAMS.POPPING_ON) {
      for (i = 0; i < balls.length; i++) {
        newBallSet = handlePop(balls[i], balls, time, false);
        if (newBallSet) {
          newBallSets.push(newBallSet);
          i--;
        }
      }
    }

    return newBallSets;
  }

  function updateBallsColors(balls, time) {
    balls.forEach(function(ball) {
      handleBallColorTransition(ball, time);
    });
  }

  function updateBallsShines(balls, time) {
    if (PARAMS.SHINE_ON) {
      balls.forEach(function(ball) {
        colorShifter.updateShine(ball.iridescenceTransitions, ball.specularityTransitions, time, ball.squish.rotation);
      });
    }
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
    var pop, i, newBall, partialParentVel, maxRadius, maxSpeedChangeFromPush, newBallSet, weight1, weight2;

    pop = false;
    newBallSet = null;

    if (ball.parent) {
      if (forcePop ||
          ball.radius > PARAMS.POP.CHILD_RADIUS_RATIO_UPPER_THRESHOLD * ball.parent.radius ||
          util.magnitude(util.vectorDifference(ball.vel, ball.previousVel)) *
              ball.radius >= CHILD_VELOCITY_CHANGE_MAGNITUDE_TIMES_RADIUS_THRESHOLD) {
        pop = true;
      }
    } else {
      if ((forcePop ||
          ball.radius > PARAMS.POP.RADIUS_UPPER_THRESHOLD ||
          util.magnitude(util.vectorDifference(ball.vel, ball.previousVel)) *
              ball.radius >= PARAMS.POP.VELOCITY_CHANGE_MAGNITUDE_TIMES_RADIUS_THRESHOLD) &&
          ball.radius > PARAMS.POP.RADIUS_LOWER_THRESHOLD) {
        pop = true;
      }
    }

    if (pop) {
      // Spawn new balls?
      if (ball.spawnNewBallsOnPop) {
        newBallSet = [];
        partialParentVel = util.scalarVectorProduct(util.magnitude(ball.vel) * PARAMS.POP.NEW_BALL_SPEED_RATIO, util.normalize(ball.vel));
        maxRadius = ball.radius * PARAMS.POP.NEW_BALL_MAX_RADIUS_RATIO;
        for (i = 0; i < PARAMS.POP.NEW_BALL_SPAWN_COUNT; i++) {
          newBall = createBall(time - 1, svg, ball.parent, i, ball.recursiveDepth, ball.pos, maxRadius);
          newBallSet.push(newBall);

          // Base the new ball's position and velocity off of the parent
          newBall.vel = util.vectorAddition(newBall.vel, partialParentVel);
        }
      }

      removeBall(ball, balls);

      weight2 = ball.radius / PARAMS.POP.RADIUS_UPPER_THRESHOLD;
      weight2 = util.applyEasing(weight2, PARAMS.POP.RADIUS_EFFECT_ON_PUSH_STRENGTH_EASING_FUNCTION);
      weight1 = 1 - weight2;
      maxSpeedChangeFromPush = util.getWeightedAverage(0, POP_MAX_SPEED_CHANGE, weight1, weight2);
      pushBallsAway(ball.pos, maxSpeedChangeFromPush, POP_MAX_DISTANCE, balls, time);

      touchAnimator.newPop(ball, time);
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

  function handleTouch(touchPos) {
    var time, intersectedBall, newBallSet;

    console.log('onTouch');

    time = Date.now();
    intersectedBall = getIntersectedBall(touchPos);

    updateBallsOldVelocities(balls);

    if (PARAMS.POPPING_ON && intersectedBall) {
      newBallSet = handlePop(intersectedBall, balls, time, true);
      if (newBallSet) {
        addNewBallSet(newBallSet, balls);
      }
    } else {
      pushBallsAway(touchPos, PARAMS.TOUCH.MAX_SPEED_CHANGE, PARAMS.TOUCH.MAX_DISTANCE, balls, time);
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

  function pushBallsAway(touchPos, maxSpeedChange, maxDistance, balls, time) {
    var newBallSets;

    balls.forEach(function(ball) {
      applyTouchSpeedChange(ball, touchPos, maxSpeedChange, maxDistance, time);
    });

    newBallSets = handleBallsPops(balls, time);
    addNewBallSets(newBallSets, balls);
  }

  function applyTouchSpeedChange(ball, touchPos, maxSpeedChange, maxDistance, time) {
    var distance, touchSpeedChange, touchVelocityChange, normalizedCoaxialVector, weight1, weight2, collisionAngle,
        tangVelocityAndPerpSpeed;

    distance = util.getDistance(touchPos.x, touchPos.y, ball.pos.x, ball.pos.y);
    if (distance < maxDistance) {
      // Calculate the push strength according to the distance
      weight2 = distance / maxDistance;
      weight2 = util.applyEasing(weight2, PARAMS.TOUCH.EFFECT_EASING_FUNCTION);
      weight1 = 1 - weight2;
      touchSpeedChange = util.getWeightedAverage(maxSpeedChange, 0, weight1, weight2);

      // Calculate the effect of the ball size on the push strength
      weight2 = 1 - ball.radius / PARAMS.POP.RADIUS_UPPER_THRESHOLD;
      weight2 = util.applyEasing(weight2, PARAMS.POP.RADIUS_EFFECT_ON_PUSH_STRENGTH_EASING_FUNCTION);
      weight1 = 1 - weight2;
      touchSpeedChange *= util.getWeightedAverage(PARAMS.POP.SPEED_CHANGE_SIZE_MULTIPLIER_MIN, PARAMS.POP.SPEED_CHANGE_SIZE_MULTIPLIER_MAX, weight1, weight2);

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

  function recoverFromWindowBlur(timeLapse) {
    balls.forEach(function(ball) {
      recoverBallFromWindowBlur(ball, timeLapse);
    });
  }

  function recoverBallFromWindowBlur(ball, timeLapse) {
    util.changeStartAndEndTimeFromBlur(ball.color, timeLapse);
    util.changeStartAndEndTimeFromBlur(ball.squish, timeLapse);
    colorShifter.recoverShineTransitionsFromWindowBlur(ball.iridescenceTransitions, timeLapse);
    colorShifter.recoverShineTransitionsFromWindowBlur(ball.specularityTransitions, timeLapse);
    if (ball.children) {
      ball.children.forEach(function(child) {
        recoverBallFromWindowBlur(child, timeLapse);
      });
    }
  }

  return {
    init: init,
    update: update,
    recoverFromWindowBlur: recoverFromWindowBlur,
    handleTouch: handleTouch
  }
})();