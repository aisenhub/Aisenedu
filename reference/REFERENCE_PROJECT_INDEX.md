# 参考项目索引

本目录专门记录 Aisenedu 在项目、功能和业务模块设计前调研过的参考项目。参考项目不属于生产代码，不应直接复制到应用中。

## 强制记录要求

每次开始开发新的项目、功能或模块前，必须先在 GitHub 搜索成熟的开源项目、实现方案或可复用组件，并在本文件新增一条记录。至少填写：

- 调研日期
- 适用的项目、功能或模块
- GitHub 搜索关键词和搜索方向
- 参考项目名称与链接
- 许可证及其使用限制
- 实际查看的目录、文件、文档或实现
- 可复用的架构、数据模型、交互模式或代码结论
- Aisenedu 的采用方案
- 不采用的内容及取舍理由

## 参考原则

- 优先选择维护活跃、使用广泛、许可证清晰、技术栈兼容的成熟项目。
- 只研究与当前需求直接相关的文件和模块，不主动搬运整个仓库。
- 参考代码时遵守许可证、版权声明和 NOTICE 要求；优先复用设计思想和经过验证的模式。
- 如果没有找到合适的项目，也要记录搜索关键词、搜索范围和“不采用外部参考”的结论。
- 参考项目只是输入，不改变 Aisenedu 的产品定位、数据权限和安全边界。

## 记录模板

复制以下模板追加到文档末尾：

```markdown
## YYYY-MM-DD｜<项目/功能/模块>

- GitHub 搜索关键词：
- 搜索范围/方向：
- 参考项目：
- 参考链接：
- 许可证：
- 查看内容：
- 可复用结论：
- Aisenedu 采用方案：
- 不采用内容及取舍理由：
```

## 已使用的参考

## 2026-08-30｜姓名贴模板按内容行数分类

- GitHub 搜索关键词：`A4 printable label template rows columns multi-line text`、`web label generator content lines template`、`GitHub printable labels layout columns rows`
- 搜索范围/方向：浏览器端 A4 标签打印的模板参数、纸面列×行排列、单枚标签多行文本和不同内容密度下的版式选择。
- 参考项目：`Rigel-Computer/Label-Print-Generator`、`labelle-org/labelle`、`eikowagenknecht/asn-label-generator`
- 参考链接：https://github.com/Rigel-Computer/Label-Print-Generator；https://github.com/labelle-org/labelle；https://github.com/eikowagenknecht/asn-label-generator
- 许可证：本次仅参考公开 README、产品边界和布局思路，未复制代码；实际复用代码前仍需以各仓库当前 LICENSE、NOTICE 和依赖许可证为准。
- 查看内容：`Rigel-Computer/Label-Print-Generator` 的 A4 标签尺寸、列数、行数和浏览器打印预览说明；`labelle-org/labelle` 的多行文本节点和可调整内容布局说明；`eikowagenknecht/asn-label-generator` 的固定 A4 行列、标签尺寸、间距和页边距示例。
- 可复用结论：标签模板应同时描述物理标签尺寸、纸面列×行、间距和内容承载能力；多行内容需要独立于纸面行数表达，不能用自动换行替代明确的内容语义。
- Aisenedu 采用方案：模板卡片按一至四行内容分类，分别配套 A4 4×10、3×8、2×6、2×5 的默认尺寸与排列；保留用户后续按实物测量微调的 mm 参数，并将导入字段上限控制为四行内容。
- 不采用内容及取舍理由：不复制第三方模板代码、画布或打印实现；不继续把模板主分类写成单纯的列×行，避免教师无法从模板名称判断姓名、班级、备注等字段能否放入同一枚标签。

## 2026-08-30｜姓名贴表格导入后的多行多列编辑

