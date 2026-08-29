import { expect, test } from '@playwright/test'

test('首页可以发现并进入姓名贴工具', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '把教育中的重复工作，交给简单好用的工具。' })).toBeVisible()
  await page.getByRole('link', { name: '打开姓名贴工具' }).click()
  await expect(page).toHaveURL(/\/tools\/name-labels$/)
  await expect(page.locator('main h1', { hasText: '学生姓名贴' })).toBeVisible()
})

test('姓名贴工作台支持文本名单和 CSV 列选择', async ({ page }) => {
  await page.goto('/tools/name-labels')
  await page.getByLabel('粘贴或输入姓名').fill('林小满\n周知行\n陈安然')
  await page.getByRole('button', { name: '使用这份名单' }).click()
  await expect(page.getByRole('button', { name: '打印姓名贴' })).toBeEnabled()
  await expect(page.getByText('第 1 / 1 页 · 页面按 mm 排版')).toBeVisible()

  await page.getByRole('button', { name: '清空名单' }).click()
  await expect(page.getByRole('dialog', { name: '清空当前名单？' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: '清空当前名单？' })).toBeHidden()
  await page.getByRole('button', { name: /^导入名单：/ }).click()

  await page.locator('input[type="file"]').setInputFiles({
    name: '名单.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('姓名,班级\n李明远,三年级', 'utf8'),
  })
  await expect(page.getByRole('combobox', { name: '姓名列' })).toBeVisible()
  await page.getByRole('combobox', { name: '姓名列' }).click()
  await page.getByRole('option', { name: '姓名' }).click()
  await page.getByRole('combobox', { name: '班级列' }).click()
  await page.getByRole('option', { name: '班级', exact: true }).click()
  await page.getByRole('button', { name: '确认字段选择' }).click()
  await page.getByRole('button', { name: /^导入名单：/ }).click()
  await expect(page.getByLabel('当前工作台状态').getByText('1 人')).toBeVisible()
  const firstLabel = page.locator('.label-text').first()
  await expect(firstLabel.locator('span')).toHaveText(['班级：三年级', '姓名：李明远'])
  await expect(firstLabel.locator('br')).toHaveCount(1)
  await page.getByRole('checkbox', { name: '显示“班级”标题' }).uncheck()
  await page.getByRole('checkbox', { name: '显示“姓名”标题' }).uncheck()
  await expect(firstLabel.locator('span')).toHaveText(['三年级', '李明远'])
})

test('姓名贴工作台在窄屏没有无意横向滚动', async ({ page }) => {
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/tools/name-labels')
    await page.getByLabel('粘贴或输入姓名').fill('林小满\n周知行\n陈安然')
    await page.getByRole('button', { name: '使用这份名单' }).click()
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth)
  }
  await page.setViewportSize({ width: 667, height: 375 })
  await page.goto('/tools/name-labels')
  await page.getByLabel('粘贴或输入姓名').fill('林小满\n周知行\n陈安然')
  await page.getByRole('button', { name: '使用这份名单' }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(667)
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/tools/name-labels')
  await page.getByLabel('粘贴或输入姓名').fill('林小满\n周知行\n陈安然')
  await page.getByRole('button', { name: '使用这份名单' }).click()
  await page.getByRole('button', { name: '打印比例' }).click()
  await expect(page.getByText('左右滑动查看整张纸。')).toBeVisible()
  const previewOverflow = await page.getByTestId('preview-scroll-container').evaluate((element) => element.scrollWidth > element.clientWidth)
  expect(previewOverflow).toBe(true)
  const documentOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(documentOverflow).toBe(false)
})
