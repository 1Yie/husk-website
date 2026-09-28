# 配置文件参考

Husk 有两个配置文件，都在 `~/.config/husk/` 下：

| 文件            | 内容                                   |
| --------------- | -------------------------------------- |
| `config.toml`   | 供应商、模型、密钥、降级链、MCP 服务器 |
| `settings.toml` | 开发者覆写——渲染后端、GPU、调试面板    |

分开的原因：`settings.toml` 里某些值（如错误的渲染后端）能让 GUI 起不来——把这类开关和供应商密钥隔离在两个文件里，改坏了也只有一处要找。

字段一律 snake_case，多数同时接受 camelCase / kebab 别名（`active_provider` ≡ `activeProvider`）。

## config.toml — 顶层键

| 键                 | 类型       | 说明                                              |
| ------------------ | ---------- | ------------------------------------------------- |
| `active_provider`  | string     | 默认供应商 id（`[providers.<id>]` 的 key）        |
| `active_model`     | string     | 默认模型 id                                       |
| `fallback_chain`   | `[string]` | 降级链——不可恢复的 429/5xx 时按序切到下一个供应商 |
| `[providers.<id>]` | table      | 供应商定义（见下）                                |

## [providers.\<id\>] — 供应商

| 键                | 类型       | 说明                                                                                       |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `kind`            | enum       | `openai_completions`（默认，别名 `type`/`api`）、`openai_responses`、`anthropic`、`gemini` |
| `base_url`        | string     | API 地址（别名 `baseUrl`）                                                                 |
| `api_key`         | string     | `env:VAR` · `keyring:<service>/<account>` · 明文（会告警）                                 |
| `headers`         | table      | 附加静态请求头，如 `{"HTTP-Referer" = "https://…"}`                                        |
| `default_model`   | string     | 该供应商的默认模型（一般用顶层 `active_model`）                                            |
| `name`            | string     | UI 显示名；map key 仍是标识符                                                              |
| `auth_header`     | bool       | `true` = 每个请求附 `Authorization: Bearer <key>`                                          |
| `models`          | `[object]` | 模型条目（见下）                                                                           |
| `model_overrides` | table      | 按模型 id 的覆写（见下）                                                                   |
| `compat`          | table      | 兼容性旗标（见下）                                                                         |

## providers.\<id\>.models — 模型条目

可以是裸字符串 id，也可以是对象：

| 键                   | 类型       | 说明                                             |
| -------------------- | ---------- | ------------------------------------------------ |
| `id`                 | string     | 模型标识                                         |
| `name`               | string     | 显示名                                           |
| `api`                | enum       | 该模型单独指定 ProviderKind（覆盖供应商 `kind`） |
| `base_url`           | string     | 该模型单独指定 base_url                          |
| `reasoning`          | bool       | 模型支持推理/思考                                |
| `input`              | `[string]` | 输入模态，如 `["text", "image"]`                 |
| `context_window`     | u64        | 上下文窗口 token 数                              |
| `max_tokens`         | u64        | 最大输出 token                                   |
| `thinking_level_map` | table      | 八档思考 → 线路参数的映射                        |
| `sampling_params`    | table      | 默认采样参数（temperature、top_p 等）            |
| `input_limits`       | table      | 输入限制（见下）                                 |
| `prompt_cache`       | table      | 提示缓存（见下）                                 |
| `cost`               | table      | 计价（见下）                                     |
| `compat`             | table      | 该模型级 ProviderCompat 覆写                     |
| `headers`            | table      | 该模型级附加请求头                               |

### cost

```toml
[providers.deepseek.models."deepseek-chat".cost]
input = 0.27         # $/百万 token
output = 1.10
cache_read = 0.07    # 缓存命中读价
cache_write = 0.27
```

分段计价：`cost.tiers[]`，`{ input_tokens_above = 128000, input = 0.50, output = 2.0, … }`，输入超过阈值走对应档。

### input_limits

| 键                       | 说明                                                 |
| ------------------------ | ---------------------------------------------------- |
| `max_request_bytes`      | 请求体上限                                           |
| `images.max_per_message` | 单条消息图片数上限                                   |
| `images.max_per_request` | 单请求图片总数上限                                   |
| `images.resize`          | `{ max_width, max_height, max_bytes }`——超限自动缩放 |

### prompt_cache

`{ short = <秒>, long = <秒> }`——短期/长期缓存档位 TTL。

