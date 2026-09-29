import { Menu as MenuIcon, Monitor, Moon, Sun, X } from '@keyline-icons/react';
import { Github } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import huskIcon from '@/assets/husk-icon.png';
import { Menu, MenuItem, MenuPopup, MenuTrigger } from '@/components/ui/menu';
import { useTheme, type Theme } from '@/lib/theme';

const REPO = 'https://github.com/1Yie/husk';

const NAV = [
	{ label: '功能', href: '/#features' },
	{ label: '文档', href: '/docs' },
	{ label: '下载', href: '/#download' },
];

/** Shared top nav — home and docs pages. */
const THEME_ICON: Record<Theme, typeof Sun> = {
	system: Monitor,
	light: Sun,
	dark: Moon,
};
const THEME_LABEL: Record<Theme, string> = {
	system: '跟随系统',
	light: '浅色模式',
	dark: '深色模式',
};

export function SiteNav({ className }: { className?: string }) {
	const { theme, cycle } = useTheme();
	const ThemeIcon = THEME_ICON[theme];
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className={`relative z-50 w-full ${className ?? ''}`}>
			<div
				className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr]
					items-center px-6"
			>
				<Link
					className="col-start-1 flex items-center gap-2.5 justify-self-start"
					to="/"
				>
					<img alt="Husk" className="h-7 w-7" src={huskIcon} />
					<span className="text-[17px] font-semibold tracking-tight text-ink">
						Husk
					</span>
				</Link>
				<nav
					className="col-start-2 hidden items-center gap-8 justify-self-center
						text-[13.5px] text-dim md:flex"
				>
					{NAV.map((item) => (
						<a
							className="transition-colors hover:text-ink"
							href={item.href}
							key={item.label}
						>
							{item.label}
						</a>
					))}
				</nav>
				<div className="col-start-3 flex items-center gap-2 justify-self-end">
					{/* mobile nav — center links collapse into a "more" menu */}
					<Menu onOpenChange={setMenuOpen} open={menuOpen}>
						<MenuTrigger
							aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
							className="flex h-8 w-8 items-center justify-center rounded-full
								border border-line text-dim transition-colors hover:text-ink
								md:hidden"
						>
							{menuOpen ? (
								<X className="h-4 w-4" />
							) : (
								<MenuIcon className="h-4 w-4" />
							)}
						</MenuTrigger>
						<MenuPopup align="end" className="w-36" sideOffset={8}>
							{NAV.map((item) => (
								<MenuItem
									className="text-[13.5px]"
									key={item.label}
									render={<a href={item.href} />}
								>
									{item.label}
								</MenuItem>
							))}
						</MenuPopup>
					</Menu>
					<button
						aria-label={`主题：${THEME_LABEL[theme]}（点击切换）`}
						className="flex h-8 w-8 items-center justify-center rounded-full
							border border-line text-dim transition-colors hover:text-ink"
						onClick={cycle}
						title={THEME_LABEL[theme]}
						type="button"
					>
						<ThemeIcon className="h-4 w-4" />
					</button>
					<a
						className="flex items-center whitespace-nowrap gap-1.5 rounded-full
							bg-ink px-4 py-1.5 text-[13px] font-medium text-page
							transition-colors hover:opacity-85"
						href={REPO}
						rel="noreferrer"
						target="_blank"
					>
						前往 GitHub
						<Github className="h-3.5 w-3.5" />
					</a>
				</div>
			</div>
		</header>
	);
}
