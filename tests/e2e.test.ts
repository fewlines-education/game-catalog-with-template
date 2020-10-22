import { openBrowser, closeBrowser, scrollDown, goto, link, text, click, waitFor } from "taiko";

describe("Account Web Application show identity", () => {
  jest.setTimeout(20000);

  beforeAll(async () => {
    await openBrowser({
      args: [
        "--window-size=1280,800",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-first-run",
        "--no-sandbox",
        "--no-zygote",
      ],
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
    expect(await text("Video Games Database").exists()).toBe(true);

    await click(link("platforms"));
    await waitFor("Xbox 360");
    await scrollDown("View Games");
    click(link("View Games"));

    await waitFor("The PlayStation 4 system opens the door");
    expect(await text("The PlayStation 4 system opens the door").exists()).toBeTruthy();
  });
});
