// FingguFlux Tabs Component
import { defineComponent, h, provide, ref, InjectionKey, Ref, PropType } from 'vue';
import { useFinggu } from './composable';

export const __ffClasses_Tabs = [
    'ff-tabs',
    'ff-tab-list',
    'ff-tab',
    'ff-tab-active',
    'ff-tab-content'
];

interface TabsContext {
    activeTab: Ref<string>;
    setActiveTab: (value: string) => void;
}

export const TabsSymbol: InjectionKey<TabsContext> = Symbol('FingguTabs');

export const Tabs = defineComponent({
    name: 'FingguTabs',
    props: {
        defaultValue: {
            type: String,
            required: true
        }
    },
    setup(props, { slots }) {
        const activeTab = ref(props.defaultValue);
        const setActiveTab = (value: string) => { activeTab.value = value; };

        provide(TabsSymbol, { activeTab, setActiveTab });

        return () => h('div', { class: 'ff-tabs' }, slots.default?.());
    }
});

export const TabList = defineComponent({
    name: 'FingguTabList',
    setup(_, { slots }) {
        return () => h('div', { class: 'ff-tab-list', role: 'tablist' }, slots.default?.());
    }
});

export const TabTrigger = defineComponent({
    name: 'FingguTabTrigger',
    props: {
        value: {
            type: String,
            required: true
        }
    },
    setup(props, { slots }) {
        const context = inject(TabsSymbol);
        const { resolveAll } = useFinggu();

        return () => {
            const isActive = context?.activeTab.value === props.value;
            return h('button', {
                role: 'tab',
                'aria-selected': isActive,
                class: resolveAll(['ff-tab', isActive && 'ff-tab-active']),
                onClick: () => context?.setActiveTab(props.value)
            }, slots.default?.());
        };
    }
});

export const TabContent = defineComponent({
    name: 'FingguTabContent',
    props: {
        value: {
            type: String,
            required: true
        }
    },
    setup(props, { slots }) {
        const context = inject(TabsSymbol);
        return () => (context?.activeTab.value === props.value)
            ? h('div', { class: 'ff-tab-content' }, slots.default?.())
            : null;
    }
});

// For SFC imports
import { inject } from 'vue';
export default Tabs;
