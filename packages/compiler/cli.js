#!/usr/bin/env node
/**
 * FingguFlux CLI
 * v1.0.0-beta.1
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanFiles, getProjectFiles } from './scanner.js';
import { CompilerEngine } from './engine.js';
import { runThemeCheck, printThemeCheckReport } from './theme-check.js';
import {
    generateSnapshot, writeSnapshot, runSnapshotCompare, printSnapshotReport
} from './snapshot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../');
const srcPath = path.resolve(frameworkRoot, 'src');

if (!fs.existsSync(srcPath)) {
    console.error('❌ FingguFlux installation corrupted. Internal source not found.');
    console.error(`   Expected path: ${srcPath}`);
    process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0] || 'build';

const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const mode = getArg('--mode') || 'dev';
const inputDir = getArg('--input') || './';
const outputDir = getArg('--output') || './dist';

async function main() {
    switch (command) {
        case 'build':
            await runBuild();
            break;
        case 'analyze':
            await runAnalyze();
            break;
        case 'doctor':
            await runDoctor();
            break;
        case 'a11y':
            await runA11y();
            break;
        case 'theme-check':
            await runThemeCheckCommand();
            break;
        case 'snapshot':
            await runSnapshotCommand();
            break;
        case 'harden':
            // Harden maps to snapshot comparison in public beta
            await runSnapshotCommand({ compare: true });
            break;
        default:
            console.error(`Unknown command: ${command}`);
            console.log('Available commands: build, analyze, doctor, a11y, theme-check, snapshot, harden');
            process.exit(1);
    }
}

async function prepareEngine() {
    const files = getProjectFiles(path.resolve(inputDir));
    const usedClasses = scanFiles(files);
    const engine = new CompilerEngine({ mode });
    engine.setUsedClasses(usedClasses);

    // Collect CSS source files from internal registry
    let combinedCSS = '';
    const corePath = srcPath;

    const collectCSS = (dir) => {
        if (!fs.existsSync(dir)) return;
        const list = fs.readdirSync(dir).sort(); // Deterministic file ordering
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

    const finalCSS = engine.processCSS(combinedCSS);
    return { engine, finalCSS, usedClasses };
}

async function runBuild() {
    console.log(`\n🚀 FingguFlux Compiler [Mode: ${mode.toUpperCase()}]`);

    // 1. Token Enforcement Guard
    validateTokenEnforcement();

    const { engine, finalCSS } = await prepareEngine();

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const cssPath = path.join(outputDir, 'finggu.css');
    const mappingPath = path.join(outputDir, 'mapping.json');
    const reportPath = path.join(outputDir, 'fingguflux-report.json');

    fs.writeFileSync(cssPath, finalCSS);
    fs.writeFileSync(mappingPath, JSON.stringify(engine.getMapping(), null, 2));
    fs.writeFileSync(reportPath, JSON.stringify(engine.generateReport(), null, 2));

    console.log(`✅ Build Complete!`);
    console.log(`- CSS: ${cssPath} (${Buffer.byteLength(finalCSS)} bytes)`);
    console.log(`- Report: ${reportPath}`);
}

/**
 * Validates that no hardcoded values exist in src/components or src/utilities.
 * Throws error to fail the build if violations are found.
 */
