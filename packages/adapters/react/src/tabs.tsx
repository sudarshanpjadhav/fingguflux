import React, { useState } from 'react';
import { useFinggu } from './provider';

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
}

export const __ffClasses_Tabs = [
    'ff-tabs',
    'ff-tab-list',
    'ff-tab',
    'ff-tab-active',
    'ff-tab-content'
];

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className="ff-tabs">{children}</div>
        </TabsContext.Provider>
    );
};

export const TabList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="ff-tab-list" role="tablist">{children}</div>
);

export const TabTrigger: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
    const context = React.useContext(TabsContext);
    const { resolveAll } = useFinggu();
    if (!context) return null;

    return (
        <button
            role="tab"
            aria-selected={context.activeTab === value}
            className={resolveAll(['ff-tab', context.activeTab === value && 'ff-tab-active'])}
            onClick={() => context.setActiveTab(value)}
        >
            {children}
        </button>
    );
};

export const TabContent: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
    const context = React.useContext(TabsContext);
    if (!context || context.activeTab !== value) return null;
    return <div className="ff-tab-content">{children}</div>;
};
