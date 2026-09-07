// Premium spring/transition presets for framer-motion

export const SPRING_SNAPPY = { type: 'spring', stiffness: 400, damping: 30 }
export const SPRING_SOFT = { type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }
export const SPRING_BOUNCY = { type: 'spring', stiffness: 300, damping: 20 }
export const SPRING_GENTLE = { type: 'spring', stiffness: 120, damping: 20, mass: 1 }

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]
export const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1]

// Stagger container for children
export const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

// Shared child animation
export const STAGGER_CHILD_UP = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING_SNAPPY, opacity: { duration: 0.4 } },
  },
}

export const STAGGER_CHILD_FADE = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_SOFT, opacity: { duration: 0.3 } },
  },
}

export const STAGGER_CHILD_SCALE = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_BOUNCY,
  },
}

// Text reveal with clip-path (words slide up inside clip)
export const TEXT_REVEAL_LINE = {
  hidden: { opacity: 0, y: 60, rotateX: -20 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { ...SPRING_GENTLE, opacity: { duration: 0.5 } },
  },
}

// 3D tilt hover (returns motion values)
export const TILT_HOVER = {
  rest: { rotateX: 0, rotateY: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  hover: { scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } },
}

// Magnetic button effect
export const MAGNETIC_HOVER = {
  rest: { scale: 1, x: 0, y: 0 },
  hover: { scale: 1.05, transition: SPRING_SNAPPY },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
}

// Page section entrance
export const SECTION_ENTER = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_GENTLE, opacity: { duration: 0.6 } },
  },
}

// Card 3D perspective wrapper style
export const PERSPECTIVE_STYLE = { perspective: 1200 }
