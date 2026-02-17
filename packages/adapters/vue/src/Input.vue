<template>
  <input :class="ffClasses" v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useFinggu } from './composable';

export const __ffClasses_Input = [
  'ff-input',
  'ff-input-error'
];

export default defineComponent({
  name: 'FingguInput',
  inheritAttrs: false,
  props: {
    error: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { resolveAll } = useFinggu();
    const ffClasses = computed(() => resolveAll([
      'ff-input',
      props.error && 'ff-input-error'
    ]));
    return { ffClasses };
  }
});
</script>
