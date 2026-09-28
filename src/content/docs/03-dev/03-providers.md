# 模型供应商层

`agent-llm` 把各家 LLM API 归一成统一的 `StreamChunk` 流协议。

## 配置

`config.toml` 里 `AppConfig` 管全局（`active_provider`、`fallback_chain`），`ProviderConfig` 管单个供应商。密钥支持 `env:VAR` 与 `keyring:<svc>/<acct>` 两种引用，解析失败该供应商标记不可用而非崩溃。

## 供应商类型

`ProviderKind` 支持：`openai_completions`（OpenAI 兼容）、`openai_responses`、`anthropic`、`gemini`。统一由基于 rig-core 的 `RigProvider` 实现，处理各家的线路层方言。

## Sampler 韧性层

`Sampler` 包住 `LlmProvider`：空闲超时、末日循环（doom-loop）检测、指数退避重试。provider 热插拔——换模型不动会话。

## 流协议

`chat_stream` 返回 `StreamChunk` 流：`ContentDelta`、`ToolCallDelta`、`Error`、`Done` 等。`rig_bridge` 负责双向翻译：请求侧方言映射（推理参数、消息修复配对），流侧 shim（`HarmonyStripper`、`CallStripper` 之类清洗层）。

## 推理强度映射

`Engine::resolve_reasoning_effort` 把 UI 八档思考强度翻译成线路级 effort——按供应商能力表与 `thinking_level_map` 微调：OpenAI 兼容走 `reasoning_effort`，OpenRouter 走 `reasoning`，Qwen 走 `enable_thinking`。
