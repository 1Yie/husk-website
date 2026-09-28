import { useEffect, useState } from 'react';

/** Latest GitHub release → per-platform download links. Fetched at runtime so
 *  the site always points at the newest tag; on failure callers fall back to
 *  the releases index page. */

const API = 'https://api.github.com/repos/1Yie/husk/releases/latest';
const CACHE_KEY = 'husk-release-assets';
const CACHE_TTL = 30 * 60 * 1000;

export interface ReleaseAsset {
	name: string;
	url: string;
}

interface Cache {
	tag: string;
	assets: ReleaseAsset[];
	at: number;
}

function readCache(): Cache | null {
	try {
		const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? '') as Cache;
		if (c?.tag && Date.now() - c.at < CACHE_TTL) return c;
	} catch {
		/* corrupt cache — refetch */
	}
	return null;
}

export function useLatestRelease(): {
	tag: string | null;
	assets: ReleaseAsset[];
} {
	const [state, set] = useState<Cache>(
		() => readCache() ?? { tag: '', assets: [], at: 0 }
	);
	useEffect(() => {
		const cached = readCache();
		if (cached) return;
		let dead = false;
		fetch(API)
			.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
			.then((d) => {
				if (dead) return;
				const c: Cache = {
					tag: d.tag_name ?? '',
					assets: (d.assets ?? []).map(
						(a: { name: string; browser_download_url: string }) => ({
							name: a.name,
							url: a.browser_download_url,
						})
					),
					at: Date.now(),
				};
				sessionStorage.setItem(CACHE_KEY, JSON.stringify(c));
				set(c);
			})
			.catch(() => {});
		return () => {
			dead = true;
		};
	}, []);
	return { tag: state.tag || null, assets: state.assets };
}

/** Asset whose name ends with `suffix` (e.g. `x64.dmg`). */
export function asset(
	assets: ReleaseAsset[],
	suffix: string
): ReleaseAsset | undefined {
	return assets.find((a) => a.name.endsWith(suffix));
}
