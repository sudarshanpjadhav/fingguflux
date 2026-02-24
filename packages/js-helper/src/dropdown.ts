/**
 * Dropdown Helper
 * Handles accessible keyboard navigation, outside-click detection, and state management.
 */

export const initDropdowns = () => {
    // Global Click Listener for Event Delegation
    document.addEventListener('click', (e: MouseEvent) => {
        const trigger = (e.target as HTMLElement).closest('.ff-dropdown-trigger') as HTMLElement;
        const dropdown = (e.target as HTMLElement).closest('.ff-dropdown') as HTMLElement;

        // Handle clicks on triggers
        if (trigger && dropdown) {
            const currentState = dropdown.getAttribute('data-ff-state');
            const newState = currentState === 'open' ? 'closed' : 'open';
            setDropdownState(dropdown, newState);
            return;
        }

        // Outside Click Detection
        if (!dropdown) {
            closeAllDropdowns();
        }
    });

    // Global Keydown Listener
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        const activeElement = document.activeElement as HTMLElement;
        const dropdown = activeElement ? activeElement.closest('.ff-dropdown') as HTMLElement : null;

        if (!dropdown) {
            if (e.key === 'Escape') closeAllDropdowns();
            return;
        }

        const state = dropdown.getAttribute('data-ff-state');
        const trigger = dropdown.querySelector('.ff-dropdown-trigger') as HTMLElement;
        const items = Array.from(dropdown.querySelectorAll('.ff-dropdown-item')) as HTMLElement[];
        const currentIndex = items.indexOf(activeElement);

        if (e.key === 'Escape') {
            setDropdownState(dropdown, 'closed');
            if (trigger) trigger.focus(); // Return focus to trigger
            e.preventDefault();
            return;
        }

        if (state === 'closed') {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                setDropdownState(dropdown, 'open');
                if (items.length > 0) items[0].focus();
                e.preventDefault();
            }
            return;
        }

        // Navigation within open menu
        switch (e.key) {
            case 'ArrowDown':
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
                e.preventDefault();
                break;
            case 'ArrowUp':
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                items[prevIndex].focus();
                e.preventDefault();
                break;
            case 'Tab':
                setDropdownState(dropdown, 'closed');
                break;
        }
    });
};

const setDropdownState = (dropdown: HTMLElement, state: string) => {
    dropdown.setAttribute('data-ff-state', state);
    const trigger = dropdown.querySelector('.ff-dropdown-trigger');
    if (trigger) {
        trigger.setAttribute('aria-expanded', state === 'open' ? 'true' : 'false');
    }
};

const closeAllDropdowns = () => {
    const openDropdowns = document.querySelectorAll('.ff-dropdown[data-ff-state="open"]');
    openDropdowns.forEach(dropdown => setDropdownState(dropdown as HTMLElement, 'closed'));
};
