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
        PrimaryShade: (level: number) => `--ff-primary-${level}`
    },

    // Spacing
    Spacing: {
        Scale: (level: number) => `--ff-space-${level}`
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
        Slow: '--ff-motion-slow'
    },

    Effects: {
        ShadowSm: '--ff-shadow-sm',
        ShadowMd: '--ff-shadow-md',
        ShadowLg: '--ff-shadow-lg',
        ShadowXl: '--ff-shadow-xl',
        BlurMd: '--ff-blur-md',
        GlassHighlight: '--ff-glass-highlight',
        GlassBorder: '--ff-glass-border'
    },

    // Z-Index
    ZIndex: {
        10: '--ff-z-10',
        20: '--ff-z-20',
        50: '--ff-z-50'
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
    }
} as const;

export type TokenRegistry = typeof TOKENS;
