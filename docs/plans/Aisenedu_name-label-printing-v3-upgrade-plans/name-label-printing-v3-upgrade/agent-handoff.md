# Agent Handoff：执行入口与稳定规则

## 1. 可直接复制给执行 agent 的完整提示词

```text
你正在 Aisenedu 仓库执行“姓名贴打印系统 v3.1 升级”。这是一项分阶段实现任务，不要重新发散架构。

输入：
- 本地项目：先运行 `git rev-parse --show-toplevel` 获取，不要猜路径。
- 目标模块：apps/web/src/features/label-printing/
- 计划目录：docs/plans/Aisenedu_name-label-printing-v3-upgrade-plans/name-label-printing-v3-upgrade/
- 架构文档：由用户提供的 `Aisenedu_姓名贴打印系统目标架构_v3.1_校准系统增强版.docx` 实际本地路径；若仓库内已有同等内容的 Markdown/文档，也要核对版本。
- GitHub：aisenhub/Aisenedu

开始前必须：
1. 阅读根 AGENTS.md。
2. 阅读计划目录的 README.md、00-master-plan.md、shared-contracts.md、architecture-coverage-matrix.md。
3. 阅读 verification-record.md，先了解已经完成/失败/阻塞的事实。
4. 阅读当前要执行的阶段文档及其上游阶段交接。
5. 重新核对实际代码、分支和工作区：
   git rev-parse --show-toplevel
   git remote -v
   git branch --show-current
   git rev-parse HEAD
   git status --short
6. 如果记录与代码不一致，先查明原因并修 verification-record；不要盲目续做。
7. 不覆盖或丢弃用户/其他 agent 的未提交修改。

架构硬约束：
- Physical Document / Scene-first；SVG/PDF 都是 renderer，不是 layout truth。
- domain 物理单位 mm；PDF point/y-axis 只在 PDF renderer 边界转换。
- PhysicalTemplate = paper + label size + origin + pitch + rows/columns。
- firstLabelIndex 属于会话 Project，不属于 template。
- LayoutEngine 纯函数，不读 DOM、renderer、calibration、preview scale。
- TextLayout 必须在 renderer 前完成，并使用真实 font metrics。
- Preview/PDF 共享 FontAssetRegistry；PDF 不允许 silent font fallback。
- Scene 只实现当前需要的 Rect/Text/Image/Group/clip/opacity/transform，不建通用设计器。
- Calibration 独立于 template；只在 Ideal Scene 后、renderer 前应用一次 compensation matrix。
- 用户不直接编辑 raw scale/rotation/shear/affine。
- Device Geometry Page 与 template 无关；Template Overlay 只诊断 template geometry。
- 高级 rotation/affine correction 必须通过 printer self-test + >=3 repeatability；随机 skew 不保存固定补偿。
- Vector PDF 是正式目标；Browser Print 是 fallback。
- names/import rows/firstLabelIndex/background object URL 不得长期持久化或上传。
- 本期不做 QZ/ZPL/600DPI 默认 raster/相机扫描/通用 affine UI/packages 抽包。

执行范围：严格按当前阶段文档。不要提前实现后面阶段，也不要把 future enhancements 混进来。

依赖/实验规则：
- 新依赖前先确认现有依赖不能解决，并记录必要性和许可证。
- PDF 库/字体按 Phase 0/4 Gate 验证，不允许凭计划推荐直接安装并假定可行。
- Calibration residual/repeatability 阈值必须来自 synthetic + real measurement 数据；不要写拍脑袋 magic number。
- 没有物理打印机时，软件可以继续完成非依赖部分，但实体打印验收保持“未验证/已阻塞”，不得声称完成。

每阶段实施：
1. 检查该阶段列出的“已核实文件”是否仍存在/职责是否变化。
2. 先补/更新能证明行为的测试，再改代码；不要求教条 TDD，但必须有可验证证据。
3. 复用现有组件/服务，不复制业务规则。
4. 旧路径在阶段指定退出点删除/停用，避免双写和长期两套实现。
5. 运行阶段要求的实际命令；记录命令、环境、退出码和摘要到 verification-record.md。
6. UI 改动用真实浏览器/E2E 验证相关响应式尺寸、加载、空、错误、禁用和恢复状态。
7. 发生失败必须保留失败记录和修复/复测，不把历史改写成“从未失败”。

Git / GitHub：
- 沿用本任务已有工作分支。若没有专用分支，按项目规范创建一条，例如 `feat/name-label-printing-v3`，Phase 0–6 在同一分支连续推进。
- 不 force push、不重写共享历史、不合并 main、不创建 Release、不部署。
- 每阶段通过该阶段必要验证后：检查 diff → 更新 verification record → 提交含义明确的 commit(s) → push 到远程任务分支 → 确认远端包含 SHA → 写入 GitHub link。
- 可以先提交/push 阶段代码，再用单独 docs commit 记录 code SHA；不要为了让 commit 包含自己的 SHA 不断 amend。
- “已交付”只有在实现完成 + 必要验收通过 + 所有阶段必要提交 push 成功时才能填写。
- push 失败保留本地成果，状态不能写已交付，也不要直接进入下一阶段。

多 agent 协作：
- 集成人独占/串行处理：shared contracts、types/domain public exports、主 Zustand store、LabelPrintingWorkspace、最终 dependency/package lock 和跨阶段集成。
- Domain agent 可负责 domain/layout/migration tests。
- Text/Scene agent 可负责 text/scene/asset pure modules。
- Renderer agent 可负责 renderers/svg、renderers/pdf、output。
- Calibration math agent 可负责 pure matrix/fitting/diagnosis/profile serialization。
- UI agent 只在上游 contract 稳定后改 calibration/output components 和 E2E。
- 两个 agent 不得同时修改同一 owner 文件；集成人负责合并并重新运行跨模块测试。

停止边界：
- 当前阶段完成并 push 后先更新 handoff；除非任务明确让你连续执行下一阶段，否则按上游编排决定继续。
- 遇到会改变 frozen contract、造成数据丢失、许可证不可用、Vector PDF 技术路线失败且无备选、或需要用户选择产品行为的问题，记录证据与推荐方案；继续做不依赖部分。只有确实无法合理推断且会改变实施结果时再请求用户决策。
```

