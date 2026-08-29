# Aisenedu 文档索引

本文档用于说明各类文档的职责和权威性，避免产品、架构和临时笔记互相冲突。

## 当前文档

| 文档 | 内容 | 维护时机 |
| --- | --- | --- |
| [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md) | 产品定位、用户角色、当前范围和术语 | 产品范围或角色变化时 |
| [`PROJECT_ARCHITECTURE.md`](PROJECT_ARCHITECTURE.md) | 技术栈、目录、模块边界、数据流和安全边界 | 架构、数据流或基础设施变化时 |
| [`NAME_LABEL_PRINTING_ARCHITECTURE.md`](NAME_LABEL_PRINTING_ARCHITECTURE.md) | 学生姓名贴工具的范围、功能架构、打印规则、隐私边界与验证标准 | 姓名贴功能的范围、设计或实现决策变化时 |
| [`NAME_LABEL_PRINTING_AGENT_TASKS.md`](NAME_LABEL_PRINTING_AGENT_TASKS.md) | 可直接交给开发 Agent 的姓名贴实现任务、依赖和验收条件 | 开发顺序、范围或验收条件变化时 |
| [`OPTIMIZATION_EXECUTION_PLAN.md`](OPTIMIZATION_EXECUTION_PLAN.md) | 姓名贴工具优化任务、依赖、验收条件与实施进度看板 | 开始、阻塞、完成或回归任一优化任务时 |
| [`NAME_LABEL_PERFORMANCE.md`](NAME_LABEL_PERFORMANCE.md) | 10,000 条合成名单的性能基线与 Worker 决策 | 性能边界或解析方案变化时 |
| [`NAME_LABEL_SECOND_PHASE_PROPOSALS.md`](NAME_LABEL_SECOND_PHASE_PROPOSALS.md) | 姓名贴第二阶段能力调研与立项建议（仅调研） | 第二阶段范围评审时 |
| [`../reference/REFERENCE_PROJECT_INDEX.md`](../reference/REFERENCE_PROJECT_INDEX.md) | GitHub 参考项目、搜索关键词、许可证、复用结论和取舍理由 | 每次项目/功能/模块开发前调研后 |
| [`../AGENTS.md`](../AGENTS.md) | AI Coding Agent 与开发者的工程协作规则 | 工程规则变化时 |
| [`../README.md`](../README.md) | 项目介绍、快速开始和常用命令 | 初始化、命令或入口变化时 |

## 文档规则

- 重要决定写入对应文档，不只留在聊天记录中。
- 文档只记录已经确认的事实；待决事项明确标注为“待决”。
- 新建文档前先判断现有文档是否可以扩展，避免产生重复说明。
