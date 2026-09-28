/** Mock content for the marketing replica of the husk desktop app.
 *  Shapes mirror the app's ProjectOverview / SessionRow / stream items. */

export interface MockSession {
	id: number;
	title: string;
	pinned?: boolean;
	running?: boolean;
}

export interface MockProject {
	name: string;
	root: string;
	current?: boolean;
	sessions: MockSession[];
}

export const projects: MockProject[] = [
	{
		name: 'husk-website',
		root: '~/Workspace/husk-website',
		current: true,
		sessions: [
			{
				id: 9,
				title:
					'查看当前项目，如果我实现一个 computer Use 的功能，使用怎样的方案比较好？',
				running: true,
			},
			{ id: 8, title: '优化打包体积' },
			{ id: 3, title: 'landing 动效' },
		],
	},
	{
		name: 'agent-rs',
		root: '~/Workspace/agent-rs',
		sessions: [
			{ id: 7, title: '弹窗闪烁修复', pinned: true },
			{ id: 6, title: '重构 session 状态层' },
			{ id: 5, title: '侧栏滚动性能' },
		],
	},
];

/** 会话区 = 跨项目最近列表（置顶优先，上限 6 条）。 */
export const recents = projects
	.flatMap((p) =>
		p.sessions.map((s) => ({
			root: p.root,
			project: p.name,
			current: p.current,
			row: s,
		}))
	)
	.sort(
		(a, b) =>
			Number(b.row.pinned ?? false) - Number(a.row.pinned ?? false) ||
			b.row.id - a.row.id
	)
	.slice(0, 6);

export const activeSessionTitle =
	'查看当前项目，如果我实现一个 computer Use 的功能，使用怎样的方案比较好？';

/* ------------------------------------------------------------------ */

export interface ToolRow {
	/** Wire tool name — renders as `asChipText` label, e.g. smart_read. */
	label: string;
	/** Arg chip — renders in the grey mono pill. */
	arg?: string;
	/** Settled status text — 完成 / 已中断. */
	status?: string;
}

export type ChatItem =
	| { type: 'user'; text: string; ts: string }
	| { type: 'thinking'; label: string; body?: string }
	| {
			type: 'tools';
			label: string;
			elapsed?: string;
			live?: boolean;
			rows: ToolRow[];
	  }
	| { type: 'reply-live'; label: string }
	| { type: 'text'; md: string };

