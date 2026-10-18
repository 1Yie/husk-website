# 从源码构建

## 工具链

- Rust stable + Cargo
- Node.js 20+ 与 npm（或 Bun）
- Tauri CLI 2：`cargo install tauri-cli --version "^2"`

## Linux 系统依赖

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev \
  libdbus-1-dev libssl-dev patchelf rpm
```

可选：`bubblewrap`（沙箱后端，推荐）、`xdotool` 与 `scrot`（桌面操作工具）。

## 开发运行

```bash
git clone https://github.com/1Yie/husk.git && cd husk
npm ci --prefix crates/app-tauri/frontend   # 前端依赖
cd crates/app-tauri
cargo tauri dev                             # 桌面端，Vite 起在 1420
```

用独立 app 标识跑一个互不干扰的实例：

```bash
cargo tauri dev -c tauri.dev.conf.json5
```

只跑前端（Tauri API 用 stub）：

```bash
cd crates/app-tauri/frontend && npx vite --config vite.harness.config.ts
```

## 命令行

```bash
cargo run -p app-cli -- --headless --workspace . --prompt "解释这个仓库的结构"
```

常用参数：

| 参数                                               | 说明                      |
| -------------------------------------------------- | ------------------------- |
| `--headless`                                       | 无头模式，不启动交互界面  |
| `--workspace <dir>`                                | 工作区根目录              |
| `--prompt <text>` / `--prompt-file <path>`         | 一次性任务                |
| `--json`                                           | 以 JSONL 输出事件流       |
| `--provider` / `--model`                           | 覆盖模型选择              |
| `--mode`                                           | `build` / `plan` / `goal` |
| `--permission`                                     | 权限模式                  |
| `--sandbox` / `--no-sandbox` / `--sandbox-network` | 沙箱控制                  |
| `--allow-domain` / `--deny-domain`                 | 出网白名单/黑名单         |
| `--yes`                                            | 自动通过需要确认的操作    |

## 测试

```bash
nice -n 10 cargo test                         # Rust
npm --prefix crates/app-tauri/frontend test   # 前端（Vitest）
```

仓库根 `.cargo/config.toml` 把并行度固定为 4，避免构建占满整机。

## 发布构建

```bash
cd crates/app-tauri
cargo tauri build     # deb / rpm / nsis / msi / dmg
```

产物在 `target/release/bundle/`。

## macOS 通知

macOS 11+ 的系统通知走 `UNUserNotificationCenter`，必须从签名的 `.app` 运行才会工作。只调界面时 `tauri dev` 足够；要测通知和点击跳转，需构建本地应用：

```bash
cd crates/app-tauri
cargo tauri build --debug --bundles app -c tauri.dev.conf.json5
open ../../target/debug/bundle/macos/Husk.app
```

首次发通知时系统会请求权限，之后可在「系统设置 → 通知 → Husk」中调整。本地构建使用 ad-hoc 签名；发布时通过 `APPLE_SIGNING_IDENTITY` 指定正式证书。
