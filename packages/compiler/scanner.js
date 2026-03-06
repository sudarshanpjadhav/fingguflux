/**
 * FingguFlux Scanner (Infrastructure Grade)
 * Upgraded from RegEx to AST-based structural analysis.
 * Supports HTML, JS, JSX, TS, TSX, Vue, and Svelte.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import * as parse5 from 'parse5';
import * as vueCompiler from '@vue/compiler-dom';
import * as svelteCompiler from 'svelte/compiler';

const traverse = _traverse.default || _traverse;

const ffClassRegex = /\bff-[\w-]+\b/g;
const parseCache = new Map();

/**
 * Extracts all ff-* classes from a string.
 */
const extractFFClasses = (text) => {
    if (!text || typeof text !== 'string') return [];
    const matches = text.match(ffClassRegex);
    return matches || [];
};

/**
 * JS/JSX/TS/TSX Parser
 */
const scanJS = (content, filePath) => {
    const classes = new Set();
    const isTS = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    const isJSX = filePath.endsWith('.jsx') || filePath.endsWith('.tsx');

    const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: [
            isTS ? 'typescript' : null,
            isJSX ? 'jsx' : null,
        ].filter(Boolean),
    });

    traverse(ast, {
        // Strings like "ff-btn ff-primary"
        StringLiteral({ node }) {
            extractFFClasses(node.value).forEach(cls => classes.add(cls));
        },
        // Template literals like `ff-btn ${active ? 'ff-primary' : ''}`
        TemplateLiteral({ node }) {
            node.quasis.forEach(quasi => {
                extractFFClasses(quasi.value.cooked).forEach(cls => classes.add(cls));
            });
        },
        // Objects or other expressions
        JSXAttribute({ node }) {
            if (node.name.name === 'class' || node.name.name === 'className') {
                if (node.value && node.value.type === 'StringLiteral') {
                    extractFFClasses(node.value.value).forEach(cls => classes.add(cls));
                }
            }
        },
    });

    return Array.from(classes);
};

/**
 * HTML Parser
 */
const scanHTML = (content) => {
    const classes = new Set();
    const document = parse5.parse(content);

    const walk = (node) => {
        if (node.attrs) {
            node.attrs.forEach(attr => {
                if (attr.name === 'class' || attr.name === 'className') {
                    extractFFClasses(attr.value).forEach(cls => classes.add(cls));
                }
            });
        }
        if (node.childNodes) {
            node.childNodes.forEach(walk);
        }
    };

    walk(document);
    return Array.from(classes);
};

/**
 * Vue Parser
 */
const scanVue = (content) => {
    const classes = new Set();
    const { ast } = vueCompiler.compile(content, {
        mode: 'module',
        onError: () => { } // Ignore template tags side effect warnings
    });

    const walk = (node) => {
        if (!node) return;

        // Handle props
        if (node.props) {
            node.props.forEach(prop => {
                // Static class="ff-btn"
                if (prop.name === 'class' && prop.value) {
                    extractFFClasses(prop.value.content).forEach(cls => classes.add(cls));
                }
                // Dynamic :class="{ 'ff-active': active }"
                if (prop.name === 'bind' && prop.arg && prop.arg.content === 'class') {
                    // Extract strings from the expression string
                    extractFFClasses(prop.exp.content).forEach(cls => classes.add(cls));
                }
            });
        }

        if (node.children) {
            node.children.forEach(walk);
        }
    };

    walk(ast);
    return Array.from(classes);
};

/**
 * Svelte Parser
 */
const scanSvelte = (content) => {
    const classes = new Set();
    const ast = svelteCompiler.parse(content);

    const walk = (node) => {
        if (node.attributes) {
            node.attributes.forEach(attr => {
                if (attr.name === 'class') {
                    if (Array.isArray(attr.value)) {
                        attr.value.forEach(part => {
                            if (part.type === 'Text') {
                                extractFFClasses(part.data).forEach(cls => classes.add(cls));
                            } else if (part.type === 'AttributeShorthand' || part.type === 'MustacheTag') {
                                // For expressions, we'll scan the raw expression text for ff-* literals
                                // Better than RegEx on full file, still heuristic within expression.
                                if (part.expression && part.expression.raw) {
                                    extractFFClasses(part.expression.raw).forEach(cls => classes.add(cls));
                                }
                            }
                        });
                    }
                }
            });
        }

        // Recursively walk through Svelte's AST properties
        const keys = ['html', 'css', 'instance', 'module', 'children'];
        keys.forEach(key => {
            if (node[key]) {
                if (Array.isArray(node[key])) {
                    node[key].forEach(walk);
                } else {
                    walk(node[key]);
                }
            }
        });
    };

    walk(ast);
    return Array.from(classes);
};

/**
 * Main File Scanner
 */
export const scanFiles = (filePaths) => {
    const usedClasses = new Set();
    const start = Date.now();

    filePaths.forEach((filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const hash = crypto.createHash('md5').update(content).digest('hex');

            // Check cache
            const cacheKey = filePath;
            if (parseCache.has(cacheKey)) {
                const cached = parseCache.get(cacheKey);
                if (cached.hash === hash) {
                    cached.classes.forEach(cls => usedClasses.add(cls));
                    return;
                }
            }

            const ext = path.extname(filePath);
            let extracted = [];

            if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                extracted = scanJS(content, filePath);
            } else if (ext === '.html') {
                extracted = scanHTML(content);
            } else if (ext === '.vue') {
                extracted = scanVue(content);
            } else if (ext === '.svelte') {
                extracted = scanSvelte(content);
            } else {
                // Fallback for unknown extensions: extraction based on literals.
                extracted = extractFFClasses(content);
            }

            extracted.forEach(cls => usedClasses.add(cls));

            // Update cache
            parseCache.set(cacheKey, { hash, classes: extracted });

        } catch (err) {
            console.error(`❌ AST Parse Error in ${filePath}: ${err.message}`);
            process.exit(1); // Fail the build as per requirements
        }
    });

    const results = Array.from(usedClasses).sort();
    const duration = Date.now() - start;

    // Internal logging for audit verification
    if (process.env.FINGGU_BENCHMARK) {
        console.log(`[AST SCANNER] Completed in ${duration}ms`);
    }

    return results;
};

/**
 * Recursively gets all project files.
 */
export const getProjectFiles = (dir, extensions = ['.html', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']) => {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            const base = path.basename(file);
            if (base === 'node_modules' || base.startsWith('.')) return;
            results = results.concat(getProjectFiles(file, extensions));
        } else {
            if (extensions.includes(path.extname(file))) {
                results.push(file);
            }
        }
    });

    return results;
};
