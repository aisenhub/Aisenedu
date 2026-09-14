# Verification Record：姓名贴打印系统 v3.1 升级

> 本文件由后续执行 agent 据实更新。计划生成时所有实施和验证均未开始；禁止预填“通过”、commit SHA、push 成功或物理验收结果。

## 1. 项目与基线

- 本次目标：实现 `docs/plans/Aisenedu_name-label-printing-v3-upgrade-plans/name-label-printing-v3-upgrade/00-master-plan.md` 定义的 Phase 0–6。
- 本次范围：软件主链、中文 PDF 字体资产、移动端预览/输入回归、校准 Profile UI、旧 renderer/offset 清理和自动化验证已完成；真实打印机重复性与物理验收仍未完成。
- GitHub 仓库：`aisenhub/Aisenedu`（执行时核对 remote）。
- 本地仓库绝对路径：`E:\Projects\Aisenedu`。
- 实施分支：`codex/name-label-printing-v2-upgrade`；已合并分支：`main`。
- 起始 commit：`2198471feead3e3ec2891c0ebf001b4ae1d48ca0`。
- 研究期远端 main 参考 SHA：`2198471feead3e3ec2891c0ebf001b4ae1d48ca0`（仅参考，不能替代执行时读取）。
- 初始 `git status --short`：`?? docs/plans/`；该计划目录为用户已有文件，未删除或覆盖。
- 初始未提交修改及归属：除用户已有的 `docs/plans/` 外，工作树中的本轮修改均为本次 v3.1 实施内容。
- Node/pnpm/OS/浏览器环境：Windows PowerShell；Node `v24.19.0`；pnpm `v11.24.0`；Playwright Chromium。
- 已知基线失败：无；基线 build、lint、Vitest 均通过。
- 架构文档实际本地路径：`docs/NAME_LABEL_PRINTING_ARCHITECTURE.md`。

## 2. 阶段状态总表

允许状态：`未开始 / 进行中 / 已阻塞 / 验证失败 / 验收通过待推送 / 已交付`。

| 阶段 | 名称 | 状态 | 已完成内容 | 剩余/前置 | 代码 commit | Push | GitHub link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 基线、隐私、研究 Gate | 已交付 | 基线核对、隐私迁移、GitHub 参考记录、PDF/CJK 能力 Gate 记录 | 无软件剩余；物理验证另计 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |
| 1 | Domain / PhysicalTemplate / Layout | 进行中 | PhysicalTemplate、origin/pitch、纯分页与兼容迁移 | 物理模板仍需真实纸材验证 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |
| 2 | TextLayout / Scene | 已交付 | 字体测量、TextLayout、Scene、共享 asset repository、overflow 诊断 | 无软件剩余；CJK 资产已接入 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |
| 3 | SVG Preview / Browser fallback | 进行中 | SVG 预览、clip、背景图、Browser Print 明确兼容路径 | 需真实浏览器打印对照 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |
| 4 | Vector PDF | 进行中 | ASCII/CJK Scene→pdf-lib 向量 PDF、精确 MediaBox、PrintScaling.None、失败恢复、字体嵌入测试 | 真实打印仍未验证 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |
| 5 | Diagnostic Calibration | 进行中 | Device Geometry、Gate 0/1/2、translation→affine 拟合、Profile scope 与 PDF 应用 | 真实打印机至少 3 次重复测量未完成 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |
| 6 | Output cutover / cleanup / final validation | 进行中 | PDF 主 CTA、Browser Print fallback、旧路径清理、文档/隐私/响应式/E2E 回归、ASCII/CJK PDF benchmark、按需加载网络测试 | 双打印机物理验收未完成；Edge/系统打印对话框未自动化 | `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c` | 已推送并合并 | [commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c) |

> “已交付” = 实施完成 + 该阶段必要验收实际通过 + 相关提交已成功 push 并确认远程包含。代码写完但没测、commit 没 push、或物理门槛尚未满足，都不能标“已交付”。

## 3. 阶段实施记录

### Phase 0

