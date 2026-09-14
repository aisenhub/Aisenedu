# 学生姓名贴生成与打印架构

> 状态：v3.1 实施架构。本文是姓名贴功能的产品、前端、打印、数据与安全边界的唯一设计依据；当前实现已切换到 PhysicalTemplate + Scene + SVG/PDF 输出，实际开发若需要偏离，先更新本文与对应任务。

## 1. 目标与范围

### 1.1 目标

面向教师，在浏览器中导入或粘贴待打印内容（学生姓名只是默认示例），按标签纸的真实物理尺寸生成标签，并在打印前完成预览、校准和排版确认。

首版以“无需登录即可完成一次安全的本地打印”为目标。用户输入内容默认只存在于当前浏览器内存，打印完成或刷新页面后不保留。

### 1.2 MVP 范围

- 粘贴名单、输入名单、导入 UTF-8 CSV 与 XLSX 文件。
- 从导入数据中选择首列内容，并可选选择其他字段；清洗空白行并提示无效项，重复内容按原样保留。
- A4 纵向/横向模板与自定义纸张；以 mm 为单位调整纸张、标签尺寸、起始位置、行列和标签节距。
- 标签排版面板：用户直接设置纸张、标签尺寸、边距、间距和行列数量；不提供快捷模板选择，支持恢复默认参数。
- 标签样式：字体与文字、外边框、内边框、背景四类设置；颜色支持配色预设、分类色盘和 HEX 自定义。
- 按指定起始空白标签位置排版；支持多页和打印前的实际尺寸 SVG 预览。
- 生成关闭打印缩放的矢量 PDF；浏览器打印作为兼容路径；提供独立设备几何测试页和模板覆盖测试页。
- 打印专用样式、键盘操作、可访问的表单错误与窄屏可用界面。

### 1.3 不在 MVP 范围

- 班级管理、学生档案、账号、组织、多人协作或云端保存。单次姓名贴导入中的班级文本属于可选打印字段，不等同于班级管理能力。
- 上传含姓名的文件到 Supabase Storage 或其他第三方。
- 条码/二维码、头像、复杂富文本、拖拽画布、模板市场。
- 不能由前端保证所有打印机一致；PDF 仅保证页面尺寸、矢量图形和明确的字体资产策略，真实设备仍需 100% 打印与校准。
- 移动端打印优化。窄屏仅保证名单导入、参数调整与预览可读；建议在桌面浏览器完成校准和打印。

### 1.4 成功标准

1. 教师可在 3 分钟内从姓名列（可带班级列）得到可打印的 A4 姓名贴。
2. 以毫米定义的预览与打印页使用同一套布局算法；不在预览与打印之间重复实现排版。
3. 更改任一纸张或标签参数后，立即显示有效性、页数和可打印预览。
4. 一张部分使用过的标签纸可从指定格开始继续打印。
5. 不将学生姓名写入日志、URL、本地持久化存储或未授权的远端服务。

## 2. 关键决策

| 决策 | 结论 | 原因 |
| --- | --- | --- |
| 首版数据边界 | 浏览器内存，设置可单独保存但不保存学生姓名 | 减少教育数据暴露；当前工程尚未接入认证与班级模型。 |
| 排版单位 | 所有纸张与布局计算使用 `mm` | CSS 像素会随显示缩放变化，不能作为标签纸的业务单位。 |
| 打印方式 | `PhysicalTemplate` → `PageLayout[]` → `PrintScene` → SVG/PDF；浏览器打印保留兼容路径 | 屏幕、PDF 和浏览器打印共享同一个场景，不在不同输出端重复排版。 |
| PDF | `pdf-lib@1.17.1` + `@pdf-lib/fontkit@1.1.1`，输出 `PrintScaling.None` | 页面尺寸和矢量图形可控；中文嵌入随应用分发且附 OFL 1.1 的 Noto Sans SC Regular 完整字体，CJK 不走子集以兼容移动 PDF 阅读器；其他字体使用明确 fallback。 |
| 导入格式 | 文本、CSV、XLSX | 教师常从 Excel 导出；导入后的数据必须经过统一的列选择和清洗层。 |
| 全局状态 | feature 内 Zustand store 保存会影响多个面板的 UI/编辑状态 | 满足工程状态规范；布局计算和导入解析保持纯函数。 |
| 持久化 | 只保存不含名单的纸张、PhysicalTemplate 映射和外观设置 | 没有账号和授权链路时，学生姓名、导入行、背景 object URL 和校准原始测量不得进入长生命周期存储。 |

