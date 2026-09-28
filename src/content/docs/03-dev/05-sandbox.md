# 沙箱与安全

## 后端自动探测

`agent-sandbox` 启动时按平台探测可用后端：

| 平台    | 后端           | 能力                                          |
| ------- | -------------- | --------------------------------------------- |
| Linux   | `bwrap`        | 完整 mount 命名空间隔离（推荐）               |
| Linux   | `landlock`     | 文件系统圈定 + seccomp 拒绝列表；无法限制网络 |
| macOS   | `sandbox-exec` | Seatbelt 配置                                 |
| Windows | Job Object     | 资源限制 + 进程树终止；文件/网络开放          |
| 任意    | `none`         | 兜底：每条 `bash` 强制人工确认并给出警告      |

## 能力声明

插件 manifest 的 `permissions` 是**穷尽式白名单**：没声明的一律拒绝。可声明网络访问白名单、文件系统读写路径等。

## 审计与风险分级

命令执行前经过 `audit.rs` 分类：`critical`（破坏性）、`elevated`、`network-mutating`（出网写）、`scope-violating`（越界路径）等。命中即强制确认，审批卡片上直接标出风险等级。

## 桌面控制的例外

`screenshot` / `computer` 的桌面后端刻意不走沙箱——它需要操作显示服务器。因此 `computer` 属 Process 类，在默认权限模式下必须经人工批准。
