import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5001');
  const rect = await page.evaluate(() => {
    const el = document.querySelector('.app-header h1');
    return JSON.parse(JSON.stringify(el.getBoundingClientRect()));
  });
  console.log(rect);
  await browser.close();
})();
