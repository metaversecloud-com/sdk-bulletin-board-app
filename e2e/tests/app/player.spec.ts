import { Page } from "@playwright/test";
import { CONTAINER, PNG_DATA_URL, THEMES, anchors, board, expect, message, test } from "../../fixtures";

const pending = (page: Page) => page.locator("details", { has: page.getByText("Pending Approval") });

const openPending = async (page: Page) => {
  await pending(page).locator("summary").click();
  return pending(page);
};

const pngFile = (bytes = 0) => ({
  name: "drawing.png",
  mimeType: "image/png",
  buffer: bytes ? Buffer.alloc(bytes, 1) : Buffer.from(PNG_DATA_URL.split(",")[1], "base64"),
});

test.describe("first open", () => {
  test("initializes the board with the default theme and the scene's anchors", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(3) });
    await page.goto(world.url("/"));

    await expect(page.getByRole("heading", { name: THEMES.CHALK.title })).toBeVisible();
    await expect(page.getByText(THEMES.CHALK.subtitle)).toBeVisible();
    await expect(page.getByText("Upload your image:")).toBeVisible();
    expect(await world.keyAssetData()).toEqual({
      anchorAssets: ["anchor-1", "anchor-2", "anchor-3"],
      messages: {},
      theme: THEMES.CHALK,
      usedSpaces: [],
    });
  });

  test("a themeId preset on the key asset picks that theme's defaults", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(1), assetData: { themeId: "BULLETIN" } });
    await page.goto(world.url("/"));

    await expect(page.getByRole("heading", { name: THEMES.BULLETIN.title })).toBeVisible();
    await expect(page.getByText("Add your message:")).toBeVisible();
    expect((await world.keyAssetData()).theme).toEqual(THEMES.BULLETIN);
  });

  test("moves legacy board data from the world data object to the key asset", async ({ page, world }) => {
    const legacy = board({ theme: "BULLETIN", messages: [message("old-1")], usedSpaces: ["anchor-1"] });
    await world.seed({
      extraAssets: anchors(2),
      worldData: { scenes: { "scene-1": legacy } },
      scenes: { "scene-1": { id: "scene-1" } },
    });
    await page.goto(world.url("/"));

    await expect(page.getByRole("heading", { name: THEMES.BULLETIN.title })).toBeVisible();
    expect(await world.keyAssetData()).toEqual(legacy);
    await expect
      .poll(async () => (await world.state()).dataObject)
      .toMatchObject({ missingScenesDeleted: true, scenes: { "scene-1": expect.stringContaining("Data transferred") } });
  });

  test("shows the error when the scene has no anchors to place submissions on", async ({ page, world }) => {
    await world.seed();
    await page.goto(world.url("/"));

    await expect(page.locator(".text-error")).toContainText("Error");
    await expect(page.getByText("Upload your image:")).toBeVisible();
    expect(await world.keyAssetData()).toEqual({});
  });
});

test.describe("message themes", () => {
  test("a player submits a message and sees it pending", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(2), assetData: board({ theme: "BULLETIN" }) });
    await page.goto(world.url("/"));

    await page.locator("textarea").fill("Happy first day!");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect((await openPending(page)).getByText("Happy first day!")).toBeVisible();
    await expect(page.locator("textarea")).toHaveValue("");
    const messages = Object.values((await world.keyAssetData()).messages);
    expect(messages).toEqual([
      {
        id: expect.stringMatching(new RegExp(`^${world.profileId}-\\d+$`)),
        approved: false,
        displayName: world.displayName,
        message: "Happy first day!",
        userId: world.profileId,
        username: "e2e-player",
      },
    ]);
  });

  test("the form requires a message and caps it at 120 characters", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN" }) });
    await page.goto(world.url("/"));

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.locator("textarea")).toHaveAttribute("maxlength", "120");
    await page.locator("textarea").pressSequentially("x".repeat(130));
    await expect(page.locator("textarea")).toHaveValue("x".repeat(120));
    expect((await world.keyAssetData()).messages).toEqual({});
  });

  test("a player only sees their own pending messages", async ({ page, world }) => {
    await world.seed({
      extraAssets: anchors(1),
      assetData: board({
        theme: "BULLETIN",
        messages: [
          message("mine", { userId: world.profileId, message: "My note" }),
          message("theirs", { message: "Someone else's note" }),
          message("mine-approved", { userId: world.profileId, message: "Already approved", approved: true }),
        ],
      }),
    });
    await page.goto(world.url("/"));

    const list = await openPending(page);
    await expect(list.getByText("My note")).toBeVisible();
    await expect(list.getByText("Someone else's note")).toHaveCount(0);
    await expect(list.getByText("Already approved")).toHaveCount(0);
  });

  test("after three pending submissions the form is replaced by the limit notice", async ({ page, world }) => {
    const mine = ["a", "b", "c"].map((id) => message(id, { userId: world.profileId }));
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN", messages: mine }) });
    await page.goto(world.url("/"));

    await expect(page.getByText("You have reached the limit of maximum messages")).toBeVisible();
    await expect(page.locator("textarea")).toHaveCount(0);
  });

  test("a player deletes their own pending message", async ({ page, world }) => {
    await world.seed({
      extraAssets: anchors(1),
      assetData: board({
        theme: "BULLETIN",
        messages: [message("mine", { userId: world.profileId, message: "Delete me" }), message("theirs")],
      }),
    });
    await page.goto(world.url("/"));

    const list = await openPending(page);
    await list.locator(".tooltip", { hasText: "Delete" }).getByRole("button").click();

    await expect(pending(page)).toHaveCount(0);
    expect(Object.keys((await world.keyAssetData()).messages)).toEqual(["theirs"]);
  });
});

