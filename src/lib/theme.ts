import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';
const KEY = 'husk-theme';
const ORDER: Theme[] = ['system', 'light', 'dark'];

export function getTheme(): Theme {
	const t = localStorage.getItem(KEY);
	return t === 'light' || t === 'dark' ? (t as Theme) : 'system';
}

export function applyTheme(theme: Theme) {
	const dark =
		theme === 'dark' ||
		(theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', dark);
}

export function setTheme(theme: Theme) {
	if (theme === 'system') localStorage.removeItem(KEY);
	else localStorage.setItem(KEY, theme);
	applyTheme(theme);
}

/** system 变化时跟随（仅当未手动指定）。 */
let watching = false;
function watchSystem() {
	if (watching) return;
	watching = true;
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (getTheme() === 'system') applyTheme('system');
	});
}

export function useTheme(): { theme: Theme; cycle: () => void } {
	const [theme, set] = useState<Theme>(getTheme);
	useEffect(watchSystem, []);
	return {
		theme,
		cycle: () => {
			const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
			setTheme(next);
			set(next);
		},
	};
}