## 3. 用户、任务与流程

### 3.1 用户角色

首版只定义教师操作角色。未登录可使用本地工具；未来启用保存功能时，教师身份、学校/组织、班级与学生归属必须由 Supabase RLS 和服务端再次校验。

### 3.2 核心流程

```text
进入“姓名贴”
  → 导入/粘贴学生姓名
  → 选择姓名列及可选班级列，并确认清洗结果
  → 选择标签纸模板或自定义参数
  → 调整内容与样式，查看真实尺寸预览
  → 选择起始空白标签，必要时运行校准页
  → 打开浏览器打印对话框并完成打印
```

首次进入的空状态可将上述流程呈现为简短的四步引导（录入名单、选择标签纸、调整样式、打印 A4），帮助教师建立心智模型；它是可回退、可跳转的工作流提示，不是锁定步骤的向导。教师在任意阶段都可以回到前一面板修改数据或参数。

### 3.3 异常与恢复

| 情形 | 行为 |
| --- | --- |
| 文件格式或编码无法读取 | 在导入区域显示原因和重试操作，不改变当前可用名单。 |
| 未识别姓名列 | 显示列名/示例值选择器；姓名列未选择前不启用继续操作；班级列可以不选。 |
| 空行、重复或过长姓名 | 空行移除，重复项按原顺序保留且不做检查或标记，超长项提示用户修改或允许换行。 |
| 参数无法容纳标签格 | 相关字段显示内联错误，打印与导出禁用，预览保留最后有效布局。 |
| 用户要清空名单 | 使用确认对话框，清除后回到空状态；若有导入操作，提供短暂“撤销”。 |
| 打印机位置偏差 | 不自动猜测；提供独立设备几何页、重复测量和受策略约束的补偿模型；未通过门槛时不保存高级补偿。 |

## 4. 信息架构与交互设计

### 4.1 路由

新增路由常量 `NAME_LABELS_ROUTE = '/tools/name-labels'`，由 `app/App.tsx` 仅负责注册。

页面标题为“学生姓名贴”，URL 不含任何学生姓名、导入内容或配置序列化数据。

首页（或后续工具目录）必须提供可见的“学生姓名贴”入口；深链访问该路径仍可直接使用。应用壳提供跳至主内容链接、`<main id="main-content">` 和未匹配路由的回退页，避免工具页不可发现或键盘焦点停留在导航。

### 4.2 页面结构

桌面（`>= 1024px`）采用两栏工作台：顶部先显示跨两栏的紧凑四步导航，步骤之间使用轻量右箭头表达前进方向，下方左侧为当前步骤内容，右侧为固定可见的打印预览；页面只保留主文档纵向滚动，不再在左栏建立独立纵向滚动。主操作始终是“打印姓名贴”，并与打印摘要一起放在“打印与校准”步骤；次要操作包括导入、清空和校准。

```text
页面标题 / 返回工具页
├── 名单与导入面板
│   ├── 粘贴名单 | 导入 CSV/XLSX
│   └── 姓名列（必选）/班级列（可选）、清洗结果、名单预览
├── 标签纸与排版面板
│   ├── 纸张与排版参数（纸张、标签尺寸、边距、行列、间距） | 自定义尺寸
│   ├── 页边距、标签尺寸、行列、间距
│   └── 恢复默认参数
├── 内容与样式面板
│   └── 姓名/班级字段与标题开关、字体与文字、外边框、内边框、背景
├── 打印与校准面板
│   ├── 打印摘要、排版检查与“生成打印 PDF”
│   └── 默认折叠的设备几何测试页、模板覆盖说明与浏览器兼容路径
└── 打印预览区
    ├── 页码与缩放控制（仅屏幕）
    └── A4 实尺寸页面
```

在 `768px–1023px` 时配置栏在预览上方；在 `<768px` 时各面板纵向排列，预览可横向缩放查看但页面主体不得出现无意的横向滚动。打印按钮仍可用，同时展示“建议在桌面浏览器校准与打印”的说明。

### 4.3 可用性与无障碍要求

- 所有输入有可见标签、单位说明和字段级错误；错误需要说明原因与修复方法。
- 表单提交存在多个错误时，焦点移至可链接的错误摘要；普通字段修改在失焦后校验，不在每个击键时打断用户。
- 预览页使用语义标题和页面说明；装饰性图标使用 `aria-hidden`，图标按钮必须带可访问名称。
- 全部操作可用键盘完成；不把拖拽作为必要操作。
- 焦点样式清晰、文字对比度至少 4.5:1、非文字控件边界至少 3:1；状态不能只由颜色表达。
- 触控环境中主要按钮的可点按区域不小于 44px；尊重 `prefers-reduced-motion`。
- 屏幕预览缩放仅影响视觉，不改变 mm 布局数据或打印数据。

