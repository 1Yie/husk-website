import { useGSAP } from '@gsap/react';
import {
	Bot,
	Check,
	Cloud,
	Cpu,
	Cursor,
	FileText,
	GitBranch,
	Layers,
	Mouse,
	Plug,
	ShieldCheck,
} from '@keyline-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, type ComponentType, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type IconComponent = ComponentType<{ className?: string }>;

/* Copy is sourced from src/content/docs so the showcase cannot drift from
   what the kernel actually ships (permissions, sandbox, providers, modes). */

/* Radius scale, outer → inner: stage 2xl · window / card xl · chip md.
   Keeping nested surfaces one step apart is what makes the mocks read as
   a single system instead of a pile of identical boxes. */
const SURFACE = 'rounded-xl border border-line bg-white shadow-xs';
const CHIP =
	'rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[10.5px] leading-4 text-neutral-700';
const META = 'text-[10.5px] leading-4 text-faint';

interface ToolSpec {
	label: string;
	arg?: string;
	status?: string;
	live?: boolean;
}

const CODING_TOOLS: ToolSpec[] = [
	{ label: 'smart_read', arg: 'package.json', status: '完成' },
	{ label: 'list_dir', arg: 'src/components', status: '完成' },
	{ label: 'bash', arg: 'cargo test --workspace', live: true },
];

const OFFICE_TOOLS: ToolSpec[] = [
	{ label: 'office_create', arg: 'q3-review/review.pptx', status: '完成' },
	{ label: 'office_add', arg: 'slides 12 页 · 图表 6', status: '完成' },
	{ label: 'image_search', arg: 'minimal hero cover', status: '完成' },
];

const PROVIDERS = [
	{ name: 'anthropic', model: 'claude-opus-5.5', active: true },
	{ name: 'openai', model: 'gpt-6-astra', active: false },
	{ name: 'gemini', model: 'gemini-3.8-flash', active: false },
];

const CRATES = ['agent-llm', 'agent-sandbox', 'agent-plugin', 'agent-context'];

const MODES = ['默认', '接受编辑', '自动', '不询问', '跳过权限'];

/* ---------------------------- mock primitives ---------------------------- */

/** Dotted stage behind each mock. The grid fades out toward the edges so the
    mock sits on a surface rather than in a bordered box. */
function Stage({ children }: { children: ReactNode }) {
	const fade = 'radial-gradient(ellipse at center, #000 35%, transparent 80%)';
	return (
		<div
			aria-hidden
			className="relative overflow-hidden rounded-2xl border border-line bg-page
				px-5 py-7 sm:px-10 sm:py-10"
		>
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage:
						'radial-gradient(rgb(0 0 0 / 0.09) 1px, transparent 1px)',
					backgroundSize: '18px 18px',
					maskImage: fade,
					WebkitMaskImage: fade,
				}}
			/>
			<div className="relative mx-auto w-full max-w-[420px]">{children}</div>
		</div>
	);
}

/** Scaled-down app window — title strip + dots, like the desktop build. */
function MiniWindow({
	title,
	className,
	children,
}: {
	title: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={cn('overflow-hidden', SURFACE, className)}>
			<div
				className="flex h-8 items-center gap-1.5 border-b border-line
					bg-neutral-50 px-3"
			>
				<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
				<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
				<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
				<span className={cn('ml-1.5 truncate', META)}>{title}</span>
			</div>
			<div className="p-3.5">{children}</div>
		</div>
	);
}

/** One streamed tool row — same shape as the app's tool-call lines. */
function ToolRow({ label, arg, status, live }: ToolSpec) {
	return (
		<div className="flex items-center gap-2">
			<span className={cn('shrink-0', CHIP)}>{label}</span>
			{arg && (
				<span
					className="min-w-0 flex-1 truncate font-mono text-[10.5px] leading-4
						text-neutral-500"
				>
					{arg}
				</span>
			)}
			{status && <span className={cn('shrink-0', META)}>{status}</span>}
			{live && (
				<span className="relative flex h-1.5 w-1.5 shrink-0">
					<span
						className="absolute inline-flex h-full w-full animate-ping
							rounded-full bg-emerald-400/70"
					/>
					<span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
				</span>
			)}
		</div>
	);
}

