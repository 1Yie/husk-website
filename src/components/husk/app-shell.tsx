import { useState } from 'react';

import { ChatStream } from './chat-stream';
import { Composer } from './composer';
import {
	conversations,
	emptyConversation,
	officeSessions,
	projects,
	recents,
} from './mock-data';
import { Sidebar } from './sidebar';
import { TitleBar } from './title-bar';

function findSession(id: number) {
	const o = officeSessions.find((x) => x.id === id);
	if (o) return { session: o, project: undefined };
	for (const p of projects) {
		const s = p.sessions.find((x) => x.id === id);
		if (s) return { session: s, project: p };
	}
	return undefined;
}

/** The app window, ported 1:1 — MainLayout shell + ChatPage column
 *  (TitleBar → ChatStream → floating Composer) with the gradient fade that
 *  lets scrolled text read through the composer's rounded top edge. Sidebar
 *  rows switch the streamed conversation, same as the real build. */
export function HuskApp() {
	const [activeId, setActiveId] = useState(9);
	const [office, setOffice] = useState(false);
	const active = findSession(activeId);
	const title = active?.session.title ?? '新会话';
	const streaming = !!active?.session.running;
	const items = conversations[activeId] ?? emptyConversation;

	/** Mode switch also moves the selection to the first session of the
	 *  target list — 工作 → officeSessions[0], 编程 → recents[0] (the top
	 *  row of the 会话 section). */
	const switchMode = (next: boolean) => {
		if (next === office) return;
		setOffice(next);
		setActiveId(next ? officeSessions[0].id : recents[0].row.id);
	};

	return (
		<div className="flex h-full w-full overflow-hidden bg-white select-none">
			<Sidebar
				activeId={activeId}
				office={office}
				onMode={switchMode}
				onSelect={setActiveId}
			/>
			<main className="main-col">
				<TitleBar title={title} />
				<ChatStream items={items} sessionKey={activeId} />
				{/* fade between stream end and the floating composer */}
				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16
						bg-gradient-to-t from-white/75 via-white/35 to-transparent"
				/>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
					<div className="pointer-events-auto">
						<Composer officeMode={office} streaming={streaming} />
					</div>
				</div>
			</main>
		</div>
	);
}
