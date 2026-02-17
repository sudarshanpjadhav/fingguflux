<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { TABS_KEY } from './tabs-shared';

  export let defaultValue: string;
  const activeTab = writable(defaultValue);
  setContext(TABS_KEY, { activeTab });
</script>

<div class="ff-tabs" {...$$restProps}>
  <slot />
</div>
