<script lang="ts" context="module">
  export const __ffClasses_Input = [
    'ff-input',
    'ff-input-error'
  ];
</script>

<script lang="ts">
  import { useFinggu } from './context';

  export let error: boolean = false;

  const finggu = useFinggu();

  $: ffClasses = $finggu.resolveAll([
    'ff-input',
    error && 'ff-input-error',
    $$props.class
  ]);
</script>

<input class={ffClasses} {...$$restProps} />
