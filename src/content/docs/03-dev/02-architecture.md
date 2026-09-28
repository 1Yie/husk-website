# 架构

## Workspace crates

```
crates/
├── agent-kernel    agent 编排：ReAct 循环、状态机、会话、权限、压缩
├── agent-llm       LLM 层：provider 抽象、Sampler 韧性、流协议归一
├── agent-ipc       UiCommand / UiEvent 协议定义
├── agent-context   工作区与代码理解
├── agent-plugin    插件管理、钩子链、MCP 客户端
├── agent-sandbox   命令执行沙箱（多后端探测）
├── app-tauri       桌面壳（含 frontend/ React 应用）
└── app-cli         无头 CLI 入口
```

## 内核：ReAct 轮循环

`Engine` 驱动 ReAct（推理 → 行动）循环：采样 LLM → 解析输出 → 执行工具 → 回填结果，直到模型声明完成或到达终止态。状态机经过 `Idle`、`ScanningWorkspace`、`Reasoning`、`StreamingToken`、`AwaitingToolConfirmation`、`ExecutingTool`、`Compacting`、`Finished`、`Failed`。

每个会话一个 `SessionActor`，跑在独立 `kernel-rt` 线程上，收 `UiCommand`、发 `UiEvent`；`SessionManager` 管理多会话与 parked 后台句柄。轮边界把历史快照进 `SessionStore` 持久化。

## IPC 协议

前端 ↔ 内核通过 `agent-ipc` 定义的双向协议：

- **UiCommand**（上行）：`SendPrompt`、`Steer`、`Cancel`、`ToolDecision`、`SetModel`、`SetPermissionMode`、`SetAgentMode`、`SetThinkingLevel`……`Steer`/`Cancel` 绕过普通队列立即处理
- **UiEvent**（下行）：`StateChanged`、`TextDelta`、`ReasoningDelta`、`ToolCallStarted/Finished`、`ApprovalRequested`、`SystemMessage`、`Usage`……

桌面壳用 Tauri 命令 `agent_cmd` 把 UiCommand 派给当前会话；另有 `paste_clipboard`、`get_ui_stats` 等辅助命令。

## 前端流模型

会话渲染为 `SessionView` → `TurnSpan` → `StreamItem` 三层：一轮回复由 span 组段（思考段/工具段/正文段），span 里的 item（消息、工具调用、审批、系统提示、压缩事件、计划）独立折叠。Markdown 经 `MemoStreamdown` 流式渲染，`AssistantStatus` 负责状态胶囊与耗时展示。
