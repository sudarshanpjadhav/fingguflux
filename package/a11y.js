/**
 * FingguFlux A11y Scanner
 * Validates template ARIA compliance against FingguFlux contracts.
 */

export const ARIA_CONTRACTS = {
    'ff-accordion': {
        required: ['role="button"', 'aria-expanded'],
        recommended: ['aria-controls'],
        stateSync: 'aria-expanded'
    },
    'ff-tabs': {
        required: ['role="tablist"', 'role="tab"', 'role="tabpanel"'],
        stateSync: 'aria-selected'
    },
    'ff-modal': {
        required: ['role="dialog"', 'aria-modal="true"']
    },
    'ff-dropdown': {
        required: ['aria-haspopup="true"'],
        stateSync: 'aria-expanded'
    }
};

export function validateTemplate(content) {
    const issues = [];

    // Check Accordion patterns
    if (content.includes('ff-accordion-header')) {
        const headers = content.match(/<button[^>]*class="[^"]*ff-accordion-header[^"]*"[^>]*>/g) || [];
        headers.forEach(header => {
            if (!header.includes('aria-expanded')) {
                issues.push({
                    component: 'Accordion',
                    type: 'Error',
                    message: 'Missing aria-expanded on ff-accordion-header'
                });
            }
            if (header.includes('data-ff-state')) {
                const state = header.match(/data-ff-state="([^"]*)"/);
                const aria = header.match(/aria-expanded="([^"]*)"/);
                if (state && aria) {
                    const expected = state[1] === 'open' ? 'true' : 'false';
                    if (aria[1] !== expected) {
                        issues.push({
                            component: 'Accordion',
                            type: 'Warning',
                            message: `aria-expanded ("${aria[1]}") inconsistent with data-ff-state ("${state[1]}")`
                        });
                    }
                }
            }
        });
    }

    // Check Modal patterns
    if (content.includes('ff-modal')) {
        const modals = content.match(/<div[^>]*class="[^"]*ff-modal[^"]*"[^>]*>/g) || [];
        modals.forEach(modal => {
            if (!modal.includes('role="dialog"') && !modal.includes('role="alertdialog"')) {
                issues.push({
                    component: 'Modal',
                    type: 'Error',
                    message: 'Missing role="dialog" or "alertdialog" on ff-modal'
                });
            }
            if (!modal.includes('aria-modal="true"')) {
                issues.push({
                    component: 'Modal',
                    type: 'Warning',
                    message: 'Missing aria-modal="true" on ff-modal'
                });
            }
        });
    }

    return issues;
}

/**
 * Basic Contrast Ratio Calculator (WCAG 2.1)
 * @param {string} hex1 
 * @param {string} hex2 
 * @returns {number}
 */
export function getContrastRatio(hex1, hex2) {
    const getL = (c) => {
        let rv = parseInt(c, 16) / 255;
        return rv <= 0.03928 ? rv / 12.92 : Math.pow((rv + 0.055) / 1.055, 2.4);
    };
    const getLuminance = (hex) => {
        const r = hex.slice(1, 3);
        const g = hex.slice(3, 5);
        const b = hex.slice(5, 7);
        return 0.2126 * getL(r) + 0.7152 * getL(g) + 0.0722 * getL(b);
    };

    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
