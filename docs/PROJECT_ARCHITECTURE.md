# Aisenedu 项目架构

## 1. 架构目标

项目采用“页面组合、业务模块自治、服务访问集中、平台能力共享”的结构，保证教育工具可以逐步增加，而不会把角色、页面和数据请求全部堆进应用入口。

架构优先级：稳定性、可维护性、用户体验、性能。

## 2. 技术栈

| 层 | 方案 | 约束 |
| --- | --- | --- |
| Web UI | React 19 + TypeScript | 函数组件，保持类型安全 |
| 构建 | Vite | 不引入第二套构建系统 |
| UI 组件 | shadcn/ui 按需组件模式 | 源码归项目管理，统一放在 `src/components/ui/` |
| 样式 | Tailwind CSS v4 | 优先复用主题 token 和现有 UI |
| 路由 | React Router | 路由配置集中在 `src/app/` |
| 客户端状态 | Zustand | 只保存客户端状态，不替代服务端数据 |
| 后端平台 | Supabase | Auth、Database、Storage、Edge Functions |
| 质量验证 | Vitest + React Testing Library + Playwright | 单元/组件测试就近放置，浏览器流程测试放在应用边界 |
| 包管理 | pnpm workspace | 使用 Corepack 和锁文件 |

## 3. 代码结构

```text
.
├── apps/
│   └── web/
│       ├── public/               直接公开的静态文件
│       ├── e2e/                  Web 应用的浏览器流程测试
│       └── src/
│           ├── app/              应用入口、路由、全局布局和 Provider
│           ├── pages/            页面级组合
│           ├── components/       跨业务 UI 与布局
│           │   └── ui/           基础 UI
│           ├── features/         教育业务模块
│           ├── hooks/            全局可复用 Hooks
│           ├── stores/           Zustand 客户端状态
│           ├── services/         外部通信和服务编排
│           ├── database/         数据库类型和模型
│           ├── types/            跨模块共享类型
│           ├── utils/            纯函数
│           ├── constants/        全局常量
│           ├── assets/            应用静态资源
│           ├── styles/            全局样式
│           └── main.tsx          React 挂载入口
├── packages/                     稳定的共享包，按需创建
├── reference/                    GitHub 参考项目和调研记录
├── supabase/
│   ├── migrations/               数据库结构和 RLS 迁移
│   └── functions/                需要服务端执行的函数
├── docs/                         项目文档
├── tests/                        跨模块测试
├── scripts/                      开发和数据工具
├── AGENTS.md
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

## 4. 分层边界

```text
Route/App
   ↓
Page（页面组合）
   ↓
Feature（教育业务） ──→ Components（通用 UI）
   ↓
Feature hooks / services
   ↓
Shared services
   ↓
Supabase / Edge Functions / 外部 API
```

- `pages/` 负责将多个 feature 组合成完整页面，不实现核心业务规则。
- `features/` 是业务边界。一个 feature 可以拥有自己的组件、Hooks、服务和类型。
- `components/` 只提供可复用的展示和交互能力，不知道具体班级、作业或学生业务；基础组件统一收敛在 `components/ui/`。
- `services/` 是所有外部通信的入口；组件不能直接调用 Supabase。
- `stores/` 只保存会影响客户端交互的状态，例如当前角色、筛选条件、侧栏状态和草稿 UI 状态。
- `database/` 保存生成的数据库类型和必要的模型映射，不重复维护一套与数据库脱节的结构。
- 单元/组件测试默认与其被测 feature 或纯函数相邻放置；跨 feature 的集成测试位于 `tests/`，浏览器流程测试位于 `apps/web/e2e/`。测试不得依赖真实生产数据或在输出中记录教育敏感信息。

## 5. 首页与工具加载策略

Aisenedu 的首页是工具入口，不是所有工具的运行容器。首屏只加载应用壳、导航、必要会话信息和轻量工具目录；具体工具在用户进入后按需加载。

```text
首页首屏
  ├── 应用壳 / 导航 / 角色信息
  ├── 工具目录元数据
  └── 工具卡片（轻量展示）
          │ 用户点击或明确打开
          ▼
