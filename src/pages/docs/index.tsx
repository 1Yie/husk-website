import { ChevronDown, List } from '@keyline-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { SiteNav } from '@/components/site-nav';
import {
	Sheet,
	SheetHeader,
	SheetPanel,
	SheetPopup,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import {
	firstPage,
	getPage,
	neighbors,
	renderDoc,
	sections,
	type DocPage,
} from '@/lib/docs';
import { cn } from '@/lib/utils';

export function DocsIndex() {
	return firstPage ? (
		<Navigate replace to={`/docs/${firstPage.section}/${firstPage.slug}`} />
	) : null;
}

export function Docs() {
	const { '*': splat } = useParams();
	const [section, slug] = (splat ?? '').split('/');
	const page = getPage(section, slug);
	const [navOpen, setNavOpen] = useState(false);

	// New page → reset scroll to top, like a real docs site.
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
	}, [page?.slug, page?.section]);

	useEffect(() => {
		if (page) document.title = `${page.title} — Husk 文档`;
	}, [page]);

	const rendered = useMemo(() => (page ? renderDoc(page.body) : null), [page]);

	if (!page || !rendered) {
		return firstPage ? (
			<Navigate replace to={`/docs/${firstPage.section}/${firstPage.slug}`} />
		) : null;
	}
	const { prev, next } = neighbors(page);

	return (
		<div className="min-h-dvh w-full scroll-smooth bg-page text-ink">
			<SiteNav />
			<div className="mx-auto flex max-w-7xl gap-10 px-6">
				{/* sidebar — file tree, VitePress-style */}
				<aside
					className="sticky top-6 hidden h-[calc(100dvh-5rem)] w-56 flex-none
						self-start overflow-y-auto pt-8 pb-10 lg:block"
				>
					<DocTree page={page} />
				</aside>

				{/* content */}
				<main className="min-w-0 max-w-3xl flex-1 pt-10 pb-20">
					{/* mobile nav — the file tree lives in a left Sheet below lg.
					    Popup is portaled, so it can sit inside <main>. */}
					<Sheet onOpenChange={setNavOpen} open={navOpen}>
						<SheetTrigger
							className="mb-6 flex items-center gap-1.5 rounded-md border
								border-line bg-card px-3 py-1.5 text-[13px] text-dim
								transition-colors hover:text-ink lg:hidden"
						>
							<List className="h-3.5 w-3.5" />
							文档目录
						</SheetTrigger>
						<SheetPopup className="max-w-80" side="left">
							<SheetHeader>
								<SheetTitle className="text-base">文档目录</SheetTitle>
							</SheetHeader>
							<SheetPanel>
								<DocTree onNavigate={() => setNavOpen(false)} page={page} />
							</SheetPanel>
						</SheetPopup>
					</Sheet>
					<article
						className="docs-md"
						dangerouslySetInnerHTML={{ __html: rendered.html }}
					/>
					<PrevNext next={next} page={page} prev={prev} />
				</main>

				{/* on-this-page toc */}
				<aside
					className="sticky top-6 hidden h-fit w-48 flex-none pt-12 xl:block"
				>
					<p className="mb-2 text-[12px] font-semibold text-faint">本页内容</p>
					<ul className="flex flex-col gap-1 border-l border-line text-[12.5px]">
						{rendered.toc.map((t) => (
							<li key={t.slug}>
								<a
									className={cn(
										`-ml-px block border-l border-transparent py-0.5 text-faint
										transition-colors hover:border-dim hover:text-ink`,
										t.depth === 3 ? 'pl-6' : 'pl-3'
									)}
									href={`#${t.slug}`}
								>
									{t.text}
								</a>
							</li>
						))}
					</ul>
				</aside>
			</div>
		</div>
	);
}

/** Section → page tree, shared by the desktop sidebar and the mobile drawer. */
function DocTree({
	page,
	onNavigate,
}: {
	page: DocPage;
	onNavigate?: () => void;
}) {
	return (
		<>
			{sections.map((sec) => (
				<div className="mb-5" key={sec.key}>
					<p className="px-3 pb-1.5 text-[12px] font-semibold text-faint">
						{sec.title}
					</p>
					<ul className="flex flex-col gap-px">
						{sec.pages.map((p) => {
							const active = p === page;
							return (
								<li key={p.slug}>
									<Link
										className={cn(
											`block rounded-md px-3 py-1.5 text-[13.5px]
											transition-colors`,
											active
												? 'bg-ink/7 font-medium text-ink'
												: 'text-dim hover:bg-ink/5 hover:text-ink'
										)}
										onClick={onNavigate}
										to={`/docs/${sec.key}/${p.slug}`}
									>
										{p.title}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</>
	);
}

function PrevNext({
	page,
	prev,
	next,
}: {
	page: DocPage;
	prev?: DocPage;
	next?: DocPage;
}) {
	void page;
	return (
		<nav
			className="mt-14 flex items-stretch justify-between gap-3 border-t
				border-line pt-6"
		>
			<Pager dir="prev" page={prev} />
			<Pager dir="next" page={next} />
		</nav>
	);
}

function Pager({ dir, page }: { dir: 'prev' | 'next'; page?: DocPage }) {
	if (!page) return <span className="w-1/2" />;
	return (
		<Link
			className={cn(
				`group flex w-1/2 flex-col gap-1 rounded-lg border border-line bg-card
				px-4 py-3 transition-colors hover:border-faint/60`,
				dir === 'next' && 'items-end text-right'
			)}
			to={`/docs/${page.section}/${page.slug}`}
		>
			<span className="flex items-center gap-1 text-[11.5px] text-faint">
				<ChevronDown
					className={cn('h-3 w-3', dir === 'prev' ? 'rotate-90' : '-rotate-90')}
				/>
				{dir === 'prev' ? '上一页' : '下一页'}
			</span>
			<span className="text-[13.5px] font-medium text-ink">{page.title}</span>
		</Link>
	);
}