- 状态：已交付
- 开始/结束日期：2026-09-14 / 2026-09-14
- 实际修改文件：`stores/labelPrintSettingsStorage.ts`、`stores/useLabelPrintingStore.ts`、`reference/REFERENCE_PROJECT_INDEX.md`、本计划记录。
- 已实现行为：只持久化纸张、布局、外观和模板选择；旧 v1 数据迁移时主动丢弃姓名、原始导入行、背景 object URL、起始格和 offset；补充 pdf-lib/fontkit 与 CJK 资产 Gate 结论。
- 冻结/变更契约：长期设置 key 改为 `aisenedu.label-settings.v2`；姓名与导入行保留当前会话内存；校准 Profile 单独存储且不含学生数据。
- 与计划偏差：初始 Gate 记录曾为 CJK No-Go；后续已完成字体决策，采用官方 Noto Sans SC Regular 完整字体并保留许可证与哈希记录。为规避 pdf-lib/fontkit 的 CJK subset 在移动阅读器中解析成功但缺字的兼容性问题，中文 PDF 明确使用 `subset: false`；ASCII 仍使用标准字体。
- 新增依赖：`pdf-lib@1.17.1`、`@pdf-lib/fontkit@1.1.1`。
- 未完成/未验证：真实物理 PDF 打印。
- 关键失败/阻塞：无代码失败；CJK 资产与物理打印属于外部验收前置。
- 下一阶段 handoff：进入纯 PhysicalTemplate/Layout 链路，保留旧输入兼容层。

### Phase 1

- 状态：进行中
- 实际修改文件：`domain/physicalTemplate.ts`、`layout/createPageLayouts.ts`、`utils/templateConfig.ts`、`components/LabelTemplatePanel.tsx`。
- 已实现行为：模板采用 `originX/Y + pitchX/Y + label size + rows/columns`；布局只消费 mm 领域模型；UI 将 gap 派生展示为 X/Y 节距，并保留 v1 配置读取迁移。
- 契约/迁移：新增 `PhysicalTemplate`/`LabelProject`；旧 `PaperSettings`/`LabelLayout` 作为兼容输入，不再作为几何真相。
- 计划偏差：无实质偏差；旧 offset 作为迁移输入被剥离，不再属于 `LabelLayout`、表单、校验或分页主路径。
- 新增依赖：无。
- 未完成/未验证：真实供应商纸材的 `physicallyVerified` 尚未确认。
- Handoff：Scene 只消费 PageLayout，不从 DOM 重新推导几何。

### Phase 2

- 状态：已交付
- 实际修改文件：`text/fontRegistry.ts`、`text/measureText.ts`、`text/resolveTextLayout.ts`、`scene/types.ts`、`scene/buildPrintScene.ts`、`scene/assets.ts`、`scene/applyCalibration.ts`。
- Text/Scene 契约：采用共享 `TextLayout` 和 `RenderScene`；每个 Scene 只创建一个 Canvas measurer；renderer 不再负责换行/字号拟合；FontAssetRegistry 已接入本地 CJK PDF asset。
- 行为：预览、浏览器打印和 PDF 共享理想 Scene；背景图、遮罩、边框、文本和 overflow 都由 Scene 表达。
- 计划偏差：标准 PDF 字体仍只覆盖 ASCII；中文和无法嵌入的 preset 使用明确的授权中文 fallback，不静默读取系统字体。
- 未验证：字体资产的跨浏览器/跨打印机物理一致性。
- Handoff：SVG renderer 使用 Scene；PDF renderer 只在边界转换 mm→pt。

### Phase 3

- 状态：进行中
- 实际修改文件：`renderers/svg/renderSceneToSvg.ts`、`components/SvgPrintPreviewPage.tsx`、`components/PrintableSvgDocument.tsx`、`components/PrintPreview.tsx`、`components/PrintableCalibrationDocument.tsx`、`styles/print.css`、`hooks/useNameLabelPrint.ts`。
- SVG/Preview/Browser Print：SVG 使用 mm viewBox 与显式 clip；浏览器打印降级为带说明的兼容模式；原页面仍保留稳定骨架和重试/错误提示。
- 旧路径退出：删除无引用的 `LabelPageCanvas`、`PrintableLabelDocument`、旧 label-cell/calibration CSS；主预览/打印仅走 Scene/SVG。
- 未验证：真实打印对照与不同浏览器的打印对话框差异。
- Handoff：PDF 直接消费同一 Scene；浏览器路径不复用 PDF 校准 Profile。

### Phase 4

