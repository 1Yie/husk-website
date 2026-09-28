# Husk Website

[Husk](https://github.com/1Yie/husk) 的官网：产品落地页、文档站，以及桌面端界面的网页复刻。

## 技术栈

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4（`@custom-variant dark` + 语义色 token，支持 light/dark/system）
- React Router（`/`、`/docs/*`、404 兜底）
- GSAP + `@gsap/react`（入场与滚动动画，`prefers-reduced-motion` 下自动禁用）
- marked + highlight.js（文档渲染与代码高亮）
- `@keyline-icons/react` / lucide-react / simple-icons（图标）

## 开发

```bash
bun install
bun run dev    # http://localhost:5174
bun run build  # tsc -b && vite build
bun run lint   # eslint
```

## 结构

```
src/
├── pages/
│   ├── home/        落地页（hero、橱窗、功能、下载、页脚）
│   ├── docs/        文档页（侧栏树、正文、右侧 TOC、上一页/下一页）
│   └── not-found/   404
├── components/
│   ├── husk/        Husk 桌面端界面复刻（侧栏/标题栏/聊天流/composer）
│   ├── site-nav.tsx 共享顶栏（含主题切换）
│   └── gradient-waves.tsx  下载区 WebGL 波浪背景（react-bits）
├── lib/
│   ├── docs.ts      content/docs/**.md → 路由/侧栏/TOC（NN- 前缀定序）
│   ├── releases.ts  运行时读取 GitHub Releases，生成各平台下载直链
│   └── theme.ts     light / dark / system
└── content/docs/    文档源文件：NN-章节/NN-页面.md，路由与目录自动生成
```

## 写文档

在 `src/content/docs/` 下放置 `NN-章节/NN-页面.md` 即自动生成路由、侧栏项、页内 TOC 和上下页导航。页面标题取首个 `#` 一级标题，`NN-` 前缀只用于排序，不出现在 URL。
