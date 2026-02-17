/**
 * FingguFlux Compiler Engine
 * Handles dependency resolution, tree-shaking, and selector mapping.
 */
import fs from 'fs';
import path from 'path';

export class CompilerEngine {
    constructor(options = {}) {
        this.mode = options.mode || 'dev'; // dev, opt, ext
        this.mapping = {};
        this.usedClasses = new Set();

        // Dependency Manifest
        this.dependencies = {
            'ff-btn-': 'ff-btn',
            'ff-tab-': 'ff-tab',
            'ff-dropdown-': 'ff-dropdown',
            'ff-modal-': 'ff-modal',
            'ff-card-': 'ff-card',
            'ff-input-': 'ff-input'
        };
    }

    setUsedClasses(classes) {
        this.usedClasses = new Set(classes);
        this.resolveDependencies();
    }

    /**
     * Resolves base class dependencies for variants
     */
    resolveDependencies() {
        const expanded = new Set(this.usedClasses);
        this.usedClasses.forEach(cls => {
            for (const [prefix, base] of Object.entries(this.dependencies)) {
                if (cls.startsWith(prefix)) {
                    expanded.add(base);
                }
            }
        });
        this.usedClasses = expanded;
    }

    /**
     * Generates a deterministic short hash for a class name
     * Uses a simple FNV-1a inspired hash for speed and determinism
     */
    getHash(str) {
        let hash = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return (hash >>> 0).toString(36);
    }

    generateMapping(cls) {
        if (this.mapping[cls]) return this.mapping[cls];

        if (this.mode === 'dev') {
            this.mapping[cls] = cls;
        } else if (this.mode === 'opt') {
            this.mapping[cls] = cls.replace('ff-', '');
        } else if (this.mode === 'ext') {
            const hash = this.getHash(cls);
            this.mapping[cls] = `ff-${hash}`;
        }

        return this.mapping[cls];
    }

    processCSS(cssContent) {
        let processed = cssContent;

        // 1. Identify all .ff- selectors in the source
        const classRegex = /\.ff-([\w-]+)/g;
        const foundInCSS = new Set();
        let match;
        while ((match = classRegex.exec(cssContent)) !== null) {
            foundInCSS.add(`ff-${match[1]}`);
        }

        // 2. Generate mappings only for USED classes
        foundInCSS.forEach(cls => {
            if (this.usedClasses.has(cls)) {
                this.generateMapping(cls);
            }
        });

        // 3. Tree-shaking (Block-level pruning) - DO THIS FIRST while names are original
        const blocks = processed.split('}');
        const filteredBlocks = blocks.filter(block => {
            const selectorIndex = block.indexOf('{');
            if (selectorIndex === -1) return block.trim().length > 0;

            const selector = block.substring(0, selectorIndex).trim();

            if (selector.includes('.ff-')) {
                const ffClassesInSelector = selector.match(/\.ff-[\w-]+/g);
                if (ffClassesInSelector) {
                    // Prune block if ANY ff- class in the selector is unused
                    // (Matches our strict tree-shaking policy for components/utilities)
                    const hasUnused = ffClassesInSelector.some(cls => {
                        const baseCls = cls.substring(1);
                        return !this.usedClasses.has(baseCls);
                    });
                    if (hasUnused) return false;
                }
            }
            return true;
        });

        processed = filteredBlocks.join('}') + (filteredBlocks.length > 0 ? '}' : '');

        // 4. Replace selectors with mapped hashes
        // NOTE: We explicitly DO NOT hash CSS variables starting with --ff-
        // This ensures runtime theme switching remains operational.
        const sortedClasses = Object.keys(this.mapping).sort((a, b) => b.length - a.length);
        sortedClasses.forEach(cls => {
            const mapped = this.mapping[cls];
            if (cls !== mapped) {
                const escapedCls = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\.${escapedCls}(?![\\w-])`, 'g');
                processed = processed.replace(regex, `.${mapped}`);
            }
        });

        // 5. Keyframe Pruning (Post-pruning)
        return this.pruneKeyframes(processed);
    }

    pruneKeyframes(css) {
        // Find all referenced animation names
        const animationRegex = /animation(?:\-name)?\s*:\s*([^;!}]+)/g;
        const usedAnimations = new Set();
        let match;
        while ((match = animationRegex.exec(css)) !== null) {
            // Split by space/comma and filter out durations/easings/etc
            const parts = match[1].split(/[,\s]+/).map(p => p.trim());
            parts.forEach(p => {
                if (p && !/^\d|ms|s|infinite|linear|ease|both|forwards|backwards/.test(p)) {
                    usedAnimations.add(p);
                }
            });
        }

        // Prune unused @keyframes blocks
        const keyframeBlocks = css.split(/@keyframes\s+([\w-]+)\s*\{/);
        if (keyframeBlocks.length <= 1) return css;

        let finalCSS = keyframeBlocks[0];
        for (let i = 1; i < keyframeBlocks.length; i += 2) {
            const name = keyframeBlocks[i];
            const contentAndRest = keyframeBlocks[i + 1];

            // Find the end of this @keyframes block (handling nested braces if any)
            let braceCount = 1;
            let endOfBlock = -1;
            for (let j = 0; j < contentAndRest.length; j++) {
                if (contentAndRest[j] === '{') braceCount++;
                if (contentAndRest[j] === '}') braceCount--;
                if (braceCount === 0) {
                    endOfBlock = j;
                    break;
                }
            }

            const keyframeContent = contentAndRest.substring(0, endOfBlock + 1);
            const rest = contentAndRest.substring(endOfBlock + 1);

            if (usedAnimations.has(name)) {
                finalCSS += `@keyframes ${name} {${keyframeContent}`;
            }
            finalCSS += rest;
        }

        return finalCSS;
    }

    getMapping() {
        // Return sorted mapping for stability
        const sortedMapping = {};
        Object.keys(this.mapping).sort().forEach(key => {
            sortedMapping[key] = this.mapping[key];
        });
        return sortedMapping;
    }
}
