/**
 * Tabs Helper
 * Handles accessible keyboard navigation and state management for tabs.
 */

export const initTabs = () => {
    document.addEventListener('click', (e: MouseEvent) => {
        const tab = (e.target as HTMLElement).closest('[data-ff-tab]') as HTMLElement;
        if (!tab) return;
        activateTab(tab);
    });

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        const tab = (e.target as HTMLElement).closest('[data-ff-tab]') as HTMLElement;
        if (!tab) return;

        const tablist = tab.closest('[role="tablist"]');
        if (!tablist) return;

        const tabs = Array.from(tablist.querySelectorAll('[data-ff-tab]')) as HTMLElement[];
        const index = tabs.indexOf(tab);

        let nextTab: HTMLElement | undefined;

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
            e.preventDefault();
        }
    });
};

export const activateTab = (tab: HTMLElement) => {
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
    const allPanels = document.querySelectorAll('[data-ff-tab-panel]');
    allPanels.forEach(panel => {
        const panelId = panel.getAttribute('data-ff-tab-panel');
        const isTarget = panelId === tabId;
        panel.setAttribute('data-ff-state', isTarget ? 'active' : 'inactive');
    });
};
