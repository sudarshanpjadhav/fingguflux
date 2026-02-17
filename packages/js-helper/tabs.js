/**
 * Tabs Helper
 * Handles accessible keyboard navigation and state management for tabs.
 */

export const initTabs = () => {
    document.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-ff-tab]');
        if (!tab) return;
        activateTab(tab);
    });

    document.addEventListener('keydown', (e) => {
        const tab = e.target.closest('[data-ff-tab]');
        if (!tab) return;

        const tablist = tab.closest('[role="tablist"]');
        if (!tablist) return;

        const tabs = Array.from(tablist.querySelectorAll('[data-ff-tab]'));
        const index = tabs.indexOf(tab);

        let nextTab;

        switch (e.key) {
            case 'ArrowLeft':
                nextTab = tabs[index - 1] || tabs[tabs.length - 1];
                break;
            case 'ArrowRight':
                nextTab = tabs[index + 1] || tabs[0];
                break;
            case 'Home':
                nextTab = tabs[0];
                break;
            case 'End':
                nextTab = tabs[tabs.length - 1];
                break;
            default:
                return;
        }

        if (nextTab) {
            nextTab.focus();
            // Optional: Auto-activate on focus? 
            // accessibility best practices suggest activation on Enter/Space OR arrow navigation
            // We will follow the "manual" activation pattern for better screen reader UX
            // unless the user clicks.
            e.preventDefault();
        }
    });
};

export const activateTab = (tab) => {
    const tablist = tab.closest('[role="tablist"]');
    if (!tablist) return;

    const tabId = tab.getAttribute('data-ff-tab');
    const allTabs = tablist.querySelectorAll('[data-ff-tab]');

    // Update Tabs
    allTabs.forEach(t => {
        const isActive = t === tab;
        t.setAttribute('data-ff-state', isActive ? 'active' : 'inactive');
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    // Update Panels
    // We look for panels globally or within a shared container
    // A common pattern is panels being siblings or in a sibling container.
    // We'll search for Panels that match the ID.
    const allPanels = document.querySelectorAll('[data-ff-tab-panel]');
    allPanels.forEach(panel => {
        // Only affect panels related to this specific tab set if possible
        // but the ID link is usually unique.
        const panelId = panel.getAttribute('data-ff-tab-panel');
        const isTarget = panelId === tabId;
        panel.setAttribute('data-ff-state', isTarget ? 'active' : 'inactive');
    });
};
