<script lang="ts">
  import { useFinggu } from './context';
  const finggu = useFinggu();
  $: ffClasses = $finggu.resolveAll(['ff-dropdown-item', $$props.class]);
</script>

<div class={ffClasses} {...$$restProps}>
  <slot />
</div>