## 2. 文档阅读顺序

执行任何 Phase：

1. `AGENTS.md`（仓库真实版本）。
2. `verification-record.md`。
3. `00-master-plan.md`。
4. `shared-contracts.md`。
5. 当前 Phase 文档。
6. 上游 Phase 的 verification handoff。
7. v3.1 架构文档对应章节。
8. 受影响的真实代码/测试。

不要先看旧 MVP 文档就按旧设计实现；旧文档仅用于理解现状/冲突。

## 3. 阶段依赖

```text
0 → 1 → 2 → 3 → 4 → 5 → 6
```

允许的受控并行：

- Phase 2 contract 稳定后，SVG renderer、PDF spike/integration、calibration pure math 可由不同 agent 并行，但集成顺序仍按阶段门槛。
- Calibration UI/device page 不能早于 Scene/PDF contract。
- Cutover/cleanup 只能最后做。

## 4. 文件所有权建议

| Owner | 主要文件 | 说明 |
| --- | --- | --- |
| Integrator | `types.ts`、domain exports、store、`LabelPrintingWorkspace.tsx`、package/lock、docs integration | 串行编辑，解决冲突 |
| Domain | `domain/`、`layout/`、legacy migration/tests | 不改 renderer/UI |
| Text/Scene | `text/`、`scene/`、asset/test | 不改 store |
| SVG/PDF | `renderers/`、`output/` | 只消费 Scene contract |
| Calibration math | fitting/matrix/diagnosis/profile serialization | 不直接实现 UI |
| UI/E2E | calibration/output components、Playwright | contract 稳定后进入 |

## 5. Git 提交规范

建议 commit 示例（实际内容为准）：

- `phase0: remove student data from persistent label state`
- `phase1: migrate label geometry to origin and pitch`
- `phase2: introduce text layout and print scene`
- `phase3: render label preview and fallback print from svg`
- `phase4: add vector pdf label export`
- `phase5: add diagnostic printer calibration workflow`
- `phase6: make pdf the primary label print output`

阶段可以多个 commit，不必压成一个，但进入下一阶段前全部必要 commit 必须 push。

## 6. 接手任务核对清单

新的 agent 必须回答并写入 verification record：

- 当前本地 repo root？
- 当前 remote URL？
- 当前 branch？
- HEAD SHA？
- 工作区是否 clean？已有修改属于谁？
- 上一阶段远程 commit 是否确实存在？
- verification record 与代码是否一致？
- 当前阶段依赖的 contract/test 是否已存在并通过？
- 是否存在未解决 blocker？

如果不能确认，不得把旧记录当事实继续。
