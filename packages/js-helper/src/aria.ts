/**
 * ARIA Helper
 * Managed attribute toggling for accessibility.
 */
export const toggleAria = (element: HTMLElement, attribute: string, force?: boolean): boolean => {
    const current = element.getAttribute(attribute);
    const next = force !== undefined ? (force ? 'true' : 'false') : (current === 'true' ? 'false' : 'true');
    element.setAttribute(attribute, next);
    return next === 'true';
};

export const setAriaHidden = (selector: string, isHidden: boolean) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.setAttribute('aria-hidden', isHidden.toString()));
};