### 4.4 视觉系统与组件规范

经 UI 设计系统检索并结合当前 Aisenedu 的浅色应用壳，姓名贴工具采用“极简、网格化、功能优先”的编辑器风格：屏幕工作区保持克制，打印页始终以白色真实纸张为视觉主体。检索推荐的深色主题与外部 Web 字体不作为首版方案，因为它会削弱纸张预览的对照感，并可能造成中文打印字形不一致。

| 层级 | 规范 |
| --- | --- |
| 屏幕画布 | 使用现有浅色 `slate` 背景；预览周围以低对比阴影或细边框与工作区区分，不能模拟为深色画布。 |
| 信息层级 | 页面标题 → 当前名单/页数状态 → 分组配置 → 打印预览；不以颜色单独表示配置是否有效。 |
| 主操作 | 每个时刻只保留一个主操作“打印姓名贴”；导入、校准、清空与重置均为次级/危险操作。 |
| 间距与网格 | 使用 4px/8px 节奏；桌面配置栏和预览区以稳定网格对齐，避免装饰性渐变或无意义的卡片嵌套。 |
| 字体 | 屏幕预览沿用系统字体栈；正式 PDF 对中文使用随应用分发且附带 OFL 1.1 文本的 Noto Sans SC Regular 完整字体，避免 CJK 子集在移动阅读器中的兼容性问题；楷体/衬线/等宽中文使用明确授权的中文 PDF fallback，不静默读取用户系统字体。 |
| 色彩 | 在样式中使用语义 token（主操作、表面、边框、错误、成功、焦点），而非在业务组件散落十六进制色值；常规文字与背景至少 4.5:1 对比度。 |
| 动效 | 只用于面板展开、状态反馈等因果明确的过渡，建议 150–250ms；只动画 `opacity`/`transform`，并在减少动态效果偏好下关闭。 |

在开始实现工作台前，先在全局样式建立最小的 `surface`、`text`、`border`、`primary`、`error`、`success` 与 `focus` 语义 token，并由 Tailwind v4 主题引用。姓名贴业务组件不得直接定义色值；打印页的白底属于纸张语义，而不是另一套主题。

当用户试图打印而布局有错误时，页面顶部必须渲染可聚焦的错误摘要（`role="alert"`），并链接到每个无效字段；焦点移至摘要，但字段内联错误必须保留。Toast 只能补充反馈，不能代替错误摘要或字段错误。

### 4.5 输出模式与内容字段的演进

首列内容是 MVP 唯一必需字段；其他列是可选导入、可选打印字段。工具默认只打印用户提供的字段值，不擅自添加“姓名：”“班级：”或其他字段标题；标题开关仅在用户明确打开后生效。学生姓名只是默认示例，工具本身不限制输入语义。参考页面中“单人铺满/教师批量/桌牌”与拼音、学号的设计对教育场景有价值，但会改变信息密度和隐私风险，因此按以下顺序扩展：

| 能力 | 阶段 | 交互与安全规则 |
| --- | --- | --- |
| 教师批量姓名贴 | MVP | 当前唯一实现的输出模式；姓名为必选字段，班级为可选字段；适配标签纸、多页与校准。 |
| 家长单人铺满 | 第二阶段 | 本地输入单个姓名，生成一张铺满 A4 的大姓名贴；不引入名单保存或新权限。 |
| 折叠桌牌 | 第二阶段 | 使用独立的双面/折叠布局算法与校准模板，不能复用标签纸格算法后强行旋转。 |
| 拼音 | 第二阶段 | 明确为可选辅助字段，默认关闭；仅在用户输入或导入指定列后显示，需验证声调字符和排版溢出。 |
| 班级管理、学号 | 第二阶段 | 班级管理涉及实体、归属和保存流程；学号属于更敏感的学生标识。两者均不在本工具中持久化。姓名贴中的一次性班级列导入和打印不等于班级管理。 |
| 卡通/主题模板 | 第二阶段 | 提供项目内置、经过打印测试的低墨量主题；不能使用 emoji 作为结构性图标，不上传用户背景图，也不把远端图片带入打印流程。 |

MVP 页面不得出现不可用的上述开关或“即将推出”控件。后续启用每项能力前，应补充样式、纸张、长文本、隐私与人工打印的验收用例。

## 5. 前端结构

