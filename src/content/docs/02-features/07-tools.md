# 工具系统

每个工具由 `ToolRegistry` 注册为一份 `ToolSpec`：JSON schema、`readonly` 标记、`ToolClass` 分类、`network` 标记与执行体。执行上下文 `ToolCtx` 携带工作区根、沙箱后端、会话存储、记忆库、取消令牌、子代理孵化器和 UI 事件通道。

模式会改变注册表的内容：计划模式移除写工具，目标模式追加完成契约工具。子代理拿到的注册表还会再裁掉几样（见[子代理](/docs/features/memory-skills-subagents)）。

## 文件与检索

| 工具           | 用途                                   |
| -------------- | -------------------------------------- |
| `smart_read`   | 读文件内容，按行区间返回               |
| `list_dir`     | 探索目录层级                           |
| `smart_grep`   | 进程内正则/字面量搜索                  |
| `fuzzy_patch`  | 搜索替换式块编辑                       |
| `apply_patch`  | 多文件结构化补丁                       |
| `web_fetch`    | 抓取文档与参考资料，带 SSRF 与限流防护 |
| `web_download` | 下载文件到工作区                       |
| `image_search` | 检索图片                               |
| `view_image`   | 把本地图片交给模型查看                 |

## 执行

| 工具                | 用途                             |
| ------------------- | -------------------------------- |
| `bash`              | 在沙箱内执行 shell               |
| `smart_test_runner` | 跑测试或检查，输出经过过滤       |
| `batch_execute`     | 批量并行执行只读调用，上限 16 个 |

`bash` 与测试运行器都经过 `SandboxBackend::run_command`，带环境变量白名单、资源上限和进程树清理，见[沙箱与安全](/docs/dev/sandbox)。

## 符号级导航

| 工具          | 用途                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `serena`      | 接入 [Serena](https://github.com/oraios/serena) 的语义导航：`find_symbol`、`replace_symbol_body`、`rename_symbol` 等 |
| `find_symbol` | 直接按符号名定位定义                                                                                                 |
| `service`     | 管理长期运行的后台服务进程                                                                                           |

## 桌面操作

| 工具         | 用途                                                     |
| ------------ | -------------------------------------------------------- |
| `screenshot` | 截屏并把图像交给模型（只读观察类）                       |
| `computer`   | 键鼠驱动——点击、拖拽、输入、按键、滚动（控制类，需审批） |

`computer` 支持 X11，依赖 `xdotool` 与 `scrot`（或 ImageMagick 的 `import`）。截图会缩放到长边不超过 1568 像素再回传。

模型没有声明支持图像输入时，`screenshot` 只返回文件路径，不传图。

桌面后端刻意不走沙箱：`bwrap` 的 `--clearenv` 与 `--tmpfs /tmp` 会让 X socket 不可达，工具在沙箱内根本无法工作。这一块靠权限门把关，没有文件系统隔离。

## 编排

| 工具           | 用途                                     |
| -------------- | ---------------------------------------- |
| `delegate`     | 派生只读子代理处理有边界的子任务         |
| `todo`         | 持久任务清单                             |
| `ask_question` | 结构化地向你提问（单选/多选/自定义输入） |
| `skill`        | 加载一个技能的完整指令                   |
| `remember`     | 写入一条记忆                             |

## 办公文档

`office_*` 系列覆盖常见文档操作：`office_create`、`office_open`、`office_set`、`office_get`、`office_query`、`office_add`、`office_remove`、`office_move`、`office_merge`、`office_import`、`office_save`、`office_validate`、`office_view`、`office_exec`、`office_batch`、`office_raw`、`office_close`、`office_skill`、`office_help`。

## 模式专属

| 工具            | 模式 | 用途                                                  |
| --------------- | ---- | ----------------------------------------------------- |
| `submit_plan`   | 计划 | 提交结构化方案，结束本轮                              |
| `goal_complete` | 目标 | 声明目标达成                                          |
| `goal_blocked`  | 目标 | 声明目标受阻并说明原因                                |
| `blueprint`     | 全部 | 查询/校验架构蓝图：`locate`、`read`、`check`、`graph` |
