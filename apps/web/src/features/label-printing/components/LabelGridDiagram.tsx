import type { LabelLayout, PaperSettings } from '../types'

type LabelGridDiagramProps = Readonly<{
  layout: LabelLayout
  paper: PaperSettings
}>

type MarkerProps = Readonly<{
  cx: number
  cy: number
  letter: string
}>

function Marker({ cx, cy, letter }: MarkerProps) {
  return (
    <g aria-hidden="true">
      <circle cx={cx} cy={cy} fill="var(--color-primary)" r="9" />
      <text dominantBaseline="central" fill="var(--color-primary-foreground)" fontSize="10" fontWeight="700" textAnchor="middle" x={cx} y={cy}>
        {letter}
      </text>
    </g>
  )
}

const cards = [
  { x: 100, y: 70 },
  { x: 168, y: 70 },
  { x: 100, y: 114 },
  { x: 168, y: 114 },
  { x: 100, y: 158 },
  { x: 168, y: 158 },
]

export function LabelGridDiagram({ layout, paper }: LabelGridDiagramProps) {
  return (
    <figure className="mt-4 rounded-xl border border-border bg-surface px-3 py-3" aria-labelledby="label-grid-diagram-title">
      <figcaption className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-text" id="label-grid-diagram-title">尺寸位置示意</span>
        <span className="text-[11px] text-text-muted">不按比例 · 以 2×3 为例</span>
      </figcaption>

      <svg aria-labelledby="label-grid-diagram-title" className="mt-3 h-auto w-full" role="img" viewBox="0 0 360 234">
        <defs>
          <marker id="label-grid-arrow" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="3" refY="3" viewBox="0 0 6 6">
            <path d="M 6 0 L 0 3 L 6 6 z" fill="var(--color-primary)" />
          </marker>
        </defs>

        {/* Paper and representative 2 × 2 label grid. */}
        <rect fill="var(--color-surface-raised)" height="172" rx="8" stroke="var(--color-border)" strokeWidth="1.5" width="232" x="64" y="40" />
        {cards.map(({ x, y }, index) => (
          <rect fill="var(--color-primary)" fillOpacity="0.08" height="28" key={index} rx="3" stroke="var(--color-primary)" strokeOpacity="0.55" width="54" x={x} y={y} />
        ))}

        {/* A · top margin */}
        <line markerEnd="url(#label-grid-arrow)" markerStart="url(#label-grid-arrow)" stroke="var(--color-primary)" strokeWidth="1.2" x1="84" x2="84" y1="41" y2="69" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="84" x2="100" y1="41" y2="41" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="84" x2="100" y1="69" y2="69" />
        <Marker cx={48} cy={55} letter="A" />

        {/* B · left margin */}
        <line markerEnd="url(#label-grid-arrow)" markerStart="url(#label-grid-arrow)" stroke="var(--color-primary)" strokeWidth="1.2" x1="65" x2="99" y1="86" y2="86" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="65" x2="65" y1="78" y2="94" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="99" x2="99" y1="78" y2="94" />
        <Marker cx={48} cy={86} letter="B" />

        {/* C · label width */}
        <line markerEnd="url(#label-grid-arrow)" markerStart="url(#label-grid-arrow)" stroke="var(--color-primary)" strokeWidth="1.2" x1="168" x2="222" y1="56" y2="56" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="168" x2="168" y1="56" y2="70" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="222" x2="222" y1="56" y2="70" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="222" x2="241" y1="56" y2="56" />
        <Marker cx={254} cy={56} letter="C" />

        {/* D · label height */}
        <line markerEnd="url(#label-grid-arrow)" markerStart="url(#label-grid-arrow)" stroke="var(--color-primary)" strokeWidth="1.2" x1="230" x2="230" y1="71" y2="97" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="222" x2="230" y1="71" y2="71" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="222" x2="230" y1="97" y2="97" />
        <Marker cx={250} cy={84} letter="D" />

        {/* E · horizontal gap */}
        <line markerEnd="url(#label-grid-arrow)" markerStart="url(#label-grid-arrow)" stroke="var(--color-primary)" strokeWidth="1.2" x1="155" x2="167" y1="196" y2="196" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="155" x2="155" y1="186" y2="196" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="167" x2="167" y1="186" y2="196" />
        <Marker cx={161} cy={211} letter="E" />

        {/* F · vertical gap */}
        <line markerEnd="url(#label-grid-arrow)" markerStart="url(#label-grid-arrow)" stroke="var(--color-primary)" strokeWidth="1.2" x1="240" x2="240" y1="143" y2="157" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="222" x2="240" y1="143" y2="143" />
        <line stroke="var(--color-primary)" strokeDasharray="2 2" strokeOpacity="0.65" strokeWidth="1" x1="222" x2="240" y1="157" y2="157" />
        <Marker cx={260} cy={150} letter="F" />
      </svg>

      <ul className="mx-auto mt-3 grid w-fit grid-cols-2 gap-x-5 gap-y-2 text-[11px] leading-4 text-text-muted">
        <li className="flex items-baseline gap-1.5"><strong className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">A</strong><span>上边距 {paper.marginTopMm} mm</span></li>
        <li className="flex items-baseline gap-1.5"><strong className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">B</strong><span>左边距 {paper.marginLeftMm} mm</span></li>
        <li className="flex items-baseline gap-1.5"><strong className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">C</strong><span>标签宽度 {layout.labelWidthMm} mm</span></li>
        <li className="flex items-baseline gap-1.5"><strong className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">D</strong><span>标签高度 {layout.labelHeightMm} mm</span></li>
        <li className="flex items-baseline gap-1.5"><strong className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">E</strong><span>横向间距 {layout.gapXmm} mm</span></li>
        <li className="flex items-baseline gap-1.5"><strong className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">F</strong><span>纵向间距 {layout.gapYmm} mm</span></li>
      </ul>
    </figure>
  )
}
