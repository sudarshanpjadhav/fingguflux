<script lang="ts" context="module">
  const VARIANTS = {
    primary: 'ff-btn-primary',
    secondary: 'ff-btn-secondary',
    ghost: 'ff-btn-ghost',
    outline: 'ff-btn-outline'
  } as const;

  const SIZES = {
    sm: 'ff-btn-sm',
    md: 'ff-btn-md',
    lg: 'ff-btn-lg'
  } as const;

  const MOTIONS = {
    fade: 'ff-fade-in',
    'slide-up': 'ff-slide-up',
    'scale-in': 'ff-scale-in',
    lift: 'ff-hover-lift'
  } as const;

  export const __ffClasses_Button = [
    'ff-btn',
    ...Object.values(VARIANTS),
    ...Object.values(SIZES),
    ...Object.values(MOTIONS),
    'ff-card-glass'
  ];
</script>

<script lang="ts">
  import { useFinggu } from './context';
  
  export let variant: keyof typeof VARIANTS = 'primary';
  export let size: keyof typeof SIZES = 'md';
  export let motion: keyof typeof MOTIONS | undefined = undefined;
  export let glass: boolean = false;

  const finggu = useFinggu();

  $: ffClasses = $finggu.resolveAll([
    'ff-btn',
    VARIANTS[variant],
    SIZES[size],
    glass && 'ff-card-glass',
    motion && MOTIONS[motion],
    $$props.class
  ]);
</script>

<button class={ffClasses} {...$$restProps}>
  <slot />
</button>