工具路由 → 动态加载 feature → 加载工具专属依赖 → 请求工具数据
```

实施约束：

- 工具采用路由级或 feature 级动态 `import()` / `React.lazy`，保持独立 chunk。
- 首页、根 Provider 和共享 barrel 文件不得静态引入全部工具实现。
- 编辑器、图表、文件处理、AI 等重型依赖在工具内部继续拆分，只有实际使用时才加载。
- 用户明确意图后可以预取对应 chunk，但不能阻塞首屏或取消正式加载态。
- 每个工具必须有骨架屏、稳定占位尺寸、加载失败提示和重试路径，避免布局跳动和无反馈等待。
- 首页使用轻量工具目录元数据，不为每个工具初始化完整 API 查询；工具数据在进入工具后再请求。

新增工具的提案必须记录：加载触发点、首屏网络影响、分包边界、重型依赖、资源体积关注点和失败恢复方式。验收时检查生产构建分包和浏览器 Network，确认首页没有请求未使用工具的代码、重型资源或专属 API。

## 6. UI 组件库策略

- 使用 shadcn/ui 的按需引入方式，不整体安装和维护一个黑盒 UI 框架。
- 新 UI 先查找 `src/components/ui/` 和相邻 feature 中的现有实现；能复用就不复制。
- 组件只差样式或少量行为时，通过 props、`className` 或变体扩展。
- 确实缺少组件时，使用 shadcn CLI 按需添加，并将生成代码调整为 Aisenedu 的 Tailwind 主题 token。
- Button、Dialog、DropdownMenu、Tooltip、Tabs 和 Sonner 是优先使用的通用交互基础；业务规则、接口请求和角色判断放在 feature/service，不放进基础 UI。
- 不引入第二套 UI 组件库，除非先记录依赖必要性、职责边界和长期维护成本。

## 7. UI/UX 设计工作流

所有网页 UI 相关工作必须使用已安装的 `ui-ux-pro-max` 技能：

- 新页面、新模块或整体视觉方向先使用 `--design-system`，结合产品类型、用户角色、React、Tailwind 和 shadcn/ui 生成设计方向。
- 单个组件或明确问题使用对应的 `--domain` 查询，例如 `ux`、`typography`、`color`、`react`、`icons` 或 `chart`。
- 交付前检查可访问性、交互反馈、性能、响应式布局、排版/色彩对比、错误状态和空状态。
- 技能建议服从 Aisenedu 的产品需求、教育场景、权限规则和现有设计系统，不自动替代这些约束。

## 8. Feature 模块模板

```text
src/features/course/
├── components/
│   ├── CourseCard.tsx
│   └── CourseForm.tsx
├── hooks/
│   └── useCourses.ts
├── services/
│   └── courseService.ts
├── types.ts
└── index.ts
```

模块内类型和逻辑默认留在模块中；只有被多个业务模块真正共享时，才提升到 `src/types/`、`src/hooks/` 或 `src/services/`。

## 9. 数据和权限

浏览器端的数据流：

```text
用户操作 → Page/Feature → Hook/Service → Supabase
             ↓                 ↓
        UI 状态 Store      数据加载/错误状态
