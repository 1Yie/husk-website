import { useGSAP } from '@gsap/react';
import { Check, GitBranch, ShieldCheck } from '@keyline-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* 回放一节：把内核处理一次任务的过程摊开给访客看。

   舞台是左栏的阶段清单，银幕是右栏（窄屏时吸在顶部）的会话窗口。滚动
   到哪一段，窗口就切到那一段的状态机快照——不是装饰性的循环动画，而是
   ReAct 一圈里真实经过的节点。文案与数值来自 src/content/docs：状态机
   节点名、沙箱后端、五档权限、标题栏统计。 */

/** 会话窗口里的一行 —— 对齐内核往 UI 推的 UiEvent 形状。 */
type Line =
	| { kind: 'approval'; detail: string; risk: string; target: string }
	| { kind: 'diff'; added: number; files: number; removed: number }
	| { kind: 'note'; active?: string; chips: string[]; label: string }
	| { kind: 'say'; text: string }
	| { kind: 'think'; text: string }
	| {
			kind: 'tool';
			arg: string;
			label: string;
			live?: boolean;
			status?: string;
	  };

/** 标题栏读数 —— 内核 Usage 事件的字段。 */
interface Snapshot {
	branch: string;
	cache: string;
	changed: number;
	cost: string;
	ctx: number;
	rate: number | null;
}

interface Stage {
	/** 内核状态机节点。 */
	state: string;
	title: string;
	body: string;
	lines: Line[];
	stats: Snapshot;
}

/** 一轮 ReAct 的五个节点，顺序即状态机推进的顺序。 */
const STAGES: Stage[] = [
	{
		state: 'ScanningWorkspace',
		title: '先摸清工作区',
		body: '翻目录、读配置、搜用法——只读工具直接放行，不用你为每一步点头。',
		lines: [
			{
				kind: 'think',
				text: '先量体积再看代码：前端 dist 里多半是字体占大头。',
			},
			{ kind: 'tool', arg: 'dist/assets', label: 'list_dir', status: '完成' },
			{
				kind: 'tool',
				arg: 'vite.config.ts',
				label: 'smart_read',
				status: '完成',
			},
			{
				kind: 'tool',
				arg: 'manualChunks|woff2',
				label: 'grep',
				status: '完成',
			},
		],
		stats: {
			branch: 'main ·1',
			cache: '—',
			changed: 0,
			cost: '$0.01',
			ctx: 9,
			rate: null,
		},
	},
	{
		state: 'Reasoning',
		title: '把活拆成清单',
		body: '模型给出步骤，落成持久 todo：做一步划一步，中断了也还在。',
		lines: [
			{
				kind: 'think',
				text: '三条路：字体换 woff2 子集、streamdown 拆包懒加载、Rust 侧开 lto + strip。先验证收益，再动刀。',
			},
			{ kind: 'tool', arg: '4 项 · 写入会话', label: 'todo', status: '完成' },
		],
		stats: {
			branch: 'main ·1',
			cache: '8.2k',
			changed: 0,
			cost: '$0.03',
			ctx: 14,
			rate: 74,
		},
	},
	{
		state: 'AwaitingToolConfirmation',
		title: '该你点头时停下',
		body: '每个工具派发前都过权限门：按当前档位决定放行、弹卡片，还是拒绝。',
		lines: [
			{
				kind: 'approval',
				detail: '打包产物重建，只写 target/，不碰源码',
				risk: '进程执行',
				target: 'bash · cargo build --release --bin app-tauri',
			},
			{
				active: '接受编辑',
				chips: ['默认', '接受编辑', '自动', '不询问', '跳过权限'],
				kind: 'note',
				label: '权限模式',
			},
		],
		stats: {
			branch: 'main ·1',
			cache: '12.4k',
			changed: 0,
			cost: '$0.05',
			ctx: 21,
			rate: 81,
		},
	},
	{
		state: 'ExecutingTool',
		title: '在沙箱里动手',
		body: '命令交给平台最强的后端执行，带资源与时间上限；结果回填给模型继续推。',
		lines: [
			{
				kind: 'tool',
				arg: 'vite.config.ts · tauri.conf.json',
				label: 'apply_patch',
				status: '自动通过',
			},
			{
				arg: 'cargo build --release --bin app-tauri',
				kind: 'tool',
				label: 'bash',
				live: true,
			},
			{
				chips: ['bwrap', 'sandbox-exec', 'Job Object'],
				kind: 'note',
				label: '沙箱后端 · 按平台探测',
			},
		],
		stats: {
			branch: 'main ·1',
			cache: '26.8k',
			changed: 2,
			cost: '$0.11',
			ctx: 34,
			rate: 88,
		},
	},
	{
		state: 'Finished',
		title: '交付，并且算清账',
		body: 'diff、上下文、缓存、速率、花了多少——标题栏一直在，不必猜。',
		lines: [
			{ added: 48, files: 3, kind: 'diff', removed: 112 },
			{
				kind: 'say',
				text: '包体 38MB → 21MB：字体换 woff2 子集、streamdown 拆包懒加载、Rust 侧开 lto + strip，改动都在 diff 面板里。',
			},
		],
		stats: {
			branch: 'main ·1',
			cache: '41.2k',
			changed: 3,
			cost: '$0.42',
			ctx: 62,
			rate: 88,
		},
	},
];

