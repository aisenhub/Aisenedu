import { describe, expect, it } from 'vitest'
import { asMm } from '../types'
import { createDeviceGeometryPage, DEVICE_GEOMETRY_PAGE_VERSION } from './deviceGeometryPage'

describe('createDeviceGeometryPage', () => {
  it('生成与标签模板无关的九点设备几何测试页', () => {
    const page = createDeviceGeometryPage({ size: 'A4', orientation: 'portrait', widthMm: asMm(210), heightMm: asMm(297), marginTopMm: asMm(0), marginRightMm: asMm(0), marginBottomMm: asMm(0), marginLeftMm: asMm(0) })
    expect(page.version).toBe(DEVICE_GEOMETRY_PAGE_VERSION)
    expect(page.expectedMarkers).toHaveLength(9)
    expect(page.scene.pages[0].widthMm).toBe(210)
    expect(page.scene.pages[0].heightMm).toBe(297)
    expect(page.scene.pages[0].nodes.length).toBeGreaterThan(20)
  })
})
