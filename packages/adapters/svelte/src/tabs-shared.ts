import { writable, type Writable } from 'svelte/store';

export const TABS_KEY = Symbol('FingguTabs');

export interface TabsContext {
    activeTab: Writable<string>;
}

export const __ffClasses_Tabs = [
    'ff-tabs',
    'ff-tab-list',
    'ff-tab',
    'ff-tab-active',
    'ff-tab-content'
];