function validateTokenEnforcement() {
    console.log('🔍 Running Token Enforcement Audit...');
    const forbiddenPatterns = [
        { regex: /#[0-9a-fA-F]{3,8}/g, name: 'Hex Color' },
        { regex: /rgba?\((?!var)/g, name: 'Raw RGB/RGBA' },
        { regex: /\d+(px|rem)(?!\))/g, name: 'Hardcoded Unit' },
        { regex: /z-index:\s*\d+/g, name: 'Hardcoded Z-Index' }
    ];

    const searchDirs = [
        path.join(srcPath, 'components'),
        path.join(srcPath, 'utilities')
    ];
    let violations = [];

    const scan = (dir) => {
        const absDir = dir;
        if (!fs.existsSync(absDir)) return;

        const files = fs.readdirSync(absDir);
        files.forEach(file => {
            const p = path.join(absDir, file);
            if (fs.statSync(p).isDirectory()) {
                scan(p);
            } else if (file.endsWith('.css')) {
                const content = fs.readFileSync(p, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    forbiddenPatterns.forEach(pattern => {
                        const matches = line.match(pattern.regex);
                        if (matches) {
                            // Filter out false positives (e.g. inside var statements or comments)
                            if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
                            violations.push(`[${pattern.name}] ${file}:${idx + 1} -> ${line.trim()}`);
                        }
                    });
                });
            }
        });
    };

    searchDirs.forEach(scan);

    if (violations.length > 0) {
        console.error('\n❌ TOKEN ENFORCEMENT FAILURE: Hardcoded values detected!');
        violations.forEach(v => console.error(`   ${v}`));
        console.error('\nBuild failed. All values must use var(--ff-*) tokens.');
        process.exit(1);
    }
    console.log('✅ Token contract verified. No hardcoded values found.');
}

async function runAnalyze() {
    console.log(`\n📊 FingguFlux Intelligence - Analyze Mode`);
    const { engine } = await prepareEngine();
    const stats = engine.getStats();

    console.log(`-------------------------------------------`);
    console.log(`Total Scanned Classes:  ${stats.totalClasses}`);
    console.log(`Used Classes:           ${stats.usedClasses}`);
    console.log(`Unused Classes:         ${stats.unusedClasses}`);
    console.log(`Extreme Mappings:       ${stats.extremeMappings}`);
    console.log(`-------------------------------------------`);
    console.log(`Original Size:          ${stats.originalSize} bytes`);
    console.log(`Estimated Final Size:   ${stats.finalSize} bytes`);
    console.log(`Gzip Estimate (~30%):   ${stats.gzipEstimate} bytes`);
    console.log(`-------------------------------------------`);

    if (stats.unusedList.length > 0 && args.includes('--verbose')) {
        console.log(`\n💀 Unused Classes:`);
        stats.unusedList.slice(0, 20).forEach(c => console.log(`  - ${c}`));
        if (stats.unusedList.length > 20) console.log(`  ... and ${stats.unusedList.length - 20} more.`);
    }
}

async function runDoctor() {
    console.log(`\n🩺 FingguFlux Intelligence - Doctor Mode`);
    const mappingPath = path.resolve(outputDir, 'mapping.json');
    const corePkgPath = path.resolve(frameworkRoot, 'package.json');

    let healthy = true;

    // 1. Check mapping
    if (fs.existsSync(mappingPath)) {
        console.log(`✅ mapping.json found.`);
        try {
            const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
            if (Object.keys(mapping).length === 0) {
                console.warn(`⚠️ Warning: mapping.json is empty.`);
            }
        } catch {
            console.error(`❌ Error: mapping.json is corrupted.`);
            healthy = false;
        }
    } else {
        console.warn(`⚠️ Warning: mapping.json not found in ${outputDir}. Run build first.`);
        healthy = false;
    }

    // 2. Check Core Version
    if (fs.existsSync(corePkgPath)) {
        const corePkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
        console.log(`✅ Core version verified: ${corePkg.version}`);
    }

    // 3. Extreme Mode Compatibility
    const { usedClasses } = await prepareEngine();
    const invalidClasses = usedClasses.filter(c => !c.startsWith('ff-'));
    if (invalidClasses.length > 0) {
        console.error(`❌ Error: ${invalidClasses.length} classes do not follow ff- prefix!`);
        invalidClasses.slice(0, 5).forEach(c => console.log(`  - ${c}`));
        healthy = false;
    } else {
        console.log(`✅ All used classes follow ff- prefix.`);
    }

    if (healthy) console.log(`\n✨ Project is healthy!`);
    else console.log(`\n❌ Project has issues. See details above.`);
}

