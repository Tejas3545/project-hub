'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';

/** Color set for a single mode (light or dark). */
interface ColorSet {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: string;
    foreground: string;
    secondary: string;
    muted: string;
    mutedForeground: string;
    border: string;
    accent: string;
    accentForeground: string;
}

/** Theme preset with both light and dark color variants. */
interface ThemePreset {
    name: string;
    icon: string;
    light: ColorSet;
    dark: ColorSet;
}

/** All theme presets — each has both light and dark color variants. */
const THEME_PRESETS: ThemePreset[] = [
    {
        name: 'Default Blue',
        icon: '💎',
        light: {
            primary: '#3b82f6', primaryDark: '#2563eb', primaryLight: '#60a5fa',
            background: '#ffffff', foreground: '#020817', secondary: '#f9fafb',
            muted: '#f1f5f9', mutedForeground: '#64748b', border: '#e2e8f0',
            accent: '#eff6ff', accentForeground: '#1e40af',
        },
        dark: {
            primary: '#3b82f6', primaryDark: '#2563eb', primaryLight: '#60a5fa',
            background: '#020817', foreground: '#f8fafc', secondary: '#0f172a',
            muted: '#1e293b', mutedForeground: '#94a3b8', border: '#1e293b',
            accent: '#1e3a8a', accentForeground: '#eff6ff',
        },
    },
    {
        name: 'VS Code',
        icon: '🟦',
        light: {
            primary: '#007acc', primaryDark: '#005f99', primaryLight: '#1e9de8',
            background: '#ffffff', foreground: '#1e1e1e', secondary: '#f3f3f3',
            muted: '#e8e8e8', mutedForeground: '#616161', border: '#d4d4d4',
            accent: '#e8f0fe', accentForeground: '#005a9e',
        },
        dark: {
            primary: '#007acc', primaryDark: '#005f99', primaryLight: '#1e9de8',
            background: '#1e1e1e', foreground: '#d4d4d4', secondary: '#252526',
            muted: '#2d2d30', mutedForeground: '#808080', border: '#3e3e42',
            accent: '#264f78', accentForeground: '#cce5ff',
        },
    },
    {
        name: 'GitHub',
        icon: '🐙',
        light: {
            primary: '#238636', primaryDark: '#1a7f37', primaryLight: '#3fb950',
            background: '#ffffff', foreground: '#1f2328', secondary: '#f6f8fa',
            muted: '#eaeef2', mutedForeground: '#656d76', border: '#d0d7de',
            accent: '#dafbe1', accentForeground: '#116329',
        },
        dark: {
            primary: '#238636', primaryDark: '#1a7f37', primaryLight: '#3fb950',
            background: '#0d1117', foreground: '#e6edf3', secondary: '#161b22',
            muted: '#21262d', mutedForeground: '#8b949e', border: '#30363d',
            accent: '#1f3a22', accentForeground: '#7ee787',
        },
    },
    {
        name: 'Dracula',
        icon: '🧛',
        light: {
            primary: '#9b6fd9', primaryDark: '#7c4dbd', primaryLight: '#bd93f9',
            background: '#f8f8f2', foreground: '#282a36', secondary: '#f0edf5',
            muted: '#e6e0f0', mutedForeground: '#6272a4', border: '#d5cce6',
            accent: '#f0e8ff', accentForeground: '#6c3fad',
        },
        dark: {
            primary: '#bd93f9', primaryDark: '#9b6fd9', primaryLight: '#d0afff',
            background: '#282a36', foreground: '#f8f8f2', secondary: '#343746',
            muted: '#44475a', mutedForeground: '#6272a4', border: '#44475a',
            accent: '#3d2d5c', accentForeground: '#bd93f9',
        },
    },
    {
        name: 'Nord',
        icon: '❄️',
        light: {
            primary: '#5e81ac', primaryDark: '#4c6e96', primaryLight: '#81a1c1',
            background: '#eceff4', foreground: '#2e3440', secondary: '#e5e9f0',
            muted: '#d8dee9', mutedForeground: '#4c566a', border: '#c8d0de',
            accent: '#d8e6f0', accentForeground: '#5e81ac',
        },
        dark: {
            primary: '#88c0d0', primaryDark: '#5e81ac', primaryLight: '#8fbcbb',
            background: '#2e3440', foreground: '#eceff4', secondary: '#3b4252',
            muted: '#434c5e', mutedForeground: '#d8dee9', border: '#4c566a',
            accent: '#2a3a4a', accentForeground: '#88c0d0',
        },
    },
    {
        name: 'Monokai',
        icon: '🔥',
        light: {
            primary: '#7a9e1e', primaryDark: '#628016', primaryLight: '#a6e22e',
            background: '#fafaf0', foreground: '#272822', secondary: '#f0f0e0',
            muted: '#e6e6d0', mutedForeground: '#75715e', border: '#d4d4be',
            accent: '#f0f5e0', accentForeground: '#5c7a10',
        },
        dark: {
            primary: '#a6e22e', primaryDark: '#8bc21e', primaryLight: '#c4f060',
            background: '#272822', foreground: '#f8f8f2', secondary: '#3e3d32',
            muted: '#49483e', mutedForeground: '#75715e', border: '#49483e',
            accent: '#3a3e1e', accentForeground: '#a6e22e',
        },
    },
    {
        name: 'Rose Pine',
        icon: '🌹',
        light: {
            primary: '#907aa9', primaryDark: '#7a6594', primaryLight: '#c4a7e7',
            background: '#faf4ed', foreground: '#575279', secondary: '#f2e9de',
            muted: '#ece5d8', mutedForeground: '#797593', border: '#dfdad3',
            accent: '#f2e4f9', accentForeground: '#907aa9',
        },
        dark: {
            primary: '#c4a7e7', primaryDark: '#907aa9', primaryLight: '#e0def4',
            background: '#191724', foreground: '#e0def4', secondary: '#1f1d2e',
            muted: '#26233a', mutedForeground: '#908caa', border: '#393552',
            accent: '#2a2540', accentForeground: '#c4a7e7',
        },
    },
    {
        name: 'Sunset',
        icon: '🌅',
        light: {
            primary: '#f97316', primaryDark: '#ea580c', primaryLight: '#fb923c',
            background: '#fffbf5', foreground: '#1c1410', secondary: '#fef3e2',
            muted: '#fde8cd', mutedForeground: '#9a7558', border: '#f5d5b0',
            accent: '#fff0e0', accentForeground: '#c2410c',
        },
        dark: {
            primary: '#f97316', primaryDark: '#ea580c', primaryLight: '#fb923c',
            background: '#1c1410', foreground: '#fef3e2', secondary: '#2a1f18',
            muted: '#3d2e22', mutedForeground: '#c9a88a', border: '#4a3828',
            accent: '#3d2510', accentForeground: '#fb923c',
        },
    },
    {
        name: 'Ocean',
        icon: '🌊',
        light: {
            primary: '#06b6d4', primaryDark: '#0891b2', primaryLight: '#22d3ee',
            background: '#ecfeff', foreground: '#083344', secondary: '#cffafe',
            muted: '#a5f3fc', mutedForeground: '#155e75', border: '#99e2f2',
            accent: '#dff9fd', accentForeground: '#0e7490',
        },
        dark: {
            primary: '#06b6d4', primaryDark: '#0891b2', primaryLight: '#22d3ee',
            background: '#083344', foreground: '#ecfeff', secondary: '#0c4a5e',
            muted: '#155e75', mutedForeground: '#a5f3fc', border: '#1a6d89',
            accent: '#0e4f66', accentForeground: '#22d3ee',
        },
    },
];

