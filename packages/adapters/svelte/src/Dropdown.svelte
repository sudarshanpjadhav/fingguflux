<script lang="ts" context="module">
  export const __ffClasses_Dropdown = [
    'ff-dropdown',
    'ff-dropdown-trigger',
    'ff-dropdown-menu',
    'ff-dropdown-menu-right',
    'ff-dropdown-item'
  ];
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useFinggu } from './context';

  export let align: 'left' | 'right' = 'left';

  const finggu = useFinggu();
  let isOpen = false;
  let container: HTMLElement;

  function toggle() { isOpen = !isOpen; }
  function close() { isOpen = false; }

  function handleClickOutside(event: MouseEvent) {
    if (container && !container.contains(event.target as Node)) {
      close();
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  });

  $: ffContainerClasses = $finggu.resolveAll(['ff-dropdown']);
  $: ffTriggerClasses = $finggu.resolveAll(['ff-dropdown-trigger']);
  $: ffMenuClasses = $finggu.resolveAll([
    'ff-dropdown-menu',
    align === 'right' && 'ff-dropdown-menu-right'
  ]);
</script>

<div class={ffContainerClasses} bind:this={container}>
  <button
    type="button"
    class={ffTriggerClasses}
    on:click={toggle}
    aria-haspopup="true"
    aria-expanded={isOpen}
  >
    <slot name="trigger" />
  </button>

  <div
    class={ffMenuClasses}
    data-ff-state={isOpen ? 'open' : 'closed'}
    role="menu"
    aria-hidden={!isOpen}
  >
    <slot />
  </div>
</div>