async function runA11y() {
    console.log(`\n♿ FingguFlux Accessibility Audit`);
    const { validateTemplate, getContrastRatio } = await import('./a11y.js');
    const files = getProjectFiles(path.resolve(inputDir));

    let totalIssues = 0;

    // 1. Template Validation
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const fileIssues = validateTemplate(content);
        if (fileIssues.length > 0) {
            console.log(`\nFile: ${path.relative(process.cwd(), file)}`);
            fileIssues.forEach(issue => {
                const typeColor = issue.type === 'Error' ? '\x1b[31m' : '\x1b[33m';
                console.log(`  [${typeColor}${issue.type}\x1b[0m] ${issue.component}: ${issue.message}`);
                totalIssues++;
            });
        }
    });

    // 2. Token Contrast Check
    console.log(`\n🎨 Semantic Token Contrast Check:`);
    const coreTokensPath = path.join(srcPath, 'tokens', 'tokens.css');
    const corePath = fs.existsSync(coreTokensPath) ? coreTokensPath : null;

    if (corePath) {
        const tokens = fs.readFileSync(corePath, 'utf8');
        const pairings = [
            ['--ff-success-surface', '--ff-success-content', 'Success'],
            ['--ff-warning-surface', '--ff-warning-content', 'Warning'],
            ['--ff-danger-surface', '--ff-danger-content', 'Danger']
        ];

        pairings.forEach(([bgVar, fgVar, label]) => {
            const bgMatch = tokens.match(new RegExp(`${bgVar}: ([#\\w]+)`));
            const fgMatch = tokens.match(new RegExp(`${fgVar}: ([#\\w]+)`));
            if (bgMatch && fgMatch) {
                const ratio = getContrastRatio(bgMatch[1], fgMatch[1]);
                const pass = ratio >= 4.5;
                const status = pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
                console.log(`  ${label.padEnd(10)}: ${status} (${ratio.toFixed(2)}:1)`);
                if (!pass) totalIssues++;
            }
        });
    }

    if (totalIssues === 0) {
        console.log(`\n✨ No accessibility issues found!`);
    } else {
        console.log(`\n❌ Found ${totalIssues} accessibility issues.`);
    }
}

async function runThemeCheckCommand() {
    const tokensPath = path.join(srcPath, 'tokens', 'tokens.css');
    if (!fs.existsSync(tokensPath)) {
        console.error('❌ tokens.css not found internally.');
        console.error(`   Expected: ${tokensPath}`);
        process.exit(1);
    }

    const css = fs.readFileSync(tokensPath, 'utf8');
    const verbose = args.includes('--verbose');

    let result;
    try {
        result = runThemeCheck(css);
    } catch (e) {
        console.error('❌ theme-check failed:', e.message);
        process.exit(1);
    }

    printThemeCheckReport(result, { verbose });

    if (!result.pass) process.exit(1);
}

async function runSnapshotCommand(override = {}) {
    const doWrite = args.includes('--write');
    const doCompare = override.compare || args.includes('--compare');
    const verbose = args.includes('--verbose');

    if (doWrite) {
        console.log('\n📸 Generating API surface snapshot…');
        const snap = writeSnapshot();
        const dim = snap.surface;
        console.log(`  ✅ CSS tokens    : ${dim.cssTokens.length}`);
        console.log(`  ✅ JS exports    : ${dim.jsExports.length}`);
        console.log(`  ✅ CLI commands  : ${dim.cliCommands.length}`);
        console.log(`  ✅ Component CSS : ${dim.componentFiles.length}`);
        console.log(`\n✨ Snapshot written → src/metadata/API_SURFACE_SNAPSHOT.json  (v${snap.version})\n`);
        return;
    }

    if (doCompare) {
        let report;
        try {
            report = runSnapshotCompare();
        } catch (e) {
            console.error('\n❌', e.message);
            process.exit(1);
        }
        printSnapshotReport(report, verbose);
        if (!report.pass) process.exit(1);
    }
}

main().catch(err => {
    console.error('Command failed:', err);
    process.exit(1);
});