- GitHub 搜索关键词：`React CSV importer tab-delimited textarea multi-column open source`、`CSV import preview map columns React mature library`、`Papa Parse CSV parsing worker header GitHub`
- 搜索范围/方向：浏览器端 CSV/TSV 分隔文本解析、导入列映射、导入后编辑与确认、表格数据在 React 表单中的保真回填。
- 参考项目：`mholt/PapaParse`、`tableflowhq/csv-import`、`beamworks/react-csv-importer`、`soldforaloss/ceesvee`
- 参考链接：https://github.com/mholt/PapaParse；https://github.com/tableflowhq/csv-import；https://github.com/beamworks/react-csv-importer；https://github.com/soldforaloss/ceesvee
- 许可证：Papa Parse 为 MIT；Tableflow CSV Import 的仓库许可证需以仓库当前 LICENSE 为准，本次只参考 README 流程；`react-csv-importer` 已归档且本次只参考 README，未复制代码；CEESVEE 的许可证和桌面产品边界不作为本次 Web 运行时依赖依据。
- 查看内容：Papa Parse README 中的分隔符、表头、本地解析和反向序列化能力；Tableflow 的列模板与完成回调；react-csv-importer 的上传、原始预览、列映射和确认流程；CEESVEE 的 Tab/CSV 分隔符识别和记录编辑思路。
- 可复用结论：多列文本应保留“换行=记录、Tab=字段”的稳定表示；导入流程应先完成列映射，再允许用户编辑，最后显式确认；字段标题需要与列值分开保存，避免回填时丢失列语义。
- Aisenedu 采用方案：导入确认后将已选字段值以 Tab 分隔、每条记录以换行分隔回填顶部编辑框；编辑框确认时按相同规则重新解析，并沿用本次导入的字段标题；导入按钮置于“使用这份名单”之前，支持“先导入、再修改、后确认”和直接输入两种路径。
- 不采用内容及取舍理由：不引入完整 CSV 导入 UI 或表格编辑器，避免额外依赖、样式冲突和首屏负担；不把逗号作为手动编辑框的列分隔符，避免与姓名/备注中的自然逗号冲突；不上传或持久化学生数据。

## 2026-08-29｜姓名贴班级与姓名双字段导入

- GitHub 搜索关键词：`React printable labels multiple fields name class`、`React CSV column mapping multiple fields`、`React spreadsheet import optional fields`
- 搜索范围/方向：多字段 CSV/XLSX 映射、可选字段、预览确认、浏览器本地导入和标签中多字段排版。
- 参考项目：`UgnisSoftware/react-spreadsheet-import`、`importcsv/importcsv`、`beamworks/react-csv-importer`、`evertsd/react-avery`
- 参考链接：https://github.com/UgnisSoftware/react-spreadsheet-import；https://github.com/importcsv/importcsv；https://github.com/beamworks/react-csv-importer；https://github.com/evertsd/react-avery
- 许可证：`react-spreadsheet-import` 为 MIT；`importcsv/importcsv` 的前端为 MIT、后端和管理端为 AGPL-3.0；`react-csv-importer` 本次只参考公开 README 流程，不复制代码；`react-avery` 本次只参考打印预览与表单/纸张分栏方向，不复制代码。
- 查看内容：字段 schema、列自动匹配与手动映射、可选字段、用户确认后提交、浏览器本地解析、真实比例打印预览和左表单/右纸张布局。
- 可复用结论：导入流程应将原始表格列映射到明确的业务字段；姓名作为必选字段，班级作为可选字段；用户确认映射后再一次性更新内存名单；预览和打印共享同一个字段渲染模型。
- Aisenedu 采用方案：扩展 `StudentName` 为可选 `className`，导入面板提供姓名列和班级列选择，班级标题/姓名标题由内容面板分别控制；继续使用现有本地 File API、内存 store、mm 布局和 DOM 打印。
- 不采用内容及取舍理由：不引入完整导入 UI 依赖，避免 Chakra/额外 CSS 与现有 shadcn/ui 冲突；不使用后端/AI 映射，避免学生信息离开浏览器；不把班级扩展为云端班级管理或持久化数据。

## 2026-08-29｜姓名贴 MVP 工具实现与测试边界

