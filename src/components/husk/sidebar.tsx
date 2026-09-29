import {
	ArrowUpRight,
	Bell,
	Bookmark,
	Bot,
	ChevronDown,
	ChevronRight,
	Download,
	File,
	FileImage,
	FileSpreadsheet,
	FileText,
	FileType,
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
import {
	officeArtifactGroups,
	officeSessions,
	projects,
	recents,
	type MockArtGroup,
	type MockArtType,
	type MockSession,
} from './mock-data';

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

/** Ext → icon+color, mirroring the app's ExtIcon (artifacts panel). */
function ExtIcon({ ext, className }: { ext: string; className?: string }) {
	const props = { size: 14 } as const;
	switch (ext) {
		case 'pdf':
			return (
				<FileText
					{...props}
					className={cn('shrink-0 text-red-500', className)}
				/>
			);
		case 'doc':
		case 'docx':
			return (
				<FileText
					{...props}
					className={cn('shrink-0 text-sky-500', className)}
				/>
			);
		case 'ppt':
		case 'pptx':
			return (
				<FileType
					{...props}
					className={cn('shrink-0 text-amber-500', className)}
				/>
			);
		case 'xls':
		case 'xlsx':
		case 'csv':
			return (
				<FileSpreadsheet
					{...props}
					className={cn('shrink-0 text-emerald-600', className)}
				/>
			);
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'gif':
		case 'webp':
		case 'svg':
		case 'ttf':
		case 'woff2':
			return (
				<FileImage
					{...props}
					className={cn('shrink-0 text-violet-500', className)}
				/>
			);
		default:
			return (
				<File
					{...props}
					className={cn('shrink-0 text-neutral-500', className)}
				/>
			);
	}
}

const TYPE_EXT: Record<MockArtType['key'], string> = {
	pdf: 'pdf',
	doc: 'docx',
	ppt: 'pptx',
	xls: 'xlsx',
	asset: 'png',
	other: 'other',
};

/** 产物 date group — sticky header, type sub-groups collapsed by default,
 *  files on `pl-9` rows, same as the app's OfficeFileGroup. */
function OfficeFileGroup({
	group,
	defaultOpen,
}: {
	group: MockArtGroup;
	defaultOpen: boolean;
}) {
	const [openDay, setOpenDay] = useState(defaultOpen);
	const [openTypes, setOpenTypes] = useState<Set<string>>(new Set());
	const count = group.types.reduce((n, t) => n + t.files.length, 0);

	return (
		<div className="flex flex-col">
			<div className={cn(openDay && 'bg-panel sticky top-0 z-10 pb-0.5')}>
				<div
					className="group flex w-full cursor-pointer items-center gap-1.5
						rounded-md px-2 py-1.5 text-left text-[13px] text-neutral-800
						transition-colors
						hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]"
					onClick={() => setOpenDay(!openDay)}
					role="button"
					tabIndex={0}
				>
					<span className="shrink-0 text-neutral-500">
						{openDay ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronRight className="h-3.5 w-3.5" />
						)}
					</span>
					<span className="min-w-0 flex-1 truncate font-medium">
						{group.label}
					</span>
					<span className="shrink-0 text-[11px] text-neutral-500 tabular-nums">
						{count}
					</span>
				</div>
			</div>
			{openDay && (
				<div className="flex flex-col gap-0.5">
					{group.types.map((type) => (
						<OfficeTypeGroup
							key={type.key}
							open={openTypes.has(type.key)}
							onToggle={() =>
								setOpenTypes((prev) => {
									const next = new Set(prev);
									if (next.has(type.key)) next.delete(type.key);
									else next.add(type.key);
									return next;
								})
							}
							type={type}
						/>
					))}
				</div>
			)}
		</div>
	);
}

