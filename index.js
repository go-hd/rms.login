module.exports = { login, getShopId }

const selectors = {
  loginIdInput: 'input[name=login_id]',
  passwordInput: 'input[name=passwd]',
  historyCheckbox: 'input[name=HSTRYRLGN]',
  userIdInput: 'input[name=user_id]',
  userPasswordInput: 'input[name=user_passwd]',
  userHistoryCheckbox: 'input[name=HSTRYRUSR]',
  submitButton: 'button[type=submit],button[name=submit]',
  shopPageLink: '#com_header_shop_url',
}

const urls = {
  login: 'https://glogin.rms.rakuten.co.jp/?sp_id=1',
  mainmenu: 'https://mainmenu.rms.rakuten.co.jp',
}

/**
 * Login to RMS with puppeteer.
 *
 * @param page {import("puppeteer/lib/Page").Page} Puppeteer page instance.
 * @param shopId {String} RMS shop id.
 * @param shopPassword {String} RMS shop password.
 * @param userId {String} Rakuten id.
 * @param userPassword {String} Rakuten password.
 * @returns {Promise<void>}
 */
async function login (page, shopId, shopPassword, userId, userPassword) {
  await page.goto(urls.login, { waitUntil: 'networkidle2' })

  await page.type(selectors.loginIdInput, shopId)
  await page.type(selectors.passwordInput, shopPassword)
  await page.click(selectors.historyCheckbox)
  await submit(page)

  await page.type(selectors.userIdInput, userId)
  await page.type(selectors.userPasswordInput, userPassword)
  await page.click(selectors.userHistoryCheckbox)
  await submit(page)

  await submit(page)
  await submit(page)
}

/**
 * Wait for page transition by clicking the submit button.
 *
 * @param page {import("puppeteer/lib/Page").Page} Puppeteer page instance.
 * @returns {Promise<void>}
 */
function submit (page) {
  return Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click(selectors.submitButton)
  ])
}

/**
 * Get the shop ID.
 *
 * @param page {import("puppeteer/lib/Page").Page} Puppeteer page instance.
 * @returns {Promise<string>}
 */
async function getShopId (page) {
  await page.goto(urls.mainmenu)
  return page.evaluate(selector => {
    const shopPageURL = document.querySelector(selector).getAttribute('href')
    return shopPageURL.replace(/^https:\/\/www.rakuten.co.jp\/(.+)$/, '$1')
  }, selectors.shopPageLink)
}