import React, { useState, useMemo } from 'react';
import { FingguProvider, Button, Card, Tabs, TabList, TabTrigger, TabContent } from '@finggu/react';
import { setTheme, FingguTheme } from '@finggu/js-helper';

/**
 * Interactive Playground for FingguFlux.
 * Demonstrates:
 * - Dev / Opt / Ext modes (simulated)
 * - Theme switching & isolation
 * - Motion utilities
 */
export const Playground: React.FC = () => {
    const [mode, setMode] = useState<'dev' | 'opt' | 'ext'>('dev');
    const [theme, setLocalTheme] = useState<FingguTheme>('light');
    const [isIsolated, setIsIsolated] = useState(false);

    // Simulated mapping for the playground
    const mapping = useMemo(() => {
        if (mode === 'dev') return null;
        if (mode === 'opt') return {
            'ff-btn': 'btn',
            'ff-btn-primary': 'btn-primary',
            'ff-card': 'card',
            'ff-card-lg': 'card-lg'
        };
        return {
            'ff-btn': 'ff-a1',
            'ff-btn-primary': 'ff-p1',
            'ff-card': 'ff-c1',
            'ff-card-lg': 'ff-cl1'
        };
    }, [mode]);

    return (
        <Card variant="default" padding="lg" style={{ margin: 'var(--ff-space-8) 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--ff-space-6)', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Interactive Playground</h3>
                <div style={{ display: 'flex', gap: 'var(--ff-space-2)' }}>
                    <Button variant={mode === 'dev' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('dev')}>Dev</Button>
                    <Button variant={mode === 'opt' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('opt')}>Opt</Button>
                    <Button variant={mode === 'ext' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('ext')}>Ext</Button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--ff-space-4)', marginBottom: 'var(--ff-space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ff-space-2)' }}>
                    <span style={{ fontSize: '0.9rem' }}>Theme:</span>
                    <select
                        value={theme}
                        onChange={(e) => setLocalTheme(e.target.value as FingguTheme)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--ff-neutral-300)' }}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                    </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ff-space-2)', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={isIsolated} onChange={() => setIsIsolated(!isIsolated)} />
                    Enable Theme Isolation
                </label>
            </div>

            <div className="playground-canvas" style={{
                padding: 'var(--ff-space-10)',
                backgroundColor: 'var(--ff-neutral-50)',
                borderRadius: 'var(--ff-radius-lg)',
                border: '1px dashed var(--ff-neutral-300)',
                minHeight: '200px'
            }}>
                <FingguProvider mapping={mapping} mode={mode} theme={isIsolated ? undefined : theme}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ff-space-6)' }}>
                        {isIsolated ? (
                            <FingguProvider theme={theme}>
                                <Card padding="lg" variant="default" className="ff-motion-pop">
                                    <h4>Isolated {theme} Theme</h4>
                                    <p>This container uses its own theme provider.</p>
                                    <Button variant="primary">Themed Button</Button>
                                </Card>
                            </FingguProvider>
                        ) : (
                            <div style={{ display: 'flex', gap: 'var(--ff-space-4)' }}>
                                <Button variant="primary" motion="pop">Primary Pop</Button>
                                <Button variant="secondary">Secondary</Button>
                            </div>
                        )}

                        <div style={{ fontSize: '0.8rem', opacity: 0.6, fontFamily: 'var(--ff-font-mono)' }}>
                            Current Class: {mode === 'ext' ? '.ff-a1 .ff-p1' : mode === 'opt' ? '.btn .btn-primary' : '.ff-btn .ff-btn-primary'}
                        </div>
                    </div>
                </FingguProvider>
            </div>
        </Card>
    );
};
