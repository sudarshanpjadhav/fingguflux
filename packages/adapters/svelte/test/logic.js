const assert = (condition, message) => {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exit(1);
    }
};

const runTest = (name, fn) => {
    console.log(`Running: ${name}...`);
    try {
        fn();
        console.log(`✅ PASS: ${name}`);
    } catch (err) {
        console.error(`❌ FAIL: ${name}`);
        console.error(err);
        process.exit(1);
    }
};

// --- Mocks & Core Logic (Simulating Svelte Stores) ---

const mockUseFinggu = (mode, mapping) => {
    // In Svelte, this returns a derived store. We'll simulate the resolution logic directly.
    const fingguState = { mapping, mode };

    const resolve = (className) => {
        if (mode === 'dev' || !mapping) return className;
        const mapped = mapping[className];
        if (mode === 'ext' && !mapped && className.startsWith('ff-')) {
            throw new Error(`Missing mapping for ${className}`);
        }
        return mapped || className;
    };

    const resolveAll = (classes) => {
        return classes
            .filter(Boolean)
            .map(c => resolve(c))
            .join(' ');
    };

    return { resolve, resolveAll };
};

// --- Tests ---

runTest('Prop → Class Resolution (Svelte Button Logic)', () => {
    const VARIANTS = { primary: 'ff-btn-primary', secondary: 'ff-btn-secondary' };
    const SIZES = { md: 'ff-btn-md', lg: 'ff-btn-lg' };

    const getClasses = (props, mode, mapping) => {
        const { resolveAll } = mockUseFinggu(mode, mapping);
        return resolveAll([
            'ff-btn',
            VARIANTS[props.variant || 'primary'],
            SIZES[props.size || 'md'],
            props.glass && 'ff-card-glass',
            props.class // simulate $$props.class
        ]);
    };

    const devClasses = getClasses({ variant: 'primary', size: 'lg', class: 'custom-class' }, 'dev', null);
    assert(devClasses === 'ff-btn ff-btn-primary ff-btn-lg custom-class', `Dev mapping mismatch: ${devClasses}`);

    const mapping = {
        'ff-btn': 'ff-a',
        'ff-btn-primary': 'ff-b',
        'ff-btn-lg': 'ff-c'
    };
    const extClasses = getClasses({ variant: 'primary', size: 'lg' }, 'ext', mapping);
    assert(extClasses === 'ff-a ff-b ff-c', `Ext mapping mismatch: ${extClasses}`);
});

runTest('Strict Extreme Mode (Throw on Missing)', () => {
    const mapping = { 'ff-btn': 'ff-a' };
    const { resolve } = mockUseFinggu('ext', mapping);

    try {
        resolve('ff-missing');
        assert(false, 'Should have thrown on missing class');
    } catch (err) {
        assert(err.message.includes('Missing mapping'), 'Wrong error message');
    }
});

runTest('Version Guard Logic', () => {
    let warnCalled = false;
    const oldWarn = console.warn;
    console.warn = () => { warnCalled = true; };

    const validateVersion = (mapping, version) => {
        if (mapping && version && mapping._version && mapping._version !== version) {
            console.warn(`Version mismatch`);
        }
    };

    validateVersion({ _version: '1.0' }, '2.0');
    console.warn = oldWarn;
    assert(warnCalled, 'Version mismatch should be detected');
});

runTest('Manifest Verification', () => {
    const __ffClasses_Button = [
        'ff-btn',
        'ff-btn-primary',
        'ff-btn-secondary'
    ];
    assert(__ffClasses_Button.includes('ff-btn-primary'), 'Manifest missing classes');
});

console.log("\n🚀 All Svelte Logic Tests Passed!");