- 状态：进行中
- PDF 技术路线/库/版本：已验证并采用 `pdf-lib@1.17.1 + @pdf-lib/fontkit@1.1.1` 直接 Scene→PDF；PDF 页 MediaBox 精确由 mm 转换，ViewerPreferences 设置 `PrintScaling.None`。
- 字体资产与许可证：`NotoSansSC-Regular.otf` 随应用分发，8,331,336 bytes，SHA-256 见 `apps/web/src/features/label-printing/assets/fonts/SOURCE.md`，附官方 OFL 1.1 文本；实际嵌入中文 Scene 后 PDF 可重新读取。
- 实际修改文件：`renderers/pdf/renderSceneToPdf.ts`、`output/exportPdf.ts`、PDF 结构测试、`apps/web/package.json`、`pnpm-lock.yaml`。
- Benchmark：已完成 ASCII、CJK 和图片 Scene 的 1/20/100/200 页耗时/文件大小 benchmark；未测峰值内存。
- 未完成：物理打印。
- Handoff：正式 PDF 的 CJK 软件 Gate 已通过；物理验收仍保持未验证。

### Phase 5

- 状态：进行中
- Device page version：`device-geometry-v1`；9 个 marker、X/Y 尺、方格和安全框，独立于标签模板。
- Fitting policy/threshold source：`calibration/policy.ts` 集中管理；当前明确标记为软件 provisional，待真实打印机数据替换。
- Printer self-test：UI Gate 2 已要求选择“正常/歪斜/尚未执行”；歪斜会阻断拟合。
- Real repeatability samples：未验证；UI 要求至少 3 个完整点，advanced model 还要求至少 3 次重复样本。
- 实际修改文件：`calibration/deviceGeometryPage.ts`、`templateOverlayPage.ts`、`matrix.ts`、`fitCalibration.ts`、`diagnosis.ts`、`policy.ts`、`profileRepository.ts`、`components/PrintCalibrationPanel.tsx`。
- Profile persistence：只存设备/介质/纸张/方向/输出路径、矩阵和证据；当前 Profile 只应用于 scope 匹配的 PDF，不应用浏览器打印。
- Handoff：必须用真实设备测量替换 provisional 阈值后，才可宣称高级校准产品化完成。

### Phase 6

- 状态：进行中
- Cutover：主 CTA 已改为“生成打印 PDF”；Browser Print 明确降级为兼容模式；PDF 生成失败会保留项目状态并提示重试/兼容打印。
- Cleanup：主预览/正式输出已移出旧 Canvas/DOM 排版主链；无引用的旧组件、旧 label-cell/calibration CSS 与 offset 表单/校验已删除。
- Docs：README、姓名贴架构、项目架构、参考索引和本记录已同步。
- Privacy audit：已验证姓名、导入表格行和背景 object URL 不进入长期设置；导出的 PDF 是用户明确操作产生的本地成果。
- Bundle/network：生产构建显示 NameLabelPrinting 页面为独立 chunk，PDF renderer、fontkit 和 Noto 字体 asset 均未进入首页入口；Playwright 网络测试确认进入工具但未点击 PDF 时不请求重型资源，点击后才请求字体并下载正式 PDF。`agent-browser` CLI/CUA fallback 不可用，未完成该工具的 Network 面板检查。
- Two-printer physical acceptance：未验证。
- Template physicallyVerified：未标记；无真实纸材/双打印机证据。
- Handoff：软件交付候选已具备；仍需真实浏览器打印对照、至少两台打印机的物理验收和真实图片 PDF benchmark，完成后才能标记已交付。

## 4. 验证记录

每次验证追加一条，失败也保留，不要覆盖。

#### 2026-09-14 — Phase 0 — 基线与隐私迁移

- 被验证代码：branch `codex/name-label-printing-v2-upgrade` / commit `2198471feead3e3ec2891c0ebf001b4ae1d48ca0` 起始工作树 / working tree `modified`
- 环境：Windows PowerShell；Node `v24.19.0`；pnpm `v11.24.0`；Browser `Playwright Chromium`
- 命令/操作：核对 `git rev-parse --show-toplevel`、`git status --short`、remote、依赖与既有测试；检查旧 localStorage key 迁移测试。
- 退出码：`0`
- 结果摘要：初始只有用户已有 `docs/plans/` 未跟踪目录；没有发现基线失败；姓名、导入表格行、背景 object URL 不再进入新持久化设置。
- 失败详情：当时无代码失败；当时仓库尚未找到 CJK 字体资产，按当时状态记录为 No-Go，后续已由 2026-09-14 CJK Gate 记录解决。
- 修复措施：新增安全 settings serializer/storage 和 legacy migration；追加 GitHub 参考索引。
- 复测：包含在后续 19 文件/67 用例完整 Vitest 中。
- 覆盖范围：`unit / privacy / compatibility`
- 此结果在后续相关代码变化后是否仍有效：是；最终完整回归已复测。