const SURFACE = 'rounded-xl border border-line bg-white shadow-xs';
const CHIP =
	'rounded-sm bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600';

/** 空闲循环只在区块可见时跑，滚出视野就停。 */
function gate(
	root: HTMLElement | null,
	anim: gsap.core.Timeline | gsap.core.Tween
) {
	if (!root) return;
	anim.pause();
	ScrollTrigger.create({
		trigger: root,
		start: 'top 95%',
		end: 'bottom 5%',
		onEnter: () => anim.play(),
		onEnterBack: () => anim.play(),
		onLeave: () => anim.pause(),
		onLeaveBack: () => anim.pause(),
	});
	if (ScrollTrigger.isInViewport(root)) anim.play();
}

/** 标题栏读数的一格。 */
function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex min-w-0 items-baseline gap-1.5">
			<span className="shrink-0 text-faint">{label}</span>
			<span className="truncate text-neutral-800 tabular-nums">{value}</span>
		</div>
	);
}

/** 窗口正文的一行。 */
function LineRow({ line }: { line: Line }) {
	switch (line.kind) {
		case 'approval':
			return (
				<div className="rounded-md border border-line bg-page p-2.5">
					<div className="flex items-center gap-1.5">
						<ShieldCheck className="h-3.5 w-3.5 text-neutral-600" />
						<span className="text-[11.5px] font-medium text-neutral-800">
							需要你的批准
						</span>
						<span className={cn('ml-auto', CHIP)}>{line.risk}</span>
					</div>
					<p className="mt-1.5 font-mono text-[11px] leading-4 text-neutral-700">
						{line.target}
					</p>
					<p className="mt-1 text-[11.5px] leading-5 text-dim">{line.detail}</p>
					<div className="mt-2.5 flex flex-wrap gap-1.5">
						<span className="rounded-sm bg-ink px-2 py-0.5 text-[11px] text-page">
							允许
						</span>
						<span
							className="rounded-sm border border-line px-2 py-0.5 text-[11px]
								text-dim"
						>
							拒绝
						</span>
						<span
							className="rounded-sm border border-line px-2 py-0.5 text-[11px]
								text-dim"
						>
							本会话内总是允许
						</span>
					</div>
				</div>
			);

		case 'diff':
			return (
				<div
					className="flex items-center gap-2 rounded-md border border-line px-2
						py-1.5 font-mono text-[10.5px]"
				>
					<GitBranch className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
					<span className="text-neutral-700">{line.files} files changed</span>
					<span className="text-diff-add">+{line.added}</span>
					<span className="text-diff-del">−{line.removed}</span>
				</div>
			);

		case 'note':
			return (
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="text-[10.5px] text-faint">{line.label}</span>
					{line.chips.map((c) => (
						<span
							className={cn(
								CHIP,
								c === line.active && 'bg-ink text-page',
								c !== line.active && 'text-neutral-500'
							)}
							key={c}
						>
							{c}
						</span>
					))}
				</div>
			);

		case 'say':
			return <p className="text-[12px] leading-5 text-ink">{line.text}</p>;

		case 'think':
			return (
				<div className="flex gap-2.5">
					<span className="mt-0.5 w-px shrink-0 self-stretch bg-neutral-300" />
					<p className="text-[12px] leading-5 text-dim">{line.text}</p>
				</div>
			);

		case 'tool':
			return (
				<div
					className="flex items-center gap-2 rounded-md border border-line px-2
						py-1.5"
				>
					<span className="shrink-0 font-mono text-[11px] text-neutral-700">
						{line.label}
					</span>
					<span
						className="min-w-0 truncate rounded-sm bg-neutral-100 px-1.5 py-0.5
							font-mono text-[10px] text-neutral-500"
					>
						{line.arg}
					</span>
					{line.live ? (
						<span
							className="ml-auto flex shrink-0 items-center gap-1.5 text-[10.5px]
								text-running"
						>
							<span className="pw-live h-1.5 w-1.5 rounded-full bg-running" />
							执行中
						</span>
					) : (
						<span className="ml-auto shrink-0 text-[10.5px] text-faint">
							{line.status}
						</span>
					)}
				</div>
			);
	}
}

