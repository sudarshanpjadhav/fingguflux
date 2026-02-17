#!/usr/bin/env node
/**
 * FingguFlux CLI
 * Phase 6A: Compiler CLI Foundation
 */
import fs from 'fs';
import path from 'path';
import { scanFiles, getProjectFiles } from './scanner.js';
import { CompilerEngine } from './engine.js';

// Basic named argument parser
const args = process.argv.slice(2);
const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const mode = getArg('--mode') || 'dev';
const inputDir = getArg('--input') || './';
const outputDir = getArg('--output') || './dist';

async function runBuild() {
    console.log(`\n🚀 FingguFlux Compiler [Mode: ${mode.toUpperCase()}]`);

    // 1. Scan for used classes
    console.log(`🔍 Scanning files in ${inputDir}...`);
    const files = getProjectFiles(path.resolve(inputDir));
    const usedClasses = scanFiles(files);
    console.log(`✅ Found ${usedClasses.length} used FingguFlux classes.`);

    // 2. Initialize Engine
    const engine = new CompilerEngine({ mode });
    engine.setUsedClasses(usedClasses);

    // 3. Collect CSS source files
    // Try to find them in node_modules or relative to where compiler is
    let combinedCSS = '';
    const possiblePaths = [
        path.resolve('./node_modules/@finggu/core'),
        path.resolve('./packages/core'),
        path.resolve('../../packages/core')
    ];

    let corePath = possiblePaths.find(p => fs.existsSync(p));
    if (!corePath) throw new Error('Could not find @finggu/core CSS sources.');

    const collectCSS = (dir) => {
        if (!fs.existsSync(dir)) return;
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file === 'components') collectCSS(fullPath);
            } else if (path.extname(file) === '.css' && file !== 'index.css') {
                combinedCSS += fs.readFileSync(fullPath, 'utf8') + '\n';
            }
        });
    };

    collectCSS(corePath);

    // 4. Process CSS
    console.log(`🛠️ Processing CSS and applying tree-shaking...`);
    const finalCSS = engine.processCSS(combinedCSS);
    const mapping = engine.getMapping();

    // 5. Output
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const cssPath = path.join(outputDir, 'finggu.css');
    const mappingPath = path.join(outputDir, 'mapping.json');

    fs.writeFileSync(cssPath, finalCSS);
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

    console.log(`\n📦 Build Complete!`);
    console.log(`- CSS: ${cssPath} (${Buffer.byteLength(finalCSS)} bytes)`);
    console.log(`- Mapping: ${mappingPath}`);
    console.log(`- Mode: ${mode}`);
}

runBuild().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
