<template>
  <div :class="ffContainerClasses" ref="containerRef">
    <button
      type="button"
      :class="ffTriggerClasses"
      @click="toggle"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <slot name="trigger" />
    </button>
    <div
      :class="ffMenuClasses"
      :data-ff-state="isOpen ? 'open' : 'closed'"
      role="menu"
      :aria-hidden="!isOpen"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed, PropType } from 'vue';
import { useFinggu } from './composable';

export const __ffClasses_Dropdown = [
  'ff-dropdown',
  'ff-dropdown-trigger',
  'ff-dropdown-menu',
  'ff-dropdown-menu-right',
  'ff-dropdown-item'
];

export default defineComponent({
  name: 'FingguDropdown',
  props: {
    align: {
      type: String as PropType<'left' | 'right'>,
      default: 'left'
    }
  },
  setup(props) {
    const { resolveAll } = useFinggu();
    const isOpen = ref(false);
    const containerRef = ref<HTMLElement | null>(null);

    const toggle = () => { isOpen.value = !isOpen.value; };
    const close = () => { isOpen.value = false; };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        close();
      }
    };

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });

    const ffContainerClasses = computed(() => resolveAll(['ff-dropdown']));
    const ffTriggerClasses = computed(() => resolveAll(['ff-dropdown-trigger']));
    const ffMenuClasses = computed(() => resolveAll([
      'ff-dropdown-menu',
      props.align === 'right' && 'ff-dropdown-menu-right'
    ]));

    return { 
      isOpen, 
      containerRef, 
      toggle, 
      ffContainerClasses, 
      ffTriggerClasses, 
      ffMenuClasses 
    };
  }
});

// DropdownItem as a simple functional-like component
export const DropdownItem = defineComponent({
  name: 'FingguDropdownItem',
  setup(_, { slots, attrs }) {
    const { resolveAll } = useFinggu();
    const ffClasses = computed(() => resolveAll(['ff-dropdown-item', attrs.class as string]));
    return () => h('div', { ...attrs, class: ffClasses.value }, slots.default?.());
  }
});
import { h } from 'vue';
</script>
