import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('menuitem').click()
  await page.getByRole('link', { name: 'Members' }).click()
  await page
    .locator('div')
    .filter({
      hasText:
        /^Megumi Shimabukuro1991年うまれ。ソフトウェアエンジニア🧑‍💻View Profile$/,
    })
    .getByRole('button')
    .click()
})