#### 2026-09-14 — Phase 1–5 — Scene、SVG、PDF 与校准回归

- 被验证代码：branch `codex/name-label-printing-v2-upgrade` / working tree `modified`
- 环境：Windows PowerShell；Node `v24.19.0`；pnpm `v11.24.0`
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web exec tsc -b
  corepack pnpm --filter @aisenedu/web lint
  $env:CI='true'; corepack pnpm --filter @aisenedu/web test
  git diff --check
  ```
- 退出码：`0`
- 结果摘要：TypeScript、ESLint、空白检查通过；Vitest `19 passed / 67 passed`；覆盖 PhysicalTemplate/layout、TextLayout、Scene/SVG/PDF、隐私迁移、Device Geometry、calibration fit 和仿射 Scene transform。
- 失败详情：无代码测试失败。
- 修复措施：校准输入要求完整 X/Y；修正首个测量点直接输入的状态更新；Profile 去重保存并接入匹配 PDF scope。
- 复测：完成 E2E 与生产构建复测。
- 覆盖范围：`unit / component / privacy / compatibility / performance`
- 此结果在后续相关代码变化后是否仍有效：是；最后一次小修复后已重新执行完整 Vitest、build、lint。

#### 2026-09-14 — Phase 4/6 — 生产构建与按需加载

- 被验证代码：branch `codex/name-label-printing-v2-upgrade` / working tree `modified`
- 环境：Windows PowerShell；Node `v24.19.0`；pnpm `v11.24.0`
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web build
  ```
- 退出码：`0`
- 结果摘要：Vite `1975 modules transformed`，生产构建通过；`NameLabelPrintingPage` chunk `224.04 kB`（gzip `68.85 kB`），PDF renderer `3.98 kB`（gzip `2.02 kB`），fontkit `716.82 kB`（gzip `329.77 kB`），均未进入首页静态入口；Vite 仅对若干大 chunk 给出体积提示。
- 失败详情：无构建失败；fontkit 本身较大，仍按 PDF 导出动作动态加载。
- 修复措施：维持 route-level lazy loading，PDF/fontkit 使用动态 import。
- 复测：build 内置 `tsc -b` 已通过。
- 覆盖范围：`build / performance`
- 此结果在后续相关代码变化后是否仍有效：是；测量输入完整性校验后的最终 build 仍通过，chunk 以上述最终值为准。

#### 2026-09-14 — Phase 3/6 — 浏览器端核心流程

- 被验证代码：branch `codex/name-label-printing-v2-upgrade` / working tree `modified`
- 环境：Windows PowerShell；Playwright `Chromium`；2 workers
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web test:e2e
  ```
- 退出码：`0`
- 结果摘要：`5 passed (53.5s)`；首页进入工具、文本/CSV 导入、移动窄屏无意横向滚动、背景图打印文档同步、1000 条名单分页均通过。
- 失败详情：未安装 `agent-browser` CLI，且 CUA fallback 没有可用浏览器/网络请求失败；因此未完成 agent-browser Network 面板证据。
- 修复措施：使用 Playwright 项目既有 E2E 完成同等浏览器流程验证，并保留工具缺失记录。
- 复测：后续仅有持久化边界修正，已由针对性 privacy tests、TypeScript、Lint 和 build 覆盖；E2E 主流程本身未受 UI 影响。
- 覆盖范围：`e2e / responsive / compatibility`
- 此结果在后续相关代码变化后是否仍有效：是；后续变更仅修正无 UI 的安全持久化序列化，已做针对性复测。

#### 2026-09-14 — Phase 4/6 — CJK 字体资产与正式 PDF 下载

- 被验证代码：working tree `modified`；`fontRegistry.ts`、`renderSceneToPdf.ts`、本地 Noto Sans SC asset 与 Playwright smoke test
- 环境：Windows PowerShell；Node `v24.19.0`；Playwright Chromium；Vite dev server
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web exec vitest run src/features/label-printing/renderers/pdf/renderSceneToPdf.test.ts
  corepack pnpm --filter @aisenedu/web exec playwright test smoke.spec.ts --grep "首页不加载打印重型资源" --timeout=60000
  ```
