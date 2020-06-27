const puppeteer = require('puppeteer')
const { describe, before, after, it } = require('mocha')
const { expect } = require('chai')
require('dotenv').config()

const { login, getShopId } = require('./index.js')

describe('Login', function () {
  this.timeout(0)

  before(async function () {
    global.browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
    })

    global.page = await global.browser.newPage()
    await global.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36')
    await global.page.setRequestInterception(true)

    global.page.on('request', (request) => {
      const isAbortType = type => ['image', 'stylesheet', 'font'].includes(type)
      isAbortType(request.resourceType()) ? request.abort() : request.continue()
    })

    await login(
      global.page,
      process.env.RMS_SHOP_ID,
      process.env.RMS_SHOP_PASSWORD,
      process.env.RMS_USER_ID,
      process.env.RMS_USER_PASSWORD,
    )
  })

  after(async function () {
    await global.browser.close()
  })

  it('Status', async function () {
    const response = await global.page.goto('https://mainmenu.rms.rakuten.co.jp', { waitUntil: 'load' })
    const status = await response.status()

    expect(status === 200)
  })

  it('Correct shop', async function () {
    const shopId = await getShopId(global.page)

    expect(shopId === process.env.RAKUTEN_SHOP_URL)
  })
})
