<template>
  <teleport to="body" v-if="mounted">
    <div
      v-show="isOpen || animating"
      :class="ffContainerClasses"
      aria-hidden="!isOpen"
    >
      <div class="ff-modal-overlay" @click="$emit('close')" />
      <div :class="ffContentClasses">
        <slot />
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useFinggu } from './composable';

export const __ffClasses_Modal = [
  'ff-modal',
  'ff-modal-open',
  'ff-modal-closed',
  'ff-modal-overlay',
  'ff-modal-content'
];

export default defineComponent({
  name: 'FingguModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const { resolveAll } = useFinggu();
    const mounted = ref(false);
    const animating = ref(false);

    onMounted(() => {
      mounted.value = true;
    });

    watch(() => props.isOpen, (val) => {
      if (val) {
        document.body.style.overflow = 'hidden';
        animating.value = true;
      } else {
        setTimeout(() => {
          animating.value = false;
          document.body.style.overflow = '';
        }, 300); // Exit animation duration
      }
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
    });

    const ffContainerClasses = computed(() => resolveAll([
      'ff-modal',
      props.isOpen ? 'ff-modal-open' : 'ff-modal-closed'
    ]));

    const ffContentClasses = computed(() => resolveAll([
      'ff-modal-content'
    ]));

    return { 
      mounted, 
      animating, 
      ffContainerClasses, 
      ffContentClasses 
    };
  }
});
</script>
