const puppeteer = require('puppeteer')
const { expect } = require('chai')
require('dotenv').config()

const { login } = require('./index.js')

describe('Login', function () {
  it('Response is 200', async function () {
    const browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process'
      ]
    })

    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36')
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const isAbortType = type => ['image', 'stylesheet', 'font'].includes(type)
      isAbortType(request.resourceType()) ? request.abort() : request.continue()
    })

    await login(
      page,
      process.env.RMS_SHOP_ID,
      process.env.RMS_SHOP_PASSWORD,
      process.env.RMS_USER_ID,
      process.env.RMS_USER_PASSWORD,
    )

    const response = await page.goto('https://mainmenu.rms.rakuten.co.jp', { waitUntil: 'load' })
    const status = await response.status()
    expect(status).to.equal(200)

    await browser.close()
  })
})