```text
apps/web/src/
├── app/
│   ├── App.tsx                         # 仅注册路由与应用布局
│   └── routes.ts                        # 路由常量（若现有项目引入该文件）
├── pages/
│   └── NameLabelPrintingPage.tsx        # 页面组合
├── features/
│   └── label-printing/
│       ├── components/
│       │   ├── LabelImportPanel.tsx
│       │   ├── NameColumnPicker.tsx
│       │   ├── NameListPreview.tsx
│       │   ├── LabelTemplatePanel.tsx
│       │   ├── LabelContentPanel.tsx
│       │   ├── PrintCalibrationPanel.tsx
│       │   ├── PrintPreview.tsx
│       │   ├── PrintableSvgDocument.tsx
│       │   ├── SvgPrintPreviewPage.tsx
│       │   └── PrintableCalibrationDocument.tsx
│       ├── hooks/
│       │   ├── useLabelImport.ts
│       │   └── useNameLabelPrint.ts
│       ├── services/
│       │   ├── importNames.ts
│       │   └── labelPrintService.ts
│       ├── workers/
│       │   └── parseWorkbook.worker.ts   # 受限的 XLSX 解析（按需创建）
│       ├── stores/
│       │   └── useLabelPrintingStore.ts
│       ├── utils/
│       │   ├── layout.ts
│       │   ├── validation.ts
│       │   └── templatePresets.ts
│       ├── types.ts
│       └── index.ts
├── components/ui/                       # 仅复用/新增 shadcn 基础组件
└── styles/
    └── print.css                        # 只含打印媒介、@page 与 mm 规则
```

组件不得直接读取文件、调用 Supabase 或将学生姓名写入浏览器持久化存储。文件解析进入 `services/importNames.ts`；`layout/createPageLayouts.ts` 必须无副作用且可独立测试。

## 6. 数据模型与状态

### 6.1 领域类型

v3.1 的打印主链以 `PhysicalTemplate` 和 `LabelProject` 为稳定领域契约；下面的 `PaperSettings`/`LabelLayout` 仅作为现有表单与 legacy config 的兼容形状，`origin/pitch` 在进入 LayoutEngine 时由 `PhysicalTemplate` 统一提供，校准补偿不写回模板。

```ts
type PhysicalTemplate = {
  id: string
  version: number
  name: string
  paper: Pick<PaperSettings, 'size' | 'widthMm' | 'heightMm' | 'orientation' | 'cutStyle'>
  grid: {
    labelWidthMm: LengthMm
    labelHeightMm: LengthMm
    columns: number
    rows: number
    originXmm: LengthMm
    originYmm: LengthMm
    pitchXmm: LengthMm
    pitchYmm: LengthMm
  }
  verification: { physicallyVerified: boolean; note?: string }
}

type LabelProject = {
  names: StudentName[] // 仅当前页面会话
  templateId: string
  firstLabelIndex: number
  appearance: LabelAppearance // 仅当前页面会话；安全外观设置可单独持久化
}
```

```ts
type LengthMm = number

type StudentName = {
  id: string
  value: string
  className?: string
  sourceRow: number
}

type PaperSize = 'A4' | 'LETTER' | 'CUSTOM'
type Orientation = 'portrait' | 'landscape'

type PaperSettings = {
  size: PaperSize
  orientation: Orientation
  cutStyle?: 'none' | 'inner-lace' | 'inner-plain'
  widthMm: LengthMm
  heightMm: LengthMm
  marginTopMm: LengthMm
  marginRightMm: LengthMm
  marginBottomMm: LengthMm
  marginLeftMm: LengthMm
}

type LabelLayout = {
  labelWidthMm: LengthMm
  labelHeightMm: LengthMm
  columns: number
  rows: number
  gapXmm: LengthMm
  gapYmm: LengthMm
  firstLabelIndex: number // 项目分页状态，当前固定为 0，不向用户暴露设置
}

type TemplateContentCapacity = {
  maxLines: 1 | 2 | 3 | 4
  recommendedUse: string
}

type LabelTemplatePreset = {
  id: string
  name: string
  version: number
  paper: PaperSettings
  layout: Omit<LabelLayout, 'firstLabelIndex'>
  contentCapacity: TemplateContentCapacity
  isPhysicallyVerified: boolean
}

type LabelAppearance = {
  fontPreset: 'systemSans' | 'systemSerif' | 'kaiTi' | 'monospace'
  fontSizePt: number
  lineHeight: number
  fontWeight: 400 | 500 | 600 | 700
  textAlign: 'left' | 'center' | 'right'
  textColor: string
  backgroundColor: string // 标准化为 #RRGGBB
  backgroundMode: 'solid' | 'image'
  backgroundImage?: { mimeType: 'image/png' | 'image/jpeg' | 'image/webp'; objectUrl: string; naturalWidth: number; naturalHeight: number; scale: number; offsetX: number; offsetY: number; maskTone: 'light' | 'dark'; maskOpacity: number }
  borderColor: string
  borderWidthMm: LengthMm
  outerBorderVisible: boolean
  innerBorderVisible: boolean
  innerBorderColor: string
  innerBorderStyle: 'solid' | 'dashed'
  borderRadiusMm: LengthMm
  backgroundMaskOpacity: number
  backgroundMaskTone: 'light' | 'dark'
  showClassTitle: boolean
  showNameTitle: boolean
  showFieldTitles?: boolean
}

type LabelProjectDraft = {
  names: StudentName[]
  paper: PaperSettings
  layout: LabelLayout
  appearance: LabelAppearance
}
```