- 退出码：`0`
- 结果摘要：本地 `NotoSansSC-Regular.otf` 8,331,336 bytes，SHA-256 `FAA6C9DF652116DDE789D351359F3D7E5D2285A2B2A1F04A2D7244DF706D5EA9`；OFL 1.1 许可证文本随 asset 保存；Vitest 中文 Scene→PDF `3 passed`，Playwright 确认首页/进入工具未请求 PDF、fontkit 或 Noto 字体，点击正式 PDF 后成功下载 `aisenedu-name-labels.pdf` 并请求 Noto 字体。
- 失败详情：无代码失败。
- 修复措施：ASCII systemSans 使用标准 Helvetica；中文和其他无合法 PDF 映射的字体使用明确的 Noto Sans SC 授权 fallback；中文嵌入使用完整字体以保证移动阅读器兼容性，字体仍仅在导出动作中加载。
- 覆盖范围：`unit / e2e / build / compatibility`
- 此结果在后续相关代码变化后是否仍有效：字体和 renderer 后续只做结构清理，完整测试/构建需以最新记录为准。

#### 2026-09-14 — 移动端回归 — 字号单位、输入显示与中文 PDF 兼容性

- 被验证代码：`renderSceneToSvg.ts`、`renderSceneToPdf.ts`、`PrintPreview.tsx`、SVG/PDF 回归测试、`smoke.spec.ts`
- 环境：Windows PowerShell；Node `v24.19.0`；Playwright Chromium；Vite dev server；视口 `375 × 812`
- 复现：输入 `其他文字` 后检查首个 SVG 文本节点，并执行正式 PDF 下载；同时检查页面横向滚动、浏览器错误和 Noto 字体请求。
- 根因：Scene/SVG 的 `viewBox` 单位是 `mm`，但 renderer 直接输出了以 `pt` 为单位的 `14pt` 字号；在 SVG 中它被按 CSS 像素解释，导致文字测量约 `130.65mm`，即使调到最小字号也会明显超出 `40mm` 标签。输入内容本身实际已存在，之前主要被过大文本裁剪，另外详情预览的选择标识不应依赖当前页的 cell id。
- 修复：SVG 边界将 `fontSizePt` 统一换算为 `mm` 用户单位；详情预览使用稳定的独立选中标识；E2E 增加输入文本和字号回归断言。CJK PDF 改为 `subset: false`，避免 pdf-lib/fontkit 子集 PDF 在部分移动阅读器中结构可读但字形缺失；ASCII 仍使用标准字体。
- 结果：修复后文本为 `姓名：其他文字`，字号属性为 `4.9389`，`getBBox()` 宽 `35.321mm`，小于标签宽 `40mm`；生成 PDF 为 `7,339,833 bytes`、1 页，可被 `PDFDocument.load()` 重新读取，确实请求 Noto 字体且无页面错误/横向溢出。
- 资源复用：跨 3 页共享同一 PNG 背景的 PDF 测试中，资源 `loadBytes` 调用次数为 `1`，确认图片只解码/嵌入一次。
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web exec vitest run src/features/label-printing/renderers/svg/renderSceneToSvg.test.ts src/features/label-printing/renderers/pdf/renderSceneToPdf.test.ts
  ```
- 退出码：`0`
- 结果摘要：针对性 Vitest `2 files / 5 tests passed`；浏览器回归确认姓名输入可见、字号与标签尺寸匹配、移动端无横向溢出，中文 PDF 可读取。
- 覆盖范围：`unit / e2e / responsive / compatibility / performance`
- 此结果在后续相关代码变化后是否仍有效：需以本记录后续的最终全量验证和 GitHub merge commit 为准。

#### 2026-09-14 — Bugfix final verification — 移动端预览与中文 PDF

- 被验证代码：上述缺陷修复后的 working tree，交付前最终状态
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web test
  corepack pnpm --filter @aisenedu/web test:coverage
  corepack pnpm --filter @aisenedu/web build
  corepack pnpm --filter @aisenedu/web lint
  corepack pnpm --filter @aisenedu/web test:e2e
  git diff --check
  node C:\Users\S1786\.codex\skills\impeccable\scripts\detect.mjs --json apps/web/src/features/label-printing/components/PrintPreview.tsx apps/web/src/features/label-printing/renderers/svg/renderSceneToSvg.ts
  ```
