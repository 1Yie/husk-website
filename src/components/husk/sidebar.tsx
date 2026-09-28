import {
	Bell,
	Bookmark,
	ChevronDown,
	ChevronRight,
	Folder,
	FolderOpen,
	FolderPlus,
	MoreHorizontal,
	Plus,
	Settings,
} from '@keyline-icons/react';
import { useState } from 'react';

import huskIcon from '@/assets/husk-icon.png';
import { cn } from '@/lib/utils';

import { Orb } from './agent-orb';
import { projects, recents, type MockSession } from './mock-data';

/** Session row — same shape as the app's SessionItem: pl-7 h-8, orb when
 *  running, "···" menu on hover, pinned bookmark. */
function SessionItem({
	row,
	active,
	hint,
	onSelect,
}: {
	row: MockSession;
	active?: boolean;
	hint?: string;
	onSelect?: () => void;
}) {
	return (
		<div
			className={cn(
				`group flex h-8 min-h-8 w-full shrink-0 cursor-pointer items-center
				gap-1.5 rounded-md pl-7 pr-2 text-[13px] select-none transition-colors`,
				active
					? `bg-[color-mix(in_srgb,var(--husk-black)_6%,transparent)]
						text-neutral-900`
					: `font-normal text-neutral-600
						hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]
						hover:text-neutral-900`
			)}
			onClick={onSelect}
			onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
			role="button"
			tabIndex={0}
		>
			<span className="min-w-0 flex-1 truncate text-left">{row.title}</span>
			{row.pinned && (
				<Bookmark className="h-3 w-3 shrink-0 fill-current text-amber-500" />
			)}
			{hint && (
				<span
					className="max-w-[64px] shrink-0 truncate text-[11px]
						text-neutral-500"
				>
					{hint}
				</span>
			)}
			<span className="relative h-5 w-5 shrink-0">
				{row.running && (
					<Orb
						className="absolute inset-0 flex items-center justify-center
							text-neutral-800 group-hover:invisible"
						size={14}
						variant="C3"
					/>
				)}
				<button
					aria-label="会话操作"
					className="invisible absolute inset-0 flex items-center justify-center
						rounded text-neutral-500 group-hover:visible
						hover:bg-[color-mix(in_srgb,var(--husk-n300)_60%,transparent)]
						hover:text-neutral-700"
					type="button"
				>
					<MoreHorizontal className="h-3.5 w-3.5" />
				</button>
			</span>
		</div>
	);
}

/** Project row — chevron + folder icon + name + count + current dot; the
 *  expanded list renders its sessions below. */
function ProjectItem({
	project,
	activeId,
	onSelect,
}: {
	project: (typeof projects)[number];
	activeId: number;
	onSelect: (id: number) => void;
}) {
	const [open, setOpen] = useState(!!project.current);
	return (
		<div className="flex flex-col">
			<div className={cn(open && 'bg-panel sticky top-0 z-10 pb-0.5')}>
				<div
					className="group flex w-full cursor-pointer items-center gap-1.5
						rounded-md px-2 py-1.5 text-left text-[13px] text-neutral-800
						transition-colors
						hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]"
					onClick={() => setOpen(!open)}
					role="button"
					tabIndex={0}
				>
					<span className="shrink-0 text-neutral-500">
						{open ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronRight className="h-3.5 w-3.5" />
						)}
					</span>
					<span className="shrink-0 text-neutral-500">
						{open ? (
							<FolderOpen className="h-4 w-4" />
						) : (
							<Folder className="h-4 w-4" />
						)}
					</span>
					<span className="min-w-0 flex-1 truncate font-medium">
						{project.name}
					</span>
					{project.sessions.length > 0 && (
						<span className="shrink-0 text-[11px] text-neutral-500 tabular-nums">
							{project.sessions.length}
						</span>
					)}
					{project.current && (
						<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-800" />
					)}
				</div>
			</div>
			{open && (
				<div className="flex flex-col gap-0.5">
					{project.sessions.map((s) => (
						<SessionItem
							active={s.id === activeId}
							key={s.id}
							onSelect={() => onSelect(s.id)}
							row={s}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function Sidebar({
	activeId,
	onSelect,
}: {
	activeId: number;
	onSelect: (id: number) => void;
}) {
	return (
		<aside
			className="bg-panel border-hairline hidden h-full w-[240px] flex-none
				flex-col border-r text-neutral-800 select-none md:flex"
		>
			{/* window-drag strip — icon + wordmark, h-9 like the app's bar */}
			<div
				className="border-hairline bg-panel flex h-9 flex-none cursor-default
					items-center gap-2 border-b px-3"
			>
				<img
					alt=""
					className="h-4 w-4 shrink-0"
					draggable={false}
					src={huskIcon}
				/>
				<span
					className="text-[12px] font-semibold tracking-tight text-neutral-700"
				>
					Husk
				</span>
			</div>

			<div className="flex min-h-0 flex-1 flex-col">
				<div
					className="flex flex-none items-center justify-between px-4 pt-3 pb-1"
				>
					<span className="text-[13px] font-medium text-neutral-600">会话</span>
				</div>
				<div className="flex flex-none flex-col gap-0.5 px-2 pb-1">
					{recents.map(({ root, project, current, row }) => (
						<SessionItem
							active={row.id === activeId}
							hint={current ? undefined : project}
							key={`${root}:${row.id}`}
							onSelect={() => onSelect(row.id)}
							row={row}
						/>
					))}
				</div>

				<div
					className="flex flex-none items-center justify-between px-4 pt-2 pb-1"
				>
					<span className="text-[13px] font-medium text-neutral-600">项目</span>
					<div className="flex items-center gap-0.5">
						<button
							aria-label="新建会话"
							className="flex h-5 w-5 items-center justify-center rounded
								text-neutral-500 transition-colors
								hover:bg-[color-mix(in_srgb,var(--husk-n200)_60%,transparent)]
								hover:text-neutral-700"
							type="button"
						>
							<Plus className="h-3.5 w-3.5" />
						</button>
						<button
							aria-label="打开其他工作区"
							className="flex h-5 w-5 items-center justify-center rounded
								text-neutral-500 transition-colors
								hover:bg-[color-mix(in_srgb,var(--husk-n200)_60%,transparent)]
								hover:text-neutral-700"
							type="button"
						>
							<FolderPlus className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto">
					<div className="flex min-h-full flex-col gap-0.5 px-2 pb-2">
						{projects.map((p) => (
							<ProjectItem
								activeId={activeId}
								key={p.root}
								onSelect={onSelect}
								project={p}
							/>
						))}
					</div>
				</div>
			</div>

			<div
				className="bg-panel flex h-11 flex-none items-center px-4 select-none"
			>
				<div className="flex items-center gap-3.5">
					<button
						aria-label="设置"
						className="rounded p-1 text-neutral-500 transition-colors
							hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]
							hover:text-neutral-800"
						type="button"
					>
						<Settings className="h-4 w-4" />
					</button>
					<button
						aria-label="通知"
						className="relative rounded p-1 text-neutral-500 transition-colors
							hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]
							hover:text-neutral-800"
						type="button"
					>
						<Bell className="h-4 w-4" />
					</button>
				</div>
			</div>
		</aside>
	);
}