数值在领域草稿和 store 中始终为数字，不保存带单位的字符串。输入层负责把表单文本转换为数字；非法值不可进入排版函数。

表单另有仅用于编辑的 `LabelPrintFormState`：它按字段保存原始字符串、是否已触碰和字段错误，不属于领域对象，也不持久化。字段为空、`NaN`、超出范围或交叉校验失败时，store 仍保留最后一次有效的 `LabelProjectDraft`；预览继续展示该草稿的最后有效 `PageLayout[]`，同时在输入处显示错误。这样既不会让非法数值进入布局算法，也不会在教师编辑中途清空可用预览。

### 6.2 Zustand Store 职责

`useLabelPrintingStore` 保存当前会话的名单、导入步骤、预览缩放、打印状态与非持久化提示状态；通过版本化安全存储只恢复不含名单的纸张、排版和外观设置。原始表单字符串由对应的 feature hook 持有；store 不保存服务端数据，也不负责计算页面位置。

建议的 action：`setNames`、`restoreSelectedTemplateDefaults`、`updatePaper`、`updateLayout`、`updateAppearance`、`setPreviewScale`、`resetDraft`。恢复默认参数只重置纸张、布局、外观和当前 Profile 选择，不清空姓名名单。批量导入仅调用一次 `setNames`，不得逐行触发大量状态更新。

### 6.3 隐私与临时数据

- 项目纸张/排版/样式设置可写入版本化 `localStorage`，但已清洗姓名、班级、字段顺序、导入行、原始文件名、背景 object URL 和原始校准测量不得写入；刷新后名单回到空状态。不写入 `sessionStorage`、URL、分析事件、错误日志或网络请求。
- 临时背景图片只保留在当前浏览器会话中；其二进制内容和对象 URL 不写入项目草稿，刷新后回到纯色背景。
- 读取文件使用浏览器 File API，完成解析后只保留已清洗的数据；不上传原文件。

## 7. 导入与清洗设计

### 7.1 输入渠道

| 渠道 | 要求 | 输出 |
| --- | --- | --- |
| 多行粘贴/手动输入 | 每行一个姓名 | 单列姓名记录，行号从 1 开始；不产生班级值。 |
| CSV | UTF-8，支持逗号与常见引号转义 | 表格、列标题与行号；姓名列必选，班级列可选。 |
| XLSX | 读取第一个工作表；允许用户选择列 | 表格、列标题与行号；姓名列必选，班级列可选。 |

XLSX 解析使用按需加载的 `read-excel-file@9.3.10` 兼容入口和浏览器入口（MIT）；兼容入口优先，失败后再尝试浏览器入口。CSV 继续使用 feature 内的受限解析器。导入逻辑必须包装在 service 内，禁止在组件中直接依赖解析库。解析依赖只在用户选择 XLSX 文件后加载，实际版本和产物体积在变更记录中维护。

### 7.2 清洗规则

1. 保留原始行号，去除首尾空白和不可见空格。
2. 移除空值并报告数量。
3. 使用 Unicode 规范化（NFC），避免视觉相同的重复名称遗漏。
4. 重复姓名不自动删除、不计数、不标记：教师可能需要同名学生，导入顺序和条数原样保留。
5. 姓名和班级值分别限制显示安全长度，例如 80 个字符；超过长度需修改后才能打印；班级列为空时保留为空，不生成“班级：”。
6. 渲染时一律以 React 文本节点输出，禁止把导入值当作 HTML。

### 7.3 资源限制与解析隔离