/** Session → its stream items. Clicking a sidebar row swaps this in. */
export const conversations: Record<number, ChatItem[]> = {
	9: [
		{
			type: 'user',
			text: '查看当前项目，如果我实现一个 computer Use 的功能，使用怎样的方案比较好？',
			ts: '14:16',
		},
		{
			type: 'thinking',
			label: '思考过程',
			body: '用户在问实现方案，先把项目结构摸清楚：看 package.json 确认技术栈，看 router 和 App 的入口布局，再决定 computer use 应该落在内核还是前端层。',
		},
		{
			type: 'tools',
			label: '1 次工具调用',
			elapsed: '12s',
			rows: [{ label: 'smart_read', arg: 'package.json', status: '完成' }],
		},
		{
			type: 'thinking',
			label: '思考过程',
			body: '项目是 Vite + React 的静态站，真正的 agent 能力在 Rust 内核那边——computer use 走 CDP 截图 + 输入注入更合适，网页层只负责展示。',
		},
		{
			type: 'tools',
			label: '正在调用工具',
			elapsed: '13s',
			live: true,
			rows: [
				{ label: 'smart_read', arg: 'package.json', status: '完成' },
				{ label: 'list_dir', arg: 'src/components/husk', status: '完成' },
				{ label: 'smart_read', arg: 'src/router/index.tsx', status: '完成' },
				{ label: 'smart_read', arg: 'src/App.tsx', status: '完成' },
				{
					label: 'smart_read',
					arg: 'src/pages/home/index.tsx',
					status: '完成',
				},
			],
		},
		{ type: 'reply-live', label: '正在回复' },
	],

	7: [
		{ type: 'user', text: '弹窗打开的时候还是会闪一下，查下原因', ts: '13:02' },
		{
			type: 'thinking',
			label: '思考过程',
			body: '闪现出现在动画收尾——大概率是合成器在最后一帧提交了陈旧 damage 区。先用 WEBKIT_SHOW_DAMAGE 确认是不是引擎层的重绘问题。',
		},
		{
			type: 'tools',
			label: '3 次工具调用',
			elapsed: '41s',
			rows: [
				{ label: 'bash', arg: 'WEBKIT_SHOW_DAMAGE=1 ./dev', status: '完成' },
				{
					label: 'smart_read',
					arg: 'src/components/ui/dialog.tsx',
					status: '完成',
				},
				{ label: 'grep', arg: 'zoom-in-95 · src/', status: '完成' },
			],
		},
		{
			type: 'text',
			md: '确认了——是 WebKitGTK 2.54 的 damage tracking 回归：弹窗动画结束的最后一帧把上一帧的 damage 区又提交了一次，视觉上就是闪一个矩形。\n\n应用层改不掉，已经在 `main.rs` 里做了 Wayland + NVIDIA 的自动探测兜底，剩下的等上游修复。',
		},
	],

	8: [
		{ type: 'user', text: 'release 包现在多大？能不能再小点', ts: '11:48' },
		{
			type: 'thinking',
			label: '思考过程',
			body: '先看 bundle 构成：前端 dist 里字体就占了 20MB（MiSans 可变字体全量），这才是大头，不是代码。',
		},
		{
			type: 'tools',
			label: '4 次工具调用',
			elapsed: '28s',
			rows: [
				{ label: 'bash', arg: 'du -sh dist/assets/*', status: '完成' },
				{
					label: 'bash',
					arg: 'cargo build --release --bin app-tauri',
					status: '完成',
				},
				{ label: 'smart_read', arg: 'frontend/vite.config.ts', status: '完成' },
				{
					label: 'apply_patch',
					arg: 'crates/app-tauri/tauri.conf.json',
					status: '完成',
				},
			],
		},
		{
			type: 'text',
			md: '包体从 38MB 压到 21MB：\n- MiSans 换 woff2 子集，`assetcollection` 里去掉未用的回退链\n- 前端 `manualChunks` 把 streamdown 拆出去懒加载\n- Rust 侧开 `lto = "fat"` + `strip = true`',
		},
	],

	6: [
		{
			type: 'user',
			text: 'session 的状态现在散在三四个 store 里，理一下',
			ts: '10:30',
		},
		{
			type: 'thinking',
			label: '思考过程',
			body: '现状：activeSession、stream view、queued drafts 分散在三个 store，切换会话时要手动同步。合并成一个 session-scoped view model 更干净。',
		},
		{
			type: 'text',
			md: '整理完的方案：\n\n- `stream-view.ts` 收拢为唯一数据源，turn/span/item 三层结构不动\n- store 只保留 `activeId` + 每个会话一份的 view cache\n- 切换即换引用，不再做逐字段同步',
		},
	],

	5: [
		{ type: 'user', text: '侧栏会话多了之后滚动有点卡', ts: '09:57' },
		{
			type: 'thinking',
			label: '思考过程',
			body: '滚动卡通常是每行 hover 样式触发了 layout——查一下行组件有没有 box-shadow 或 border 抖动。',
		},
		{
			type: 'tools',
			label: '2 次工具调用',
			elapsed: '19s',
			rows: [
				{
					label: 'smart_read',
					arg: 'session-sidebar/index.tsx',
					status: '完成',
				},
				{
					label: 'apply_patch',
					arg: 'session-sidebar/index.tsx',
					status: '完成',
				},
			],
		},
		{
			type: 'text',
			md: '修好了：hover 时的 `···` 按钮原来用 `hidden` 切换，改成 `visibility` 后不再回流，滚动帧率回到 60。',
		},
	],

	3: [
		{ type: 'user', text: '首页给 app 橱窗加个滚动视差', ts: '16:40' },
		{
			type: 'thinking',
			label: '思考过程',
			body: 'Codex 那种出血式橱窗：窗口初始完整可见，往下滚时轻微上移 + 放大一点，露出下半屏内容。用 scroll-driven transform，不引入滚动库。',
		},
		{
			type: 'text',
			md: '实现思路：橱窗卡片 `sticky` + `translateY(scrollProgress * -40px)`，首屏正好卡在视口下沿，滚动 400px 内走完整段视差。',
		},
	],

	1: [
		{
			type: 'user',
			text: '合并上游之后 stream 这块全是冲突',
			ts: '昨天 22:14',
		},
		{
			type: 'text',
			md: '上游把 span 改成了惰性分页，我们的 turn rail 依赖全量高度——冲突要保留对方的渲染层，把 rail 的 anchor 计算挪到懒加载之后。',
		},
	],
};

/** Fallback for a session with no authored mock conversation. */
export const emptyConversation: ChatItem[] = [
	{ type: 'user', text: '开始新会话', ts: '14:20' },
	{
		type: 'text',
		md: '这是一个演示会话——数据来自 `mock-data.ts`，可以替换成任意内容。',
	},
];

export const stats = {
	branch: 'main',
	dirty: 0,
	prompt: '266K',
	ctxWin: '1000K',
	pct: 27,
	completion: '951',
	cached: '265K',
	uncached: '364',
	cost: '$0.0078',
	toks: '182.0',
	changes: 1,
};

export const modelName = 'SWE-2';
