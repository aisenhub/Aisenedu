# Aisenedu 姓名贴打印系统 v3.1 升级执行计划包

> 用途：本目录只用于指导后续 coding agent 实施。当前计划编制轮次没有修改产品代码、安装依赖、部署、启动开发服务器、创建分支、提交或推送 Git。

## 建议放置位置

当前仓库中的实际目录为：

```text
docs/plans/Aisenedu_name-label-printing-v3-upgrade-plans/name-label-printing-v3-upgrade/
```

## 本次输入解析

| 输入 | 本计划采用值 |
| --- | --- |
| 项目路径 | `<LOCAL_REPO_ROOT>`：执行 agent 开始时必须通过 `git rev-parse --show-toplevel` 解析；本轮没有假定用户本地绝对路径 |
| GitHub 仓库 | `aisenhub/Aisenedu` |
| 目标模块 | `apps/web/src/features/label-printing/`，并包含直接关联的 `apps/web/e2e/`、`apps/web/src/styles/print.css`、项目/模块架构文档和 `reference/REFERENCE_PROJECT_INDEX.md` |
| 架构文档 | `Aisenedu_姓名贴打印系统目标架构_v3.1_校准系统增强版.docx`；执行时以用户提供的本地实际路径为准 |
| 补充讨论结论 | 架构中心为 Physical Document / Scene-first；Vector PDF 为正式产物；SVG 为预览/浏览器打印 renderer；校准必须诊断式、模板与设备分离；rotation/affine 只在证据充分时自动拟合 |
| 本次范围 | 架构 v3.1 Phase 0–6：基线与隐私、领域模型、TextLayout/Scene、SVG、Vector PDF、诊断式校准、输出切换/清理/验收 |
| 暂不实施 | QZ/本地打印代理、ZPL/EPL、通用设计器、默认 600 DPI raster、面向普通用户的 affine/rotation 原始参数、扫描/相机自动测量、无真实需求的 `/packages` 拆包 |
| 计划保存目录 | `docs/plans/Aisenedu_name-label-printing-v3-upgrade-plans/name-label-printing-v3-upgrade/` |

## 阅读顺序

1. `00-master-plan.md` — 总计划、现状证据、阶段图、完成标准。
2. `shared-contracts.md` — 跨阶段唯一权威契约。执行 agent 不得各自发明冲突的数据模型。
3. `architecture-coverage-matrix.md` — 架构 v3.1 每项建议的阶段映射与验收口径。
4. `research-basis.md` — 成熟项目/官方资料的参考边界与实施期复核要求。
5. `01-...` 至 `07-...` — 按阶段实施。
6. `08-future-enhancements.md` — 明确排除的后续增强项。
7. `agent-handoff.md` — 可直接复制给执行 agent 的完整指令。
8. `verification-record.md` — 实施期唯一进度/验证记录模板。

## 研究期核实基线

计划编制时，远端 `main` 指向提交：

```text
2198471feead3e3ec2891c0ebf001b4ae1d48ca0
```

这只是**研究期参考基线**。执行 agent 不得假定用户本地仍处于该提交；必须重新核对本地 HEAD、远端、分支和工作区。

## 状态说明

本目录中的所有阶段状态默认均为“未开始”。任何“应运行”“应验证”“完成门槛”都是未来执行要求，不代表本轮已经实施或验证。
