# 插件、钩子与 MCP

## 插件清单

插件由 `manifest.json` 声明：`id`、`name`、`version`、`kind`（`wasm` 或 `mcp`）、`entry`、`permissions`、`capabilities`。`PluginManager` 负责发现、校验与生命周期。

## 钩子链

插件可在 `capabilities.hooks[]` 里挂生命周期钩子：`on_user_input`、`before_tool_execute`、`after_tool_execute`、`on_state_transition`、`on_response`。

```json
"hooks": [{
  "event": "before_tool_execute",
  "filter": { "tool": "bash" },
  "run": { "command": "./guard.sh", "args": [], "env": {} },
  "timeout_ms": 2000
}]
```

执行方式：fork 命令、STDIN 喂 JSON 载荷、STDOUT 读 JSON 裁决——`Continue` / `Block` / `Inject` / `Veto` / `Rewrite`（视事件类型可用子集不同）。

拦截 force-push 的最小示例：

```sh
#!/bin/sh
payload=$(cat)
case "$payload" in
  *"push --force"*) echo '{"action":"veto","reason":"force-push needs a human"}' ;;
  *)                echo '{"action":"continue"}' ;;
esac
```

## 插件发现路径

启动时按序扫描四个目录下的 `<id>/manifest.json`：

| 位置                      | 层级       | 信任                                             |
| ------------------------- | ---------- | ------------------------------------------------ |
| `~/.config/husk/plugins/` | 用户级插件 | 直接加载                                         |
| `~/.config/husk/mcp/`     | 用户级 MCP | 直接加载                                         |
| `<repo>/.husk/plugins/`   | 项目内插件 | **需信任授权**——钩子命令是本地代码，不信任不执行 |
| `<repo>/.husk/mcp/`       | 项目内 MCP | 需信任授权                                       |

## MCP 服务器

MCP 服务器就是一个 `kind: "mcp"`（或带 `entry` 时默认识别）的清单文件，放在上述 `mcp/` 目录之一：

```json
{
	"entry": {
		"args": ["-y", "@upstash/context7-mcp"],
		"command": "npx",
		"env": { "CONTEXT7_API_KEY": "…" }
	},
	"id": "context7",
	"name": "Context7",
	"version": "1.0.0"
}
```

`entry` 即传输层：

- `entry.command` + `args` + `env` → stdio 子进程（JSON-RPC 2.0）
- `entry.url` + `entry.headers` → streamable HTTP 服务器（需在 `permissions` 里声明网络白名单，否则拒绝连接）

`McpClient` 负责进程生命周期、握手、工具列表缓存；MCP 工具进同一个 `ToolRegistry`，走同一个 `PermissionGate`——外部工具和内置工具在审批模型上没有区别。
