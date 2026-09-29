import { useGSAP } from '@gsap/react';
import { ChevronDown, Download } from '@keyline-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { siApple, siLinux } from 'simple-icons';

import huskIcon from '@/assets/husk-icon.png';
import GradientWaves from '@/components/gradient-waves';
// import { FeatureShowcase } from '@/components/home/feature-showcase';
// import { PowerShowcase } from '@/components/home/power-showcase';
import { HuskApp } from '@/components/husk/app-shell';
import { SiteNav } from '@/components/site-nav';
import {
	asset,
	PLATFORM_FILES,
	PLATFORM_NAME,
	rankPlatformFiles,
	useLatestRelease,
	usePlatformTarget,
	type Platform,
} from '@/lib/releases';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REPO = 'https://github.com/1Yie/husk';
const RELEASES = `${REPO}/releases`;

const WINDOWS_LOGO =
	'M3 3h8.5v8.5H3z M12.5 3H21v8.5h-8.5z M3 12.5h8.5V21H3z M12.5 12.5H21V21h-8.5z';

const PLATFORMS: { key: Platform; name: string; note: string; logo: string }[] =
	[
		{
			key: 'macos',
			name: PLATFORM_NAME.macos,
			note: 'dmg 安装包',
			logo: siApple.path,
		},
		{
			key: 'linux',
			name: PLATFORM_NAME.linux,
			note: 'deb · rpm',
			logo: siLinux.path,
		},
		{
			key: 'windows',
			name: PLATFORM_NAME.windows,
			note: 'Windows 10+ · x64',
			logo: WINDOWS_LOGO,
		},
	];

