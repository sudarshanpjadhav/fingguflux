<script lang="ts" context="module">
  export const __ffClasses_Modal = [
    'ff-modal',
    'ff-modal-open',
    'ff-modal-closed',
    'ff-modal-overlay',
    'ff-modal-content'
  ];
</script>

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { useFinggu } from './context';

  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();
  const finggu = useFinggu();
  
  let mounted = false;
  let animating = false;

  onMount(() => {
    mounted = true;
  });

  $: if (isOpen) {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      animating = true;
    }
  } else {
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        animating = false;
        document.body.style.overflow = '';
      }, 300); // Exit animation duration
    }
  }

  $: ffContainerClasses = $finggu.resolveAll([
    'ff-modal',
    isOpen ? 'ff-modal-open' : 'ff-modal-closed'
  ]);

  $: ffContentClasses = $finggu.resolveAll([
    'ff-modal-content',
    $$props.class
  ]);
</script>

{#if mounted && (isOpen || animating)}
  <div class={ffContainerClasses} aria-hidden={!isOpen}>
    <div class="ff-modal-overlay" on:click={() => dispatch('close')} />
    <div class={ffContentClasses}>
      <slot />
    </div>
  </div>
{/if}
