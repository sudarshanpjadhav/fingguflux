<script lang="ts" context="module">
  const VARIANTS = {
    outline: 'ff-card-outline',
    glass: 'ff-card-glass'
  } as const;

  const PADDINGS = {
    none: 'ff-p-0',
    sm: 'ff-p-2',
    md: 'ff-p-4',
    lg: 'ff-p-8'
  } as const;

  export const __ffClasses_Card = [
    'ff-card',
    'ff-card-header',
    'ff-card-body',
    ...Object.values(VARIANTS),
    ...Object.values(PADDINGS)
  ];
</script>

<script lang="ts">
  import { useFinggu } from './context';

  export let variant: keyof typeof VARIANTS | undefined = undefined;
  export let padding: keyof typeof PADDINGS = 'md';

  const finggu = useFinggu();

  $: ffClasses = $finggu.resolveAll([
    'ff-card',
    variant && VARIANTS[variant],
    PADDINGS[padding],
    $$props.class
  ]);
</script>

<div class={ffClasses} {...$$restProps}>
  <slot />
</div>