- 退出码：全部为 `0`
- 结果摘要：Vitest `19 passed / 63 passed`；V8 statements/lines `66.28%`、branches `74.33%`、functions `61.72%`；生产构建 `1975 modules transformed`，NameLabelPrinting chunk `225.82 kB`（gzip `69.32 kB`），PDF renderer `4.11 kB`（gzip `2.11 kB`），fontkit `716.82 kB`（gzip `329.77 kB`），Noto 字体仍为独立按需资源；ESLint 通过；Playwright `6 passed (27.5s)`；Impeccable detector 返回 `[]`。
- 失败详情：无代码失败；构建仅保留既有的少数大 chunk 体积提示。
- 结论：三项用户报告缺陷均有代码回归保护；中文 PDF 使用完整字体会使单页文件约 `7.34MB`，这是移动阅读器兼容性所需的明确取舍，且字体仍只在用户点击正式导出后加载。
- 物理边界：未执行实体打印；仍缺第二台普通打印机、目标标签纸和用户授权的耗材测试，因此不宣称物理验收完成。
- 覆盖范围：`unit / e2e / responsive / build / lint / privacy / performance / compatibility`
- 此结果在后续相关代码变化后是否仍有效：待 GitHub push/merge 完成后以最终 commit SHA 关联复核。

#### 2026-09-14 — Phase 5/6 — 旧路径退出、Profile 选择与网络证据

- 被验证代码：working tree `modified`；`PhysicalTemplate` layout 主入口、Profile picker、旧 renderer 清理、`smoke.spec.ts`
- 环境：Windows PowerShell；Node `v24.19.0`；pnpm `v11.24.0`；Playwright Chromium
- 命令/操作：
  ```bash
  corepack pnpm --filter @aisenedu/web test
  corepack pnpm --filter @aisenedu/web build
  corepack pnpm --filter @aisenedu/web lint
  corepack pnpm --filter @aisenedu/web exec playwright test smoke.spec.ts --grep "首页不加载打印重型资源" --timeout=60000
  git diff --check
  ```
- 退出码：`0`
- 结果摘要：Vitest `19 passed / 62 passed`；build `1975 modules transformed`，NameLabelPrinting 页面 `225.81 kB`（gzip `69.30 kB`），PDF renderer `4.11 kB`（gzip `2.10 kB`），fontkit `716.82 kB`（gzip `329.77 kB`），Noto asset 独立输出；lint、coverage 与 diff check 通过。旧 LabelPageCanvas/PrintableLabelDocument、旧 CSS、offset 入口已无引用；Profile repository 与匹配/停用测试通过。
- 失败详情：`agent-browser` CLI 不可用且 CUA fallback 无可用浏览器；该工具 Network 面板未验证。Playwright 同等网络断言通过。
- 覆盖范围：`unit / component / e2e / build / lint / privacy / performance / compatibility`
- 此结果在后续相关代码变化后是否仍有效：是；布局实现路径整理及字体文案调整后已重新通过完整 Vitest、coverage、build、lint 和 Playwright E2E。

#### 2026-09-14 — Phase 5 — 实体打印机清单核对

- 被验证代码：非代码只读环境核对
- 环境：Windows PowerShell；系统打印机枚举
- 命令/操作：`Get-Printer | Select-Object Name,PrinterStatus,WorkOffline,Type,PortName`
- 退出码：`0`
- 结果摘要：当前可见一台实体打印机 `Brother DCP-T426W Printer`（`Offline`），另有 Microsoft Print to PDF、XPS、Fax、OneNote 软件打印机；未发现第二台普通实体打印机。
- 失败详情：没有用户授权执行消耗纸张/墨水的实体打印；没有纸材 SKU、驱动版本、进纸方式和尺量结果，因此不填充 synthetic/physical sample。
- 结论：软件校准流程可继续使用；两台打印机、同配置三次重复、普通纸/目标介质和 Template Overlay 物理门槛保持未验证。
- 覆盖范围：`physical`