test.describe("image themes", () => {
  test("a player uploads a picture: it goes to S3 as a PNG and waits for approval", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(2), assetData: board({ theme: "CHALK" }) });
    await page.goto(world.url("/"));

    await page.locator('input[type="file"]').setInputFiles(pngFile());
    await page.getByRole("button", { name: "Submit" }).click();

    await expect((await openPending(page)).locator('img[src*="userUploads"]')).toHaveAttribute(
      "src",
      new RegExp(`^https://e2e_bucket\\.s3\\.amazonaws\\.com/userUploads/${world.profileId}-\\d+\\.png$`),
    );
    const [stored] = Object.values((await world.keyAssetData()).messages) as any[];
    const key = `userUploads/${stored.id}.png`;
    expect(stored.imageUrl).toBe(`https://e2e_bucket.s3.amazonaws.com/${key}`);
    expect((await world.s3()).objects).toEqual({ [key]: expect.objectContaining({ contentType: "image/png", isPng: true }) });
  });

  test("a picture over 1 MB is refused before upload", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "CHALK" }) });
    await page.goto(world.url("/"));

    await page.locator('input[type="file"]').setInputFiles(pngFile(1048577));
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.locator(".text-error")).toContainText("File is too big!");
    expect((await world.keyAssetData()).messages).toEqual({});
    expect((await world.s3()).log).toEqual([]);
  });

  test("deleting a pending picture also deletes it from S3", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "CHALK" }) });
    await page.goto(world.url("/"));
    await page.locator('input[type="file"]').setInputFiles(pngFile());
    await page.getByRole("button", { name: "Submit" }).click();
    const list = await openPending(page);
    await expect(list.locator('img[src*="userUploads"]')).toBeVisible();

    await list.locator(".tooltip", { hasText: "Delete" }).getByRole("button").click();

    await expect(pending(page)).toHaveCount(0);
    expect((await world.keyAssetData()).messages).toEqual({});
    const { objects, log } = await world.s3();
    expect(objects).toEqual({});
    expect(log.map((entry) => entry.action)).toEqual(["put", "delete"]);
  });
});

test.describe("admin access", () => {
  test("only admins see the settings button", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(1), assetData: board() });
    await page.goto(world.url("/"));
    await expect(page.getByRole("heading", { name: THEMES.CHALK.title })).toBeVisible();
    await expect(page.locator("button.icon-with-rounded-border")).toHaveCount(0);

    await world.seed({ isAdmin: true, extraAssets: anchors(1), assetData: board() });
    await page.reload();
    await page.locator("button.icon-with-rounded-border").click();
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  });

  test("game state reports the theme switcher and only provisioned themes", async ({ page, world }) => {
    await world.seed({ isAdmin: true, extraAssets: { ...anchors(1), ...CONTAINER }, assetData: board() });

    const state = await (await page.request.get(world.api("/game-state"))).json();

    expect(state).toEqual({
      theme: THEMES.CHALK,
      isAdmin: true,
      canSwitchScenes: true,
      availableThemeIds: ["BULLETIN", "BULLETIN_SKETCH", "CHALK", "ART", "PARKING", "GALLERY"],
    });
  });
});
