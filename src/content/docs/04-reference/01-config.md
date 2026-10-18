# 配置文件参考

Husk 有两种配置文件，都放在 `~/.config/husk/` 下：

| 文件            | 内容                                |
| --------------- | ----------------------------------- |
| `config.toml`   | 供应商、模型、密钥、降级链          |
| `settings.toml` | 开发者覆写——渲染后端、GPU、调试面板 |

除此之外还有一层「应用偏好」——默认模型、权限模式、思考档位、压缩阈值、沙箱开关等。它们不在上面两个文件里，而是存在数据目录下的 `sessions.db`（redb）的 `globals` 表，通过界面修改。

字段一律 snake_case，多数同时接受 camelCase 别名（例如 `active_provider` ≡ `activeProvider`）。

## 顶层字段

| 键                | 类型     | 说明             |
| ----------------- | -------- | ---------------- |
| `active_provider` | string   | 当前供应商 id    |
| `active_model`    | string   | 当前模型 id      |
| `fallback_chain`  | string[] | 供应商降级顺序   |
| `providers`       | table    | 供应商定义，见下 |

## `[providers.<id>]`

| 键                | 类型   | 说明                                                                    |
| ----------------- | ------ | ----------------------------------------------------------------------- |
| `kind`            | enum   | `openai_completions`（默认）、`openai_responses`、`anthropic`、`gemini` |
| `base_url`        | string | API 地址                                                                |
| `api_key`         | string | `env:VAR` / `keyring:<service>/<account>` / 明文（告警）                |
| `headers`         | table  | 附加静态请求头                                                          |
| `default_model`   | string | 该供应商的默认模型                                                      |
| `name`            | string | 界面显示名，不影响 key                                                  |
| `auth_header`     | bool   | 是否用 `Authorization` 头传密钥                                         |
| `models`          | array  | 模型列表，见下                                                          |
| `compat`          | table  | 兼容开关，见下                                                          |
| `model_overrides` | table  | 按模型 id 覆盖上面的 `compat`                                           |

### `compat`

| 键                          | 说明                                |
| --------------------------- | ----------------------------------- |
| `supports_store`            | 是否支持 `store` 参数               |
| `supports_developer_role`   | 是否支持 `developer` 角色消息       |
| `supports_reasoning_effort` | 是否支持 `reasoning_effort`         |
| `max_tokens_field`          | 最大输出 token 的字段名（各家不同） |

## `[[providers.<id>.models]]`

| 键                                                  | 类型     | 说明                            |
| --------------------------------------------------- | -------- | ------------------------------- |
| `id`                                                | string   | 线路上的模型 id                 |
| `name`                                              | string   | 显示名                          |
| `api`                                               | enum     | 覆盖供应商的 `kind`             |
| `base_url`                                          | string   | 覆盖供应商地址                  |
| `context_window`                                    | int      | 上下文窗口（token）             |
| `max_tokens`                                        | int      | 最大输出                        |
| `reasoning`                                         | bool     | 是否支持推理                    |
| `input`                                             | string[] | 支持的输入类型：`text`、`image` |
| `cost`                                              | table    | 价格，见下                      |
| `thinking_level_map`                                | table    | 档位 → 线路值                   |
| `sampling_params`                                   | table    | 透传给线路的采样参数            |
| `input_limits`、`prompt_cache`、`compat`、`headers` | table    | 按模型的细粒度覆盖              |

### `cost`

| 键            | 说明                       |
| ------------- | -------------------------- |
| `input`       | 输入，每百万 token 单价    |
| `output`      | 输出                       |
| `cache_read`  | 缓存读取                   |
| `cache_write` | 缓存写入                   |
| `tiers`       | 分档计价（长上下文阶梯价） |

### `thinking_level_map`

键是 Husk 的档位（`off`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max`），值是该模型线路上的实际取值。空字符串表示这一档不发送任何参数。

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

[[providers.anthropic.models]]
id             = "claude-sonnet-4-5"
name           = "Claude Sonnet 4.5"
context_window = 200000
reasoning      = true
input          = ["text", "image"]

[providers.anthropic.models.cost]
input       = 3.0
output      = 15.0
cache_read  = 0.3
cache_write = 3.75
```

## `settings.toml`

开发者覆写，改动在下次启动生效：

| 键                 | 类型   | 说明                                          |
| ------------------ | ------ | --------------------------------------------- |
| `renderer`         | string | `wayland` / `x11`——显式指定 GDK 后端          |
| `gpu_acceleration` | bool   | `false` 强制软件渲染（调试驱动问题用）        |
| `monitor_panel`    | bool   | 显示帧间隔与事件速率面板，`Ctrl+Shift+P` 切换 |
| `devtools`         | bool   | 允许在打包版本中打开 WebKit 检查器（F12 等）  |
| `developer_ui`     | bool   | 显示开发者相关界面入口                        |

`renderer` 与 `gpu_acceleration` 只在 Linux 上有意义：桌面端默认按会话类型自动选择 X11/Wayland，并按显卡情况挑渲染路径。
