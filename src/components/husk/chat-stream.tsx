import { ChevronDown, Copy } from '@keyline-icons/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Orb } from './agent-orb';
import { type ChatItem, type ToolRow } from './mock-data';

/* ------------------------------- turn rail -------------------------------
 * Left-edge overview strip: 4-dot top/bottom handles, long dash per user
 * turn, short dash per assistant block — same geometry as ChatTurnRail.
 * ----------------------------------------------------------------------- */

function RailMark({
	kind,
	active,
}: {
	kind: 'handle' | 'user' | 'assistant';
	active?: boolean;
}) {
	return (
		<div
			className="group/item flex h-[11px] w-[20px] cursor-pointer items-center
				justify-center"
		>
			{kind === 'handle' ? (
				<div
					className="flex items-center justify-center gap-[1.5px] opacity-40
						transition-all duration-150 group-hover/item:opacity-90"
				>
					{[0, 1, 2, 3].map((i) => (
						<span
							className="h-[2px] w-[2px] rounded-full bg-neutral-600
								transition-colors group-hover/item:bg-neutral-800"
							key={i}
						/>
					))}
				</div>
			) : kind === 'user' ? (
				<div
					className={cn(
						'rounded-full transition-all duration-150',
						active
							? `h-[3.5px] w-[14px] bg-neutral-900
								shadow-[0_0_4px_rgba(255,255,255,0.35)]`
							: `h-[2px] w-[14px] bg-neutral-300 group-hover/item:w-[16px]
								group-hover/item:bg-neutral-500`
					)}
				/>
			) : (
				<div
					className={cn(
						'rounded-full transition-all duration-150',
						active
							? `h-[3.5px] w-[9px] bg-neutral-900
								shadow-[0_0_4px_rgba(255,255,255,0.35)]`
							: `h-[2px] w-[8px] bg-neutral-300 group-hover/item:w-[10px]
								group-hover/item:bg-neutral-500`
					)}
				/>
			)}
		</div>
	);
}

function TurnRail() {
	return (
		<div
			className="absolute top-1/2 left-3 z-30 flex -translate-y-1/2 flex-col
				items-center select-none"
		>
			<div className="flex flex-col items-center gap-0 rounded-full px-1.5 py-2">
				<RailMark kind="handle" />
				<RailMark kind="user" />
				<RailMark kind="assistant" />
				<RailMark kind="assistant" />
				<RailMark kind="assistant" />
				<RailMark active kind="assistant" />
				<RailMark kind="handle" />
			</div>
		</div>
	);
}

/* ------------------------------ status rows ----------------------------- */