export function Home() {
	const root = useRef<HTMLDivElement>(null);
	const { tag, assets } = useLatestRelease();
	/** Resolved on the client: highlights the visitor's own build in the
	 *  download section, but never auto-picks a download for them. */
	const { arch, platform } = usePlatformTarget();

	useEffect(() => {
		document.title = 'Husk — 运行于本地的 AI 编程智能体';
	}, []);

	useGSAP(
		() => {
			// All animation gated behind prefers-reduced-motion.
			const mm = gsap.matchMedia();
			mm.add('(prefers-reduced-motion: no-preference)', () => {
				// Hero entrance — logo'd page loads like the app: quick, staggered,
				// zero flash. Elements are visible-by-default so no-preference off
				// (or JS failure) never strands content.
				gsap.from('.reveal-hero', {
					opacity: 0,
					y: 28,
					duration: 0.9,
					ease: 'power3.out',
					stagger: 0.09,
				});
				gsap.from('.reveal-nav', {
					opacity: 0,
					y: -8,
					duration: 0.6,
					ease: 'power2.out',
				});

				// App window rises into place as it scrolls in.
				gsap.from('.reveal-app', {
					opacity: 0,
					y: 80,
					scale: 0.97,
					duration: 1.1,
					ease: 'power3.out',
					scrollTrigger: { trigger: '.reveal-app', start: 'top 92%' },
				});
				// Download card outer: translate only — fading the whole card
				// would make the already-painted WebGL scene appear to "pop"
				// when the tween ends.
				gsap.from('.reveal-download', {
					y: 40,
					duration: 0.8,
					ease: 'power2.out',
					scrollTrigger: { trigger: '.reveal-download', start: 'top 88%' },
				});

				// Sections + cards stagger in on entry.
				gsap.utils.toArray<HTMLElement>('.reveal-card').forEach((el) => {
					gsap.from(el, {
						opacity: 0,
						y: 36,
						duration: 0.7,
						ease: 'power2.out',
						scrollTrigger: { trigger: el, start: 'top 88%' },
					});
				});
			});
		},
		{ scope: root }
	);

	return (
		<div className="min-h-dvh w-full scroll-smooth bg-page text-ink" ref={root}>
			{/* top nav */}
			<SiteNav className="reveal-nav" />

			{/* hero */}
			<section className="mx-auto max-w-7xl px-6 pt-20 pb-14 text-center">
				<h1
					className="reveal-hero text-[64px] leading-none font-bold
						tracking-tight text-ink"
				>
					Husk
				</h1>
				<p className="reveal-hero mt-5 text-[19px] text-dim">
					运行于本地的 AI 智能体，由 Rust 内核驱动。
				</p>
				<div className="reveal-hero mt-8 flex items-center justify-center gap-3">
					{/* Scrolls to the download section instead of deciding for the
					    visitor — the card there marks their own build. */}
					<a
						className="flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5
							text-[14px] font-medium text-page transition-opacity
							hover:opacity-85"
						href="#download"
					>
						立即尝试 Husk
						<ChevronDown className="h-4 w-4" />
					</a>
				</div>
				<p className="reveal-hero mt-10 text-[12.5px] text-faint">
					{PLATFORMS.map((p, i) => (
						<span
							className={
								p.key === platform ? 'font-medium text-ink' : undefined
							}
							key={p.key}
						>
							{i > 0 ? ' · ' : ''}
							{p.name}
						</span>
					))}
				</p>
			</section>

			{/* app showcase — the real UI, framed like the Codex hero window,
			    bleeding below the fold */}
			<section className="mx-auto max-w-6xl px-6 pb-24">
				{/* no overflow wrapper here — it would clip the card's
				    box-shadow (shadows paint outside the border box) */}
				<div
					className="reveal-app overflow-hidden rounded-[8px] border border-line
						bg-white
						shadow-[0_24px_80px_-16px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.08)]
						ring-1 ring-neutral-300/60 dark:ring-white/10
						dark:shadow-[0_24px_80px_-16px_rgba(0,0,0,0.55),0_4px_16px_-4px_rgba(0,0,0,0.4)]"
				>
					<div className="h-[720px]">
						<HuskApp />
					</div>
				</div>
			</section>

			{/* <FeatureShowcase /> */}

			{/* <PowerShowcase /> */}

			<section className="mx-auto max-w-6xl px-6 pb-28 pt-20" id="download">
				<div
					className="reveal-download relative overflow-hidden rounded-2xl px-8
						py-16 text-center"
				>
					{/* the component's root is `relative` — it can't be the
					    absolutely-positioned layer itself, so wrap it */}
					<div className="absolute inset-0">
						<GradientWaves
							amplitude={3}
							brightness={1.15}
							detail="medium"
							fogDepth={8}
							grain={false}
							height={3}
							mouseInteraction
							zoom={1.1}
						/>
					</div>
					<div className="reveal-card relative z-10">
						<Download className="mx-auto h-8 w-8 text-neutral-800" />
						<h2
							className="mt-4 text-[28px] font-bold tracking-tight
								text-neutral-900"
						>
							下载 Husk
						</h2>
						<p className="mt-3 text-[14px] text-neutral-700">
							{tag ? `最新版本 ${tag} · ` : ''}从 GitHub Releases 获取构建。
						</p>
						<div
							className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3
								sm:grid-cols-3"
						>
							{PLATFORMS.map((p) => (
								<div
									className={`flex flex-col items-center rounded-xl border px-4
									py-5 backdrop-blur-md transition-colors ${
										p.key === platform
											? `border-neutral-900/25 bg-white/80
												shadow-[0_10px_30px_-16px_rgba(0,0,0,0.35)]`
											: 'border-white/50 bg-white/55 hover:bg-white/70'
									}`}
									key={p.key}
								>
									<svg
										aria-hidden
										className="h-5 w-5 fill-current text-neutral-800"
										viewBox="0 0 24 24"
									>
										<path d={p.logo} />
									</svg>
									<span
										className="mt-1.5 flex items-center gap-1.5 text-[14px]
											font-medium text-neutral-900"
									>
										{p.name}
										{p.key === platform ? (
											<span
												className="rounded-full bg-neutral-900 px-1.5 py-px
													text-[10px] font-normal text-white"
											>
												你的系统
											</span>
										) : null}
									</span>
									<span className="text-[11.5px] text-neutral-500">
										{p.note}
									</span>
									<div className="mt-2.5 flex flex-col items-center gap-0.5">
										{rankPlatformFiles(PLATFORM_FILES[p.key], arch).map((f) => {
											const a = asset(assets, f.tail);
											return a ? (
												<a
													className="text-[12px] font-medium text-neutral-800
														underline decoration-neutral-400 underline-offset-3
														transition-colors hover:decoration-neutral-800"
													href={a.url}
													key={f.tail}
												>
													{f.label}
												</a>
											) : (
												<span
													className="text-[12px] text-neutral-400"
													key={f.tail}
												>
													{f.label}
												</span>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* footer */}
			<footer className="border-t border-line">
				<div
					className="mx-auto flex h-16 max-w-7xl items-center justify-between
						px-6 text-[12.5px] text-faint"
				>
					<div className="flex items-center gap-2">
						<img alt="" className="h-4 w-4" src={huskIcon} />
						<span>Husk</span>
					</div>
					<div className="flex items-center gap-6">
						<a
							className="hidden transition-colors hover:text-ink md:inline"
							href={REPO}
							rel="noreferrer"
							target="_blank"
						>
							GitHub
						</a>
						<a
							className="hidden transition-colors hover:text-ink md:inline"
							href={RELEASES}
							rel="noreferrer"
							target="_blank"
						>
							Releases
						</a>
						<a
							className="hidden transition-colors hover:text-ink md:inline"
							href={`${REPO}/issues`}
							rel="noreferrer"
							target="_blank"
						>
							Issues
						</a>
						<span>MIT License</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
