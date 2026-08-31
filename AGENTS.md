# Aisenedu 开发协作规范

本文档是 Aisenedu 的 AI Coding Agent 和开发者共同遵循的工程约定。若需求与本文档冲突，以用户明确需求为准；若代码与文档冲突，应先确认真实现状，再同步修正文档。

## 项目定位

Aisenedu 是教育类 Web 工具平台，面向教师、家长和学生。当前只把 Web 作为交付和验收范围；桌面端、移动端和原生能力在没有明确需求前不进入主架构。

## 首次接入与变更原则

- 初次接入或进行大范围调整时，先分析现有目录、入口、组件、重复代码、数据流和构建方式。
- 不要为了新功能重写整个应用，不删除未确认的现有功能。
- 新项目可以直接移除已经确认废弃的路径，不为了假设性的历史兼容保留双轨实现。
- 大型架构变更开始前，说明原因、影响范围和验证方式。
- 修改保持聚焦，避免与当前需求无关的重构和依赖升级。

## 技术基线

- React 19、TypeScript、Vite、Tailwind CSS v4、pnpm workspace。
- 使用 Zustand 管理跨页面、跨组件的客户端状态；服务端数据不能被当作 Zustand 的数据库替代品。
- 使用 React Router 管理路由。
- 使用 Supabase Auth、Database、Storage；必须在服务端执行的敏感操作使用 Supabase Edge Functions（TypeScript/Deno）。
- 当前 Web 是唯一强制验证目标，不把桌面、Android、iOS 或 Electron 构建作为默认验收门槛。
- 不引入第二套前端框架、构建系统或 UI 框架，除非有明确的架构决策记录。

## 目录规则

```text
apps/web/src/
├── app/                  应用启动、路由、全局 Provider、布局
├── pages/                页面级组合
├── components/           跨业务复用的 UI 和布局组件
│   └── ui/               基础 UI 组件
├── features/             教育业务模块
├── hooks/                跨业务复用的 Hooks
├── stores/               Zustand 客户端状态
├── services/             API、Supabase、Storage 等外部通信
├── database/             数据库生成类型和数据库模型
├── types/                跨模块共享类型
├── utils/                无副作用纯函数
├── constants/            路由、限制和固定配置
├── assets/               应用静态资源
├── styles/               全局样式和主题
└── main.tsx              React 挂载入口
```

- React 代码必须放在 `apps/web/src/`，配置文件不要放进 `src/`。
- 页面只负责布局与模块组合；复杂业务逻辑放到 `features/`。
- 通用组件不直接访问 Supabase、不直接修改业务全局状态。
- 只有稳定、可独立测试或确有跨应用复用价值的能力才创建 `packages/` 子包。
- 数据库结构变化必须通过 `supabase/migrations/` 记录；服务端密钥和敏感业务放在 `supabase/functions/`。
- 不把用户上传文件放入 `src/assets/` 或 `public/`。
- 外部参考项目、GitHub 调研记录和参考文件清单统一放在根目录 `reference/`，不放入生产代码目录。

## Feature 模块规范

每个业务模块按实际需要组织以下内容：

```text
features/<module>/
├── components/            模块专属组件
├── hooks/                 模块专属 Hooks
├── services/              模块专属服务编排
├── types.ts               模块专属类型
└── index.ts               对外公开入口（需要时创建）
```

初期模块建议包括 `auth`、`teacher`、`parent`、`student`、`course`、`assessment`、`resource` 和 `analytics`。只有需求明确后才创建模块，避免预先堆放空代码。

## App 与组件规则

- `main.tsx` 只负责初始化和挂载 React。
- `app/App.tsx` 只包含全局 Provider、路由和应用级布局，不放数据库查询、认证流程、AI 请求或复杂业务 UI。
- UI 基础组件库采用 shadcn/ui 的按需组件模式，组件源码归项目所有，统一放在 `apps/web/src/components/ui/`；Tailwind CSS 负责样式和主题 token。
- 实现 UI 前依次检查 `components/ui/`、相邻 feature 和页面现有组件，优先复用已有组件。
- 现有组件只差少量样式或行为时，优先扩展 props 或传入 `className`，不要复制实现。
- 现有组件无法满足需求时，才按需执行 `corepack pnpm dlx shadcn@latest add <组件名> --yes`；新增组件必须放在 `components/ui/`，并适配项目主题 token。
- 通用交互优先使用 Button、Dialog、DropdownMenu、Tooltip、Tabs 和 Sonner；业务逻辑不得放入基础 UI 组件。
- 不引入另一套 UI 组件库；确需引入时，必须先说明与现有组件库的职责边界和依赖理由。
- 组件使用函数式 React 和 TypeScript，保持职责单一；业务组件默认导出。

## UI 与组件库使用要求