- GitHub 搜索关键词：`React printable labels mm A4 browser app name tags`、`SheetJS xlsx React browser import CSV labels`、`react-to-print React 19 printing documents`
- 搜索范围/方向：浏览器端标签排版、React 打印 iframe 生命周期、CSV/XLSX 导入边界、可访问表单与本地处理。
- 参考项目：`MatthewHerbst/react-to-print`、`SheetJS/sheetjs`、`UgnisSoftware/react-spreadsheet-import`、`dreambulka/Label-Generator-App`、`u8array/ZPLab`
- 参考链接：https://github.com/MatthewHerbst/react-to-print；https://github.com/SheetJS/sheetjs；https://github.com/UgnisSoftware/react-spreadsheet-import；https://github.com/dreambulka/Label-Generator-App；https://github.com/u8array/ZPLab
- 许可证：`react-to-print` 为 MIT；SheetJS CE `xlsx` 采用 Apache-2.0；其余项目本阶段只参考 README、产品边界和交互方向，未复制代码或资源，若后续需要复用代码必须单独核实其当前许可证与 NOTICE。
- 查看内容：`react-to-print` README/API/React 19 兼容说明；SheetJS 浏览器读取方向；导入组件的列匹配流程；本地标签生成器的 CSV/毫米尺寸边界；标签设计器的尺寸与浏览器编辑思路。
- 可复用结论：打印应使用独立内容 ref 和动态打印样式；导入应在服务层做受限解析、列选择和一次性提交；标签尺寸使用 mm；首页与工具编辑器保持路由和依赖边界。
- Aisenedu 采用方案：保持 React + Tailwind + shadcn/ui，先完成纯布局和可测的导入清洗，再动态加载 `xlsx` 与 `react-to-print`；采用内存数据、浏览器打印和真实尺寸 DOM 预览。
- 不采用内容及取舍理由：不复制第三方画布、条码、云端存储、静默打印或 PDF 方案；MVP 只服务教师批量姓名贴，并保留学生姓名不出浏览器的隐私边界。

## 2026-08-29｜首页与姓名贴工具入口设计

- GitHub 搜索关键词：`label printing web app React printable labels`、`name tag generator printable web`、`React Avery labels`
- 搜索范围/方向：姓名贴/标签打印 Web 应用的首页入口、浏览器本地处理、打印工具路由拆分和可打印编辑器的产品边界。
- 参考项目：`Hufnagels/svgdraw`、`ZaparooProject/zaparoo-designer`、`evertsd/react-avery`
- 参考链接：https://github.com/Hufnagels/svgdraw；https://github.com/ZaparooProject/zaparoo-designer；https://github.com/evertsd/react-avery
- 许可证：本次仅参考公开的产品定位、README 和仓库结构，未复制代码或资源；上述项目许可证未在本次入口设计中逐项核实，后续如需复用代码必须单独核实许可证、版本和 NOTICE 要求。
- 查看内容：仓库 README、项目定位、浏览器端标签编辑/打印方向、Avery 标签纸适配和本地工具边界说明。
- 可复用结论：首页应作为轻量工具目录与任务入口；姓名贴编辑器应独立为工具路由；首页只展示工具元数据和清晰入口，不预加载标签编辑器、表格解析或打印依赖。
- Aisenedu 采用方案：首页提供教育工具定位、姓名贴工具预览和唯一首个工具入口；使用 `/tools/name-labels` 独立路由，并通过 React `lazy`/动态导入加载工具页面，为后续 XLSX 解析、打印和 Worker 拆包预留边界。
- 不采用内容及取舍理由：不复制第三方编辑器、画布、模板市场或云端保存能力；姓名贴 MVP 严格遵循本地架构文档，优先保证教师批量录入、真实尺寸预览和浏览器打印，避免首页变重和学生信息外流。

## 2026-08-29｜学生姓名贴生成与打印

