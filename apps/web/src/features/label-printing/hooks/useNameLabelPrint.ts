import { useCallback, type RefObject } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { PaperSettings } from '../types'
import { createPrintPageStyle, waitForPrintableImages } from '../services/labelPrintService'

type NameLabelPrintOptions = Readonly<{
  contentRef: RefObject<HTMLDivElement | null>
  documentTitle: string
  paper: PaperSettings
  canPrint: boolean
}>

export function useNameLabelPrint({ canPrint, contentRef, documentTitle, paper }: NameLabelPrintOptions) {
  const setPrintStatus = useLabelPrintingStore((state) => state.setPrintStatus)
  const print = useReactToPrint({
    contentRef,
    documentTitle,
    onAfterPrint: () => setPrintStatus('idle'),
    onBeforePrint: async () => { await waitForPrintableImages(contentRef.current); setPrintStatus('printing') },
    onPrintError: (_location, error) => setPrintStatus('error', error instanceof Error ? '打印未能启动，请检查浏览器打印权限后重试。' : '打印未能启动，请重试。'),
    pageStyle: createPrintPageStyle(paper),
    printIframeProps: { referrerPolicy: 'no-referrer' },
  })

  const printDocument = useCallback(() => {
    if (!canPrint) {
      setPrintStatus('error', '请先导入姓名并修正排版参数后再打印。')
      return
    }
    setPrintStatus('printing')
    print()
  }, [canPrint, print, setPrintStatus])

  return { printDocument }
}
