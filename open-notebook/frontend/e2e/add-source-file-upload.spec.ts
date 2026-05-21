import { expect, test } from '@playwright/test'
import path from 'path'

/**
 * Reproduces and guards the "Select file" button in Add Source dialog.
 * Run: npx playwright test e2e/add-source-file-upload.spec.ts
 */
test.describe('Add source file upload', () => {
  test('select file button opens picker and enables submit', async ({ page }) => {
    await page.goto('/notebooks')
    await page.getByText('测试笔记本').first().click()
    await page.waitForURL(/\/notebooks\//)

    await page.getByRole('button', { name: '添加来源' }).first().click()
    await page.getByRole('menuitem', { name: '添加来源' }).click()

    await expect(page.getByRole('dialog', { name: '添加新来源' })).toBeVisible()
    await page.getByRole('tab', { name: '上传文件' }).click()

    const selectButton = page.getByTestId('source-file-select-button')
    await expect(selectButton).toBeVisible()
    await expect(selectButton).toHaveText('选择文件')

    const fixturePath = path.join(__dirname, '..', 'test-fixtures', 'sample-upload.txt')
    const fileChooserPromise = page.waitForEvent('filechooser')
    await selectButton.click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(fixturePath)

    await expect(page.getByTestId('source-file-select-button')).toBeVisible()
    await expect(page.getByText('sample-upload.txt')).toBeVisible()
    await expect(page.getByRole('button', { name: '完成' })).toBeEnabled()
  })
})
