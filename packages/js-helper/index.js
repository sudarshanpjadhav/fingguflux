/**
 * FingguFlux JS Helper - Entry Point
 */
export * from './focus-trap.js';
export * from './scroll-lock.js';
export * from './aria.js';
export * from './events.js';
export * from './tabs.js';
export * from './dropdown.js';

import { initEvents } from './events.js';
import { initTabs } from './tabs.js';
import { initDropdowns } from './dropdown.js';

// Auto-initialize if running in a standard environment
if (typeof document !== 'undefined') {
    initEvents();
    initTabs();
    initDropdowns();
    console.log('FingguFlux JS Helpers initialized.');
}