- GitHub 搜索关键词：`label printing web application`、`name tag generator print`、`Avery labels pdf generator`、`student name labels`、`label generator JavaScript`、`printable labels`、`label template pdf`
- 搜索范围/方向：浏览器标签纸排版、可打印标签前端、起始空白标签位置、React 打印、客户端 PDF 与 Excel/CSV 导入。
- 参考项目：`vivesweb/printable_labels_pdf`、`davidfischer/mtg-printable-set-label-frontend`、`ideadapt/label-templates`、`figuren-theater/label-printing`、`MatthewHerbst/react-to-print`、`SheetJS/sheetjs`、`parallax/jsPDF`、`exceljs/exceljs`
- 参考链接：https://github.com/vivesweb/printable_labels_pdf；https://github.com/davidfischer/mtg-printable-set-label-frontend；https://github.com/ideadapt/label-templates；https://github.com/figuren-theater/label-printing；https://github.com/MatthewHerbst/react-to-print；https://github.com/SheetJS/sheetjs；https://github.com/parallax/jsPDF；https://github.com/exceljs/exceljs
- 许可证：`vivesweb/printable_labels_pdf` 和 `figuren-theater/label-printing` 为 GPL-3.0，不复制代码；`react-to-print`、`jsPDF`、`ExcelJS` 为 MIT；SheetJS CE 为 Apache-2.0；其余仓库未核实到明确许可证，不复制代码。
- 查看内容：各项目 GitHub README、LICENSE、可用的 `package.json`/标签布局源码与仓库结构；重点检查了标签尺寸、纸张、行列、边距、间距、起始格、React 打印、中文 PDF 字体和 XLSX 处理说明。
- 可复用结论：采用“真实物理单位 + 统一分页算法 + 指定起始空白格 + 打印校准”的设计；采用 React 专用打印组件模式；导入层独立于 UI；直接浏览器打印优先于首版客户端 PDF。
- Aisenedu 采用方案：新增独立 `label-printing` feature，MVP 仅在浏览器内存保存姓名，使用 DOM 预览和打印媒介样式；打印采用 `react-to-print` v3 API，XLSX/CSV 采用按需加载的 `read-excel-file` 浏览器入口和 feature 内 CSV 解析。以文件/行列限制与必要的 Worker 降低本地解析风险。
- 不采用内容及取舍理由：不采用 PHP/WordPress/旧 wkhtmltopdf 技术栈；不复制 GPL 或许可证不清晰的代码；不在 MVP 引入 PDF、二维码、云端项目保存和班级管理，避免扩大范围或暴露学生信息。

## 2026-08-29｜学生姓名贴交互参考（非代码来源）

- 搜索范围/方向：已提供的在线姓名贴工具页面，用于评估教育场景中的输入流程、内容字段、输出模式、实时预览和打印提示。
- 参考项目：TraeWork 姓名贴打印工具
- 参考链接：https://share.traecontent.cn/artifact/.ODC7B4-IHGJHN
- 许可证：未提供可复用代码的许可证；仅作产品交互参考，不复制代码、视觉素材或卡通模板。
- 查看内容：四步工作流（录入、选模板、调参数、打印）、家长单人铺满/教师批量/折叠桌牌模式、拼音/班级/学号可选字段、模板选择、实时预览和 A4 打印提示。
- 可复用结论：采用非锁定的四步工作流提示、实时预览与显式打印说明；将单人铺满、桌牌、拼音、班级/学号和内置主题模板列为 MVP 后的独立扩展项。
- Aisenedu 采用方案：MVP 保持教师批量姓名贴、mm 排版、起始格和校准；不保存学生数据。后续能力以架构文档第 4.5 节为准逐项评估。
- 不采用内容及取舍理由：不使用像素作为打印布局单位；不上传自定义背景图、不默认收集班级/学号、不引入 PDF 导出或保存数据，避免打印不准、功能膨胀和学生信息暴露。

## 2026-08-29｜微信小程序姓名贴模板与校准参数（非代码来源）

- 搜索范围/方向：用户提供的小程序截图，用于评估标签纸模板卡、行列与内容容量、恢复默认、字段帮助、打印机兼容说明和校准教程。
- 参考项目：未提供产品名称或链接（仅用户提供截图）
- 许可证：未知；仅作产品交互参考，不复制代码、界面素材或文案。
- 查看内容：模板列表按“3 列 8 行 / 4 列 10 行”等网格与“每枚 2 行字 / 3 行字”内容容量分类；参数页含模板尺寸、页边距、标签外边距、恢复默认、校准教程、进纸方式和自定义纸张支持提示。
- 可复用结论：采用模板卡的网格和内容容量说明、当前模板恢复默认、字段级帮助、打印兼容说明与校准教程；将行数差异定义为独立排版预设，而非任意压缩字体。
- Aisenedu 采用方案：初版模板卡显示列×行、每张数量、内容行数、适用说明和验证状态；保留 mm 布局、起始格和 X/Y 校准。硬件相关字段只作为用户确认的说明，不做自动检测或控制。
- 不采用内容及取舍理由：不采用全量平铺的移动端参数表、单位不明的字号或浏览器无法控制的进纸方式开关；Web 使用预设优先、渐进展开和可验证的物理参数。

## 2026-08-29｜Aisenedu 初始工程架构

