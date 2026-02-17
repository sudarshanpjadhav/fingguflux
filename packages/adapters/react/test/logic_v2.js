/**
 * FingguFlux React Adapter Logic Verification
 * This test verifies the mapping and prop resolution logic independently of the React runtime.
 */

const runTest = (name, fn) => {
    try {
        fn();
        console.log(`✅ [PASS] ${name}`);
    } catch (err) {
        console.error(`❌ [FAIL] ${name}: ${err.message}`);
        process.exit(1);
    }
};

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

// --- Logic Implementation (Mirrored from components for validation) ---

const resolveClass = (className, mode, mapping) => {
    if (mode === 'dev' || !mapping) return className;
    return mapping[className] || className;
};

const resolveAll = (classes, mode, mapping) => {
    return classes
        .filter(Boolean)
        .map(c => resolveClass(c, mode, mapping))
        .join(' ');
};

const getButtonClasses = (props, mode, mapping) => {
    const { variant = 'primary', size = 'md', motion, glass, className } = props;
    const rawClasses = [
        'ff-btn',
        `ff-btn-${variant}`,
        `ff-btn-${size}`,
        glass && 'ff-card-glass',
        motion === 'lift' ? 'ff-hover-lift' : (motion && (motion === 'fade' ? 'ff-fade-in' : (motion === 'slide-up' || motion === 'scale-in' ? `ff-${motion}` : motion))),
        className
    ];
    return resolveAll(rawClasses, mode, mapping);
};

// --- Test Cases ---

runTest('Deterministic Class Mapping (Extreme Mode)', () => {
    const mapping = {
        'ff-btn': 'ff-o4blxk',
        'ff-btn-primary': 'ff-eb09xb',
        'ff-btn-md': 'ff-1wwqdo6',
        'ff-hover-lift': 'ff-1i0r010'
    };

    const resolved = getButtonClasses({ variant: 'primary', size: 'md', motion: 'lift' }, 'ext', mapping);
    assert(resolved === 'ff-o4blxk ff-eb09xb ff-1wwqdo6 ff-1i0r010', `Mapping mismatch: ${resolved}`);
});

runTest('Dev Mode Passthrough', () => {
    const mapping = { 'ff-btn': 'ff-hashed' };
    const resolved = getButtonClasses({ variant: 'primary' }, 'dev', mapping);
    assert(resolved.includes('ff-btn') && !resolved.includes('ff-hashed'), 'Dev mode should not apply mapping');
});

runTest('SSR Safety (Missing Mapping)', () => {
    const resolved = getButtonClasses({ variant: 'primary' }, 'ext', null);
    assert(resolved.includes('ff-btn-primary'), 'Should fallback to raw names if mapping is null');
});

runTest('Motion Prop Resolution', () => {
    const resolvedFade = getButtonClasses({ motion: 'fade' }, 'dev', null);
    assert(resolvedFade.includes('ff-fade-in'), `Motion 'fade' should map to 'ff-fade-in'. Got: ${resolvedFade}`);

    const resolvedSlide = getButtonClasses({ motion: 'slide-up' }, 'dev', null);
    assert(resolvedSlide.includes('ff-slide-up'), `Motion 'slide-up' should map to 'ff-slide-up'. Got: ${resolvedSlide}`);
});

runTest('Conditional Class Composition', () => {
    const withGlass = getButtonClasses({ glass: true }, 'dev', null);
    assert(withGlass.includes('ff-card-glass'), 'Missing glass class');

    const withoutGlass = getButtonClasses({ glass: false }, 'dev', null);
    assert(!withoutGlass.includes('ff-card-glass'), 'Should not include glass class');
});

console.log('\n🌟 React adapter logic verified successfully!\n');