- 文件扩展名和 MIME 类型只作用户提示，实际解析失败必须安全退出；首版只接受 CSV 与 XLSX，不支持旧版 XLS。
- 导入前拒绝大于 **5 MB** 的文件；解析过程中最多处理 **10,000 行、100 列**，单元格清洗后最多 **80 个 Unicode 字符**。超过限制时不替换当前名单，并给出不含姓名的处理建议。
- XLSX 解析器按用户选择文件时动态加载，优先使用兼容入口，失败后再尝试浏览器入口；Worker 的输入和返回值仅在当前内存中存在，错误对象不得回显原始单元格内容。
- CSV/XLSX 解析、列选择和清洗均应产生可测的受限中间模型；只在用户确认姓名列及可选班级列后，单次调用 `setNames` 写入已清洗名单。

## 8. 排版与打印引擎

### 8.1 单一布局算法

`PhysicalTemplate` 描述纸张、标签尺寸、`originX/Y` 和 `pitchX/Y`；`layout.ts` 计算所有输出格的位置。屏幕 SVG 预览、PDF 和浏览器打印文档都消费同一个 `PageLayout[]`/`PrintScene`，不得分别计算分页。

```text
capacity = columns × rows
absoluteSlot = nameIndex // 当前 firstLabelIndex 固定为 0
pageIndex = floor(absoluteSlot / capacity)
slotIndex = absoluteSlot % capacity
row = floor(slotIndex / columns)
column = slotIndex % columns
x = originX + column × pitchX
y = originY + row × pitchY
```

每一个输出页都有 `widthMm`、`heightMm` 和二维 cell 数组。当前从每页第一格开始填充，末页不足的格子明确表示为 `empty`。

### 8.2 参数验证

```text
gridWidth  = columns × labelWidth  + (columns - 1) × gapX
gridHeight = rows × labelHeight + (rows - 1) × gapY
availableWidth  = paperWidth  - marginLeft - marginRight
availableHeight = paperHeight - marginTop  - marginBottom

gridWidth <= availableWidth
gridHeight <= availableHeight
`firstLabelIndex` 固定为 `0`；用户不需要配置起始空白格。
```

设备补偿不再写入 `LabelLayout`；它只作为匹配输出路径的 Calibration Profile 矩阵包裹 Ideal Scene，且最多应用一次。模板位置只由 `originX/Y` 与 `pitchX/Y` 决定。

### 8.3 CSS 与打印

- `PrintScene` 的 SVG 页面使用 `width="<paperWidth>mm"`、`height="<paperHeight>mm"` 和相同的 mm viewBox。
- PDF 在唯一的输出边界把 mm 转换为 points，MediaBox 使用纸张的精确物理尺寸，并设置 `PrintScaling.None`。
- `print.css` 内使用 `@media print`：隐藏应用导航、表单、屏幕缩放控件与辅助文案；保留由同一场景序列化的 SVG 文档。
- `@page` 的尺寸/方向由当前模板提供。打印对话框中应提示用户关闭“适应页面/缩放”、设置 `100%`，并按需要启用背景图形。
- 浏览器兼容路径使用 `react-to-print` 把由 `PrintScene` 序列化的 `PrintableSvgDocument` 传给打印窗口。若打印窗口被拦截或 API 抛错，显示可恢复的错误提示；正式路径使用同一 Scene 生成 Vector PDF。
- 浏览器和打印机都有非可控页边距；不宣称所有打印机在未校准时达到精确对齐。

### 8.4 校准页

校准输出分为两个独立文档：Device Geometry Page 只验证设备的平移、轴向缩放、旋转/相似变换和仿射风险；Template Overlay Page 只验证具体模板的 origin、pitch、标签尺寸和切线关系。两者都不使用学生姓名。高级模型需要至少三次同配置重复测量，且必须通过稳定性和残差门槛后才允许保存 profile；软件阈值是临时策略，不能替代真实打印机实测。

打印前在校准面板展示“打印兼容说明”：默认使用 A4 标签纸、选择 100% 缩放、关闭“适合页面”；若使用自定义纸张尺寸，应先在打印机驱动或系统打印对话框中确认该纸张可用。页面不能检测或改变打印机进纸方式、边距能力或自定义纸张支持，因此这些内容只能作为用户确认的指导信息，不能伪装为可自动执行的开关。

所有会影响物理输出的字段（纸张尺寸、标签尺寸、originX/Y、pitchX/Y）必须提供就近帮助说明，解释其作用与单位；帮助不能只用无文字图标表达。

## 9. 模板策略

### 9.1 预设

