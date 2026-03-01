/**
 * FingguFlux Token Registry
 * 
 * This file serves as the official contract for all CSS variables used in FingguFlux.
 * All variables MUST follow the --ff-[category]-[name] convention.
 */

export const TOKENS = {
    // Colors
    Colors: {
        Primary: '--ff-primary',
        Secondary: '--ff-secondary',
        Danger: '--ff-danger',
        Success: '--ff-success',
        Warning: '--ff-warning',
        Info: '--ff-info',
        Surface: '--ff-surface',
        Text: '--ff-text',
        Neutral: (level: number) => `--ff-neutral-${level}`,
        PrimaryShade: (level: number) => `--ff-primary-${level}`,
        PrimaryRing: '--ff-primary-ring',
        DangerRing: '--ff-danger-ring',
        Transparent: '--ff-color-transparent'
    },

    // Spacing
    Spacing: {
        Scale: (level: number) => `--ff-space-${level}`,
        Neg1: '--ff-space-neg-1',
        Neg2: '--ff-space-neg-2',
        DropdownWidth: '--ff-width-dropdown'
    },

    // Radius
    Radius: {
        None: '--ff-radius-none',
        Sm: '--ff-radius-sm',
        Md: '--ff-radius-md',
        Lg: '--ff-radius-lg',
        Xl: '--ff-radius-xl',
        '2Xl': '--ff-radius-2xl',
        Full: '--ff-radius-full'
    },

    // Motion
    Motion: {
        Fast: '--ff-motion-fast',
        Medium: '--ff-motion-medium',
        Slow: '--ff-motion-slow',
        Reduction: '--ff-motion-reduction'
    },

    Effects: {
        ShadowSm: '--ff-shadow-sm',
        ShadowMd: '--ff-shadow-md',
        ShadowLg: '--ff-shadow-lg',
        ShadowXl: '--ff-shadow-xl',
        BlurMd: '--ff-blur-md',
        GlassHighlight: '--ff-glass-highlight',
        GlassHighlightSubtle: '--ff-glass-highlight-subtle',
        GlassDarkOverlay: '--ff-glass-dark-overlay',
        GlassBorder: '--ff-glass-border',
        ShadowNone: '--ff-shadow-none'
    },

    // Z-Index
    ZIndex: {
        10: '--ff-z-10',
        20: '--ff-z-20',
        50: '--ff-z-50',
        1: '--ff-z-1'
    },

    // Position
    Position: {
        0: '--ff-pos-0',
        Half: '--ff-pos-half'
    },

    // Opacity
    Opacity: {
        0: '--ff-opacity-0',
        50: '--ff-opacity-50',
        75: '--ff-opacity-75',
        100: '--ff-opacity-100'
    },

    Typography: {
        Sans: '--ff-font-sans',
        Mono: '--ff-font-mono',
        SizeBadge: '--ff-font-size-badge'
    }
} as const;

export type TokenRegistry = typeof TOKENS;
