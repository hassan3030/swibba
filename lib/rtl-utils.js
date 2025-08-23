// RTL/LTR Utility System
export const rtlUtils = {
  flexDirection: {
    row: 'flex-row rtl:flex-row-reverse',
    rowReverse: 'flex-row-reverse rtl:flex-row',
    col: 'flex-col',
    colReverse: 'flex-col-reverse',
  },
  justify: {
    start: 'justify-start rtl:justify-end',
    end: 'justify-end rtl:justify-start',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  },
  items: {
    start: 'items-start rtl:items-end',
    end: 'items-end rtl:items-start',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  },
  self: {
    start: 'self-start rtl:self-end',
    end: 'self-end rtl:self-start',
    center: 'self-center',
    baseline: 'self-baseline',
    stretch: 'self-stretch',
  },
}

// CSS-in-JS RTL utilities
export const rtlCSS = {
  getSpacing: (direction, size) => {
    if (direction === 'rtl') {
      return { marginRight: size, marginLeft: 0 }
    }
    return { marginLeft: size, marginRight: 0 }
  },
  getPosition: (direction, property, value) => {
    if (direction === 'rtl') {
      return property === 'left' ? { right: value, left: 'auto' } : { left: value, right: 'auto' }
    }
    return { [property]: value }
  },
  getTransform: (direction, value) => {
    if (direction === 'rtl') {
      return { transform: `translateX(-${value})` }
    }
    return { transform: `translateX(${value})` }
  },
}

export const useRTLStyles = (direction) => {
  const isRTL = direction === 'rtl'
  return {
    classes: {
      container: 'flex rtl:flex-row-reverse',
      textCenter: 'text-center',
    },
    styles: {
      marginStart: isRTL ? { marginRight: '1rem' } : { marginLeft: '1rem' },
      marginEnd: isRTL ? { marginLeft: '1rem' } : { marginRight: '1rem' },
    },
  }
}

export const withDirection = (Component) => (props) => {
  const direction = props.direction || 'ltr'
  const rtlStyles = useRTLStyles(direction)
  return <Component {...props} rtlStyles={rtlStyles} direction={direction} />
}

export default {
  rtlUtils,
  rtlCSS,
  useRTLStyles,
  withDirection,
}
