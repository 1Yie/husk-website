# 从源码构建

## 工具链

- Rust stable + Cargo
- Node.js ≥ 20（或 Bun）
- Tauri CLI 2：`cargo install tauri-cli --version "^2"`

## Linux 系统依赖

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev \
  libdbus-1-dev libssl-dev patchelf rpm
```

可选：`bubblewrap`（沙箱后端，推荐）。

## 运行

```bash
git clone https://github.com/1Yie/husk.git && cd husk
npm ci --prefix crates/app-tauri/frontend   # 前端依赖
cd crates/app-tauri && cargo tauri dev    # 桌面应用（Vite dev on :1420）
```

其他常用入口：

```bash
# 独立 app 标识的 dev 实例（与正式装互不干扰）
cargo tauri dev -c tauri.dev.conf.json5

# 只跑前端 + Tauri API 桩，快速调 UI
cd crates/app-tauri/frontend && npx vite --config vite.harness.config.ts

# 无头 CLI 形态
cargo run -p app-cli -- --headless --workspace . --prompt "解释这个仓库的结构"

# 全量测试
cargo test
```

## 发布构建

```bash
cd crates/app-tauri && cargo tauri build
```

产物在 `target/release/bundle/`（deb / rpm / nsis / msi / dmg 视平台而定）。