- GitHub 搜索关键词：本次架构初始化未单独执行 GitHub 项目检索；参考来源为已指定的本地项目
- 搜索范围/方向：React + Vite + TypeScript + Tailwind CSS + pnpm workspace 的项目工程规范
- 参考项目：AisenLens（本地参考项目）
- 参考链接：未提供外部链接；本地路径为 `E:\Projects\Aisenlens`
- 许可证：未核实（仅作为本地工程结构参考，未复制代码）
- 查看内容：`AGENTS.md`、`README.md`、根 `package.json`、`pnpm-workspace.yaml`、`apps/web/package.json`
- 可复用结论：采用 pnpm workspace、`apps/web` Web 应用边界、`app/pages/components/features/hooks/stores/services` 分层、Supabase 服务边界、shadcn/ui 按需组件规则和 Web 优先验收范围
- Aisenedu 采用方案：保留 Web-only 初始范围；将业务模块调整为教育领域的 `auth`、`teacher`、`parent`、`student`、`course`、`assessment`、`resource` 和 `analytics`
- 不采用内容及取舍理由：暂不引入桌面/移动端壳、视频场景引擎及 AisenLens 专属业务模块，避免超出当前教育 Web 平台范围

## 2026-08-29｜UI/UX 设计与审查技能历史调研（已停用）

- GitHub 搜索关键词：`AI UI UX design system React Tailwind shadcn skill`、`AI frontend design review audit accessibility responsive Codex skill`
- 搜索范围/方向：面向 React + Tailwind + shadcn/ui 的设计系统生成、UI/UX 设计指导、可访问性/响应式审查和 AI Coding Agent 技能
- 参考项目：UI UX Pro Max（`ui-ux-pro-max`）
- 参考链接：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- 许可证：MIT；复用其代码或文件时保留版权和许可证声明
- 查看内容：项目 README、安装说明、设计系统生成说明、React/shadcn/ui 支持说明和许可证
- 可复用结论：适合在新页面或新模块开始前生成产品类型匹配的布局、色彩、字体、交互和反模式检查建议；支持 React、Tailwind 和 shadcn/ui 方向
- Aisenedu 采用方案：不采用该技能；当前统一按 `AGENTS.md` 使用项目现有的 shadcn/ui 组件和 Tailwind token。
- 不采用内容及取舍理由：该条目仅保留为历史调研记录，不作为后续开发指令，也不再安装或调用该技能；教育产品的最终判断以项目组件规范、可访问性标准和实际角色验证为准。

## 2026-08-29｜UI 成品审查与视觉优化技能评估

- GitHub 搜索关键词：`AI frontend design review audit accessibility responsive Codex skill`、`Impeccable AI design skill 23 commands`
- 搜索范围/方向：面向已有 Web 页面进行视觉审查、可访问性、响应式、交互、排版和设计系统一致性检查
- 参考项目：Impeccable
- 参考链接：https://github.com/pbakaus/impeccable；官方站点：https://impeccable.style/
- 许可证：Apache-2.0；仓库同时包含 NOTICE 归属要求，使用代码或文件时按许可证和 NOTICE 执行
- 查看内容：项目 README、Codex 技能说明、`DESIGN.md` 设计系统说明、`audit`/`critique`/`polish` 等命令说明、CLI 检测说明和许可证
- 可复用结论：适合在已有页面或重要 UI 变更后做审查和优化；可以帮助发现层级、排版、色彩对比、响应式、焦点状态、动效和常见 AI UI 反模式问题，并可沉淀 `DESIGN.md`
- Aisenedu 采用方案：作为 UI 交付前的审查辅助，重点用于教师工作台、家长/学生任务页面、表格、表单、空状态、错误状态和移动窄屏验证；保留产品需求和无障碍标准作为最终判断依据
- 不采用内容及取舍理由：不对每个小改动都执行完整审查，避免流程过重；不允许审查工具擅自改变已确认的产品文案、业务流程、教育术语或权限行为

## 评估结论

UI/UX Pro Max 已停用，后续不作为开发或审查流程的一部分。Aisenedu 的界面实现统一遵循 `AGENTS.md` 中的现有 shadcn/ui 组件库、Tailwind token、产品需求、无障碍标准和人工验收要求。

Impeccable 的历史评估仅作为参考记录保留，不构成后续开发指令，也不替代项目现有组件规范和实际验收。

## 2026-08-29｜OPT-01 XLSX 解析器安全替换

