<script lang="ts">
  import { getContext } from 'svelte';
  import { TABS_KEY, type TabsContext } from './tabs-shared';
  import { useFinggu } from './context';

  export let value: string;

  const finggu = useFinggu();
  const context = getContext<TabsContext>(TABS_KEY);

  $: isActive = $context?.activeTab ? $context.activeTab : null;
  $: active = $isActive === value;

  $: ffClasses = $finggu.resolveAll([
    'ff-tab',
    active && 'ff-tab-active',
    $$props.class
  ]);

  function select() {
    context?.activeTab.set(value);
  }
</script>

<button
  role="tab"
  aria-selected={active}
  class={ffClasses}
  on:click={select}
  {...$$restProps}
>
  <slot />
</button>