/** Type sub-group — collapsed by default; chevron + type icon + count. */
function OfficeTypeGroup({
	type,
	open,
	onToggle,
}: {
	type: MockArtType;
	open: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex flex-col">
			<div
				className="group flex w-full cursor-pointer items-center gap-1.5
					rounded-md py-1 pl-4 pr-2 text-left text-[12px] text-neutral-700
					transition-colors
					hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]"
				onClick={onToggle}
				role="button"
				tabIndex={0}
			>
				<span className="shrink-0 text-neutral-400">
					{open ? (
						<ChevronDown className="h-3 w-3" />
					) : (
						<ChevronRight className="h-3 w-3" />
					)}
				</span>
				<ExtIcon ext={TYPE_EXT[type.key]} />
				<span className="min-w-0 flex-1 truncate">{type.label}</span>
				<span className="shrink-0 text-[11px] text-neutral-500 tabular-nums">
					{type.files.length}
				</span>
			</div>
			{open &&
				type.files.map((f) => (
					<div
						className="group relative flex w-full cursor-pointer items-center
							gap-1.5 rounded-md py-1 pl-9 pr-2 text-left text-[12px]
							text-neutral-700 transition-colors
							hover:bg-[color-mix(in_srgb,var(--husk-black)_4%,transparent)]"
						key={f.dir + f.name}
						role="button"
						tabIndex={0}
					>
						<ExtIcon ext={f.ext} />
						<span className="min-w-0 flex-1 truncate">{f.name}</span>
						<span
							className="max-w-[72px] shrink-0 truncate text-[11px]
								text-neutral-400 group-hover:invisible"
						>
							{f.dir}
						</span>
						{/* hover action chip — floating overlay like the app's */}
						<span
							className="absolute right-2 top-1/2 -translate-y-1/2 invisible
								flex items-center gap-0.5 rounded-md px-1 py-0.5
								backdrop-blur-sm
								bg-[color-mix(in_srgb,var(--color-panel)_85%,transparent)]
								group-hover:visible"
						>
							<button
								aria-label="打开"
								className="rounded p-0.5 text-neutral-500
									hover:bg-[color-mix(in_srgb,var(--husk-n300)_50%,transparent)]
									hover:text-neutral-700"
								type="button"
							>
								<ArrowUpRight className="h-3 w-3" />
							</button>
							<button
								aria-label="另存为"
								className="rounded p-0.5 text-neutral-500
									hover:bg-[color-mix(in_srgb,var(--husk-n300)_50%,transparent)]
									hover:text-neutral-700"
								type="button"
							>
								<Download className="h-3 w-3" />
							</button>
							<button
								aria-label="打开所在目录"
								className="rounded p-0.5 text-neutral-500
									hover:bg-[color-mix(in_srgb,var(--husk-n300)_50%,transparent)]
									hover:text-neutral-700"
								type="button"
							>
								<FolderOpen className="h-3 w-3" />
							</button>
						</span>
					</div>
				))}
		</div>
	);
}

export function Sidebar({
	activeId,
	office,
	onMode,
	onSelect,
}: {
	activeId: number;
	office: boolean;
	onMode: (office: boolean) => void;
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

				{/* 编程 ↔ 工作 switch — lives in the header strip, right-aligned.
				    Same shape as the app: two fixed-width triggers (w-12, h-[22px])
				    over a sliding white pill. */}
				<div
					aria-label="切换模式"
					className="relative ml-auto flex gap-0 rounded-md p-0.5
						bg-[color-mix(in_srgb,var(--husk-black)_5%,transparent)]"
					role="tablist"
				>
					<span
						aria-hidden
						className={cn(
							`absolute inset-y-0.5 left-0.5 w-12 rounded-[8px] bg-white
							shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform
							duration-200 ease-out will-change-transform transform-gpu`,
							office && 'translate-x-12'
						)}
					/>
					<button
						aria-label="切换到编程模式"
						aria-selected={!office}
						className={cn(
							`relative flex h-[22px] w-12 cursor-pointer items-center
							justify-center gap-1 rounded px-0 py-0 text-[11px] font-normal
							transition-none`,
							office
								? 'text-neutral-500 hover:text-neutral-700'
								: 'text-neutral-800'
						)}
						onClick={() => onMode(false)}
						role="tab"
						type="button"
					>
						<Bot className="h-3 w-3" />
						编程
					</button>
					<button
						aria-label="切换到工作模式"
						aria-selected={office}
						className={cn(
							`relative flex h-[22px] w-12 cursor-pointer items-center
							justify-center gap-1 rounded px-0 py-0 text-[11px] font-normal
							transition-none`,
							office
								? 'text-neutral-800'
								: 'text-neutral-500 hover:text-neutral-700'
						)}
						onClick={() => onMode(true)}
						role="tab"
						type="button"
					>
						<FileText className="h-3 w-3" />
						工作
					</button>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col">
				{!office && (
					<>
						<div
							className="flex flex-none items-center justify-between px-4 pt-3
								pb-1"
						>
							<span className="text-[13px] font-medium text-neutral-600">
								会话
							</span>
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
							className="flex flex-none items-center justify-between px-4 pt-2
								pb-1"
						>
							<span className="text-[13px] font-medium text-neutral-600">
								项目
							</span>
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
					</>
				)}

				{office && (
					<>
						{/* Section header — 会话 in office mode (the folder button is
						    build-only); "+" starts a session. */}
						<div
							className="flex flex-none items-center justify-between px-4 pt-3
								pb-1"
						>
							<span className="text-[13px] font-medium text-neutral-600">
								会话
							</span>
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
						</div>

						{/* office sessions — flat list, shrink-wraps at 45% height */}
						<div className="max-h-[45%] min-h-0 flex-none overflow-y-auto">
							<div className="flex flex-col gap-0.5 px-2 pb-1">
								{officeSessions.map((s) => (
									<SessionItem
										active={s.id === activeId}
										key={s.id}
										onSelect={() => onSelect(s.id)}
										row={s}
									/>
								))}
							</div>
						</div>

						<div
							className="flex flex-none items-center justify-between px-4 pt-2
								pb-1"
						>
							<span className="text-[13px] font-medium text-neutral-600">
								产物
							</span>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto">
							<div className="flex min-h-full flex-col gap-0.5 px-2 pb-2">
								{officeArtifactGroups.map((g, i) => (
									<OfficeFileGroup
										defaultOpen={i === 0}
										group={g}
										key={g.label}
									/>
								))}
							</div>
						</div>
					</>
				)}
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
