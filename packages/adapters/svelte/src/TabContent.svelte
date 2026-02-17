<script lang="ts">
  import { getContext } from 'svelte';
  import { TABS_KEY, type TabsContext } from './tabs-shared';

  export let value: string;
  const context = getContext<TabsContext>(TABS_KEY);

  $: active = $context?.activeTab ? $context.activeTab : null;
  $: visible = $active === value;
</script>

{#if visible}
  <div class="ff-tab-content" {...$$restProps}>
    <slot />
  </div>
{/if}