排版面板直接提供纸张、标签尺寸、边距、间距和行列数量设置，不提供快捷模板选择；用户可根据标签实物自行配置内容行数对应的版式。

默认值使用一行内容的常用版式（标签宽 40mm、高 20mm，4×13）；列数、行数、标签尺寸和间距均可由用户直接调整，不能只通过运行时缩放或自动换行改变字段语义。

预设仅给出可编辑的默认值，不应把厂商品牌型号写死为已认证精确模板。未实物验证的卡片必须标记为“通用模板”；经实物验证后再升级为“已验证模板”。

每个预设包含稳定 `id`、显示名、版本、纸张、布局和推荐字体尺寸。后续加入经过实物验证的品牌型号时，需记录测量来源、纸张批次、打印机校准条件与版本。

排版面板提供“恢复默认参数”。执行前显示将重置哪些设置（纸张、行列、尺寸、间距、外观和当前 Profile 选择），但保留当前输入内容；打印始终从每页第一格开始。字段导入最多选择四列，分别对应标签中的一至四行内容；首列是必选内容，其他字段按用户选择顺序排列。

### 9.2 自定义

高级自定义设置允许改纸张尺寸、页边距、行列、标签宽高与间距。保存后的模板名称是非敏感配置，可在用户主动选择“保存设置”时本地保存；首版不提供云端共享。

## 10. 依赖、性能与可靠性

### 10.1 依赖原则

- 优先复用 React、React Router、Zustand、Tailwind、Lucide 与现有 shadcn/ui 组件。
- 基础 UI 和测试依赖在 NL-00 一次性建立：按需生成的 shadcn/ui 基础组件、Vitest、React Testing Library 与浏览器验证工具只服务于本项目，不引入第二套 UI 框架。
- `react-to-print` 使用 v3 API，唯一职责是浏览器兼容打印 iframe/生命周期；其余布局仍由 `PrintScene` 控制。正式 PDF 使用 `pdf-lib` + `fontkit`，FontAssetRegistry 仅在导出动作中按需嵌入本地 Noto Sans SC Regular 完整字体，避免 CJK subset 在移动阅读器中出现缺字；其他字体使用明确 fallback 或错误提示。
- XLSX 读取使用 `read-excel-file@9.3.10`，采用 MIT 许可证；仅在导入时动态加载，不得把解析库暴露到通用 UI 组件中。该库的兼容入口和浏览器入口均可读取 `ArrayBuffer`，默认读取首个工作表，导入服务按顺序尝试两种入口。
- 不引入画布编辑器或第二套 UI 框架；PDF 生成使用已通过结构测试的 `pdf-lib` 路径，中文字体资产由 FontAssetRegistry 按需嵌入并随仓库附带许可证。

### 10.2 性能目标

- 1,000 个姓名的解析、分页和预览初次呈现不应让交互明显冻结；解析完成后一次性提交 store。
- 屏幕预览可只渲染当前页与相邻页；打印文档必须完整渲染所有页。
- 布局计算是纯函数，可用 memoization 缓存；不得在每个 cell 内重复计算完整页数组。
- XLSX 解析与打印相关依赖应按 feature/用户操作动态加载，避免增加首页首屏负担。

## 11. 未来 Supabase 扩展边界

只有用户明确要求“保存项目/班级名单”且 Auth、组织归属模型已经存在时，才进入本节实施。

```text
label_projects
  id, organization_id, owner_id, name, paper_settings, layout_settings,
  appearance_settings, created_at, updated_at

label_project_items
  id, project_id, display_name, sort_order, created_at
```

- `organization_id`、`owner_id` 与 RLS 策略在同一 migration 中提交。
- 教师仅能读写属于自身组织且有成员关系的项目；学生姓名不得暴露给非授权的家长、学生或其他教师。
- 服务端日志不记录 `display_name`；导出/批量操作使用 Edge Function 时再次校验归属。
- 不把原始导入文件作为默认存储对象；如确有审计需求，必须单独定义保留期、删除策略与 Storage 访问策略。

## 12. 验证与验收

### 12.1 自动化验证

- 使用 Vitest + React Testing Library 完成纯函数与组件测试；浏览器流程由 Playwright 验证。测试工具在 NL-00 配置，不能等到功能完成后才选择。
- 单元测试：mm 容纳校验、分页、固定首格、origin/pitch、空名单、跨页、Unicode 名称、导入上限与 CSV/XLSX 标准化。
- 组件测试：字段错误与最后有效预览、不可打印状态、导入列选择、清空确认、预览页数、模板恢复后姓名仍保留。
- 浏览器测试：粘贴名单 → 配置布局 → 调用打印动作；模拟刷新恢复本地项目草稿，断言姓名不进入 URL 或网络请求，清空名单后断言本地名单为空。浏览器自动化不声称能验证系统打印对话框的最终物理输出。

