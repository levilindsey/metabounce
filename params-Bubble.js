var PARAMS = {
  // -------------------------------------------- //
  //            v   Play with me!!   v            //
  INTER_BALL_COLLISIONS_ON: true,
  SQUISH_ON: true,
  INDEPENDENT_CHILD_MOVEMENT_ON: false,
  PARENT_CHILD_MOMENTUM_TRANSFER_ON: false,
  SHINE_ON: true,
  POPPING_ON: true,
  GROWING_ON: true,

  GRAVITATIONAL_ACCELERATION: 0.0, // pixels / millis^2

  MIN_DENSITY: 4.75,
  MAX_DENSITY: 5.25,

  COEFF_OF_RESTITUTION: 0.65, // 0 = perfectly INELASTIC collision, 1 = perfectly ELASTIC collision
  COEFF_OF_FRICTION: 0.00001,

  MIN_SQUISHINESS: 0, // how much the ball compresses on impact (from 0 to 1)
  MAX_SQUISHINESS: 0.7,

  COEFF_OF_SQUISHINESS: 0.97,
  INTRA_BALL_COLLISION_SQUISH_STRENGTH_COEFF: 0.9,

  BASE: {
    BALL_COUNT: 5,
    RECURSIVE_DEPTH: 0,

    MIN_RADIUS: 40, // pixels
    MAX_RADIUS: 100,

    MIN_VELOCITY: -0.12, // pixels/millis
    MAX_VELOCITY: 0.12,

    MIN_RADIUS_GROWTH_RATE: 0.0005, // pixels/millis
    MAX_RADIUS_GROWTH_RATE: 0.005 // pixels/millis
  },
  CHILD: {
    MIN_BALL_COUNT: 1,
    MAX_BALL_COUNT: 5,

    MIN_SIZE_RATIO: 0.06,
    MAX_SIZE_RATIO: 0.3,

    MIN_VELOCITY_RATIO: 0.1,
    MAX_VELOCITY_RATIO: 0.5,

    RADIUS_GROWTH_RATIO: 0.9
  },
  POP: {
    VELOCITY_CHANGE_MAGNITUDE_TIMES_RADIUS_THRESHOLD: 80, // pixels^2/millis
    CHILD_VELOCITY_CHANGE_MAGNITUDE_RADIUS_THRESHOLD_RATIO: 0.1,

    RADIUS_UPPER_THRESHOLD: 120,
    RADIUS_LOWER_THRESHOLD: 10,

    CHILD_RADIUS_RATIO_UPPER_THRESHOLD: 0.3,

    NEW_BALL_SPAWN_COUNT: 3,
    NEW_BALL_SPEED_RATIO: 0.35,
    NEW_BALL_MAX_RADIUS_RATIO: 0.6,

    ANIMATION_TO_BALL_RADIUS_RATIO: 1.7,

    POP_TO_TOUCH_MAX_SPEED_CHANGE_RATIO: 4.5,
    POP_TO_TOUCH_MAX_DISTANCE_RATIO: 1.0,

    WHOOSH_OPACITY_RATIO: 0.2,

    SPEED_CHANGE_SIZE_MULTIPLIER_MIN: 0.5,
    SPEED_CHANGE_SIZE_MULTIPLIER_MAX: 6,

    RADIUS_EFFECT_ON_PUSH_STRENGTH_EASING_FUNCTION: 'easeInQuad'
  },
  TOUCH: {
    MAX_SPEED_CHANGE: 0.2, // pixel / millis
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

    OPACITY: 0.001,

    BACKGROUND_IMAGE: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADVSURBVHic7duxDYAwAANBiNgDsf+OgQ1oviBIdxNY33s/z+veFjbG+HrCq7XX/YCAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYCRgJGAkYDRsfoPY8759YRXa9f7AQEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjASMBIwEjAaMHQNgFBphZsIkAAAAASUVORK5CYII=)'
  },
  SHINE: {
    EASING_FUNCTION: 'easeInOutQuad',
    IRIDESCENCE: {
      COUNT: 6,

      GRADIENT_MOVES: true,
      GRADIENT_SIZE_CHANGES: true,

      BORDER_GRADIENT_STOP_OFFSET: 70, // percentage
      BORDER_GRADIENT_OPACITY_RATIO: 0.27,

      MIN_TRANSITION_TIME: 3000,
      MAX_TRANSITION_TIME: 5000,

      MIN_OPACITY: 0.0001, // from 0 to 1
      MAX_OPACITY: 0.15,

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
  },
  AUTO_TOUCHES: [
    {
      POS_RATIO: { X: 0.95, Y: 0.05 },
      TIME: 1000
    },
    {
      POS_RATIO: { X: 0.05, Y: 0.95 },
      TIME: 1200
    },
    {
      POS_RATIO: { X: 0.8, Y: 0.2 },
      TIME: 1600
    },
    {
      POS_RATIO: { X: 0.2, Y: 0.8 },
      TIME: 2400
    },
    {
      POS_RATIO: { X: 0.5, Y: 0.5 },
      TIME: 4000
    }
  ]
  // -------------------------------------------- //
};