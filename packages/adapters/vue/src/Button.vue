<template>
  <button :class="ffClasses" v-bind="$attrs">
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useFinggu } from './composable';

const VARIANTS = {
  primary: 'ff-btn-primary',
  secondary: 'ff-btn-secondary',
  ghost: 'ff-btn-ghost',
  outline: 'ff-btn-outline'
};

const SIZES = {
  sm: 'ff-btn-sm',
  md: 'ff-btn-md',
  lg: 'ff-btn-lg'
};

const MOTIONS = {
  fade: 'ff-fade-in',
  'slide-up': 'ff-slide-up',
  'scale-in': 'ff-scale-in',
  lift: 'ff-hover-lift'
};

export const __ffClasses_Button = [
  'ff-btn',
  ...Object.values(VARIANTS),
  ...Object.values(SIZES),
  ...Object.values(MOTIONS),
  'ff-card-glass'
];

export default defineComponent({
  name: 'FingguButton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<keyof typeof VARIANTS>,
      default: 'primary'
    },
    size: {
      type: String as PropType<keyof typeof SIZES>,
      default: 'md'
    },
    motion: {
      type: String as PropType<keyof typeof MOTIONS>,
      default: undefined
    },
    glass: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { resolveAll } = useFinggu();

    const ffClasses = computed(() => resolveAll([
      'ff-btn',
      VARIANTS[props.variant],
      SIZES[props.size],
      props.glass && 'ff-card-glass',
      props.motion && MOTIONS[props.motion]
    ]));

    return { ffClasses };
  }
});
</script>
