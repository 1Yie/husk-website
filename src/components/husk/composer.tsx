import {
	ArrowUp,
	Bot,
	Brain,
	ChevronsUpDown,
	Plus,
	ShieldCheck,
	Square,
} from '@keyline-icons/react';

import { Orb } from './agent-orb';
import { modelName } from './mock-data';

const PILL_BASE =
	'min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--husk-n200)_50%,transparent)] bg-[color-mix(in_srgb,var(--husk-n100)_80%,transparent)] px-2.5 py-1 text-[12px] font-medium text-neutral-600 transition-colors select-none hover:bg-[color-mix(in_srgb,var(--husk-n200)_70%,transparent)]';
const pill = `flex ${PILL_BASE}`;
/* mode/permission/thinking pills collapse below sm — the right cluster
   (model picker + send) must never get pushed out */
const pillHidden = `hidden sm:flex ${PILL_BASE}`;

/** Floating composer card — the streaming state: Steer placeholder, queue +
 *  stop circles on the right (stop shows the B3 orb, morphing to a square on
 *  hover in the real build). */
export function Composer({ streaming }: { streaming: boolean }) {
	return (
		<div className="w-full pt-1 px-4 pb-6 select-none">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
				<div
					className="flex w-full flex-col gap-2 rounded-[22px] border
						border-neutral-200 bg-white p-3
						shadow-[0_2px_12px_rgba(0,0,0,0.025)] transition-all
						hover:border-neutral-300"
				>
					<textarea
						className="min-h-[42px] w-full resize-none border-0 bg-transparent
							p-0 text-[14px] leading-relaxed outline-none
							placeholder:text-neutral-400"
						placeholder={
							streaming
								? '插入指示引导生成 (Steer)…'
								: '输入消息… @ 引用文件 · / 命令 · $ 技能'
						}
						readOnly
						rows={2}
						style={{ maxHeight: 180 }}
					/>

					<div className="flex items-center justify-between gap-2 pt-1">
						<div className="flex items-center gap-1.5">
							<button
								aria-label="添加附件"
								className="flex h-7 w-7 shrink-0 cursor-pointer items-center
									justify-center rounded-full text-neutral-500 transition-colors
									hover:bg-neutral-100 hover:text-neutral-700"
								type="button"
							>
								<Plus className="h-4 w-4" />
							</button>

							<button
								aria-label="代理模式"
								className={pillHidden}
								type="button"
							>
								<Bot className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
								<span className="max-w-[7em] truncate">构建</span>
								<ChevronsUpDown
									className="h-3.5 w-3.5 shrink-0 text-neutral-500"
								/>
							</button>
							<button
								aria-label="权限模式"
								className={pillHidden}
								type="button"
							>
								<ShieldCheck className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
								<span className="max-w-[7em] truncate">跳过权限</span>
								<ChevronsUpDown
									className="h-3.5 w-3.5 shrink-0 text-neutral-500"
								/>
							</button>
							<button
								aria-label="思考推理强度"
								className={pillHidden}
								type="button"
							>
								<Brain className="h-3.5 w-3.5 shrink-0 text-purple-600" />
								<span className="max-w-[140px] truncate">最大推理（max）</span>
								<ChevronsUpDown
									className="h-3.5 w-3.5 shrink-0 text-neutral-500"
								/>
							</button>
						</div>

						<div className="flex items-center gap-1.5">
							<button className={pill} type="button">
								{modelName}
								<ChevronsUpDown
									className="h-3.5 w-3.5 shrink-0 text-neutral-500"
								/>
							</button>
							{streaming ? (
								<button
									aria-label="中断回复"
									className="group relative flex h-8 w-8 cursor-pointer
										items-center justify-center rounded-full border
										border-[color-mix(in_srgb,var(--husk-n200)_80%,transparent)]
										bg-neutral-100 shadow-xs transition-all
										hover:bg-neutral-200"
									title="中断当前回复"
									type="button"
								>
									<Orb
										className="text-neutral-800 transition-opacity duration-150
											group-hover:opacity-0"
										size={16}
										variant="B3"
									/>
									<Square
										className="absolute h-2.5 w-2.5 fill-neutral-800
											text-neutral-800 opacity-0 transition-opacity duration-150
											group-hover:opacity-100"
									/>
								</button>
							) : (
								<button
									aria-label="无法发送 (请输入内容)"
									className="flex h-8 w-8 cursor-not-allowed items-center
										justify-center rounded-full border
										border-[color-mix(in_srgb,var(--husk-n200)_50%,transparent)]
										bg-neutral-100 text-neutral-300 transition-all select-none"
									disabled
									type="button"
								>
									<ArrowUp className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
