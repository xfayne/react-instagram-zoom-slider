import React, { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, interpolate, animated, useTransition } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import styled, { css } from 'styled-components';

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var defaultProps = {
  initialSlide: 0,
  maxScale: 4,
  minScale: 1,
  slideIndicatorTimeout: 5000,
  activeDotColor: '#4e99e9',
  dotColor: '#dadbdc'
};

function getLengthOfLine(point1, point2) {
  var middlePoint = {
    clientX: point2.clientX,
    clientY: point1.clientY
  };
  var legX = Math.abs(middlePoint.clientX - point1.clientX);
  var legY = Math.abs(middlePoint.clientY - point2.clientY);
  return Math.sqrt(Math.pow(legX, 2) + Math.pow(legY, 2));
}
function getMiddleOfLine(point1, point2) {
  return {
    clientX: Math.min(point2.clientX, point1.clientX) + Math.abs(point2.clientX - point1.clientX) / 2,
    clientY: Math.min(point2.clientY, point1.clientY) + Math.abs(point2.clientY - point1.clientY) / 2
  };
}
function getMiddleTouchOnElement(touches, boundingRect) {
  var middleTouch = getMiddleOfLine(touches[0], touches[1]);
  return {
    clientX: middleTouch.clientX - boundingRect.left,
    clientY: middleTouch.clientY - boundingRect.top
  };
}
function isTouchesInsideRect(touches, rect) {
  return Array.prototype.every.call(touches, function (touch) {
    return touch.clientX <= rect.right && touch.clientX >= rect.left && touch.clientY <= rect.bottom && touch.clientY >= rect.top;
  });
}
function clamp(value, min, max) {
  return Math.min(Math.max(min, value), max);
}

function useSlider(_ref) {
  var initialSlide = _ref.initialSlide,
      slides = _ref.slides;

  var _useSpring = useSpring(function () {
    return {
      x: typeof window !== 'undefined' ? -window.innerWidth * initialSlide : 0,
      scale: 1,
      config: {
        tension: 270,
        clamp: true
      }
    };
  }),
      _useSpring2 = _slicedToArray(_useSpring, 2),
      _useSpring2$ = _useSpring2[0],
      x = _useSpring2$.x,
      scale = _useSpring2$.scale,
      set = _useSpring2[1];

  var index = useRef(initialSlide); // Slide numbers (for display purposes only)

  var _useState = useState(initialSlide),
      _useState2 = _slicedToArray(_useState, 2),
      currentSlide = _useState2[0],
      updateSlide = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      zooming = _useState4[0],
      setZooming = _useState4[1];

  var onScale = useCallback(function (slideProps) {
    set({
      scale: slideProps.scale
    });

    if (slideProps.scale === 1) {
      setZooming(false);
    } else {
      setZooming(true);
    }
  }, [set]);
  var bind = useDrag(function (_ref2) {
    var down = _ref2.down,
        _ref2$movement = _slicedToArray(_ref2.movement, 1),
        xMovement = _ref2$movement[0],
        _ref2$direction = _slicedToArray(_ref2.direction, 1),
        xDir = _ref2$direction[0],
        distance = _ref2.distance,
        _ref2$swipe = _slicedToArray(_ref2.swipe, 1),
        swipeX = _ref2$swipe[0],
        cancel = _ref2.cancel,
        touches = _ref2.touches;

    // We don't want to interrupt the pinch-to-zoom gesture
    if (touches > 1) {
      cancel();
    } // We have swiped past halfway


    if (!down && distance > window.innerWidth / 2) {
      // Move to the next slide
      var slideDir = xDir > 0 ? -1 : 1;
      index.current = clamp(index.current + slideDir, 0, slides.length - 1);
      set({
        x: -index.current * window.innerWidth + (down ? xMovement : 0),
        immediate: false
      });
    } else if (swipeX !== 0) {
      // We have detected a swipe - update the new index
      index.current = clamp(index.current - swipeX, 0, slides.length - 1);
    } // Animate the transition


    set({
      x: -index.current * window.innerWidth + (down ? xMovement : 0),
      immediate: down
    }); // Update the slide number for display purposes

    updateSlide(index.current);
  }, {
    axis: 'x',
    bounds: {
      left: currentSlide === slides.length - 1 ? 0 : -Infinity,
      right: index.current === 0 ? 0 : Infinity,
      top: 0,
      bottom: 0
    },
    rubberband: true,
    enabled: slides.length > 1
  });
  return [zooming, scale, currentSlide, bind, x, onScale];
}

