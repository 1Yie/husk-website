import { useEffect, useState } from 'react';

/** Latest GitHub release → per-platform download links. Fetched at runtime so
 *  the site always points at the newest tag; on failure callers fall back to
 *  the releases index page. */

const API = 'https://api.github.com/repos/1Yie/husk/releases/latest';
const CACHE_KEY = 'husk-release-assets';
const CACHE_TTL = 30 * 60 * 1000;

export type Platform = 'linux' | 'macos' | 'windows';

/** Build target of a release file; `any` marks an arch-agnostic package
 *  (Linux and Windows ship a single x64 build). */
export type Arch = 'any' | 'arm64' | 'x64';

export const PLATFORM_NAME: Record<Platform, string> = {
	linux: 'Linux',
	macos: 'macOS',
	windows: 'Windows',
};

export interface PlatformFile {
	/** Target arch — the download card lists the visitor's own build first. */
	arch: Arch;
	/** Label on the download card. */
	label: string;
	/** Asset-name suffix: the release ships `Husk_<ver>_<tail>`. */
	tail: string;
}

/** The release matrix the site advertises — single source of truth for the
 *  download-card labels *and* the hero CTA's asset lookup. */
export const PLATFORM_FILES: Record<Platform, readonly PlatformFile[]> = {
	linux: [
		{ arch: 'any', label: '.deb（Debian / Ubuntu）', tail: 'amd64.deb' },
		{ arch: 'any', label: '.rpm（Fedora / RHEL）', tail: 'x86_64.rpm' },
	],
	macos: [
		{ arch: 'arm64', label: 'Apple Silicon', tail: 'aarch64.dmg' },
		{ arch: 'x64', label: 'Intel', tail: 'x64.dmg' },
	],
	windows: [
		{ arch: 'any', label: '安装程序 .exe', tail: 'x64-setup.exe' },
		{ arch: 'any', label: 'MSI 包', tail: 'x64_en-US.msi' },
	],
};

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

/** UA-CH shape — Chromium-only and absent from lib.dom.d.ts. */
interface UAData {
	getHighEntropyValues(
		hints: string[]
	): Promise<{ architecture?: string } | undefined>;
}

/** Visitor OS from the UA. Phones/tablets and unknown agents → null: the
 *  desktop builds don't run there, so callers keep their neutral wording. */
function detectPlatform(): Platform | null {
	if (typeof navigator === 'undefined') return null;
	const ua = navigator.userAgent;
	// iPadOS reports a Macintosh UA — the mobile markers catch it first.
	if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return null;
	if (/Mac OS X|Macintosh/i.test(ua)) return 'macos';
	if (/Windows/i.test(ua)) return 'windows';
	if (/Linux|X11|CrOS/i.test(ua)) return 'linux';
	return null;
}

/** CPU arch. Only Chromium exposes it (Safari and Firefox keep reporting the
 *  frozen "Intel" UA even on Apple Silicon), so x64 is the default guess — an
 *  Intel Mac can't run an arm64 build, while an arm64 Mac can still run the
 *  Intel one, which makes x64 the cheaper miss. */
function detectArch(): Promise<Arch> {
	const uaData = (navigator as Navigator & { userAgentData?: UAData })
		.userAgentData;
	if (!uaData?.getHighEntropyValues) return Promise.resolve<Arch>('x64');
	return uaData
		.getHighEntropyValues(['architecture'])
		.then((v) => (/arm/i.test(v?.architecture ?? '') ? 'arm64' : 'x64'))
		.catch(() => 'x64' as Arch);
}

/** Files ordered for the visitor: own arch, then arch-agnostic packages, then
 *  the other arch (the x64 build still runs under Rosetta). */
export function rankPlatformFiles(
	files: readonly PlatformFile[],
	arch: Arch
): PlatformFile[] {
	return [
		...files.filter((f) => f.arch === arch),
		...files.filter((f) => f.arch === 'any'),
		...files.filter((f) => f.arch !== 'any' && f.arch !== arch),
	];
}

/** The visitor's own machine, resolved on the client. Drives the hero hint and
 *  marks the matching card in the download section — the site never picks a
 *  build *for* the visitor, it just points at theirs. */
export function usePlatformTarget(): {
	arch: Arch;
	platform: Platform | null;
} {
	const [target, setTarget] = useState<{
		arch: Arch;
		platform: Platform | null;
	}>(() => ({ arch: 'x64', platform: detectPlatform() }));

	useEffect(() => {
		let dead = false;
		detectArch().then((arch) => {
			if (!dead) setTarget((t) => (t.arch === arch ? t : { ...t, arch }));
		});
		return () => {
			dead = true;
		};
	}, []);

	return target;
}
