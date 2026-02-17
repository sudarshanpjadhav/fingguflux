<template>
  <div :class="ffClasses" v-bind="$attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useFinggu } from './composable';

const VARIANTS = {
  outline: 'ff-card-outline',
  glass: 'ff-card-glass'
};

const PADDINGS = {
  none: 'ff-p-0',
  sm: 'ff-p-2',
  md: 'ff-p-4',
  lg: 'ff-p-8'
};

export const __ffClasses_Card = [
  'ff-card',
  'ff-card-header',
  'ff-card-body',
  ...Object.values(VARIANTS),
  ...Object.values(PADDINGS)
];

export default defineComponent({
  name: 'FingguCard',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<keyof typeof VARIANTS>,
      default: undefined
    },
    padding: {
      type: String as PropType<keyof typeof PADDINGS>,
      default: 'md'
    }
  },
  setup(props) {
    const { resolveAll } = useFinggu();

    const ffClasses = computed(() => resolveAll([
      'ff-card',
      props.variant && VARIANTS[props.variant],
      PADDINGS[props.padding]
    ]));

    return { ffClasses };
  }
});
</script>
