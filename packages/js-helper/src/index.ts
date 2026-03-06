/**
 * FingguFlux JS Helper - Entry Point
 */
export * from './focus-trap';
export * from './scroll-lock';
export * from './aria';
export * from './events';
export * from './tabs';
export * from './dropdown';
export * from './theme';

import { initEvents } from './events';
import { initTabs } from './tabs';
import { initDropdowns } from './dropdown';

// Auto-initialize if running in a standard environment
if (typeof document !== 'undefined') {
    initEvents();
    initTabs();
    initDropdowns();
}
