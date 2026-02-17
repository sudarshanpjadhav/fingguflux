/**
 * Scroll Lock Utility
 * Prevents body scrolling without layout shift.
 */
let scrollPosition = 0;

export const lockScroll = () => {
    scrollPosition = window.pageYOffset;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Use a data attribute for styling instead of inline styles
    document.body.setAttribute('data-ff-scroll-lock', 'true');

    // Support for browsers that don't support the attribute-based CSS we will add later
    // We avoid inline styles where possible as per constraints, but scrollbar compensation 
    // sometimes requires it if not using a global variable.
    // We'll use a CSS variable instead.
    document.documentElement.style.setProperty('--ff-scrollbar-width', `${scrollbarWidth}px`);
};

export const unlockScroll = () => {
    document.body.removeAttribute('data-ff-scroll-lock');
    document.documentElement.style.removeProperty('--ff-scrollbar-width');
    window.scrollTo(0, scrollPosition);
};
