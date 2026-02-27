/**
 * FingguFlux Scanner
 * Scans HTML/Template files to extract used ff-* classes.
 */
import fs from 'fs';
import path from 'path';

export const scanFiles = (filePaths) => {
    const usedClasses = new Set();
    const ffClassRegex = /\bff-[\w-]+\b/g;

    filePaths.forEach((filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(ffClassRegex);
            if (matches) {
                matches.forEach((cls) => usedClasses.add(cls));
            }
        } catch (err) {
            console.error(`Error scanning file ${filePath}:`, err.message);
        }
    });

    return Array.from(usedClasses);
};

export const getProjectFiles = (dir, extensions = ['.html', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']) => {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            const base = path.basename(file);
            if (base === 'node_modules' || base.startsWith('.')) return;
            // Recurse into subdirectory
            results = results.concat(getProjectFiles(file, extensions));
        } else {
            // Check extension
            if (extensions.includes(path.extname(file))) {
                results.push(file);
            }
        }
    });

    return results;
};
