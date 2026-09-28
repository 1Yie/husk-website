import hljs from 'highlight.js/lib/common';
import { Marked } from 'marked';

/**
 * File-system docs — markdown files under `src/content/docs/` form the nav
 * tree, VitePress-style. Folder = section (numeric prefix orders it), file =
 * page (first `# h1` becomes its title). URL slug strips the order prefixes:
 * `01-guide/02-installation.md` → `/docs/guide/installation`.
 */

const raw = import.meta.glob('../content/docs/**/*.md', {
	eager: true,
	import: 'default',
	query: '?raw',
}) as Record<string, string>;

const SECTION_NAMES: Record<string, string> = {
	guide: '入门',
	features: '功能',
	dev: '开发',
	reference: '参考',
};

export interface DocPage {
	/** url slug within the section, e.g. `installation` */
	slug: string;
	/** first h1 in the file — page + sidebar title */
	title: string;
	section: string;
	sectionTitle: string;
	order: number;
	body: string;
}

export interface DocSection {
	key: string;
	title: string;
	order: number;
	pages: DocPage[];
}

const stripOrder = (s: string) => s.replace(/^\d+-/, '');
const orderOf = (s: string) => Number(/^(\d+)-/.exec(s)?.[1] ?? 99);

const pages: DocPage[] = Object.entries(raw)
	.map(([path, body]) => {
		const rel = path.replace(/^\.\.\/content\/docs\//, '').replace(/\.md$/, '');
		const [dir, file] = rel.split('/');
		const section = stripOrder(dir);
		const slug = stripOrder(file);
		const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? slug;
		return {
			slug,
			title,
			section,
			sectionTitle: SECTION_NAMES[section] ?? section,
			order: orderOf(file),
			body,
		};
	})
	.sort((a, b) => a.order - b.order);

export const sections: DocSection[] = Object.values(
	pages.reduce<Record<string, DocSection>>((acc, p) => {
		acc[p.section] ??= {
			key: p.section,
			title: p.sectionTitle,
			order: orderOf(p.section),
			pages: [],
		};
		acc[p.section].pages.push(p);
		return acc;
	}, {})
).sort((a, b) => a.order - b.order);

export const firstPage = sections[0]?.pages[0];

export function getPage(section: string, slug: string) {
	return sections
		.find((s) => s.key === section)
		?.pages.find((p) => p.slug === slug);
}

/** Flat page list in reading order — for prev/next. */
export const orderedPages = sections.flatMap((s) => s.pages);

export function neighbors(page: DocPage) {
	const i = orderedPages.indexOf(page);
	return { prev: orderedPages[i - 1], next: orderedPages[i + 1] };
}

/* ------------------------------------------------------------------ */

export interface TocItem {
	depth: number;
	text: string;
	slug: string;
}

const slugify = (text: string) =>
	text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\w一-鿿-]/g, '');

/** Render one page's markdown → { html, toc }. A fresh Marked per call keeps
 *  the heading→toc collection local. */
export function renderDoc(body: string): { html: string; toc: TocItem[] } {
	const toc: TocItem[] = [];
	const m = new Marked({ gfm: true });
	m.use({
		renderer: {
			code({ text, lang }) {
				const name = (lang ?? '').split(/\s/)[0];
				const valid = Boolean(name && hljs.getLanguage(name));
				const body = valid
					? hljs.highlight(text, { language: name }).value
					: hljs.highlightAuto(text).value;
				return `<pre><code class="hljs${valid ? ` language-${name}` : ''}">${body}</code></pre>`;
			},
			heading({ tokens, depth, text }) {
				const inner = this.parser.parseInline(tokens);
				const slug = slugify(text);
				if (depth === 2 || depth === 3) toc.push({ depth, text, slug });
				return `<h${depth} id="${slug}">${inner}</h${depth}>\n`;
			},
		},
	});
	return { html: m.parse(body) as string, toc };
}
