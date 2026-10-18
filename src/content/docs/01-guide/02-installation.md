# 安装

## 下载安装包

前往 [GitHub Releases](https://github.com/1Yie/husk/releases) 获取对应平台的安装包。每个版本由 CI 为四个目标分别构建：

| 平台    | 目标                  | 格式                   |
| ------- | --------------------- | ---------------------- |
| macOS   | Apple Silicon / Intel | `.dmg`                 |
| Linux   | x86_64                | `.deb` / `.rpm`        |
| Windows | x86_64（MSVC）        | `.msi` / NSIS 安装程序 |

## Linux 依赖

桌面端基于 WebKitGTK 渲染界面，需要 `webkit2gtk-4.1`。

```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

WebKitGTK 2.54.x 存在合成器回归（弹窗闪烁、滚动条残影、窗口首次打开动画丢失），如遇到相关问题可暂时锁定在 `2.52.x`。

## 沙箱后端（推荐）

shell 命令默认在沙箱里执行。Linux 上推荐安装 `bubblewrap`，它提供完整的挂载命名空间隔离：

```bash
sudo apt-get install -y bubblewrap   # 提供 bwrap
```

沙箱后端会自动探测，见[沙箱与安全](/docs/dev/sandbox)。

## 配置供应商

Husk 通过 `config.toml` 声明模型供应商，文件位于 `~/.config/husk/`。最小配置：

```toml
active_provider = "deepseek"
fallback_chain  = ["deepseek", "anthropic"]

[providers.deepseek]
kind     = "openai_completions"
base_url = "https://api.deepseek.com"
api_key  = "env:DEEPSEEK_API_KEY"

[[providers.deepseek.models]]
id = "deepseek-chat"
```

`api_key` 支持两种引用写法，避免明文落盘：

- `env:VAR`——从环境变量读取
- `keyring:<service>/<account>`——从系统钥匙串读取

直接写明文也能用，但会收到告警。密钥解析失败的供应商会被标记为不可用，而不是让程序启动失败。

完整字段见[配置文件参考](/docs/reference/config)。