```

- 数据库表和索引通过迁移文件管理。
- 公开客户端配置只放在 `apps/web/.env.local`，模板放在 `.env.example`。
- 服务端密钥、批量操作、AI 调用和第三方私密 API 放入 Edge Functions。
- RLS 是数据权限的最终边界，前端角色判断只能改善体验，不能替代安全校验。
- 以后引入组织、学校、班级关系时，应把租户/归属字段和策略作为同一项设计，不先做无权限的全局表。

## 10. 应用入口规则

`src/main.tsx` 只负责挂载 React、全局样式和必要的初始化。`src/app/App.tsx` 只负责全局布局、Provider 和路由。认证、数据查询、AI 请求和复杂组件必须放到对应的 feature/service。

## 11. 新模块设计流程

1. 明确角色、核心任务、数据对象和权限边界。
2. 先在 GitHub 搜索成熟项目、开源实现和可复用组件，优先复用经过验证的方案。
3. 评估参考项目的维护状态、许可证、技术栈、质量和与当前需求的匹配度。
4. 只查看与当前模块相关的文件，并在 `reference/REFERENCE_PROJECT_INDEX.md` 记录链接、文件、结论、许可证和采用/不采用理由。
5. 在完成参考调研后，确定数据模型、权限边界和 Aisenedu 的实现提案。
6. 先实现数据类型与 service，再实现 feature 状态和组件。
7. 接入页面，补充错误、空状态、加载态和响应式行为。
8. 运行类型检查、构建、Lint 和与模块相关的测试。

所有参考项目和 GitHub 调研记录统一放在根目录 `reference/`，详见 [`REFERENCE_PROJECT_INDEX.md`](../reference/REFERENCE_PROJECT_INDEX.md)。该目录只保存调研说明和必要的参考资料，不直接作为生产代码来源。

## 12. 验收范围

当前默认验收：

```bash
corepack pnpm build
corepack pnpm lint
```

当引入 Supabase 迁移、Edge Function 或具体业务模块时，再增加对应的数据库、服务端和端到端验证，不把未配置的外部服务伪装成已验证。

## 13. 首个工具的加载、依赖与隐私记录

当前首个工具为 `/tools/name-labels` 学生姓名贴，页面通过路由级 `React.lazy` 加载。首页只加载应用壳、导航和轻量工具入口；姓名贴页面进入后才加载其 feature chunk。用户选择 XLSX 文件后才动态加载 `read-excel-file@9.3.10` 的浏览器入口；生产构建中的 XLSX 解析依赖不进入首页首屏 chunk。打印功能使用 `react-to-print@3.3.0`，只接收专用可打印文档 ref，不引入 jsPDF。

姓名、原始文件名和表格内容只在当前页面内存中处理；当前实现没有持久化 middleware、网络上传、分析事件、日志输出或 URL 编码。导入服务在读取前检查 5MB 文件上限，并限制 10,000 行、100 列和 80 个 Unicode 字符的姓名长度。XLSX 解析失败、格式不支持、超限和列选择取消均保留原有草稿。

UI 遵循 `components/ui/` 中的 shadcn/ui 按需组件和语义 token；姓名贴页面为浅色工作区，桌面端采用左配置/右预览，窄屏纵向排列。空状态、加载态、错误摘要、字段内联错误、确认对话框、撤销 Toast、响应式、四步工作流和懒加载失败重试均有实现或自动化覆盖。姓名贴的字体、色盘、确定性渐变、本地背景图和非敏感本地模板配置详见其 feature 架构文档。

## 14. 姓名贴优化后的工作流与外观边界

姓名贴工具使用“导入名单 → 选择版式 → 内容样式 → 打印校准”四步导航。步骤只控制当前界面，不复制或重置草稿；用户可以随时回跳，名单、表单原始值、模板、样式和预览页码保持不变。步骤导航在桌面端跨配置与预览两栏显示，使用足够宽度的紧凑横向布局；平板和手机端使用不横向滚动的 2×2 网格。桌面端配置栏不创建独立纵向滚动，纸张横向查看只发生在带提示的预览容器内。

`LabelAppearance` 将字体预设、HEX 色值、纯色/图片背景、实线/确定性渐变边框、渐变种子、遮罩和字段标题作为明确字段。字体仅使用本机字体栈；背景图片只接受 PNG/JPEG/WebP，限制大小和像素，保存在当前会话的 object URL 中，替换、恢复默认和重置时释放旧资源。预览和打印都使用同一个 `LabelPageCanvas`，打印 DOM 不包含背景编辑辅助提示。

模板配置导出、本地保存和导入使用版本化白名单，只允许纸张、布局、样式和校准参数，拒绝姓名、班级、文件名、object URL 和背景图字段。性能基线见 [`NAME_LABEL_PERFORMANCE.md`](NAME_LABEL_PERFORMANCE.md)；当前 10,000 条合成名单的清洗和分页约 77ms，暂不增加 Worker。

### 当前验证边界

- 已验证：`corepack pnpm build`、`corepack pnpm lint`、`corepack pnpm test`、`corepack pnpm test:coverage`、`corepack pnpm test:e2e`；Chrome 与 Edge 的页面加载和基本流程；375/768/1024/1440px 无意横向滚动检查；打印样式字符串和校准文档的单元测试。
- 未由自动化环境完成：系统打印对话框内的真实纸张驱动选项、实体打印机进纸与毫米偏差；因此通用模板均标记为“未实物验证”，交付说明不宣称厂商纸型精度。