/**
 * ThemeChanger component — A floating theme generator panel
 * with Light/Dark mode toggle (applies per-preset), preset themes,
 * individual color pickers, and localStorage persistence.
 */
export default function ThemeChanger() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activePreset, setActivePreset] = useState('Default Blue');
    const [customColors, setCustomColors] = useState(THEME_PRESETS[0].light);
    const [activeTab, setActiveTab] = useState<'presets' | 'colors'>('presets');

    /** Get the currently active mode: 'light' or 'dark'. */
    const currentMode = resolvedTheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        setMounted(true);
        const savedPreset = localStorage.getItem('ph-theme-preset');
        const savedColors = localStorage.getItem('ph-theme-colors');
        const savedMode = localStorage.getItem('ph-theme-mode');
        if (savedPreset) setActivePreset(savedPreset);
        if (savedColors) {
            try {
                const parsed = JSON.parse(savedColors);
                setCustomColors(parsed);
                applyColors(parsed);
            } catch (e) {
                console.error('Failed to parse saved theme colors:', e);
            }
        }
        if (savedMode) setTheme(savedMode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Apply CSS variable overrides to the document root.
     * @param colors - Color set to apply as CSS custom properties.
     */
    const applyColors = useCallback((colors: ColorSet) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-dark', colors.primaryDark);
        root.style.setProperty('--color-primary-light', colors.primaryLight);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-foreground', colors.foreground);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-muted', colors.muted);
        root.style.setProperty('--color-muted-foreground', colors.mutedForeground);
        root.style.setProperty('--color-border', colors.border);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-accent-foreground', colors.accentForeground);
    }, []);

    /**
     * Apply a theme preset for the given mode.
     * @param preset - Preset to apply.
     * @param mode - 'light' or 'dark'.
     */
    const applyPreset = useCallback((preset: ThemePreset, mode?: 'light' | 'dark') => {
        const targetMode = mode || currentMode;
        const colors = targetMode === 'dark' ? preset.dark : preset.light;
        setActivePreset(preset.name);
        setCustomColors(colors);
        applyColors(colors);
        setTheme(targetMode);
        localStorage.setItem('ph-theme-preset', preset.name);
        localStorage.setItem('ph-theme-colors', JSON.stringify(colors));
        localStorage.setItem('ph-theme-mode', targetMode);
    }, [applyColors, setTheme, currentMode]);

    /**
     * Switch Light/Dark mode — re-applies the active preset's colors for that mode.
     * @param mode - The target mode ('light', 'dark', or 'system').
     */
    const switchMode = useCallback((mode: string) => {
        setTheme(mode);
        localStorage.setItem('ph-theme-mode', mode);

        // Find the active preset and re-apply its colors for the new mode
        const preset = THEME_PRESETS.find(p => p.name === activePreset);
        if (preset && (mode === 'light' || mode === 'dark')) {
            const colors = mode === 'dark' ? preset.dark : preset.light;
            setCustomColors(colors);
            applyColors(colors);
            localStorage.setItem('ph-theme-colors', JSON.stringify(colors));
        }
    }, [setTheme, activePreset, applyColors]);

    /**
     * Update a single color and persist as custom.
     * @param key - CSS variable key name.
     * @param value - New hex color value.
     */
    const updateColor = useCallback((key: keyof ColorSet, value: string) => {
        const updated = { ...customColors, [key]: value };
        setCustomColors(updated);
        applyColors(updated);
        setActivePreset('Custom');
        localStorage.setItem('ph-theme-preset', 'Custom');
        localStorage.setItem('ph-theme-colors', JSON.stringify(updated));
    }, [customColors, applyColors]);

    /**
     * Reset all theme overrides back to defaults.
     * Removes inline CSS custom properties from the document root.
     */
    const resetTheme = useCallback(() => {
        const defaultPreset = THEME_PRESETS[0];
        setActivePreset(defaultPreset.name);
        setCustomColors(defaultPreset.light);
        const root = document.documentElement;
        const vars = [
            '--color-primary', '--color-primary-dark', '--color-primary-light',
            '--color-background', '--color-foreground', '--color-secondary',
            '--color-muted', '--color-muted-foreground', '--color-border',
            '--color-accent', '--color-accent-foreground',
        ];
        vars.forEach(v => root.style.removeProperty(v));
        setTheme('system');
        localStorage.removeItem('ph-theme-preset');
        localStorage.removeItem('ph-theme-colors');
        localStorage.removeItem('ph-theme-mode');
    }, [setTheme]);

    if (!mounted) return null;

    /** Color labels for the editor tab. */
    const COLOR_LABELS: { key: keyof ColorSet; label: string }[] = [
        { key: 'primary', label: 'Primary' },
        { key: 'primaryDark', label: 'Primary Dark' },
        { key: 'primaryLight', label: 'Primary Light' },
        { key: 'background', label: 'Background' },
        { key: 'foreground', label: 'Text' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'muted', label: 'Muted' },
        { key: 'mutedForeground', label: 'Muted Text' },
        { key: 'border', label: 'Border' },
        { key: 'accent', label: 'Accent' },
        { key: 'accentForeground', label: 'Accent Text' },
    ];

    return (
        <>
            {/* Floating Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[999] size-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center"
                aria-label="Open Theme Generator"
                title="Theme Generator"
            >
                <span className="material-symbols-outlined text-xl">palette</span>
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-[999] w-[340px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-primary text-xl">palette</span>
                            <h3 className="text-sm font-bold text-foreground">Theme Generator</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label="Close theme generator"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Body — scrollable */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {/* Mode Toggle */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Mode</p>
                            <div className="flex gap-2">
                                {[
                                    { id: 'light', label: 'Light', icon: 'light_mode' },
                                    { id: 'dark', label: 'Dark', icon: 'dark_mode' },
                                    { id: 'system', label: 'System', icon: 'monitor' },
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => switchMode(mode.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${theme === mode.id
                                                ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                                                : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base">{mode.icon}</span>
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            {[
                                { id: 'presets' as const, label: 'Themes', icon: 'auto_awesome' },
                                { id: 'colors' as const, label: 'Colors', icon: 'colorize' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Presets Tab */}
                        {activeTab === 'presets' && (
                            <div className="grid grid-cols-2 gap-2">
                                {THEME_PRESETS.map((preset) => {
                                    const previewColors = currentMode === 'dark' ? preset.dark : preset.light;
                                    return (
                                        <button
                                            key={preset.name}
                                            onClick={() => applyPreset(preset)}
                                            className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-200 border ${activePreset === preset.name
                                                    ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                                                    : 'bg-secondary/30 border-border hover:bg-secondary/60 hover:border-primary/20'
                                                }`}
                                        >
                                            {/* Color preview dots — show colors for the current mode */}
                                            <div className="flex flex-col gap-0.5 shrink-0">
                                                <div className="flex gap-0.5">
                                                    <div className="size-2.5 rounded-full border border-border/50" style={{ backgroundColor: previewColors.primary }} />
                                                    <div className="size-2.5 rounded-full border border-border/50" style={{ backgroundColor: previewColors.accent }} />
                                                </div>
                                                <div className="flex gap-0.5">
                                                    <div className="size-2.5 rounded-full border border-border/50" style={{ backgroundColor: previewColors.background }} />
                                                    <div className="size-2.5 rounded-full border border-border/50" style={{ backgroundColor: previewColors.foreground }} />
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-xs font-semibold truncate ${activePreset === preset.name ? 'text-primary' : 'text-foreground'}`}>
                                                    {preset.icon} {preset.name}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Colors Tab */}
                        {activeTab === 'colors' && (
                            <div className="space-y-2.5">
                                {COLOR_LABELS.map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between gap-3 group">
                                        <label htmlFor={`color-${key}`} className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            {label}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                                {customColors[key]}
                                            </span>
                                            <label
                                                className="relative size-8 rounded-lg border border-border overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm"
                                                style={{ backgroundColor: customColors[key] }}
                                            >
                                                <input
                                                    id={`color-${key}`}
                                                    type="color"
                                                    value={customColors[key]}
                                                    onChange={(e) => updateColor(key, e.target.value)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-border bg-secondary/20">
                        <div className="flex gap-2">
                            <button
                                onClick={resetTheme}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-secondary text-muted-foreground border border-border hover:text-foreground hover:bg-secondary/80 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">restart_alt</span>
                                Reset Default
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">check</span>
                                Done
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-2.5">
                            Active: <span className="font-semibold text-foreground">{activePreset}</span> · <span className="capitalize">{currentMode}</span>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
