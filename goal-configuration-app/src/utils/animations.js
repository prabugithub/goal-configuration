/**
 * Animation Utilities - Smooth, consistent animations throughout the app
 * Uses CSS-in-JS with emotion/styled-components via MUI
 */

export const animations = {
  // Fade animations
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
  },
  fadeOut: {
    animation: 'fadeOut 0.3s ease-in-out',
  },

  // Slide animations
  slideInUp: {
    animation: 'slideInUp 0.4s ease-out',
  },
  slideInDown: {
    animation: 'slideInDown 0.4s ease-out',
  },
  slideInLeft: {
    animation: 'slideInLeft 0.4s ease-out',
  },
  slideInRight: {
    animation: 'slideInRight 0.4s ease-out',
  },

  // Scale animations
  scaleIn: {
    animation: 'scaleIn 0.3s ease-out',
  },
  scaleOut: {
    animation: 'scaleOut 0.3s ease-out',
  },

  // Bounce animations
  bounce: {
    animation: 'bounce 0.6s ease-in-out',
  },
  bounceIn: {
    animation: 'bounceIn 0.6s ease-out',
  },

  // Pulse animations
  pulse: {
    animation: 'pulse 2s ease-in-out infinite',
  },
  pulseFast: {
    animation: 'pulseFast 1s ease-in-out infinite',
  },

  // Shimmer/Loading animation
  shimmer: {
    animation: 'shimmer 2s infinite',
  },

  // Transitions
  smooth: {
    transition: 'all 0.3s ease-in-out',
  },
  smoothFast: {
    transition: 'all 0.15s ease-in-out',
  },
  smoothSlow: {
    transition: 'all 0.5s ease-in-out',
  },
};

/**
 * Keyframe definitions for global use
 */
export const keyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes scaleOut {
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0.9);
      opacity: 0;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    70% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes pulseFast {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

/**
 * Animation presets for common UI patterns
 */
export const animationPresets = {
  cardEnter: {
    animation: 'slideInUp 0.4s ease-out',
  },
  cardExit: {
    animation: 'slideInUp 0.3s ease-in reverse',
  },
  modalEnter: {
    animation: 'scaleIn 0.3s ease-out',
  },
  modalExit: {
    animation: 'scaleOut 0.3s ease-in',
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  buttonActive: {
    transform: 'translateY(0)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  menuItem: {
    animation: 'slideInRight 0.3s ease-out',
  },
  toast: {
    animation: 'slideInUp 0.4s ease-out',
  },
  tooltip: {
    animation: 'scaleIn 0.2s ease-out',
  },
};

/**
 * Hook for using animations in components
 * Usage: const { fadeIn, slideInUp } = useAnimation();
 */
export const useAnimation = () => {
  return {
    ...animations,
    ...animationPresets,
  };
};

export default animations;