export function PowerShowcase() {
	const root = useRef<HTMLElement>(null);
	const [active, setActive] = useState(0);
	const stage = STAGES[active];

	// 滚动编排：阶段进场、激活判定、窗口入场。
	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add('(prefers-reduced-motion: no-preference)', () => {
				gsap.from('.pw-head > *', {
					opacity: 0,
					y: 22,
					duration: 0.7,
					ease: 'power2.out',
					stagger: 0.08,
					scrollTrigger: { trigger: '.pw-head', start: 'top 90%' },
				});

				gsap.from('.pw-window', {
					opacity: 0,
					y: 26,
					duration: 0.8,
					ease: 'power2.out',
					scrollTrigger: { trigger: '.pw-window', start: 'top 88%' },
				});

				gsap.utils.toArray<HTMLElement>('.pw-step').forEach((el) => {
					gsap.from(el, {
						opacity: 0,
						y: 18,
						duration: 0.6,
						ease: 'power2.out',
						scrollTrigger: { trigger: el, start: 'top 86%' },
					});
				});

				// 光标闪烁 —— 窗口永远像正在进行。
				const caretTl = gsap.timeline({ repeat: -1, yoyo: true });
				caretTl.to('.pw-caret', { opacity: 0, duration: 0.55, ease: 'none' });
				gate(root.current, caretTl);
			});
		},
		{ scope: root }
	);

	// 激活判定：进 band 的那一段接手窗口。（窄屏时窗口吸在顶部，band 取
	// 68% 保证被激活的那一行落在窗口下方，看得见。）
	useGSAP(
		() => {
			gsap.utils.toArray<HTMLElement>('.pw-step').forEach((el, i) => {
				ScrollTrigger.create({
					trigger: el,
					start: 'top 68%',
					end: 'bottom 68%',
					onToggle: (self) => {
						if (self.isActive) setActive(i);
					},
				});
			});
		},
		{ scope: root }
	);

	// 换帧：正文逐行落下，活跃节点与执行中的心跳接着跳。
	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add('(prefers-reduced-motion: no-preference)', () => {
				gsap.from('.pw-line', {
					opacity: 0,
					y: 8,
					duration: 0.45,
					ease: 'power2.out',
					stagger: 0.07,
				});

				const live = gsap.utils.toArray<HTMLElement>('.pw-node-live');
				if (live.length) {
					const ring = gsap.fromTo(
						live,
						{ opacity: 0.55, scale: 1 },
						{
							opacity: 0,
							scale: 1.9,
							duration: 1.2,
							ease: 'power2.out',
							repeat: -1,
						}
					);
					gate(root.current, ring);
				}

				const dot = gsap.utils.toArray<HTMLElement>('.pw-live');
				if (dot.length) {
					const beat = gsap.timeline({ repeat: -1, yoyo: true });
					beat.to(dot, { scale: 1.5, duration: 0.7, ease: 'power1.inOut' });
					gate(root.current, beat);
				}
			});
		},
		{ dependencies: [active], scope: root }
	);

	return (
		<section className="mx-auto max-w-6xl px-6 pb-32" id="kernel" ref={root}>
			<div className="pw-head mx-auto max-w-2xl text-center">
				<h2
					className="text-[30px] font-bold tracking-tight text-ink
						sm:text-[36px]"
				>
					一次任务，走完整个内核
				</h2>
				<p className="mt-3 text-[15px] leading-relaxed text-dim">
					推理、工具、沙箱、审计——每一步都在本机发生，每一步都看得见。
				</p>
			</div>

			{/* 窄屏：窗口先吸顶，阶段清单从它下面滚过；宽屏：左清单右窗口 */}
			<div
				className="mt-16 flex flex-col gap-10 lg:mt-20 lg:grid
					lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-14"
			>
				{/* 会话窗口 */}
				<div className="pw-panel sticky top-4 z-20 lg:order-2 lg:top-24">
					<div className={cn('pw-window overflow-hidden', SURFACE)}>
						<div
							className="flex h-8 items-center gap-1.5 border-b border-line
								bg-neutral-50 px-3"
						>
							<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
							<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
							<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
							<span
								className="ml-1.5 truncate font-mono text-[10.5px] text-faint"
							>
								husk — ~/Workspace/agent-rs
							</span>
							<span
								className="ml-auto shrink-0 rounded-sm bg-neutral-100 px-1.5
									py-0.5 font-mono text-[10px] text-neutral-600"
							>
								{stage.state}
							</span>
						</div>

						{/* 标题栏读数 */}
						<div
							className="grid grid-cols-3 gap-x-3 gap-y-1 border-b border-line
								px-3 py-2 font-mono text-[10.5px]"
						>
							<Stat label="分支" value={stage.stats.branch} />
							<Stat label="上下文" value={`${stage.stats.ctx}%`} />
							<Stat label="缓存" value={stage.stats.cache} />
							<Stat
								label="速率"
								value={stage.stats.rate ? `${stage.stats.rate} tok/s` : '—'}
							/>
							<Stat label="变更" value={`${stage.stats.changed} 文件`} />
							<Stat label="成本" value={stage.stats.cost} />
						</div>

						<div
							className="flex min-h-[236px] flex-col gap-2 p-3.5
								lg:min-h-[252px]"
						>
							{stage.lines.map((line, i) => (
								<div className="pw-line" key={`${stage.state}:${i}`}>
									<LineRow line={line} />
								</div>
							))}
							<div
								className="mt-auto flex items-center gap-1.5 pt-2 font-mono
									text-[10.5px] text-faint"
							>
								<span>{stage.state}</span>
								<span className="pw-caret h-3 w-1.5 shrink-0 bg-ink/70" />
							</div>
						</div>
					</div>
				</div>

				{/* 阶段清单 */}
				<ol className="relative flex flex-col gap-9 lg:order-1 lg:gap-11">
					{STAGES.map((s, i) => (
						<li className="pw-step relative pl-11" key={s.state}>
							{i < STAGES.length - 1 && (
								<span
									aria-hidden
									className={cn(
										`absolute top-[27px] -bottom-[2.75rem] left-[11px] w-px
										transition-colors duration-500`,
										i < active ? 'bg-ink/45' : 'bg-line'
									)}
								/>
							)}
							<span
								className={cn(
									`absolute top-1 left-0 z-10 flex h-[23px] w-[23px]
									items-center justify-center rounded-full border font-mono
									text-[10.5px] transition-colors duration-300`,
									i === active
										? 'border-ink bg-ink text-page'
										: 'border-line bg-page text-faint'
								)}
							>
								{i === active && (
									<span
										aria-hidden
										className="pw-node-live absolute inset-0 rounded-full border
											border-ink"
									/>
								)}
								{i < active ? (
									<Check className="relative h-3 w-3" />
								) : (
									<span className="relative">
										{String(i + 1).padStart(2, '0')}
									</span>
								)}
							</span>
							<h3
								className={cn(
									`text-[19px] font-semibold tracking-tight transition-colors
									duration-300`,
									i === active ? 'text-ink' : 'text-dim'
								)}
							>
								{s.title}
							</h3>
							<p className="mt-2 max-w-[30rem] text-[13.5px] leading-7 text-dim">
								{s.body}
							</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