- GitHub 搜索关键词：`browser xlsx parser JavaScript MIT read-excel-file GitHub`、`browser XLSX parser security JavaScript MIT alternative SheetJS GitHub`、`React browser spreadsheet import Web Worker`
- 搜索范围/方向：浏览器端 XLSX 读取、首工作表读取、ArrayBuffer/File API、Web Worker 支持、许可证、维护状态和解析包体积。
- 参考项目：`catamphetamine/read-excel-file`、`exceljs/exceljs`、`observablehq/xlsx`/SheetJS Community Edition。
- 参考链接：[read-excel-file](https://github.com/catamphetamine/read-excel-file)、[ExcelJS](https://github.com/exceljs/exceljs)、[SheetJS Community Edition](https://github.com/observablehq/xlsx)。
- 许可证：`read-excel-file` 为 MIT；ExcelJS 为 MIT；SheetJS Community Edition 为 Apache-2.0。实际采用依赖为 `read-excel-file@9.3.10`，许可证以其仓库和安装包 LICENSE 为准。
- 查看内容：`read-excel-file` README 的浏览器入口、`readSheet()` 首工作表行为、ArrayBuffer/File 输入、Web Worker 入口、错误类型、性能说明和 LICENSE；同时对比 ExcelJS 的维护/依赖体量说明与 SheetJS 当前浏览器解析/安全说明。
- 可复用结论：当前姓名贴只需要读取首个工作表的二维值，不需要样式、公式写回或完整工作簿编辑；应使用专用浏览器入口、保留动态加载和文件/行列上限，并为大文件预留 Worker 路径。
- Aisenedu 采用方案：用 `read-excel-file@9.3.10` 替换 `xlsx@0.18.5` 的用户上传解析路径；通过 `read-excel-file/browser` 动态导入，读取 `ArrayBuffer` 后交给现有表格模型；CSV 继续使用 feature 内受限解析器，不额外引入 CSV 依赖。
- 不采用内容及取舍理由：不采用 ExcelJS，当前只读二维表且其浏览器依赖体量和维护状态不如本需求合适；不继续使用 `xlsx@0.18.5`，避免将旧解析器保留在生产依赖和用户上传路径；不复制任何参考项目代码。

## 2026-08-29｜OPT-13 本地背景编辑与样式模型

- GitHub 搜索关键词：`React image crop component TypeScript Pointer Events MIT react-easy-crop`、`react-image-crop GitHub LICENSE TypeScript`、`native color palette local image background printable UI`
- 搜索范围/方向：React 图片裁切/缩放交互、移动端触摸、键盘替代操作、TypeScript、许可证、维护活跃度和打印前本地资源边界。
- 参考项目：`ValentinH/react-easy-crop`、`DominicTobias/react-image-crop`（当前仓库镜像/维护信息需以其主仓库为准）、`thegreatercurve/react-simple-crop`。
- 参考链接：[react-easy-crop](https://github.com/ValentinH/react-easy-crop)、[react-image-crop](https://github.com/DominicTobias/react-image-crop)、[react-simple-crop](https://github.com/thegreatercurve/react-simple-crop)。
- 许可证：`react-easy-crop` 为 MIT；`react-image-crop` 项目元数据标示 ISC；`react-simple-crop` 为 MIT。实际是否引入依赖仍需结合包体积、React 19 兼容性和打印 object URL 测试确认。
- 查看内容：`react-easy-crop` README 的拖动/缩放/旋转、移动端、键盘步进和自定义样式能力；其 `package.json` 的版本、许可证和副作用声明；`react-image-crop` 的 TypeScript/响应式裁切方向；`react-simple-crop` 的无依赖实现方向。
- 可复用结论：背景编辑需要“拖动 + 缩放 + 键盘/按钮替代”三类操作，裁切交互必须限制在代表性标签预览中；颜色选择可优先使用原生 `input[type=color]` 与项目色板，不必为单一颜色引入选择器依赖。
- Aisenedu 采用方案：先以原生 Pointer Events、按钮和范围滑块建立轻量会话级编辑模型；仅保存 MIME、临时 object URL、尺寸、缩放、偏移和遮罩等受限状态，预览和打印共享图层模型。
- 不采用内容及取舍理由：当前不直接引入第三方裁切组件，避免为单张全标签背景增加绝对定位样式和新 CSS 体系；若原生实现无法稳定完成手势、图片解码或打印克隆，再单独评估 MIT 的 `react-easy-crop`，不使用许可证或维护状态不清晰的代码。
