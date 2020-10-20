import { openBrowser, closeBrowser, goto, text, click, write, press, screenshot, waitFor } from "taiko";

describe("Account Web Application show identity", () => {
  jest.setTimeout(20000);

  beforeAll(async () => {
    const browserConfig =
      "--disable-gpu --disable-dev-shm-usage --disable-setuid-sandbox --no-first-run --no-sandbox --no-zygote";
    await openBrowser({
      args: ["--window-size=1280,800", ...browserConfig.split(" ")],
      headless: true,
    });
  });

  afterAll(async () => {
    await closeBrowser();
  });

  test("Launch the browser and go to the primary email identity show", async () => {
    expect.assertions(2);

    const website = process.env.URL || "";
    await goto(website);
    await waitFor("Video Games Database");
    expect(await text("Video Games Database").exists()).toBeTruthy();

    await click("Games");
    await waitFor("Fable II");
    expect(await text("Fable II").exists()).toBeTruthy();
  });
});
