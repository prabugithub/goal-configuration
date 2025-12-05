/**
 * Accessibility (a11y) Utilities
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Skip to main content link helper
 * Used for keyboard navigation
 */
export const skipToMainContent = () => {
  const mainElement = document.querySelector('main');
  if (mainElement) {
    mainElement.focus();
    mainElement.scrollIntoView();
  }
};

/**
 * Keyboard event handlers
 */
export const keyboardEvents = {
  isEnter: (e) => e.key === 'Enter',
  isSpace: (e) => e.key === ' ' || e.code === 'Space',
  isEscape: (e) => e.key === 'Escape',
  isArrowUp: (e) => e.key === 'ArrowUp',
  isArrowDown: (e) => e.key === 'ArrowDown',
  isArrowLeft: (e) => e.key === 'ArrowLeft',
  isArrowRight: (e) => e.key === 'ArrowRight',
  isTab: (e) => e.key === 'Tab',
};

/**
 * ARIA labels for common UI patterns
 */
export const ariaLabels = {
  // Navigation
  mainNavigation: 'Main navigation menu',
  breadcrumbs: 'Breadcrumb navigation',
  skipLink: 'Skip to main content',

  // Forms
  required: 'This field is required',
  optional: 'This field is optional',
  error: 'This field has an error',
  success: 'This field was completed successfully',

  // Buttons
  menuButton: 'Open menu',
  closeButton: 'Close',
  deleteButton: 'Delete this item',
  saveButton: 'Save changes',
  cancelButton: 'Cancel changes',

  // Icons
  loadingSpinner: 'Loading, please wait',
  checkmark: 'Completed',
  warning: 'Warning',
  error: 'Error',
  info: 'Information',

  // Navigation
  previousPage: 'Go to previous page',
  nextPage: 'Go to next page',
  goToPage: 'Go to page',
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within a modal/dialog
   */
  trapFocus: (containerElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    return {
      first: firstElement,
      last: lastElement,
      all: focusableElements,
    };
  },

  /**
   * Move focus to element
   */
  setFocus: (element) => {
    if (element) {
      element.focus();
    }
  },

  /**
   * Announce message to screen readers
   */
  announce: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};

/**
 * Color contrast checking
 * Returns whether text passes WCAG AA standard (4.5:1 for normal text)
 */
export const contrastChecker = {
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map((x) => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  getContrast: (rgb1, rgb2) => {
    const lum1 = contrastChecker.getLuminance(...rgb1);
    const lum2 = contrastChecker.getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  isWCAGAA: (rgb1, rgb2) => {
    return contrastChecker.getContrast(rgb1, rgb2) >= 4.5;
  },

  isWCAGAAA: (rgb1, rgb2) => {
    return contrastChecker.getContrast(rgb1, rgb2) >= 7;
  },
};

/**
 * High contrast mode detection
 */
export const highContrastMode = {
  isEnabled: () => {
    return (
      window.matchMedia('(prefers-contrast: more)').matches ||
      window.matchMedia('(forced-colors: active)').matches
    );
  },

  mediaQuery: () => window.matchMedia('(prefers-contrast: more)'),
};

/**
 * Reduced motion preference
 */
export const prefersReducedMotion = {
  isEnabled: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  mediaQuery: () => window.matchMedia('(prefers-reduced-motion: reduce)'),
};

/**
 * Dark mode preference
 */
export const prefersDarkMode = {
  isEnabled: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  mediaQuery: () => window.matchMedia('(prefers-color-scheme: dark)'),
};

/**
 * Semantic HTML helpers
 */
export const semanticHTML = {
  // Use heading hierarchy correctly
  // h1 for main title, h2-h6 for subsections
  headingHierarchy: 'Use h1 for main title, h2-h6 in order',

  // Use buttons for actions
  buttonVsLink: 'Use <button> for actions, <a> for navigation',

  // Use form elements properly
  formStructure: 'Always wrap inputs with labels or use aria-label',

  // Use landmarks
  landmarks: 'Use main, nav, aside, header, footer correctly',

  // Use lists for list content
  listStructure: 'Use <ul>, <ol>, <li> for actual lists',
};

/**
 * ARIA live regions for dynamic content
 */
export const liveRegions = {
  polite: 'aria-live="polite" - Polite announcements',
  assertive: 'aria-live="assertive" - Urgent announcements',
  atomic: 'aria-atomic="true" - Announce full region',
  relevant: 'aria-relevant="additions text" - What changed',
};

/**
 * Test utilities for checking a11y
 */
export const a11yTests = {
  /**
   * Check if all interactive elements are keyboard accessible
   */
  checkKeyboardAccessibility: () => {
    const interactive = document.querySelectorAll('button, [href], input, select, textarea');
    const issues = [];

    interactive.forEach((element) => {
      if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
        if (!['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
          issues.push(`Non-semantic interactive element: ${element.tagName}`);
        }
      }
    });

    return issues;
  },

  /**
   * Check if all images have alt text
   */
  checkImageAltText: () => {
    const images = document.querySelectorAll('img');
    const issues = [];

    images.forEach((img) => {
      if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });

    return issues;
  },

  /**
   * Check heading hierarchy
   */
  checkHeadingHierarchy: () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues = [];
    let lastLevel = 1;

    headings.forEach((heading) => {
      const currentLevel = parseInt(heading.tagName[1]);
      if (currentLevel > lastLevel + 1) {
        issues.push(
          `Heading hierarchy skipped: ${heading.tagName} after h${lastLevel}`
        );
      }
      lastLevel = currentLevel;
    });

    return issues;
  },

  /**
   * Check if all form inputs have labels
   */
  checkFormLabels: () => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const issues = [];

    inputs.forEach((input) => {
      const hasLabel = input.hasAttribute('aria-label') || document.querySelector(`label[for="${input.id}"]`);
      if (!hasLabel) {
        issues.push(`Form input missing label: ${input.name || input.id}`);
      }
    });

    return issues;
  },
};

export default {
  skipToMainContent,
  keyboardEvents,
  ariaLabels,
  focusManagement,
  contrastChecker,
  highContrastMode,
  prefersReducedMotion,
  prefersDarkMode,
  semanticHTML,
  liveRegions,
  a11yTests,
};