### model_overrides

按模型 id 覆写，未知 id 忽略。可覆写字段：`name`、`reasoning`、`thinking_level_map`、`input`、`input_limits`、`cost`、`prompt_cache`、`context_window`。

## providers.\<id\>.compat — 兼容旗标

供应商线路层的细粒度开关（全部 `Option<bool>` 或 `Option<string>`，`None` = 用适配器默认）：

| 键                                                 | 说明                                                          |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `supports_store`                                   | 支持 `store` 参数                                             |
| `supports_developer_role`                          | 支持 `developer` 角色消息                                     |
| `supports_reasoning_effort`                        | 支持 `reasoning_effort` 字段                                  |
| `max_tokens_field`                                 | 最大 token 字段名（`max_tokens` / `max_completion_tokens` …） |
| `supports_usage_in_streaming`                      | 流里返回 usage                                                |
| `supports_finish_reason`                           | 流里返回 finish_reason                                        |
| `requires_tool_result_name`                        | 工具结果必须带 name                                           |
| `requires_assistant_after_tool_result`             | 工具结果后需补 assistant 占位                                 |
| `requires_thinking_as_text`                        | 思考内容以纯文本下发                                          |
| `requires_reasoning_content_on_assistant_messages` | assistant 历史需带 reasoning_content                          |
| `thinking_format`                                  | 思考块格式变体                                                |
| `thinking_token_budget_field`                      | 思考预算字段名                                                |
| `supports_thinking_token_budget`                   | 支持思考预算                                                  |
| `chat_template_kwargs` / `chat_template_args`      | 聊天模板附加参数（JSON 任意值）                               |
| `cache_control_format`                             | 缓存控制格式                                                  |
| `supports_cache_control_on_tools`                  | 工具定义上允许缓存控制                                        |
| `send_session_affinity_headers`                    | 发送会话亲和请求头                                            |
| `session_affinity_format`                          | 亲和头格式                                                    |
| `supports_strict_mode` / `supports_strict_tools`   | 严格模式 / 严格工具 schema                                    |
| `supports_openai_grammar_tools`                    | OpenAI grammar 工具                                           |
| `supports_long_cache_retention`                    | 长缓存保留                                                    |
| `supports_eager_tool_input_streaming`              | 工具输入提前流式                                              |
| `supports_mid_convo_effort`                        | 会话中途切换 effort                                           |
| `force_adaptive_thinking`                          | 强制自适应思考                                                |
| `allow_empty_signature`                            | 允许空签名思考块                                              |
| `open_router_routing` / `vercel_gateway_routing`   | OpenRouter / Vercel 网关路由参数（JSON）                      |
| `allowed_fallback_models`                          | 该供应商允许的降级模型白名单                                  |

## MCP

MCP 通过清单文件接入，位置见「插件、钩子与 MCP」——`~/.config/husk/mcp/<id>/manifest.json`（用户级）或 `<repo>/.husk/mcp/<id>/manifest.json`（项目级，需信任授权）。

## settings.toml — 开发者覆写

| 键                 | 类型   | 说明                                                                                                       |
| ------------------ | ------ | ---------------------------------------------------------------------------------------------------------- |
| `renderer`         | string | `"x11"`（默认，XWayland 安全）/ `"wayland"`（原生——修部分 HiDPI/分数缩放问题，可能在不支持的驱动上起不来） |
| `gpu_acceleration` | bool   | WebKitGTK GPU 加速开关                                                                                     |
| `monitor_panel`    | bool   | 渲染监控面板                                                                                               |
| `devtools`         | bool   | WebKitGTK 开发者工具                                                                                       |
| `developer_ui`     | bool   | 开发者界面元素                                                                                             |

## 完整示例

```toml
active_provider = "deepseek"
active_model    = "deepseek-chat"
fallback_chain  = ["deepseek", "anthropic"]

[providers.deepseek]
kind     = "openai_completions"
base_url = "https://api.deepseek.com"
api_key  = "env:DEEPSEEK_API_KEY"

[[providers.deepseek.models]]
id             = "deepseek-chat"
name           = "DeepSeek Chat"
context_window = 128000
reasoning      = true
input          = ["text"]

[providers.deepseek.models.thinking_level_map]
high = "high"
max  = "high"

[providers.anthropic]
kind     = "anthropic"
base_url = "https://api.anthropic.com"
api_key  = "keyring:husk/anthropic"
```
