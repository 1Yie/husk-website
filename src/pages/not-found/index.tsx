import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { SiteNav } from '@/components/site-nav';

export function NotFound() {
	useEffect(() => {
		document.title = '404 — Husk';
	}, []);
	return (
		<div className="flex min-h-dvh w-full flex-col bg-page text-ink">
			<SiteNav />
			<main
				className="flex flex-1 flex-col items-center justify-center px-6 pb-24
					text-center"
			>
				<p
					className="text-[88px] leading-none font-bold tracking-tight text-ink"
				>
					404
				</p>
				<p className="mt-4 text-[15px] text-dim">页面不存在或已被移动。</p>
				<Link
					className="mt-8 rounded-full bg-ink px-6 py-2.5 text-[14px]
						font-medium text-page transition-opacity hover:opacity-85"
					to="/"
				>
					返回首页
				</Link>
			</main>
		</div>
	);
}