- 网页页面、组件、布局、配色、字体、交互、响应式、图表和可访问性工作统一基于项目现有的 React、Tailwind CSS 和 shadcn/ui 组件实现。
- 实现 UI 前先检查 `apps/web/src/components/ui/`、相邻 feature 和页面现有组件，优先复用已有实现。
- 通用交互优先使用项目内已有的 Button、Dialog、DropdownMenu、Tooltip、Tabs 和 Sonner；业务逻辑不得放入基础 UI 组件。
- 交付 UI 前检查可访问性、交互反馈、性能、响应式布局、排版/色彩对比以及错误和空状态。

## 首页与工具按需加载要求

Aisenedu 会集成多个教育工具，必须采用渐进式加载和代码分包，禁止首页一次性加载所有工具：

- 首页首屏只加载应用壳、导航、必要的会话/用户信息和工具目录所需的轻量元数据；工具的完整 UI、业务逻辑、重型依赖、媒体资源和工具专属请求不得在首页初始化。
- 每个工具应保持独立的 feature/route 边界，通过动态 `import()`、`React.lazy` 或路由级懒加载在用户进入工具后加载。
- 不要从首页、全局 Provider、根级 barrel 文件或共享入口静态引入所有工具模块，避免工具代码被打进首屏 bundle。
- 工具内部的大型依赖（编辑器、图表、文件处理、AI 能力等）继续按实际功能拆分，只在用户确实使用相关能力时加载。
- 可以在用户明确意图后（例如点击、键盘聚焦或明确打开工具详情）预取对应 chunk，但预取不得阻塞首屏，也不能替代真正进入工具时的加载状态。
- 懒加载必须提供稳定的骨架屏/占位布局、加载反馈、失败提示和重试路径，并预留尺寸避免内容跳动。
- 首页不得为了展示工具卡片而发起每个工具的完整数据请求；使用聚合后的目录元数据，进入具体工具后再请求工具数据。
- 新增工具时必须说明其加载边界、首屏是否会产生额外请求、预计 chunk/资源体积和失败恢复方式。
- 验证时检查生产构建产物和浏览器 Network：访问首页不应请求未使用工具的 JS chunk、重型资源或工具专属 API。

## 数据与安全边界

```text
页面/组件 → feature hooks/services → services → Supabase/API
                         ↓
                    stores（客户端 UI 状态）
```

- 浏览器端只使用公开的 Supabase URL 和匿名 Key。
- Service Role Key、第三方私钥、AI 密钥和需要授权的管理操作不得进入前端。
- 权限不能只依赖前端路由隐藏；数据库 RLS 和 Edge Functions 必须再次校验用户、角色、组织/班级归属。
- 教育数据按最小权限原则设计，避免在日志、错误提示和 URL 中暴露学生敏感信息。
- 服务端数据的缓存、加载和错误状态应属于对应 feature/service，不在任意组件中散落请求逻辑。

## 新功能流程

1. 先检查现有代码和文档，明确受影响的页面、feature、服务和数据表。
2. 在开发任何新项目、功能或业务模块前，必须先在 GitHub 搜索是否存在成熟的开源项目、实现方案或可复用组件。
3. 优先评估和复用成熟项目的架构、数据模型、交互模式或经过验证的实现；不要在没有调研的情况下重复造轮子。
4. 评估参考项目的维护活跃度、许可证、技术栈兼容性、代码质量、社区使用情况和与 Aisenedu 需求的匹配度。
5. 只提取与当前需求直接相关的参考内容，遵守许可证和版权要求；不得整库复制、直接搬运大量代码或引入不必要的依赖。
6. 在 `reference/REFERENCE_PROJECT_INDEX.md` 记录搜索范围、参考项目链接、实际查看的文件或方案、可复用结论、许可证以及最终采用/不采用的理由。
7. 对新业务模块再做成熟方案、浏览器 API 或维护良好库的补充调研，并据此确定数据模型和权限边界。
8. 先实现 service 和 feature 状态，再接入页面和可复用 UI；不要把业务逻辑塞入 `App.tsx`。
9. 验证类型、构建、核心交互和响应式布局；报告无法执行的检查及原因。

### GitHub 参考项目调研记录

每次调研至少应回答以下问题：

- 搜索了哪些关键词、技术方向或 GitHub 主题？
- 哪些项目被认为成熟，判断依据是什么？
- 参考了哪些具体目录、文件、文档或设计方案？
- 计划复用的是思想、架构、交互还是代码？是否满足许可证要求？
- Aisenedu 最终采用了什么，明确放弃了什么，原因是什么？

若没有找到合适的成熟项目，也要在 `reference/REFERENCE_PROJECT_INDEX.md` 中记录搜索结论，再基于 Aisenedu 当前技术栈自行设计。

## 验证命令

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
```

引入新依赖前先检查现有依赖是否可以解决问题，并在变更说明中记录理由。修改组件或路由后至少运行 `corepack pnpm build`。

## 文档维护

- 产品范围、用户角色和术语见 `docs/PRODUCT_SCOPE.md`。
- 目录、数据流、技术边界见 `docs/PROJECT_ARCHITECTURE.md`。
- 新增重要决策、权限规则、数据模型或基础设施时同步更新 `docs/` 和 README。
- 文档记录已确认的事实，不把猜测写成已验证结论。