/* -------------------------------- mocks --------------------------------- */

/** 桌面端 + headless 两个前端，汇入同一个内核 crate。 */
function KernelMock() {
	return (
		<div className="fs-kernel">
			{/* kept two-up at every width — the SVG fork below assumes
			    side-by-side windows at 25% / 75% */}
			<div className="grid grid-cols-2 gap-3">
				<MiniWindow title="husk · 桌面端">
					<div className="flex flex-col gap-2">
						<div className="h-1.5 w-4/5 rounded-full bg-neutral-200" />
						<div className="h-1.5 w-1/2 rounded-full bg-neutral-200" />
						<div className="mt-1 flex flex-wrap gap-1">
							{['smart_read', 'apply_patch'].map((t) => (
								<span
									className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono
										text-[10px] leading-4 text-neutral-600"
									key={t}
								>
									{t}
								</span>
							))}
						</div>
					</div>
				</MiniWindow>
				<MiniWindow title="husk · headless CLI">
					<div
						className="flex flex-col gap-1 font-mono text-[10.5px]
							leading-relaxed text-neutral-500"
					>
						<span className="truncate text-neutral-800">
							$ husk run "release 包再小点"
						</span>
						<span>→ 载入同一份 config.toml</span>
						<span>→ tools / permissions / sessions 复用</span>
					</div>
				</MiniWindow>
			</div>

			{/* fork: both front ends converge on one kernel. viewBox maps to
			    the content width, so 25/75 line up with the two windows. */}
			<svg
				aria-hidden
				className="block h-9 w-full text-neutral-300"
				fill="none"
				preserveAspectRatio="none"
				viewBox="0 0 100 36"
			>
				<path
					className="fs-conn"
					d="M25 0 V16 H75 V0"
					pathLength={100}
					stroke="currentColor"
					strokeDasharray={100}
					strokeWidth={1.5}
					vectorEffect="non-scaling-stroke"
				/>
				<path
					className="fs-conn"
					d="M50 16 V36"
					pathLength={100}
					stroke="currentColor"
					strokeDasharray={100}
					strokeWidth={1.5}
					vectorEffect="non-scaling-stroke"
				/>
			</svg>

			<div
				className="mx-auto flex w-fit items-center gap-2 rounded-lg border
					border-neutral-300 bg-white px-3.5 py-2 shadow-sm ring-4
					ring-neutral-100"
			>
				<Cpu className="h-3.5 w-3.5 text-neutral-700" />
				<span className="font-mono text-[11.5px] font-medium text-neutral-900">
					agent-kernel
				</span>
			</div>
			<div className="mt-4 flex flex-wrap justify-center gap-1.5">
				{CRATES.map((c) => (
					<span
						className="rounded-md border border-line bg-white/70 px-2 py-0.5
							font-mono text-[10px] leading-4 text-neutral-500"
						key={c}
					>
						{c}
					</span>
				))}
			</div>
		</div>
	);
}

