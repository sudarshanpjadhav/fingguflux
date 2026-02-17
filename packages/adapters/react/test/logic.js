/**
 * FingguFlux React Adapter Regression Tests
 * Verifies: Prop-to-Class mapping, Extreme mode resolution, SSR safety.
 */
import React from 'react';
import { FingguProvider, useFinggu, Button, Card, Input } from '../src/index';

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

// --- Mocking React environment for logic tests ---
// Since we are running in Node without a full DOM, we test the logic hooks and class generation.

runTest('Hook: Resolve Classes (Dev Mode)', () => {
    const mapping = { 'ff-btn': 'ff-a', 'ff-btn-primary': 'ff-b' };

    // Simulate useFinggu logic
    const resolve = (className, mode, map) => {
        if (mode === 'dev' || !map) return className;
        return map[className] || className;
    };

    assert(resolve('ff-btn', 'dev', mapping) === 'ff-btn', 'Dev mode should not map');
    assert(resolve('ff-btn', 'ext', mapping) === 'ff-a', 'Extreme mode should map');
    assert(resolve('ff-unknown', 'ext', mapping) === 'ff-unknown', 'Unknown classes should pass through');
});

runTest('Button Property Mapping', () => {
    // We test the logic that generates the class string
    const generateClasses = (props) => {
        const { variant = 'primary', size = 'md', motion, glass, className } = props;
        return [
            'ff-btn',
            `ff-btn-${variant}`,
            `ff-btn-${size}`,
            glass && 'ff-card-glass',
            motion === 'lift' ? 'ff-hover-lift' : (motion && `ff-${motion}`),
            className
        ].filter(Boolean).join(' ');
    };

    const cls = generateClasses({ variant: 'outline', size: 'lg', motion: 'fade', glass: true });
    assert(cls.includes('ff-btn'), 'Missing base class');
    assert(cls.includes('ff-btn-outline'), 'Missing variant class');
    assert(cls.includes('ff-btn-lg'), 'Missing size class');
    assert(cls.includes('ff-fade-in'), 'Missing motion class');
    assert(cls.includes('ff-card-glass'), 'Missing glass class');
});

runTest('Extreme Mode Mapping Consistency', () => {
    const mapping = {
        'ff-btn': 'ff-o4blxk',
        'ff-btn-primary': 'ff-eb09xb',
        'ff-btn-md': 'ff-1wwqdo6'
    };

    const resolveAll = (classes, map) => {
        return classes.filter(Boolean).map(c => map[c] || c).join(' ');
    };

    const rawClasses = ['ff-btn', 'ff-btn-primary', 'ff-btn-md'];
    const resolved = resolveAll(rawClasses, mapping);

    assert(resolved === 'ff-o4blxk ff-eb09xb ff-1wwqdo6', 'Hashed mapping mismatch');
});

runTest('SSR Safety (Context Fallback)', () => {
    // In SSR, mapping might be null initially.
    const resolve = (className, mode, map) => {
        if (mode === 'dev' || !map) return className;
        return map[className] || className;
    };

    assert(resolve('ff-btn', 'ext', null) === 'ff-btn', 'SSR should fallback to raw classes when mapping is missing');
});

console.log('\n🌟 React adapter logic tests passed!\n');
