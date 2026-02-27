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
        this.stats = {
            totalClasses: 0,
            usedClasses: 0,
            unusedClasses: 0,
            originalSize: Buffer.byteLength(cssContent),
            finalSize: 0,
            extremeMappings: 0,
            unusedList: []
        };

        // 1. Identify all .ff- selectors in the source
        const classRegex = /\.ff-([\w-]+)/g;
        const foundInCSS = new Set();
        let match;
        while ((match = classRegex.exec(cssContent)) !== null) {
            foundInCSS.add(`ff-${match[1]}`);
        }
        this.stats.totalClasses = foundInCSS.size;

        // 2. Generate mappings only for USED classes
        foundInCSS.forEach(cls => {
            if (this.usedClasses.has(cls)) {
                this.generateMapping(cls);
            } else {
                this.stats.unusedList.push(cls);
            }
        });
        this.stats.usedClasses = Object.keys(this.mapping).length;
        this.stats.unusedClasses = this.stats.totalClasses - this.stats.usedClasses;
        if (this.mode === 'ext') {
            this.stats.extremeMappings = this.stats.usedClasses;
        }

        // 3. Tree-shaking (Block-level pruning) - DO THIS FIRST while names are original
        const blocks = processed.split('}');
        const filteredBlocks = blocks.filter(block => {
            const selectorIndex = block.indexOf('{');
            if (selectorIndex === -1) return block.trim().length > 0;

            const selector = block.substring(0, selectorIndex).trim();

            if (selector.includes('.ff-')) {
                const ffClassesInSelector = selector.match(/\.ff-[\w-]+/g);
                if (ffClassesInSelector) {
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
        const sortedClasses = Object.keys(this.mapping).sort((a, b) => b.length - a.length);
        sortedClasses.forEach(cls => {
            const mapped = this.mapping[cls];
            if (cls !== mapped) {
                const escapedCls = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\.${escapedCls}(?![\\w-])`, 'g');
                processed = processed.replace(regex, `.${mapped}`);
            }
        });

        // 5. Keyframe Pruning
        processed = this.pruneKeyframes(processed);
        this.stats.finalSize = Buffer.byteLength(processed);
        return processed;
    }

    /**
     * @returns {Object} v0.9.4 Intelligence Stats
     */
    getStats() {
        return {
            ...this.stats,
            gzipEstimate: Math.round(this.stats.finalSize * 0.3) // Rough estimate for reporting
        };
    }

    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            engineVersion: "0.9.7",
            mode: this.mode,
            stats: this.getStats(),
            mapping: this.getMapping()
        };
    }

    pruneKeyframes(css) {
        const animationRegex = /animation(?:\-name)?\s*:\s*([^;!}]+)/g;
        const usedAnimations = new Set();
        let match;
        while ((match = animationRegex.exec(css)) !== null) {
            const parts = match[1].split(/[,\s]+/).map(p => p.trim());
            parts.forEach(p => {
                if (p && !/^\d|ms|s|infinite|linear|ease|both|forwards|backwards/.test(p)) {
                    usedAnimations.add(p);
                }
            });
        }

        const keyframeBlocks = css.split(/@keyframes\s+([\w-]+)\s*\{/);
        if (keyframeBlocks.length <= 1) return css;

        let finalCSS = keyframeBlocks[0];
        for (let i = 1; i < keyframeBlocks.length; i += 2) {
            const name = keyframeBlocks[i];
            const contentAndRest = keyframeBlocks[i + 1];

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
        const sortedMapping = {};
        Object.keys(this.mapping).sort().forEach(key => {
            sortedMapping[key] = this.mapping[key];
        });
        return sortedMapping;
    }
}

/**
 * Vite Plugin Bridge for FingguFlux Compiler
 */
export function fingguCompiler(options = {}) {
    const mode = options.mode || 'dev';
    const engine = new CompilerEngine({ mode });

    return {
        name: 'finggu-compiler',
        enforce: 'post',
        apply: 'build',
        async transform(code, id) {
            // Scan only source files for ff-* classes
            if (id.includes('node_modules')) return;
            if (!id.match(/\.[jt]sx?$/)) return;

            const matches = code.match(/ff-[\w-]+/g);
            if (matches) {
                matches.forEach(cls => engine.usedClasses.add(cls));
                engine.resolveDependencies();
            }
            return null;
        },
        async generateBundle() {
            // Ensure all collected classes have mappings
            engine.usedClasses.forEach(cls => engine.generateMapping(cls));

            const mapping = engine.getMapping();

            // Emit mapping.json
            this.emitFile({
                type: 'asset',
                fileName: 'finggu-mapping.json',
                source: JSON.stringify(mapping, null, 2)
            });

            console.log(`\n✨ [FingguFlux] Contract hardened: ${Object.keys(mapping).length} classes mapped in ${mode} mode.`);
        }
    };
}
