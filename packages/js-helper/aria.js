/**
 * ARIA Helper
 * Managed attribute toggling for accessibility.
 */
export const toggleAria = (element, attribute, force) => {
    const current = element.getAttribute(attribute);
    const next = force !== undefined ? force : current === 'true' ? 'false' : 'true';
    element.setAttribute(attribute, next);
    return next === 'true';
};

export const setAriaHidden = (selector, isHidden) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.setAttribute('aria-hidden', isHidden.toString()));
};
