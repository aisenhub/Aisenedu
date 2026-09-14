import type { LabelAppearance } from '../types'

export type SceneAsset = Readonly<{ assetId: string; url: string; mimeType?: string; loadBytes?: () => Promise<Uint8Array> }>

export class SceneAssetRepository {
  private readonly assets = new Map<string, SceneAsset>()

  register(asset: SceneAsset) {
    this.assets.set(asset.assetId, asset)
    return asset.assetId
  }

  get(assetId: string) { return this.assets.get(assetId) }
  getUrl(assetId: string) { return this.assets.get(assetId)?.url ?? (assetId.startsWith('blob:') || assetId.startsWith('data:') || assetId.startsWith('http') ? assetId : undefined) }
  async loadBytes(assetId: string) {
    const asset = this.assets.get(assetId)
    if (asset?.loadBytes) return asset.loadBytes()
    const url = this.getUrl(assetId)
    if (!url) throw new Error(`背景资源不可用：${assetId}`)
    const response = await fetch(url)
    if (!response.ok) throw new Error('背景图片读取失败，请重新选择图片。')
    return new Uint8Array(await response.arrayBuffer())
  }

  release(assetId: string) { this.assets.delete(assetId) }
  clear() { this.assets.clear() }
}

export function createSceneAssetsFromAppearance(appearance: Pick<LabelAppearance, 'backgroundMode' | 'backgroundImage'>) {
  const repository = new SceneAssetRepository()
  const image = appearance.backgroundMode === 'image' ? appearance.backgroundImage : undefined
  if (image) repository.register({ assetId: `background:${image.objectUrl}`, url: image.objectUrl, mimeType: image.mimeType })
  return repository
}
