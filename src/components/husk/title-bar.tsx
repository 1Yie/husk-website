import {
	BarChartHorizontalStart,
	ChartPie,
	GitBranch,
	Inbox,
	Minus,
	MoreHorizontal,
	Square,
	X,
	Zap,
} from '@keyline-icons/react';
import { BrainCircuit, FileDiff } from 'lucide-react';

import { cn } from '@/lib/utils';

import { stats } from './mock-data';

function WinButton({
	children,
	danger,
	label,
}: {
	children: React.ReactNode;
	danger?: boolean;
	label: string;
}) {
	return (
		<button
			aria-label={label}
			className={cn(
				`flex h-7 w-7 items-center justify-center rounded-md text-neutral-500
				transition-colors`,
				danger
					? 'hover:bg-red-500 hover:text-zinc-50'
					: `hover:bg-[color-mix(in_srgb,var(--husk-n200)_80%,transparent)]
						hover:text-neutral-900`
			)}
			type="button"
		>
			{children}
		</button>
	);
}

export function TitleBar({ title }: { title: string }) {
	return (
		<div
			className="flex h-9 flex-none items-center justify-between border-b
				border-[color-mix(in_srgb,var(--husk-n200)_80%,transparent)] bg-white
				px-3 select-none"
		>
			{/* title + raw-history button */}
			<div className="flex max-w-[500px] min-w-0 items-center">
				<span
					className="cursor-default truncate text-[13px] font-medium
						text-neutral-800"
					title={title}
				>
					{title}
				</span>
				<button
					aria-label="查看原始对话 JSON"
					className="ml-1 flex-none rounded p-1 text-neutral-500
						transition-colors
						hover:bg-[color-mix(in_srgb,var(--husk-n200)_60%,transparent)]
						hover:text-neutral-700"
					title="查看原始对话 (JSON)"
					type="button"
				>
					<BarChartHorizontalStart className="h-3.5 w-3.5" />
				</button>
			</div>

			<div className="h-full flex-1" />

			{/* stats cluster — StreamHealth renders nothing while healthy */}
			<div
				className="mr-2 flex min-w-0 flex-none items-center gap-3 text-[11px]
					font-mono text-neutral-600"
			>
				<span
					className="flex cursor-default items-center gap-1"
					title="Git 分支"
				>
					<GitBranch className="h-3 w-3" />
					{stats.branch}
					{stats.dirty > 0 && (
						<span className="text-amber-500">·{stats.dirty}</span>
					)}
				</span>
				<span
					className="flex cursor-default items-center gap-1"
					title="上下文窗口占用"
				>
					<ChartPie className="h-3 w-3" />
					{stats.prompt}/{stats.ctxWin} · {stats.pct}%
				</span>
				<span
					className="hidden cursor-default items-center gap-1 lg:flex"
					title="本轮模型生成 Token"
				>
					<BrainCircuit className="h-3 w-3" />
					{stats.completion}
				</span>
				<span
					className="hidden cursor-default items-center gap-1 lg:flex"
					title="提示词缓存命中"
				>
					<Inbox className="h-3 w-3" />
					{stats.cached}/{stats.uncached}
				</span>
				<span className="hidden cursor-default sm:block" title="本轮花费">
					{stats.cost}
				</span>
				<span
					className="hidden cursor-default items-center gap-1 xl:flex"
					title="生成速率"
				>
					<Zap className="h-3 w-3" />
					{stats.toks} tok/s
				</span>
			</div>

			{/* changes toggle — only when count > 0 */}
			{stats.changes > 0 && (
				<button
					aria-label="改动面板"
					className="mr-2 hidden flex-none cursor-pointer items-center gap-1
						rounded px-1.5 py-0.5 text-[11px] font-mono text-neutral-600
						transition-colors
						hover:bg-[color-mix(in_srgb,var(--husk-n200)_60%,transparent)]
						hover:text-neutral-800 sm:flex"
					title="查看改动"
					type="button"
				>
					<FileDiff className="h-3.5 w-3.5" />
					<span className="tabular-nums">{stats.changes}</span>
				</button>
			)}

			<div className="flex flex-none items-center gap-0.5">
				<WinButton label="最小化">
					<Minus className="size-[18px]" />
				</WinButton>
				<WinButton label="最大化">
					<Square className="size-[14px]" />
				</WinButton>
				<WinButton danger label="关闭">
					<X className="size-[20px]" />
				</WinButton>
			</div>
			<MoreHorizontal className="hidden h-4 w-4" />
		</div>
	);
}
