# 架构

Husk 分成三层：一个与界面无关的内核、一组可复用的能力 crate、若干前端适配层。内核与协议来自外部仓库，本仓库提供它们之上的宿主（`husk-host`）与前端。

## 仓库结构

```
crates/
├── agent-llm       LLM 层：provider 抽象、Sampler 韧性、流协议归一
├── agent-coding    编码相关能力：技能、记忆、计划、目标、蓝图
├── agent-context   工作区与代码理解（检索、上下文装配）
├── agent-store     会话与全局状态持久化（JSONL + 索引，redb 全局偏好）
├── husk-host       宿主装配：会话管理、命令、偏好、插件挂载
├── app-tauri       桌面端（Tauri 2 + React 前端）
├── app-cli         命令行入口（husk-cli）
├── app-tui         终端界面（husk-tui）
└── app-desktop     桌面桥接
```

外部依赖（git）分成两组：

| 来源        | crate                                  | 内容                                         |
| ----------- | -------------------------------------- | -------------------------------------------- |
| `korei`     | `agent-kernel`                         | ReAct 循环、工具注册表、权限门、压缩、子代理 |
| `korei`     | `agent-ipc`                            | `UiCommand` / `UiEvent` 协议                 |
| `korei`     | `agent-llm-core`、`agent-tool`         | 线路层原语与工具 trait                       |
| `korei-ext` | `agent-sandbox`                        | 沙箱后端与命令审计                           |
| `korei-ext` | `agent-plugin`                         | 插件清单、钩子链、MCP 客户端                 |
| `korei-ext` | `agent-skills`、`agent-paths`          | 技能加载、路径约定                           |
| `korei-ext` | `agent-tools-*`                        | 文件、shell、web、serena、office、桌面工具   |
| `korei-ext` | `agent-capabilities`、`agent-computer` | 能力声明、桌面控制                           |

## 内核：ReAct 轮循环

`Engine` 驱动 ReAct（推理 → 行动）循环：采样 LLM → 解析输出 → 执行工具 → 回填结果，直到模型不再调用工具或到达终止态。

状态机经过：`Idle`、`ScanningWorkspace`、`Reasoning`、`StreamingToken`、`AwaitingToolConfirmation`、`AwaitingConsent`、`AwaitingPluginConsent`、`ExecutingTool`、`Branching`、`Compacting`、`Finished`、`Failed`。

每个会话一个 `SessionActor`，跑在独立线程上，收 `UiCommand`、发 `UiEvent`。`SessionManager` 管理多会话与后台驻留的句柄。轮边界把历史快照进会话存储持久化。

## IPC 协议

前端与内核通过 `agent-ipc` 的双向协议通信：

- **UiCommand**（上行）：`SendPrompt`、`Steer`、`Cancel`、`ToolDecision`、`SetModel`、`SetPermissionMode`、`SetAgentMode`、`SetThinkingLevel`、`SetBlueprintEnabled`、`UndoLastTurn` 等。`Steer` 与 `Cancel` 绕过普通队列立即处理。
- **UiEvent**（下行）：`StateChanged`、`TextDelta`、`ReasoningDelta`、`ToolCallStarted` / `ToolCallFinished`、`ApprovalRequested`、`QuestionAsked`、`Compacted`、`Usage`、`QueuedPrompts`、`SystemMessage`、`Error` 等。

桌面端用 Tauri 命令 `agent_cmd` 派发 UiCommand，另有 `agent_session`、`get_ui_stats`、`paste_clipboard` 等辅助命令。事件通过 `agent://event` 推给前端。

## 前端流模型

会话渲染分三层：

1. `SessionView` —— 一个会话的全部显示状态：条目、改动、产物、用量、队列、当前模式
2. `TurnSpan` —— 一轮对话的折叠结果：思考段、工具段、正文段
3. `StreamItem` —— 最小的流条目：消息、工具调用、审批、系统提示、压缩事件、计划

两条路径折叠出同一个形状：实时流走 `applyEvent`，重开会话走 `viewFromHistory`。Markdown 经 `MemoStreamdown` 流式渲染，`AssistantStatus` 负责状态胶囊与耗时。

渲染性能上有几处刻意的设计：

- 回合级缓存：条目引用不变时复用整轮，流式增量只重算尾巴
- 挂载预算：跟随底部时最多保留最近约 30 轮在页面上，往上翻再逐步补回
- 步骤级 memo：一轮里只有正在增长的那一段会重绘

## 持久化

会话历史按工作区分目录存放，每个会话一份 JSONL，按消息追加，并配独立索引用于分页读取。只有写同一会话时才短暂加锁，因此桌面端、CLI、TUI 可以同时访问同一份历史。

全局偏好（默认模型、权限、压缩阈值、沙箱设置等）存在数据目录下的 `sessions.db`（redb）的 `globals` 表里，与 `config.toml` 分开：前者是应用设置，后者是模型供应商配置。
