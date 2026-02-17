import React from 'react';
import { FingguProvider, Button, Card, Tabs, TabList, TabTrigger, TabContent } from '@finggu/react';
import '@finggu/core/tokens.css';

/**
 * Premium documentation layout using FingguFlux internal components.
 */
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="ff-app-root" style={{
            backgroundColor: 'var(--ff-surface)',
            color: 'var(--ff-text)',
            minHeight: '100vh',
            fontFamily: 'var(--ff-font-sans)'
        }}>
            <header style={{
                padding: 'var(--ff-space-4)',
                borderBottom: '1px solid var(--ff-neutral-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--ff-surface)',
                zIndex: 50
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>FingguFlux</div>
                <nav style={{ display: 'flex', gap: 'var(--ff-space-4)' }}>
                    <Button variant="secondary" size="md">Docs</Button>
                    <Button variant="secondary" size="md">Playground</Button>
                    <Button variant="primary" size="md">GitHub</Button>
                </nav>
            </header>

            <div style={{ display: 'flex' }}>
                <aside style={{
                    width: '280px',
                    padding: 'var(--ff-space-6)',
                    borderRight: '1px solid var(--ff-neutral-200)',
                    height: 'calc(100vh - 70px)',
                    position: 'sticky',
                    top: '70px',
                    overflowY: 'auto'
                }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {['Introduction', 'Quick Start', 'Tokens', 'Motion', 'Components', 'Adapters', 'Trust'].map(item => (
                            <li key={item} style={{ marginBottom: 'var(--ff-space-2)' }}>
                                <a href={`#${item.toLowerCase().replace(' ', '-')}`} style={{
                                    textDecoration: 'none',
                                    color: 'var(--ff-neutral-600)',
                                    fontSize: '0.95rem'
                                }}>{item}</a>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main style={{
                    flex: 1,
                    padding: 'var(--ff-space-10)',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};
