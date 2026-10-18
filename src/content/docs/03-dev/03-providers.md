# 模型供应商层

`agent-llm` 把各家 LLM API 归一成统一的 `StreamChunk` 流协议。

## 四种适配器

| `kind`               | 说明                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| `openai_completions` | OpenAI 兼容的 `/chat/completions`（默认；别名 `openai_compat`、`type`、`api`） |
| `openai_responses`   | OpenAI Responses API                                                           |
| `anthropic`          | Anthropic Messages API                                                         |
| `gemini`             | Google Gemini                                                                  |

底层基于 `rig-core`，由 `RigProvider` 统一实现，各家差异由线路层方言处理。

## 配置

`config.toml` 管全局（`active_provider`、`active_model`、`fallback_chain`），每个供应商一个 `[providers.<id>]` 段，模型列在 `[[providers.<id>.models]]` 下。

密钥支持三种写法：

- `env:VAR` —— 从环境变量读
- `keyring:<service>/<account>` —— 从系统钥匙串读
- 明文 —— 可用，但启动时告警

解析失败只会把该供应商标记为不可用，不会影响其他供应商或让程序崩溃。

多个供应商并列配置时，`fallback_chain` 决定降级顺序：主模型失败或不可用时按序尝试。

## Sampler 韧性层

`Sampler` 包住 `LlmProvider`，负责把一次采样做稳：

- SSE 空闲超时
- 指数退避重试
- 末日循环（doom loop）检测——模型反复输出相同内容时打断
- 流中断后续写
- 请求体与日志脱敏

provider 支持热插拔：切换模型不需要重开会话，下一次采样即生效。

## 流协议

`chat_stream` 返回 `StreamChunk` 流：`ContentDelta`、`ToolCallDelta`、`Error`、`Done` 等。`rig_bridge` 负责双向翻译：

- **请求侧**：方言映射（推理参数、消息配对修复）
- **流侧**：清洗层（`HarmonyStripper`、`CallStripper` 之类），把各家混进正文的控制标记剥掉

## 推理强度映射

`resolve_reasoning_effort` 把 UI 的七档思考强度翻译成线路级参数，依据是供应商能力表与模型的 `thinking_level_map`：

- 支持 `reasoning_effort` 的供应商 → 直接映射
- OpenRouter 一类 → 走 `reasoning`
- Qwen 系 → 转成 `enable_thinking`
- 其余 → 按能力表忽略或降级

模型没声明支持某个档位时，会回退到一个受支持的值，不会静默失效。

## 模型条目

每个模型除了 `id`，还可以声明：显示名、上下文窗口、最大输出、是否支持推理、支持的输入类型、价格表、思考档位映射、采样参数、prompt 缓存策略、以及按供应商覆盖的头部与兼容开关。字段清单见[配置文件参考](/docs/reference/config)。
