# 安装

## 下载构建

前往 [GitHub Releases](https://github.com/1Yie/husk/releases) 获取安装包：

| 平台    | 格式            | 说明                   |
| ------- | --------------- | ---------------------- |
| macOS   | `.dmg`          | Apple Silicon 与 Intel |
| Linux   | `.deb` / `.rpm` | 依赖 WebKitGTK 4.1     |
| Windows | `.msi`          | Windows 10+，x64       |

## Linux 依赖说明

桌面端基于 WebKitGTK 渲染界面，发行版需安装 `webkit2gtk4.1`。已知 2.54.x 存在合成器回归（弹窗闪烁、滚动条残影、窗口首次打开动画丢失），建议暂锁 `2.52.x`，待上游修复后再升级。

如需沙箱执行 shell 命令，推荐额外安装 `bubblewrap`（`bwrap`）——它是 Husk 在 Linux 上隔离级别最高的后端。

## 配置模型

Husk 通过 `config.toml`（或 `settings.toml`）声明供应商。最小配置：

```toml
active_provider = "deepseek"
fallback_chain  = ["deepseek", "anthropic"]

[providers.deepseek]
kind     = "openai_completions"
base_url = "https://api.deepseek.com"
api_key  = "env:DEEPSEEK_API_KEY"
model    = "deepseek-chat"
```

`api_key` 支持两种写法：

- `env:VAR`——从环境变量读取
- `keyring:<service>/<account>`——从系统钥匙串读取

密钥解析失败的供应商会被标记为不可用（而不是启动崩溃），UI 会给出提示。

完整字段清单见[配置文件参考](/docs/reference/config)。