/** Settled thinking step — `› 思考过程`; expands to the reasoning trace. */
function ThinkingRow({ label, body }: { label: string; body?: string }) {
	const [open, setOpen] = useState(false);
	const canToggle = Boolean(body);
	// Expanded → pinned capsule, identical to the tools row's pinned form.
	return (
		<div className="my-1 w-full min-w-0 select-none">
			<div className={cn(open && 'sticky top-0 z-10 w-fit')}>
				<button
					className={cn(
						`flex h-7 w-fit items-center gap-1.5 text-xs font-medium
						text-neutral-500 transition-colors hover:text-neutral-700`,
						open
							? `rounded-full border border-neutral-200 bg-white px-2.5
								shadow-sm`
							: 'rounded px-1.5'
					)}
					disabled={!canToggle}
					onClick={() => canToggle && setOpen(!open)}
					type="button"
				>
					<ChevronDown
						className={cn(
							'h-3.5 w-3.5 text-neutral-500 transition-transform duration-300',
							open ? 'rotate-0' : '-rotate-90'
						)}
					/>
					<span>{label}</span>
				</button>
			</div>
			{canToggle && (
				<div
					className="grid w-full transition-[grid-template-rows,opacity]
						duration-250 ease-out"
					style={{
						gridTemplateRows: open ? '1fr' : '0fr',
						opacity: open ? 1 : 0,
					}}
				>
					<div className="min-h-0 w-full overflow-hidden">
						<div
							className="mt-1 w-full min-w-0 pl-6 text-[13px] leading-relaxed
								font-normal text-neutral-500 select-text"
						>
							{body?.split(/\n{2,}/).map((para, i) => (
								<p className="mb-2 last:mb-0" key={i}>
									{inline(para, `th-${i}`)}
								</p>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/** Settled tools step — `› N 次工具调用 · 12s`; expands to the flat chip list. */
function ToolsRow({
	label,
	elapsed,
	live,
	rows,
}: {
	label: string;
	elapsed?: string;
	live?: boolean;
	rows: ToolRow[];
}) {
	const [open, setOpen] = useState(!!live);
	const pinned = open;
	return (
		<div className="my-1 w-full min-w-0 select-none">
			<div className={cn(pinned && 'sticky top-0 z-10 w-fit')}>
				<button
					className={cn(
						`flex h-7 w-fit items-center gap-1.5 text-xs font-medium
						text-neutral-500 transition-colors hover:text-neutral-700`,
						pinned
							? `rounded-full border border-neutral-200 bg-white px-2.5
								shadow-sm`
							: 'rounded px-1.5'
					)}
					onClick={() => setOpen(!open)}
					type="button"
				>
					<span
						className="relative flex h-5 w-5 shrink-0 items-center
							justify-center"
					>
						{live && (
							<Orb
								className="absolute inset-0 text-neutral-800"
								size={14}
								variant="S3"
							/>
						)}
						<ChevronDown
							className={cn(
								'h-3.5 w-3.5 text-neutral-500 transition-all duration-300',
								live && 'opacity-0',
								open ? 'rotate-0' : '-rotate-90'
							)}
						/>
					</span>
					<span>{label}</span>
					{elapsed && <span className="text-neutral-400">· {elapsed}</span>}
				</button>
			</div>
			<div
				className="grid w-full transition-[grid-template-rows,opacity]
					duration-250 ease-out"
				style={{
					gridTemplateRows: open ? '1fr' : '0fr',
					opacity: open ? 1 : 0,
				}}
			>
				<div className="min-h-0 w-full overflow-hidden">
					<div className="flex w-full flex-col gap-1.5 pt-1.5">
						{rows.map((row, i) => (
							<div
								className="group flex h-7 w-fit max-w-full items-center gap-2
									rounded-md px-1.5 text-left transition-colors select-none
									hover:bg-neutral-100"
								key={i}
							>
								<span
									className="shrink-0 text-xs font-medium text-neutral-500
										transition-colors group-hover:text-neutral-700"
								>
									{row.label}
								</span>
								{row.arg && (
									<span
										className="flex h-5 max-w-[360px] min-w-0 shrink
											items-center rounded-md bg-neutral-100 px-1.5 font-mono
											text-[11px] text-neutral-600"
									>
										<span className="truncate">{row.arg}</span>
									</span>
								)}
								<span className="shrink-0 text-[11px] text-neutral-500">
									{row.status}
								</span>
								<ChevronDown
									className="h-3 w-3 shrink-0 -rotate-90 text-neutral-500"
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/** Live reply row — orb + label + ticking elapsed, no collapse affordance. */
function ReplyLiveRow({ label }: { label: string }) {
	return (
		<div className="my-1 w-full min-w-0 select-none">
			<div
				className="flex h-7 w-fit items-center gap-1.5 px-1.5 text-xs
					font-medium text-neutral-500"
			>
				<span
					className="relative flex h-5 w-5 shrink-0 items-center justify-center"
				>
					<Orb className="text-neutral-800" size={14} variant="B3" />
				</span>
				<span>{label}</span>
				<span className="text-neutral-400">· 56s</span>
			</div>
		</div>
	);
}

/* ------------------------------ markdown -------------------------------- */

function inline(text: string, keyBase: string): ReactNode[] {
	const out: ReactNode[] = [];
	const re = /(`[^`]+`)|(\*\*[^*]+\*\*)/g;
	let m: RegExpExecArray | null;
	let last = 0;
	let i = 0;
	while ((m = re.exec(text))) {
		if (m.index > last) out.push(text.slice(last, m.index));
		const tok = m[0];
		out.push(
			tok.startsWith('`') ? (
				<code key={`${keyBase}-c${i}`}>{tok.slice(1, -1)}</code>
			) : (
				<strong key={`${keyBase}-b${i}`}>{tok.slice(2, -2)}</strong>
			)
		);
		i += 1;
		last = m.index + tok.length;
	}
	if (last < text.length) out.push(text.slice(last));
	return out;
}

function MiniMarkdown({ md }: { md: string }) {
	const blocks: ReactNode[] = [];
	const parts = md.split(/```(\w*)\n?([\s\S]*?)```/);
	for (let i = 0; i < parts.length; i += 3) {
		const prose = parts[i];
		const lang = parts[i + 1];
		const code = parts[i + 2];
		if (prose?.trim()) {
			for (const para of prose.split(/\n{2,}/)) {
				const t = para.trim();
				if (!t) continue;
				const key = `p-${blocks.length}`;
				blocks.push(
					t.startsWith('- ') ? (
						<ul key={key}>
							{para.split('\n').map((li, j) => (
								<li key={j}>
									{inline(li.replace(/^-\s+/, ''), `${key}-${j}`)}
								</li>
							))}
						</ul>
					) : (
						<p key={key}>{inline(t, key)}</p>
					)
				);
			}
		}
		if (code != null) {
			blocks.push(
				<pre data-lang={lang} key={`c-${blocks.length}`}>
					<code>{code.replace(/\n$/, '')}</code>
				</pre>
			);
		}
	}
	return <div className="husk-md">{blocks}</div>;
}

/* --------------------------------- turn --------------------------------- */

function TurnItem({ item }: { item: ChatItem }) {
	switch (item.type) {
		case 'user':
			return (
				<div className="ms-auto flex w-fit max-w-[80%] flex-col items-end gap-1">
					<div className="flex w-fit max-w-full flex-col gap-2 rounded-xl bg-neutral-100 px-3.5 py-2.5 text-[14px] text-neutral-900">
						<div className="max-w-full min-w-0 text-[14px] leading-relaxed break-words select-text [overflow-wrap:anywhere]">
							{item.text}
						</div>
					</div>
					<div className="flex items-center gap-1 text-[10px] text-neutral-500 select-none">
						<Copy className="h-3 w-3" />
						<span>{item.ts}</span>
					</div>
				</div>
			);
		case 'thinking':
			return <ThinkingRow body={item.body} label={item.label} />;
		case 'tools':
			return (
				<ToolsRow
					elapsed={item.elapsed}
					label={item.label}
					live={item.live}
					rows={item.rows}
				/>
			);
		case 'reply-live':
			return <ReplyLiveRow label={item.label} />;
		case 'text':
			return (
				<div className="w-full min-w-0 text-[14px] text-neutral-900">
					<MiniMarkdown md={item.md} />
				</div>
			);
	}
}

export function ChatStream({
	items,
	sessionKey,
}: {
	items: ChatItem[];
	sessionKey: number;
}) {
	const scrollRef = useRef<HTMLDivElement>(null);
	// Land scrolled to the bottom — the desktop build's behaviour on a session
	// switch. Re-runs per session so the fresh convo snaps to its tail.
	useEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [sessionKey]);
	return (
		<div
			className="relative flex min-h-0 w-full flex-1 flex-col bg-white
				select-text"
		>
			<TurnRail />
			<div className="stream-scroll" ref={scrollRef}>
				<div
					className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4
						pt-4 pr-4 pl-11"
				>
					{items.map((item, i) => (
						<TurnItem item={item} key={i} />
					))}
					<div className="h-44 shrink-0" />
				</div>
			</div>
		</div>
	);
}