### 记录模板

#### YYYY-MM-DD HH:mm — Phase N — `<short purpose>`

- 被验证代码：branch `<...>` / commit `<...>` / working tree `<clean|modified>`
- 环境：OS `<...>`；Node `<...>`；pnpm `<...>`；Browser `<...>`
- 命令/操作：
  ```bash
  <actual command>
  ```
- 退出码：`未验证`
- 结果摘要：`未验证`
- 失败详情：`无 / ...`
- 修复措施：`无 / ...`
- 复测：`未验证`
- 截图/日志/fixture 路径：`未验证`
- 覆盖范围：`unit / component / e2e / build / lint / privacy / performance / physical / compatibility`
- 此结果在后续相关代码变化后是否仍有效：`待确认`

## 5. 物理打印记录

> 不得用 synthetic/E2E 填充本节。

### Device Geometry Sample 模板

- 日期：未验证
- Printer model：未验证
- Driver/version：未验证
- Paper/media：未验证
- Feed source：未验证
- Output path：未验证
- File/test page version：未验证
- PDF Actual Size/100%：未验证
- Sample index：未验证
- Printer self-test：未验证
- Marker measurements：未验证
- X ruler expected/actual：未验证
- Y ruler expected/actual：未验证
- Square/diagonal observation：未验证
- Fitted model：未验证
- RMS residual：未验证
- Repeatability：未验证
- Conclusion：未验证

### Template Overlay 模板

- PhysicalTemplate id/version：未验证
- Real stock/vendor/SKU：未验证
- Applied calibration profile：未验证
- origin match：未验证
- pitchX/pitchY match：未验证
- label size match：未验证
- Notes/photos local path：未验证
- Can mark physicallyVerified：未验证

## 6. 性能记录

### Layout 10k

- commit/environment：`codex/name-label-printing-v2-upgrade`；Windows PowerShell；Node `v24.19.0`；Vitest jsdom
- command：`$env:CI='true'; corepack pnpm --filter @aisenedu/web test -- src/features/label-printing/services/nameLabelPerformance.test.ts`
- result：`1 passed`；测试体包含 10,000 条合成名单清洗与分页，并保留 `<1000ms` 断言；Vitest 该文件报告约 `58ms`。

### PDF generation

| Pages | Scene/labels | Browser/machine | Time | File size | Peak memory method/value | Result |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | 默认 4×13 标签、ASCII 文本 Scene | Windows/Node/Vitest | 470.8 ms | 3.6 KiB | 未测 | 通过；首次动态加载含初始化开销 |
| 20 | 默认 4×13 标签、ASCII 文本 Scene | Windows/Node/Vitest | 372.0 ms | 56.9 KiB | 未测 | 通过 |
| 100 | 默认 4×13 标签、ASCII 文本 Scene | Windows/Node/Vitest | 1714.5 ms | 281.3 KiB | 未测 | 通过 |
| 200 | 默认 4×13 标签、ASCII 文本 Scene | Windows/Node/Vitest | 3228.0 ms | 562.0 KiB | 未测 | 通过；未宣称 streaming |

### CJK PDF generation

| Pages | Scene/labels | Browser/machine | Time | File size | Peak memory method/value | Result |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | 4×13 标签、中文文本 Scene | Windows/Node/Vitest | 2284.3 ms | 7169.5 KiB | 未测 | 通过；完整字体首次嵌入 |
| 20 | 4×13 标签、中文文本 Scene | Windows/Node/Vitest | 2390.8 ms | 7225.7 KiB | 未测 | 通过 |
| 100 | 4×13 标签、中文文本 Scene | Windows/Node/Vitest | 4149.8 ms | 7461.7 KiB | 未测 | 通过 |
| 200 | 4×13 标签、中文文本 Scene | Windows/Node/Vitest | 6711.0 ms | 7755.6 KiB | 未测 | 通过；未宣称 streaming |

> CJK benchmark 使用临时 Vitest fixture，direct Scene→PDF 并使用完整 Noto Sans SC Regular；文件大小提升是为换取移动 PDF 阅读器兼容性。结果用于趋势观察，不作为跨机器 SLA。

### CJK + image PDF generation

