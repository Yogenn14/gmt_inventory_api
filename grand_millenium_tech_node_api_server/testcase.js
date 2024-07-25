//adding Puppeteer library
const pt = require("puppeteer");
pt.launch().then(async (browser) => {
  //browser new page
  const p = await browser.newPage();
  //set viewpoint of browser page
  await p.setViewport({ width: 1000, height: 500 });
  //launch URL
  await p.goto("https://bstackdemo.com");
  //capture screenshot
  await p.screenshot({
    path: "browserstack-demo.png",
  });
  //browser close
  await browser.close();
});
