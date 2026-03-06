const fs = require('fs');
const cp = require('child_process');
const crypto = require('crypto');

function getHashes() {
    const files = fs.readdirSync('dist').sort();
    const hashes = {};
    for (const f of files) {
        if (!fs.statSync('dist/' + f).isFile()) continue;
        const c = fs.readFileSync('dist/' + f);
        hashes[f] = crypto.createHash('sha256').update(c).digest('hex');
    }
    return hashes;
}

cp.execSync('npm run compile', { stdio: 'inherit' });
const h1 = getHashes();

cp.execSync('npm run compile', { stdio: 'inherit' });
const h2 = getHashes();

console.log('H1:', h1);
console.log('H2:', h2);

for (const f in h1) {
    if (h1[f] !== h2[f]) {
        console.log('Mismatch in file:', f);
        try {
            console.log('--- File 1 ---\n' + fs.readFileSync('dist1/' + f, 'utf8'));
        } catch (e) { }
    }
}
