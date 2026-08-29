import { expect, test } from '@playwright/test'

test('首页可以发现并进入姓名贴工具', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '把教育中的重复工作，交给简单好用的工具。' })).toBeVisible()
  await page.getByRole('link', { name: '打开姓名贴工具' }).click()
  await expect(page).toHaveURL(/\/tools\/name-labels$/)
  await expect(page.locator('main h1', { hasText: '学生姓名贴' })).toBeVisible()
})