/** 五档权限 + 沙箱审批卡，光标循环点「拒绝」。 */
function PermissionMock() {
	return (
		<div>
			<div className="flex flex-wrap justify-center gap-1.5">
				{MODES.map((m, i) => (
					<span
						className={cn(
							'rounded-md border px-2.5 py-1 text-[11px] leading-4',
							i === 0
								? `border-neutral-300 bg-white font-medium text-neutral-900
									shadow-xs`
								: 'border-transparent bg-neutral-100/80 text-neutral-500'
						)}
						key={m}
					>
						{m}
					</span>
				))}
			</div>

			<div className={cn('mt-4 p-3.5', SURFACE)}>
				<div
					className="flex items-center gap-2 rounded-lg border border-line
						bg-neutral-50 px-2.5 py-2"
				>
					<span className={cn('shrink-0', CHIP, 'bg-white ring-1 ring-line')}>
						bash
					</span>
					<span
						className="min-w-0 flex-1 truncate font-mono text-[11px] leading-4
							text-neutral-700"
					>
						rm -rf build/ && cargo build
					</span>
				</div>

				<div className="mt-3.5 flex items-center gap-1.5">
					<span className="relative inline-flex">
						<span
							className="fs-deny inline-flex h-7 items-center rounded-md border
								border-line bg-white px-3 text-[11.5px] font-medium
								text-neutral-800 shadow-xs"
						>
							拒绝
						</span>
						<Cursor
							className="fs-perm-cursor pointer-events-none absolute left-1/2
								top-1/2 h-3.5 w-3.5 text-neutral-800 drop-shadow-sm"
						/>
						<span
							className="fs-perm-ripple pointer-events-none absolute left-1/2
								top-1/2 h-5 w-5 rounded-full border border-neutral-500/60
								opacity-0"
						/>
					</span>
					<span
						className="inline-flex h-7 items-center rounded-md bg-ink px-3
							text-[11.5px] font-medium text-page"
					>
						允许一次
					</span>
					<span
						className="ml-auto inline-flex h-7 items-center px-1.5 text-[11.5px]
							text-neutral-400"
					>
						总是允许
					</span>
				</div>
			</div>
		</div>
	);
}

/** 供应商链：主用在使用中，其余待命，失败即接管。 */
function ProviderMock() {
	return (
		<div className="flex flex-col gap-2">
			{PROVIDERS.map((p) => (
				<div
					className={cn(
						'flex items-center gap-3 rounded-xl border px-3.5 py-2.5',
						p.active
							? 'border-neutral-300 bg-white shadow-sm'
							: 'border-line bg-white/60'
					)}
					key={p.name}
				>
					<span
						className={cn(
							'h-1.5 w-1.5 shrink-0 rounded-full',
							p.active ? 'fs-dot-active bg-emerald-500' : 'bg-neutral-300'
						)}
					/>
					<span
						className={cn(
							'w-[68px] shrink-0 font-mono text-[11px] font-medium',
							p.active ? 'text-neutral-900' : 'text-neutral-600'
						)}
					>
						{p.name}
					</span>
					<span
						className="min-w-0 flex-1 truncate font-mono text-[10.5px] leading-4
							text-neutral-500"
					>
						{p.model}
					</span>
					{p.active ? (
						<Badge className="px-1.5" variant="success">
							使用中
						</Badge>
					) : (
						<Badge className="px-1.5" variant="outline">
							待命
						</Badge>
					)}
				</div>
			))}
		</div>
	);
}

/** 编程 ↔ 工作：滑动胶囊来回切，下方工具视图跟着换。 */
function ModeMock() {
	return (
		<div>
			<div
				className="relative mx-auto flex w-fit gap-0 rounded-lg bg-neutral-100
					p-0.5 ring-1 ring-inset ring-line"
			>
				<span
					className="fs-mode-pill absolute inset-y-0.5 left-0.5 w-[76px]
						rounded-md bg-white shadow-xs ring-1 ring-black/5"
				/>
				<span
					className="relative flex h-7 w-[76px] items-center justify-center
						gap-1.5 text-[12px] font-medium text-neutral-900"
				>
					<Bot className="h-3.5 w-3.5" />
					编程
				</span>
				<span
					className="relative flex h-7 w-[76px] items-center justify-center
						gap-1.5 text-[12px] text-neutral-500"
				>
					<FileText className="h-3.5 w-3.5" />
					工作
				</span>
			</div>

			<div className="mt-4 grid">
				<div
					className={cn(
						'fs-set-a col-start-1 row-start-1 flex flex-col gap-2.5 p-3.5',
						SURFACE
					)}
				>
					{CODING_TOOLS.map((t) => (
						<ToolRow key={t.label} {...t} />
					))}
				</div>
				<div
					className={cn(
						`fs-set-b col-start-1 row-start-1 flex flex-col gap-2.5 p-3.5
						opacity-0`,
						SURFACE
					)}
				>
					{OFFICE_TOOLS.map((t) => (
						<ToolRow key={t.label} {...t} />
					))}
				</div>
			</div>
		</div>
	);
}