function useZoom(_ref) {
  var minScale = _ref.minScale,
      maxScale = _ref.maxScale,
      onScale = _ref.onScale;
  var element = useRef(null);
  var initialBoundingRect = useRef(null);
  var firstTouch = useRef(null);
  var initialPinchLength = useRef(null);

  var _useSpring = useSpring(function () {
    return {
      scale: 1,
      middleTouchOnElement: [0, 0],
      translateX: 0,
      translateY: 0,
      immediate: true,
      onFrame: function onFrame(_ref2) {
        var currentScale = _ref2.scale;

        if (typeof onScale === 'function') {
          onScale({
            scale: currentScale
          });
        }
      }
    };
  }),
      _useSpring2 = _slicedToArray(_useSpring, 2),
      _useSpring2$ = _useSpring2[0],
      scale = _useSpring2$.scale,
      middleTouchOnElement = _useSpring2$.middleTouchOnElement,
      translateX = _useSpring2$.translateX,
      translateY = _useSpring2$.translateY,
      set = _useSpring2[1];

  var handleTouchStart = useCallback(function (event) {
    if (event.touches.length !== 2) {
      return;
    }

    initialBoundingRect.current = element.current.getBoundingClientRect();

    if (!event.touches.length || !isTouchesInsideRect(event.touches, initialBoundingRect.current)) {
      return;
    }

    event.preventDefault();

    var _event$touches = _slicedToArray(event.touches, 2),
        touch1 = _event$touches[0],
        touch2 = _event$touches[1];

    var _getMiddleTouchOnElem = getMiddleTouchOnElement(event.touches, initialBoundingRect.current),
        clientX = _getMiddleTouchOnElem.clientX,
        clientY = _getMiddleTouchOnElem.clientY;

    firstTouch.current = [clientX, clientY];
    initialPinchLength.current = getLengthOfLine(touch1, touch2);
    set({
      middleTouchOnElement: [clientX, clientY],
      immediate: true
    });
  }, [set]);
  var handleTouchMove = useCallback(function (event) {
    if (firstTouch.current) {
      var currentMiddleTouchOnElement = getMiddleTouchOnElement(event.touches, initialBoundingRect.current);

      var _event$touches2 = _slicedToArray(event.touches, 2),
          touch1 = _event$touches2[0],
          touch2 = _event$touches2[1];

      var currentPinchLength = getLengthOfLine(touch1, touch2);
      set({
        scale: clamp(currentPinchLength / initialPinchLength.current, minScale, maxScale),
        translateX: currentMiddleTouchOnElement.clientX - firstTouch.current[0],
        translateY: currentMiddleTouchOnElement.clientY - firstTouch.current[1],
        immediate: true
      });
    }
  }, [set]);
  var handleTouchEnd = useCallback(function () {
    set({
      scale: 1,
      translateX: 0,
      translateY: 0,
      immediate: false
    });
    firstTouch.current = null;
    initialPinchLength.current = null;
    initialBoundingRect.current = null;
  }, [set]);
  useEffect(function () {
    element.current.ontouchstart = handleTouchStart;
    element.current.ontouchmove = handleTouchMove;
    element.current.ontouchend = handleTouchEnd;
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  return [element, scale, translateX, translateY, middleTouchOnElement];
}

var _templateObject, _templateObject2, _templateObject3;
var TOTAL_SPACE = 10;
var SIZES = [6, 4, 2];

var getSize = function getSize() {
  return function (props) {
    var size = SIZES[props.distance] || 0;
    var margin = size !== 0 ? (TOTAL_SPACE - size) / 2 : 0;
    return css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    width: ", "px;\n    height: ", "px;\n    margin: 0 ", "px;\n  "])), size, size, margin);
  };
};

var Dots = styled.div(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 20px 0;\n"])));
var Dot = styled.div(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n  ", "\n  background: ", ";\n  border-radius: 50%;\n  transition: width 300ms ease-in-out, height 300ms ease-in-out, margin 300ms ease-in-out;\n"])), getSize(), function (props) {
  return props.active ? props.activeDotColor : props.dotColor;
});

function Dots$1(_ref) {
  var activeDotColor = _ref.activeDotColor,
      centerDots = _ref.centerDots,
      currentSlide = _ref.currentSlide,
      dotColor = _ref.dotColor,
      totalSlides = _ref.totalSlides;
  var centerOffset = useRef(0);
  var slideOffset = useRef(0);
  var currentCenterOffset = currentSlide - slideOffset.current;

  if (currentCenterOffset >= 0 && currentCenterOffset < centerDots) {
    centerOffset.current = currentCenterOffset;
  } else {
    slideOffset.current = currentSlide - centerOffset.current;
  }

  return /*#__PURE__*/React.createElement(Dots, null, _toConsumableArray(Array(totalSlides)).map(function (_, idx) {
    var centerPage = parseInt(centerDots / 2, 10) + slideOffset.current;
    var distance = Math.abs(idx - centerPage);
    var scaledDistance = clamp(distance - parseInt(centerDots / 2, 10), 0, 3);
    return /*#__PURE__*/React.createElement(Dot, {
      dotColor: dotColor,
      activeDotColor: activeDotColor,
      active: idx === currentSlide,
      distance: scaledDistance // eslint-disable-next-line react/no-array-index-key
      ,
      key: idx
    });
  }));
}
Dots$1.propTypes = {
  activeDotColor: PropTypes.string,
  centerDots: PropTypes.number,
  currentSlide: PropTypes.number.isRequired,
  dotColor: PropTypes.string,
  totalSlides: PropTypes.number.isRequired
};
Dots$1.defaultProps = {
  activeDotColor: '#4e99e9',
  centerDots: 3,
  dotColor: '#dadbdc'
};

var _templateObject$1;
var Slide = styled.div(_templateObject$1 || (_templateObject$1 = _taggedTemplateLiteral(["\n  width: 100vw;\n  height: auto;\n  display: block;\n"])));

var AnimatedSlide = animated(Slide);
function Slide$1(_ref) {
  var children = _ref.children,
      onScale = _ref.onScale,
      minScale = _ref.minScale,
      maxScale = _ref.maxScale;

  var _useZoom = useZoom({
    minScale: minScale,
    maxScale: maxScale,
    onScale: onScale
  }),
      _useZoom2 = _slicedToArray(_useZoom, 5),
      element = _useZoom2[0],
      scale = _useZoom2[1],
      translateX = _useZoom2[2],
      translateY = _useZoom2[3],
      middleTouchOnElement = _useZoom2[4];

  return /*#__PURE__*/React.createElement(AnimatedSlide, {
    ref: element,
    style: {
      transform: interpolate([scale, translateX, translateY], function (sc, x, y) {
        return "translate3d(".concat(x, "px, ").concat(y, "px, 0) scale3d(").concat(sc, ", ").concat(sc, ", 1)");
      }),
      transformOrigin: middleTouchOnElement.interpolate(function (x, y) {
        return "".concat(x, "px ").concat(y, "px 0");
      })
    }
  }, children);
}
Slide$1.propTypes = {
  children: PropTypes.node.isRequired,
  onScale: PropTypes.func,
  minScale: PropTypes.number,
  maxScale: PropTypes.number
};
Slide$1.defaultProps = {
  onScale: undefined,
  maxScale: defaultProps.maxScale,
  minScale: defaultProps.minScale
};

var _templateObject$2;
var SlideIndicator = styled.div(_templateObject$2 || (_templateObject$2 = _taggedTemplateLiteral(["\n  background-color: rgba(0, 0, 0, 0.7);\n  color: white;\n  display: inline-block;\n  position: absolute;\n  top: 20px;\n  right: 20px;\n  border-radius: 15px;\n  font-size: 14px;\n  padding: 6px;\n  letter-spacing: 1px;\n  user-select: none;\n  pointer-events: none;\n  line-height: 1;\n"])));

var AnimatedSlideIndicator = animated(SlideIndicator);
function SlideIndicator$1(_ref) {
  var currentSlide = _ref.currentSlide,
      inFront = _ref.inFront,
      slideIndicatorTimeout = _ref.slideIndicatorTimeout,
      totalSlides = _ref.totalSlides;

  var _useState = useState(true),
      _useState2 = _slicedToArray(_useState, 2),
      isVisible = _useState2[0],
      setVisible = _useState2[1];

  useEffect(function () {
    if (slideIndicatorTimeout !== null) {
      var timer = setTimeout(function () {
        setVisible(false);
      }, slideIndicatorTimeout);
      return function () {
        return clearTimeout(timer);
      };
    }
  }, []);
  var transitions = useTransition(isVisible, {
    from: {
      opacity: 1
    },
    enter: {
      opacity: 1
    },
    leave: {
      opacity: 0
    }
  });

  if (totalSlides < 2) {
    return null;
  } //test


  return /*#__PURE__*/React.createElement(React.Fragment, null, transitions(function (props, item, key) {
    return item && /*#__PURE__*/React.createElement(AnimatedSlideIndicator, {
      key: key,
      inFront: inFront,
      style: _objectSpread2({}, props)
    }, currentSlide + 1, "/", totalSlides);
  }));
}
SlideIndicator$1.propTypes = {
  currentSlide: PropTypes.number.isRequired,
  inFront: PropTypes.bool,
  slideIndicatorTimeout: PropTypes.number,
  totalSlides: PropTypes.number.isRequired
};
SlideIndicator$1.defaultProps = {
  inFront: true,
  slideIndicatorTimeout: defaultProps.slideIndicatorTimeout
};

var _templateObject$3, _templateObject2$1, _templateObject3$1;
var Slider = styled.div(_templateObject$3 || (_templateObject$3 = _taggedTemplateLiteral(["\n  position: relative;\n  display: grid;\n  grid-auto-flow: column;\n  width: 100%;\n  user-select: none;\n  touch-action: pan-y;\n  -webkit-user-drag: none;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n  z-index: ", ";\n"])), function (props) {
  return props.isZooming ? 20 : 0;
});
var Overlay = styled.div(_templateObject2$1 || (_templateObject2$1 = _taggedTemplateLiteral(["\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 20;\n"])));
var SlideOverlay = styled.div(_templateObject3$1 || (_templateObject3$1 = _taggedTemplateLiteral(["\n  position: relative;\n  z-index: ", ";\n"])), function (props) {
  return props.inFront ? 10 : 0;
});

var AnimatedOverlay = animated(Overlay);
var AnimatedSlider = animated(Slider);
function Slider$1(_ref) {
  var initialSlide = _ref.initialSlide,
      slides = _ref.slides,
      slideOverlay = _ref.slideOverlay,
      slideIndicatorTimeout = _ref.slideIndicatorTimeout,
      activeDotColor = _ref.activeDotColor,
      dotColor = _ref.dotColor;

  var _useSlider = useSlider({
    initialSlide: initialSlide,
    slides: slides
  }),
      _useSlider2 = _slicedToArray(_useSlider, 6),
      zooming = _useSlider2[0],
      scale = _useSlider2[1],
      currentSlide = _useSlider2[2],
      bind = _useSlider2[3],
      x = _useSlider2[4],
      onScale = _useSlider2[5];

  return /*#__PURE__*/React.createElement("div", null, zooming && /*#__PURE__*/React.createElement(AnimatedOverlay, {
    style: {
      backgroundColor: scale.interpolate({
        range: [1, 2, 10],
        output: [0, 0.7, 0.7]
      }).interpolate(function (opacity) {
        return "rgba(0, 0, 0, ".concat(opacity, ")");
      })
    }
  }), /*#__PURE__*/React.createElement(SlideOverlay, {
    inFront: !zooming
  }, slideOverlay, /*#__PURE__*/React.createElement(SlideIndicator$1, {
    slideIndicatorTimeout: slideIndicatorTimeout,
    currentSlide: currentSlide,
    totalSlides: slides.length
  })), /*#__PURE__*/React.createElement(AnimatedSlider, _extends({
    isZooming: zooming // eslint-disable-next-line react/jsx-props-no-spreading

  }, bind(), {
    style: {
      transform: x.interpolate(function (slideX) {
        return "translateX(".concat(slideX, "px");
      })
    }
  }), slides.map(function (slide, idx) {
    return (
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      React.createElement(Slide$1, {
        onScale: onScale,
        key: idx
      }, slide)
    );
  })), slides.length > 1 && /*#__PURE__*/React.createElement(Dots$1, {
    totalSlides: slides.length,
    currentSlide: currentSlide,
    centerDots: slides.length < 6 ? slides.length : undefined,
    dotColor: dotColor,
    activeDotColor: activeDotColor
  }));
}
Slider$1.propTypes = {
  /** Index of the slide to be rendered by default */
  initialSlide: PropTypes.number,

  /** List of slides to render */
  slides: PropTypes.arrayOf(PropTypes.node).isRequired,

  /** Maximum zoom level */
  maxScale: PropTypes.number,

  /** Minimum zoom level */
  minScale: PropTypes.number,

  /** Content to overlay on the slider */
  slideOverlay: PropTypes.node,

  /** Time in ms until the slide indicator fades out. Set to `null` to disable this behavior. */
  slideIndicatorTimeout: PropTypes.number,

  /** Pagination dot color for the active slide */
  activeDotColor: PropTypes.string,

  /** Pagination dot color for all other slides */
  dotColor: PropTypes.string
};
Slider$1.defaultProps = {
  initialSlide: defaultProps.initialSlide,
  maxScale: defaultProps.maxScale,
  minScale: defaultProps.minScale,
  slideOverlay: null,
  slideIndicatorTimeout: defaultProps.slideIndicatorTimeout,
  activeDotColor: defaultProps.activeDotColor,
  dotColor: defaultProps.dotColor
};

export default Slider$1;
export { useSlider, useZoom };
//# sourceMappingURL=index.es.js.map
