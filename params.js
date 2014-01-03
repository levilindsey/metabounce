var PARAMS = {
  // -------------------------------------------- //
  //            v   Play with me!!   v            //
  INTER_BALL_COLLISIONS: true,
  INDEPENDENT_CHILD_MOVEMENT: false,
  PARENT_CHILD_MOMENTUM_TRANSFER: false,

  GRAVITATIONAL_ACCELERATION: 0.00001, // pixels / millis^2

  MIN_DENSITY: 4.75,
  MAX_DENSITY: 5.25,

  COEFF_OF_RESTITUTION: 0.65, // 0 = perfectly INELASTIC collision, 1 = perfectly ELASTIC collision
  COEFF_OF_FRICTION: 0.00001,

  MIN_SQUISHINESS: 0, // how much the ball compresses on impact (from 0 to 1)
  MAX_SQUISHINESS: 0.7,

  COEFF_OF_SQUISHINESS: 0.37,
  INTRA_BALL_COLLISION_SQUISH_STRENGTH_COEFF: 0.9,

  BASE: {
    BALL_COUNT: 6,
    RECURSIVE_DEPTH: 0,

    OPACITY: 0.6,

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
  COLOR: {
    MINOR_EASING_FUNCTION: 'easeInOutQuad',
    MIN_MINOR_TRANSITION_TIME: 1000, // milliseconds
    MAX_MINOR_TRANSITION_TIME: 3000,

    MAJOR_EASING_FUNCTION: 'easeInOutQuad',
    MIN_MAJOR_TRANSITION_TIME: 2000, // milliseconds
    MAX_MAJOR_TRANSITION_TIME: 5000,

    MIN_HUE: 0, // from 0 to 360
    MAX_HUE: 360,

    MIN_SATURATION: 0, // percentage
    MAX_SATURATION: 100,

    MIN_LIGHTNESS: 0, // percentage
    MAX_LIGHTNESS: 100,

    BACKGROUND: '#222222'
  },
  TOUCH: {
    MAX_SPEED_CHANGE: 1.5, // pixel / millis
    MAX_DISTANCE: 250, // pixels
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
  // -------------------------------------------- //
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