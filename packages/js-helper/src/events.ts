/**
 * Event Delegation System
 * Handles global listeners for better performance and dynamic elements.
 */
import { toggleAria } from './aria';

const registry = new Map<string, any[]>();

export const onToggle = (type: string, callback: (data: any) => void) => {
    if (!registry.has(type)) registry.set(type, []);
    registry.get(type)!.push(callback);
};

export const initEvents = () => {
    // Global Click Listener
    document.addEventListener('click', (e: MouseEvent) => {
        const trigger = (e.target as HTMLElement).closest('[data-ff-toggle]') as HTMLElement;
        if (!trigger) return;

        const type = trigger.getAttribute('data-ff-toggle') || 'default';
        const targetId = trigger.getAttribute('data-ff-target');
        const target = targetId ? document.getElementById(targetId) : null;

        // Default state toggle
        if (target) {
            const isExpanded = toggleAria(trigger, 'aria-expanded');
            target.setAttribute('data-ff-state', isExpanded ? 'open' : 'closed');

            // Notify custom listeners
            if (registry.has(type)) {
                registry.get(type)!.forEach(cb => cb({ trigger, target, isExpanded }));
            }
        }
    });

    // Global Keydown Listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Find all open toggles and close them
            const openTargets = document.querySelectorAll('[data-ff-state="open"]');
            openTargets.forEach(target => {
                target.setAttribute('data-ff-state', 'closed');
                const trigger = document.querySelector(`[data-ff-target="${target.id}"]`);
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        }
    });
};
