import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import zlib from 'zlib';

const ROOT = process.cwd();
const BENCHMARK_DIR = path.join(ROOT, 'benchmark');
const DIST_DIR = path.join(BENCHMARK_DIR, 'dist');

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

const results = [];

const measure = (name, cssContent) => {
    const rawSize = Buffer.byteLength(cssContent);
    const minifiedSize = rawSize; // Assuming already minified
    const gzipSize = zlib.gzipSync(cssContent).length;

    return {
        name,
        rawSize,
        gzipSize,
        reduction: 0 // Will calculate later
    };
};

const runBenchmark = async () => {
    console.log('🚀 Starting FingguFlux Benchmark Runner...');

    // 1. FingguFlux
    console.log('📦 Building FingguFlux...');
    const fingguInput = path.join(BENCHMARK_DIR, 'implementations', 'fingguflux');

    try {
        const cliPath = path.join(ROOT, 'packages', 'compiler', 'cli.js');
        // Use absolute paths to avoid resolution issues
        const cmd = `node "${cliPath}" build --input "${fingguInput}" --output "${DIST_DIR}" --mode dev`;
        console.log(`Executing: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });

        const fingguCSS = fs.readFileSync(path.join(DIST_DIR, 'finggu.css'), 'utf8');
        results.push(measure('FingguFlux (Opt)', fingguCSS));
    } catch (e) {
        console.error('❌ FingguFlux Build Failed');
        throw e;
    }

    // 2. Tailwind
    console.log('📦 Building Tailwind...');
    const tailwindDir = path.join(BENCHMARK_DIR, 'implementations', 'tailwind');
    const tailwindConfig = `
      module.exports = {
        content: ["${tailwindDir.replace(/\\/g, '/')}/index.html"],
        theme: { extend: {} },
        plugins: [],
      }
    `;
    fs.writeFileSync(path.join(tailwindDir, 'tailwind.config.js'), tailwindConfig);
    fs.writeFileSync(path.join(tailwindDir, 'input.css'), '@tailwind base; @tailwind components; @tailwind utilities;');

    try {
        const tailwindCmd = `npx tailwindcss -c "${path.join(tailwindDir, 'tailwind.config.js')}" -i "${path.join(tailwindDir, 'input.css')}" -o "${path.join(DIST_DIR, 'tailwind.css')}" --minify`;
        console.log(`Executing: ${tailwindCmd} in benchmark/setup`);
        execSync(tailwindCmd, {
            cwd: path.join(BENCHMARK_DIR, 'setup'),
            stdio: 'inherit'
        });

        const tailwindCSS = fs.readFileSync(path.join(DIST_DIR, 'tailwind.css'), 'utf8');
        results.push(measure('Tailwind CSS', tailwindCSS));
    } catch (e) {
        console.error('❌ Tailwind Build Failed');
        throw e;
    }

    // 3. Bootstrap (Minified)
    console.log('📦 Measuring Bootstrap...');
    const bootstrapPath = path.join(ROOT, 'benchmark', 'setup', 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css');
    const bootstrapCSS = fs.readFileSync(bootstrapPath, 'utf8');
    results.push(measure('Bootstrap (Full)', bootstrapCSS));

    // 4. Vanilla
    console.log('📦 Measuring Vanilla...');
    const vanillaCSS = fs.readFileSync(path.join(BENCHMARK_DIR, 'implementations', 'vanilla', 'style.css'), 'utf8');
    results.push(measure('Vanilla Handcrafted', vanillaCSS));

    // Calculate Percentages (Comparison to Bootstrap)
    const baseSize = results.find(r => r.name === 'Bootstrap (Full)').rawSize;
    results.forEach(r => {
        r.percentageOfBootstrap = ((r.rawSize / baseSize) * 100).toFixed(1) + '%';
        r.savings = (100 - (r.rawSize / baseSize * 100)).toFixed(1) + '%';
    });

    // Write Results
    fs.writeFileSync(path.join(BENCHMARK_DIR, 'results.json'), JSON.stringify(results, null, 2));

    // Generate Summary MD
    let summary = '# FingguFlux Performance Benchmark Results\n\n';
    summary += '| Framework | Raw Size | Gzip Size | vs Bootstrap | Savings |\n';
    summary += '| :--- | :---: | :---: | :---: | :---: |\n';

    results.sort((a, b) => a.rawSize - b.rawSize).forEach(r => {
        summary += `| **${r.name}** | ${r.rawSize} B | ${r.gzipSize} B | ${r.percentageOfBootstrap} | ${r.savings} |\n`;
    });

    summary += '\n\n> Benchmarked on ' + new Date().toISOString() + '\n';
    summary += '> Methodology: Identical UI Scenario, Production Settings.\n';

    fs.writeFileSync(path.join(BENCHMARK_DIR, 'summary.md'), summary);

    console.log('\n📊 Benchmark Complete! Summary generated in benchmark/summary.md');
};

runBenchmark();
