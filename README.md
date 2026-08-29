# Aisenedu

Aisenedu 是面向教育场景的 Web 工具平台，服务于教师、家长和学生，逐步提供备课、教学、家庭协同、学习管理与数据分析等能力。

当前项目处于基础架构阶段，首个交付平台为 Web。技术架构和目录约定以 [`AGENTS.md`](AGENTS.md) 与 [`docs/PROJECT_ARCHITECTURE.md`](docs/PROJECT_ARCHITECTURE.md) 为准。

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui 按需组件模式
- Zustand：客户端全局状态
- React Router：页面路由
- Supabase：认证、数据库、文件存储与 Edge Functions
- pnpm workspace：统一管理应用、共享包和工具

## 目录概览

```text
apps/web/                 Web 应用
  src/app/                应用入口、路由和全局 Provider
  src/pages/              页面组合层
  src/components/         无业务耦合的通用组件
  src/features/           教育业务模块
  src/hooks/              全局可复用 Hooks
  src/stores/             Zustand 客户端状态
  src/services/           外部服务访问层
  src/database/           数据库类型与模型
  src/types/              跨模块类型
  src/utils/              纯工具函数
  src/constants/          全局常量
  src/assets/             应用静态资源
supabase/                 数据库迁移与服务端函数
docs/                     产品、架构和决策文档
reference/                GitHub 参考项目和调研记录
tests/                    跨模块测试
scripts/                  开发和数据工具
packages/                 稳定的共享能力（按需创建）
```

## 开发

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
```

需要连接 Supabase 时，将 `apps/web/.env.example` 复制为 `apps/web/.env.local` 并填写公开配置。敏感密钥不得进入前端代码或 Git。

## 开发约定

1. 新功能先定位到 `apps/web/src/features/` 下的业务模块。
2. 页面负责组合，业务逻辑放在 feature；外部请求统一经过 `services/`。
3. 先复用现有 UI 组件，再考虑新增组件或依赖。
4. 每次结构或功能变更后至少执行 Web 构建检查。
5. 重要的产品和技术决策同步记录到 `docs/`。
6. 新项目、功能或模块开发前，先搜索 GitHub 并将结果记录到 `reference/REFERENCE_PROJECT_INDEX.md`。
7. 首页只加载应用壳和轻量工具目录；具体工具及重型依赖必须按需加载。

## 文档

- [文档索引](docs/DOCUMENTATION_INDEX.md)
- [项目架构](docs/PROJECT_ARCHITECTURE.md)
- [产品范围与角色](docs/PRODUCT_SCOPE.md)
