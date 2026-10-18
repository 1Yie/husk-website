# 插件、钩子与 MCP

## 插件清单

一个插件就是一个目录，里面一份 `manifest.json`。清单声明 `id`、`name`、`version`、`kind`（`wasm` 或 `mcp`）、`entry`、`permissions`、`capabilities`，以及它提供的能力：`tools`、`context_providers`、`commands`、`hooks`。

## 钩子

钩子挂在会话生命周期的四个位置：

| 事件                  | 能做什么                       |
| --------------------- | ------------------------------ |
| `on_user_input`       | 放行 / 拒绝本轮 / 注入一段提示 |
| `before_tool_execute` | 放行 / 否决这次调用 / 改写参数 |
| `after_tool_execute`  | 观察结果，不能改变裁决         |
| `on_state_transition` | 观察状态变化（发后不管）       |

`before_tool_execute` 在权限门之前运行——钩子可以否决一次调用，但不能代替你批准它。

执行方式是 fork 一个本地命令，STDIN 喂 JSON 载荷，STDOUT 读 JSON 裁决：

```json
{ "action": "veto", "reason": "force-push needs a human" }
```

可用的裁决：

| 事件                  | 裁决                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| `on_user_input`       | `continue`、`block`（附原因）、`inject`（附提示）                     |
| `before_tool_execute` | `continue`、`veto`（原因会作为失败结果给模型）、`rewrite`（替换参数） |

一个拦截 force-push 的钩子示例：

```sh
#!/bin/sh
payload=$(cat)
case "$payload" in
  *"push --force"*) echo '{"action":"veto","reason":"force-push needs a human"}' ;;
  *)                echo '{"action":"continue"}' ;;
esac
```

`sdks/` 下有 Python 与 TypeScript 的辅助库，省去自己拼 JSON。

## 发现路径

启动时按序扫描：

| 位置                      | 层级       | 信任       |
| ------------------------- | ---------- | ---------- |
| `~/.config/husk/plugins/` | 用户级插件 | 直接加载   |
| `~/.config/husk/mcp/`     | 用户级 MCP | 直接加载   |
| `<工作区>/.husk/plugins/` | 项目级插件 | 需信任授权 |
| `<工作区>/.husk/mcp/`     | 项目级 MCP | 需信任授权 |

项目级插件默认不生效：钩子命令是本地代码，克隆一个仓库不应该等于同意执行它里面的脚本。首次遇到时会请求授权，同意后按路径记账，之后不再重复询问。

## MCP 服务器

MCP 服务器是一份 `kind: "mcp"` 的清单，放在上述任一 `mcp/` 目录：

```json
{
	"entry": {
		"args": ["-y", "@upstash/context7-mcp"],
		"command": "npx",
		"env": { "CONTEXT7_API_KEY": "…" }
	},
	"id": "context7",
	"kind": "mcp",
	"name": "Context7",
	"version": "1.0.0"
}
```

`entry` 即传输层：

- `command` + `args` + `env` → stdio 子进程，JSON-RPC 2.0
- `url` + `headers` → Streamable HTTP（需在 `permissions` 里声明网络白名单，否则拒绝连接）

MCP 客户端负责进程生命周期、握手、工具列表缓存，并支持 `tools/list_changed` 热重载。MCP 工具进同一个 `ToolRegistry`，走同一个权限门——外部工具和内置工具在审批模型上没有区别。
