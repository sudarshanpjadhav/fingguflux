import React, { useState } from 'react';
import { FingguProvider, Button, Card } from '@finggu/react';
import '@finggu/core/tokens.css';

// Mock mapping for example
const mapping = {
    'ff-btn': 'ff-rz1',
    'ff-btn-primary': 'ff-rp1',
    'ff-card': 'ff-rc1'
};

export default function App() {
    const [mode, setMode] = useState<'dev' | 'ext'>('dev');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    return (
        <FingguProvider
            mapping={mode === 'ext' ? mapping : null}
            mode={mode}
            theme={theme}
            version="0.9.0"
        >
            <div style={{ padding: '2rem' }}>
                <Card padding="lg" variant="default">
                    <h1>React Minimal Example</h1>
                    <p>Current Mode: <strong>{mode}</strong> | Theme: <strong>{theme}</strong></p>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Button variant="primary" onClick={() => setMode(mode === 'dev' ? 'ext' : 'dev')}>
                            Toggle Mode
                        </Button>
                        <Button variant="secondary" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                            Toggle Theme
                        </Button>
                    </div>
                </Card>
            </div>
        </FingguProvider>
    );
}