/** 桌面操作：光标在缩小的「屏幕」上移动并点击。 */
function ComputerUseMock() {
	return (
		<div
			className="relative h-[108px] overflow-hidden rounded-lg border
				border-line bg-white shadow-xs"
		>
			<div
				className="flex h-6 items-center gap-1 border-b border-line
					bg-neutral-50 px-2.5"
			>
				<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
				<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
				<span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
			</div>
			<span
				className="absolute left-4 top-10 h-11 w-24 rounded-md border
					border-line bg-neutral-50"
			/>
			<span
				className="absolute right-4 top-12 h-9 w-16 rounded-md border
					border-line bg-neutral-50"
			/>
			<span
				className="absolute bottom-3 left-4 h-1 w-8 rounded-full bg-neutral-200"
			/>
			<span
				className="absolute bottom-3 left-14 h-1 w-4 rounded-full
					bg-neutral-200"
			/>
			<Cursor
				className="fs-cu-cursor pointer-events-none absolute left-10 top-14
					h-3.5 w-3.5 text-neutral-800 drop-shadow-sm"
			/>
			<span
				className="fs-cu-ripple pointer-events-none absolute left-10 top-14 h-5
					w-5 rounded-full border border-neutral-500/60 opacity-0"
			/>
		</div>
	);
}

/** 插件钩子：命中禁止规则后拦下高危命令。 */
function HookMock() {
	return (
		<div className="rounded-lg border border-line bg-white p-3 shadow-xs">
			<div
				className="flex items-center gap-1.5 font-mono text-[10.5px] leading-4
					text-neutral-500"
			>
				<Plug className="h-3 w-3" />
				before_tool_execute
			</div>
			<div className="mt-2.5 flex items-center gap-1.5">
				<span className={cn('shrink-0', CHIP)}>bash</span>
				<span
					className="truncate font-mono text-[10.5px] leading-4
						text-neutral-700"
				>
					git push --force
				</span>
			</div>
			<div
				className="fs-hook-row mt-2.5 flex items-center gap-1.5 border-t
					border-line pt-2.5 text-[11px] leading-4 text-neutral-500"
			>
				<Check className="h-3 w-3 shrink-0 text-emerald-600" />
				命中规则 · force push 需二次确认
			</div>
			<div className="mt-2.5 flex items-center justify-between">
				<Badge className="fs-hook-badge px-1.5" variant="error">
					已拦截
				</Badge>
				<span className={META}>等待你的确认</span>
			</div>
		</div>
	);
}