### 12.2 人工打印检查

在 Chrome 与 Edge 的打印预览中分别检查 A4 纵/横向、多页、校准页以及 `@page` 尺寸。另在至少一台常用 A4 打印机、100% 缩放、背景开关两种配置下验证：预设模板、中文姓名、英文长姓名、打印校准与多页输出。记录浏览器、打印机、驱动、纸张型号、缩放设置与实测偏差；未实测的模板必须标记为通用模板。

### 12.3 发布门槛

- `corepack pnpm build`
- `corepack pnpm lint`
- 新增的模块测试全部通过。
- 375px、768px、1024px 宽度下无无意横向滚动；键盘 Tab 顺序合理。
- 无学生姓名进入 URL、日志、持久化存储或网络请求。
- 视觉实现符合第 4.4 节：浅色工作区、白色纸张预览、唯一主操作、可见焦点、表单错误摘要，以及减少动态效果支持。

## 13. 风险与待决事项

| 风险/待决项 | 当前处理 | 需要的后续决定 |
| --- | --- | --- |
| 纸张/打印机误差 | Device Geometry + 输出路径 Profile + 通用模板 | 收集实物验证的标签纸型号后再承诺精确预设。 |
| XLSX 包体积、兼容性与恶意大文件 | `read-excel-file` 动态加载、文件/行列上限，必要时 Worker | 用真实学校导出文件测量包体积与解析耗时。 |
| 中文字体在不同系统差异 | 浏览器预览沿用系统字体栈；正式 PDF 嵌入 OFL 1.1 的 Noto Sans SC Regular 完整字体，CJK 不使用 pdf-lib/fontkit 子集 | 继续记录字体物理输出与不同浏览器/阅读器的差异；楷体/衬线中文使用明确 fallback。 |
| 云端保存 | MVP 不做 | 确认租户、认证、班级归属、保留期和删除流程。 |
| 内容字段与输出模式 | MVP 打印批量姓名贴；班级列为可选字段 | 班级管理、拼音、学号、单人铺满、桌牌和主题模板均须按第 4.5 节逐项完成隐私、排版与打印验证后再扩展。 |

## 14. 参考依据

- [GitHub 调研索引](../reference/REFERENCE_PROJECT_INDEX.md) 中“学生姓名贴生成与打印”条目。
- `vivesweb/printable_labels_pdf` 的布局参数与起始标签位思想，仅作为设计参考，不复制 GPL 代码。
- `MatthewHerbst/react-to-print` 的 v3 React 打印组件模式；实际锁定版本在实施时确认。
- `read-excel-file` 的浏览器 XLSX 读取能力与 MIT 许可证；当前实现只动态加载其 `read-excel-file/browser` 入口；历史 SheetJS 调研仅作为被替换方案记录，不再作为运行时依赖。
- [TraeWork 姓名贴打印工具参考页面](https://share.traecontent.cn/artifact/.ODC7B4-IHGJHN) 的模式划分、四步工作流提示、实时预览和打印提示，仅参考产品交互；不使用其代码、卡通素材或像素排版方式。

## 14. 优化后的实现边界

- 工作流由 `LabelWorkflowStepper` 管理当前步骤；`LabelPrintingDraftProvider` 在工作台根部提供单一配置表单会话，模板面板和校准面板共享原始值、触碰状态与错误。
- `LabelAppearance` 使用本机字体预设、标准 HEX 色值、纯色/本地图片背景、纯色外框和一至四行字段模型。输出默认只使用字段值；字段标题控制位于导入字段设置中，只有用户明确开启对应开关才输出标题。
- `LabelBackgroundEditor` 使用原生 Pointer Events、滑块和按钮完成会话级背景图拖动/缩放；背景图只保留当前 object URL 和受限变换参数，SVG/PDF/浏览器打印共用 `PrintScene`，PDF 通过 `SceneAssetRepository` 复用图片资源。
- 本地模板通过 `templateConfig.ts` 的版本化白名单导入、导出和保存；配置不能包含姓名、班级、文件名、背景图片或 object URL。
- 真实打印仍依赖浏览器打印对话框的 100% 缩放和背景图形选项；实体打印机的纸张进纸与毫米偏差必须在用户环境中校准，不能由 Web 页面宣称自动验证。
