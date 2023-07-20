import puppeteer from "puppeteer";
// fs
import fs from "fs";

export const createPdfAction = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false, timeout: 3000 });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("http://127.0.0.1:3000/admin/woo?fullscreen=true");

  const [btnFullScreen] = await page.$x("//button[@aria-label='fullscreen']");

  const hasInput = await page.$("#email");

  if (hasInput) {
    //   enter email address
    await page.type("#email", "admin@admin.de");
    await page.type("#password", "admin");
    // click login button
    await page.click("#submit-auth");
  }

  //   await browser.close();

  await page.waitForSelector("#pdf-invoice");

  const pdf = await page.pdf({
    format: "A4",
  });

  let headers = new Headers({ "Content-Type": "application/pdf" });

  await fs.writeFileSync("10111.pdf", pdf, "binary");

  return new Response(pdf, { headers });
};