/** 子代理：delegate 孵化的有界子任务。 */
function AgentTreeMock() {
	const agents = [
		{ title: '调研 provider 层', note: '完成', running: false },
		{ title: '重构 config schema', note: '运行中', running: true },
	];
	return (
		<div className="rounded-lg border border-line bg-white p-3 shadow-xs">
			<div className="flex items-center gap-1.5">
				<GitBranch className="h-3 w-3 text-neutral-500" />
				<span className="text-[11.5px] font-medium text-neutral-800">
					delegate
				</span>
				<span className={cn('ml-auto', META)}>2 个子代理</span>
			</div>
			<div
				className="mt-2.5 flex flex-col gap-2 border-l border-dashed
					border-neutral-300 pl-3"
			>
				{agents.map((a) => (
					<div className="flex items-center gap-2" key={a.title}>
						<span
							className={cn(
								'h-1.5 w-1.5 shrink-0 rounded-full',
								a.running ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'
							)}
						/>
						<span className="text-[11.5px] leading-4 text-neutral-600">
							{a.title}
						</span>
						<span className={cn('ml-auto', META)}>{a.note}</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* -------------------------------- content ------------------------------- */

interface FeatureRow {
	icon: IconComponent;
	title: string;
	desc: string;
	bullets: string[];
	mock: ReactNode;
}

const ROWS: FeatureRow[] = [
	{
		icon: Layers,
		title: '统一内核架构',
		desc: '桌面端与命令行端共用同一个 Rust 内核：同一份配置、同一套工具、同一份会话持久化。能力不在界面层，换前端不改变 agent 的行为。',
		bullets: [
			'权限判定与工具注册表在内核，前端只负责呈现',
			'从 GUI 到 headless CLI，同一任务行为可复现',
		],
		mock: <KernelMock />,
	},
	{
		icon: ShieldCheck,
		title: '五档权限管控，配合沙箱执行',
		desc: '权限从「逐项确认」到「完全信任」分五级，随时在输入框切换；命令在受限沙箱内运行，敏感密钥被屏蔽，并设有资源与时间上限。',
		bullets: [
			'写文件与进程类工具分开审批，粒度到单次工具调用',
			'禁止规则优先于一切放行规则，命中即拦截',
		],
		mock: <PermissionMock />,
	},
	{
		icon: Cloud,
		title: '多模型接入与自动降级',
		desc: '兼容 OpenAI、Anthropic、Gemini 以及任何 OpenAI 兼容端点，可同时配置多个供应商。',
		bullets: ['某家服务宕机或超时，任务照常跑完，不用手动改配置再重来'],
		mock: <ProviderMock />,
	},
	{
		icon: Bot,
		title: '编程与工作',
		desc: '编程模式下，agent 读代码、改文件、跑命令；工作模式下，生成演示文稿、文档和表格。',
		bullets: [
			'编程：读取项目文件、打补丁、执行 bash',
			'工作：新建 pptx，逐页添加内容和图表，需要配图时搜索图片',
		],
		mock: <ModeMock />,
	},
];

interface FeatureExtra {
	icon: IconComponent;
	title: string;
	desc: string;
	mock: ReactNode;
}

const EXTRAS: FeatureExtra[] = [
	{
		icon: Mouse,
		title: '桌面操作能力',
		desc: '读取屏幕画面，并模拟鼠标与键盘完成点击、拖拽与输入。',
		mock: <ComputerUseMock />,
	},
	{
		icon: Plug,
		title: '插件扩展机制',
		desc: '通过 before_tool_execute 等钩子加入自定义检查，高风险操作先拦截，再交给你确认。',
		mock: <HookMock />,
	},
	{
		icon: GitBranch,
		title: '记忆、技能与子代理',
		desc: '记忆跨会话沉淀偏好，技能按需加载；delegate 孵化子代理处理有边界的子任务。',
		mock: <AgentTreeMock />,
	},
];

/* ------------------------------- showcase ------------------------------- */

export function FeatureShowcase() {
	const root = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add('(prefers-reduced-motion: no-preference)', () => {
				gsap.from('.fs-head', {
					opacity: 0,
					y: 24,
					duration: 0.7,
					ease: 'power2.out',
					stagger: 0.08,
					scrollTrigger: { trigger: '.fs-head', start: 'top 90%' },
				});

				// Copy slides in from its own side, mock from the other.
				gsap.utils.toArray<HTMLElement>('.fs-row').forEach((row, i) => {
					const dir = i % 2 === 0 ? 1 : -1;
					const trigger = { trigger: row, start: 'top 85%' };
					const copy = row.querySelector('.fs-copy');
					const mock = row.querySelector('.fs-mock');
					if (copy) {
						gsap.from(copy, {
							opacity: 0,
							x: -32 * dir,
							duration: 0.8,
							ease: 'power2.out',
							scrollTrigger: trigger,
						});
					}
					if (mock) {
						gsap.from(mock, {
							opacity: 0,
							x: 32 * dir,
							y: 12,
							duration: 0.85,
							ease: 'power2.out',
							scrollTrigger: trigger,
						});
					}
				});

				gsap.from('.fs-extra', {
					opacity: 0,
					y: 28,
					duration: 0.7,
					ease: 'power2.out',
					stagger: 0.1,
					scrollTrigger: { trigger: '.fs-extras', start: 'top 88%' },
				});

				// Kernel connectors draw themselves in.
				gsap.from('.fs-conn', {
					strokeDashoffset: 100,
					duration: 1.1,
					ease: 'power2.out',
					stagger: 0.12,
					scrollTrigger: { trigger: '.fs-kernel', start: 'top 82%' },
				});

				// Loops below pause whenever their mock is off screen.
				const gate = (tl: gsap.core.Timeline, trigger: string) => {
					const el = root.current?.querySelector(trigger);
					if (!el) return;
					tl.pause();
					ScrollTrigger.create({
						trigger: el,
						start: 'top 92%',
						end: 'bottom 8%',
						onEnter: () => tl.play(),
						onEnterBack: () => tl.play(),
						onLeave: () => tl.pause(),
						onLeaveBack: () => tl.pause(),
					});
					if (ScrollTrigger.isInViewport(el)) tl.play();
				};

				// 权限卡：光标移到「拒绝」并点击。
				const permTl = gsap.timeline({ repeat: -1, repeatDelay: 1.3 });
				permTl
					.set('.fs-perm-cursor', { x: 30, y: 22, opacity: 0 })
					.set('.fs-perm-ripple', { scale: 0.35, opacity: 0 })
					.to('.fs-perm-cursor', { opacity: 1, duration: 0.3 })
					.to(
						'.fs-perm-cursor',
						{ x: 0, y: 0, duration: 0.6, ease: 'power2.inOut' },
						'<'
					)
					.to('.fs-deny', { scale: 0.95, duration: 0.12 }, '>-0.08')
					.to(
						'.fs-perm-ripple',
						{ scale: 1.9, opacity: 0.6, duration: 0.45 },
						'<'
					)
					.to('.fs-deny', {
						scale: 1,
						duration: 0.25,
						ease: 'back.out(2)',
					})
					.to('.fs-perm-ripple', { opacity: 0, duration: 0.3 }, '<')
					.to('.fs-perm-cursor', { opacity: 0, duration: 0.4 }, '+=0.4');
				gate(permTl, '.fs-deny');

				// 编程 ↔ 工作：胶囊来回滑，工具视图交叉淡入。
				const modeTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
				modeTl
					.to('.fs-mode-pill', {
						xPercent: 100,
						duration: 0.5,
						ease: 'power2.inOut',
					})
					.to('.fs-set-a', { opacity: 0, duration: 0.3 }, '<0.1')
					.to('.fs-set-b', { opacity: 1, duration: 0.3 }, '<')
					.to('.fs-mode-pill', {
						xPercent: 0,
						duration: 0.5,
						ease: 'power2.inOut',
						delay: 1.7,
					})
					.to('.fs-set-b', { opacity: 0, duration: 0.3 }, '<0.1')
					.to('.fs-set-a', { opacity: 1, duration: 0.3 }, '<');
				gate(modeTl, '.fs-mode-pill');

				// 桌面操作：光标走位并点两下。
				const cuTl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
				cuTl
					.set('.fs-cu-cursor', { x: 0, y: 0, opacity: 0 })
					.set('.fs-cu-ripple', { x: 0, y: 0, scale: 0.4, opacity: 0 })
					.to('.fs-cu-cursor', { opacity: 1, duration: 0.3 })
					.to('.fs-cu-cursor', {
						x: 46,
						y: -18,
						duration: 0.7,
						ease: 'power2.inOut',
					})
					.set('.fs-cu-ripple', { x: 46, y: -18 })
					.fromTo(
						'.fs-cu-ripple',
						{ scale: 0.4, opacity: 0.7 },
						{ scale: 1.9, opacity: 0, duration: 0.5 }
					)
					.to('.fs-cu-cursor', {
						x: 8,
						y: 12,
						duration: 0.6,
						ease: 'power2.inOut',
					})
					.set('.fs-cu-ripple', { x: 8, y: 12 })
					.fromTo(
						'.fs-cu-ripple',
						{ scale: 0.4, opacity: 0.7 },
						{ scale: 1.9, opacity: 0, duration: 0.5 }
					)
					.to('.fs-cu-cursor', { opacity: 0, duration: 0.4 });
				gate(cuTl, '.fs-cu-cursor');

				// 主用供应商心跳。
				const dotTl = gsap.timeline({ repeat: -1, yoyo: true });
				dotTl.to('.fs-dot-active', {
					scale: 1.35,
					duration: 0.9,
					ease: 'power1.inOut',
				});
				gate(dotTl, '.fs-dot-active');

				// 拦截徽标呼吸。
				const hookTl = gsap.timeline({ repeat: -1, yoyo: true });
				hookTl.to('.fs-hook-badge', {
					scale: 1.05,
					duration: 0.6,
					ease: 'power1.inOut',
				});
				gate(hookTl, '.fs-hook-badge');
			});
		},
		{ scope: root }
	);

	return (
		<section
			className="mx-auto max-w-6xl overflow-x-clip px-6 pb-32"
			id="features"
			ref={root}
		>
			<div className="mx-auto max-w-2xl text-center">
				<h2
					className="fs-head text-[30px] font-bold tracking-tight text-ink
						sm:text-[36px]"
				>
					功能
				</h2>
				<p className="fs-head mt-3 text-[15px] leading-relaxed text-dim">
					为高强度人机协作打磨的每个细节。
				</p>
			</div>

			<div className="mt-20 flex flex-col gap-24 lg:gap-32">
				{ROWS.map((row, i) => (
					<div
						className="fs-row grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
						key={row.title}
					>
						<div className="fs-copy max-w-[30rem]">
							<span
								className="flex h-10 w-10 items-center justify-center rounded-xl
									border border-line bg-white shadow-xs"
							>
								<row.icon className="h-[18px] w-[18px] text-neutral-700" />
							</span>
							<h3
								className="mt-5 text-[21px] font-semibold leading-snug
									tracking-tight text-ink"
							>
								{row.title}
							</h3>
							<p className="mt-3 text-[14px] leading-7 text-dim">{row.desc}</p>
							<ul className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
								{row.bullets.map((b) => (
									<li className="flex items-start gap-2.5" key={b}>
										<span
											className="mt-[3px] flex h-4 w-4 shrink-0 items-center
												justify-center rounded-full bg-neutral-100"
										>
											<Check className="h-2.5 w-2.5 text-neutral-500" />
										</span>
										<span className="text-[13px] leading-6 text-dim">{b}</span>
									</li>
								))}
							</ul>
						</div>
						<div className={cn('fs-mock', i % 2 === 1 && 'lg:order-first')}>
							<Stage>{row.mock}</Stage>
						</div>
					</div>
				))}
			</div>

			<div className="fs-extras mt-28 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{EXTRAS.map((e) => (
					<div
						className="fs-extra flex flex-col rounded-2xl border border-line
							bg-card p-6 transition-colors hover:border-neutral-300"
						key={e.title}
					>
						<div className="flex items-center gap-3">
							<span
								className="flex h-8 w-8 shrink-0 items-center justify-center
									rounded-lg border border-line bg-white shadow-xs"
							>
								<e.icon className="h-4 w-4 text-neutral-700" />
							</span>
							<h3 className="text-[15px] font-semibold text-ink">{e.title}</h3>
						</div>
						<p className="mt-3 text-[13px] leading-6 text-dim">{e.desc}</p>
						<div aria-hidden className="mt-auto pt-6">
							<div className="rounded-xl border border-line bg-page p-3">
								{e.mock}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