| Pages | Scene/labels | Browser/machine | Time | File size | Image loads | Result |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | 4×13 标签、中文文本 + 共享 PNG | Windows/Node/Vitest | 2284.3 ms | 7169.5 KiB | 1 | 通过 |
| 20 | 4×13 标签、中文文本 + 共享 PNG | Windows/Node/Vitest | 2390.8 ms | 7225.7 KiB | 1 | 通过 |
| 100 | 4×13 标签、中文文本 + 共享 PNG | Windows/Node/Vitest | 4149.8 ms | 7461.7 KiB | 1 | 通过 |
| 200 | 4×13 标签、中文文本 + 共享 PNG | Windows/Node/Vitest | 6711.0 ms | 7755.6 KiB | 1 | 通过；未宣称 streaming |

> 图片基准使用有效 PNG 资源并在每页引用同一 `assetId`；`SceneAssetRepository`/PDF image cache 在每个 PDF 内只加载一次。未测峰值内存。结果用于趋势观察，不作为跨机器 SLA。

不要因不同机器结果不一致就虚构统一 SLA；记录条件和趋势。

## 7. GitHub 交付记录

每阶段可以一条 code push + 一条 verification docs push。

### 2026-09-14 — v3.1 软件提交与 main 合并

- Phase：Phase 0–6 软件实现（Phase 1/3/4/5/6 的实体打印门槛仍保持进行中）
- Branch：`codex/name-label-printing-v2-upgrade` → `main`
- Code commit SHA：`a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c`
- Commit message：`feat: upgrade name label printing pipeline`
- Push command/result：`git push -u origin codex/name-label-printing-v2-upgrade` 成功
- Remote contains SHA：已验证；远端分支指向 `a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c`
- GitHub commit/branch link：[feature commit](https://github.com/aisenhub/Aisenedu/commit/a5477b04f7261e2ecf54a2f23c7c289b32bb7d7c)，[feature branch](https://github.com/aisenhub/Aisenedu/tree/codex/name-label-printing-v2-upgrade)
- Merge commit SHA：`20059ecadabbf663474c7286f93e95d908b7386c`
- Merge/push command/result：`git merge --no-ff ...` 成功；`git push origin main` 成功
- Remote `main` contains SHA：已验证；远端 `main` 指向 `20059ecadabbf663474c7286f93e95d908b7386c`
- GitHub main link：[merge commit](https://github.com/aisenhub/Aisenedu/commit/20059ecadabbf663474c7286f93e95d908b7386c)，[main](https://github.com/aisenhub/Aisenedu/tree/main)
- Verification-record update commit：`c1b8fd42c8ea026a4db0832bb2d135e4b5702971`，已在 `main` 上提交并成功推送。
- Push failure/retry：无。

## 8. 交接信息

### 当前交接

- 下一阶段从哪里开始：真实设备重复测量和最终物理验收。
- 必须先解决的问题：在用户提供/授权纸材和设备条件后，用至少两台普通打印机完成 Device Geometry 与 Template Overlay 对照，并记录驱动、进纸、介质和尺量数据。
- 可以直接复用：`PhysicalTemplate → PageLayout → TextLayout/RenderScene → SVG/PDF` 主链、safe settings storage、Device Geometry v1、calibration fit/profile scope 和既有导入/UI/E2E。
- 不应重复实施：不要恢复姓名持久化、不要让 renderer 重新排版、不要把校准写回模板、不要把 Browser Print 当作正式 PDF 主链。
- 当前未提交修改及归属：本轮代码与已选入交付的文档均已提交并推送；用户已有计划目录中未修改的原始文件仍保持未跟踪，未删除、未覆盖、未擅自纳入本次提交。
- 需要用户决定事项：是否授权使用当前 Brother DCP-T426W 消耗纸张/墨水执行实体打印；并提供第二台普通打印机、目标标签纸材/供应商 SKU、进纸方式和测量结果后再冻结 calibration policy 阈值。

## 9. 记录一致性规则

- 新 agent 接手先读本文件，再核对 Git/实际代码。
- 若 commit/link/status 与 Git 不一致，先更正本文件。
- 不把“计划运行”的命令填成“已运行”。
- 相关代码在一次验证后改变，必须复测或注明旧验证不再覆盖。
- 保留关键失败及修复链路，不删掉失败历史。
