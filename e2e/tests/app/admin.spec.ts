import { Page } from "@playwright/test";
import { CONTAINER, KEY_ASSET_ID, THEMES, TopiaWorld, anchors, board, expect, message, test } from "../../fixtures";

const IMAGE_URL = "https://e2e_bucket.s3.amazonaws.com/userUploads/profile-someone-1.png";

const openAdmin = async (page: Page, world: TopiaWorld) => {
  await page.goto(world.url("/"));
  await page.locator("button.icon-with-rounded-border").click();
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
};

const section = (page: Page, title: string) => page.locator("details", { has: page.getByText(title, { exact: true }) });

const openSection = async (page: Page, title: string) => {
  await section(page, title).locator("summary").click();
  return section(page, title);
};

const field = (page: Page, label: string) => page.locator(`div:has(> label:text-is("${label}")) > :is(input, textarea, select)`);

const approve = (page: Page, world: TopiaWorld, messageId: string) =>
  page.request.post(world.api(`/admin/message/approve/${messageId}`));

const droppedWithUniqueName = async (world: TopiaWorld, uniqueName: string) =>
  (await world.assets()).filter((asset) => asset.uniqueName === uniqueName);

test.describe("pending messages", () => {
  test("lists every player's pending submission with who sent it", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({
        theme: "BULLETIN",
        messages: [
          message("m1", { message: "First note", displayName: "Ana", username: "ana99" }),
          message("m2", { message: "Second note", displayName: "Ben", username: "Ben" }),
          message("m3", { message: "Old note", approved: true }),
        ],
      }),
    });
    await openAdmin(page, world);

    const list = await openSection(page, "Pending Approval");
    await expect(list.getByText("First note")).toBeVisible();
    await expect(list.getByText("from Ana (ana99)")).toBeVisible();
    await expect(list.getByText("Second note")).toBeVisible();
    await expect(list.getByText("from Ben", { exact: true })).toBeVisible();
    await expect(list.getByText("Old note")).toHaveCount(0);
  });

  test("approving a message drops its background and text at the anchor", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "BULLETIN", anchorAssets: ["anchor-1"], messages: [message("m1", { message: "See you at recess" })] }),
    });
    await openAdmin(page, world);

    const list = await openSection(page, "Pending Approval");
    await list.locator(".tooltip", { hasText: "Approve" }).getByRole("button").click();
    await expect(section(page, "Pending Approval")).toHaveCount(0);

    // anchor-1 sits at (100, 200); DROPPABLE_ASSETS_BULLETIN offsets the image by (5, 6) and the text by (10, -20).
    expect(await droppedWithUniqueName(world, "scene-1-background-anchor-1")).toEqual([
      expect.objectContaining({
        assetId: "webImageAsset",
        layer0: "https://example.invalid/note.png",
        position: { x: 105, y: 206 },
        sceneDropId: "scene-1",
        isInteractive: true,
        interactivePublicKey: "e2e-public-key",
      }),
    ]);
    expect(await droppedWithUniqueName(world, "scene-1-text-anchor-1")).toEqual([
      expect.objectContaining({
        assetId: "textAsset",
        text: "See you at recess",
        position: { x: 110, y: 180 },
        textColor: "black",
        textSize: 14,
        textWidth: 150,
        isTextTopLayer: true,
        yOrderAdjust: 1000,
      }),
    ]);
    expect(await world.keyAssetData()).toMatchObject({ messages: {}, usedSpaces: ["anchor-1"] });
    await expect
      .poll(() => world.events("particles"))
      .toEqual([expect.objectContaining({ name: "purpleSmoke_puff", position: { x: 100, y: 200 }, duration: 2 })]);
  });

  test("approving on a text-only theme drops just the text", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "PARKING", anchorAssets: ["anchor-1"], messages: [message("m1", { message: "Bring snacks" })] }),
    });

    const response = await approve(page, world, "m1");

    expect(response.ok()).toBe(true);
    expect(await droppedWithUniqueName(world, "scene-1-background-anchor-1")).toEqual([]);
    // DROPPABLE_TEXT_PARKING: offset (0, -5), yellow, size 18.
    expect(await droppedWithUniqueName(world, "scene-1-text-anchor-1")).toEqual([
      expect.objectContaining({ text: "Bring snacks", position: { x: 100, y: 195 }, textColor: "yellow", textSize: 18 }),
    ]);
  });

  test("numeric text offsets in the theme config move the text like string ones", async ({ page, world }) => {
    test.fail(true, "EXP-432: numeric textOffsetX/Y are added but never assigned (handleApproveMessages.ts)");
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "BULLETIN_SKETCH", anchorAssets: ["anchor-1"], messages: [message("m1")] }),
    });

    await approve(page, world, "m1");

    // DROPPABLE_ASSETS_BULLETIN_SKETCH: textOffsetX 10, textOffsetY -20 (numbers); anchor-1 at (100, 200).
    expect(await droppedWithUniqueName(world, "scene-1-text-anchor-1")).toEqual([
      expect.objectContaining({ position: { x: 110, y: 180 } }),
    ]);
  });

  test("approving uses a free anchor, never one already taken", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(3),
      assetData: board({
        theme: "BULLETIN",
        anchorAssets: ["anchor-1", "anchor-2", "anchor-3"],
        usedSpaces: ["anchor-1", "anchor-3"],
        messages: [message("m1")],
      }),
    });

    await approve(page, world, "m1");

    expect(await droppedWithUniqueName(world, "scene-1-text-anchor-2")).toHaveLength(1);
    expect((await world.keyAssetData()).usedSpaces).toEqual(["anchor-1", "anchor-3", "anchor-2"]);
  });

  test("when every anchor is taken, approval rewrites an existing message", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: {
        ...anchors(1),
        "old-text": { id: "old-text", uniqueName: "scene-1-text-anchor-1", sceneDropId: "scene-1", text: "Old message" },
      },
      assetData: board({ theme: "BULLETIN", anchorAssets: ["anchor-1"], usedSpaces: ["anchor-1"], messages: [message("m1", { message: "Newest" })] }),
    });

    const response = await approve(page, world, "m1");

    expect(response.ok()).toBe(true);
    expect(await world.events("set-custom-text")).toEqual([expect.objectContaining({ assetId: "old-text", text: "Newest" })]);
    expect((await world.state()).assets["old-text"].text).toBe("Newest");
    expect(await world.keyAssetData()).toMatchObject({ messages: {}, usedSpaces: ["anchor-1"] });
  });

  test("long words are hyphenated so they wrap on the sign", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "BULLETIN", anchorAssets: ["anchor-1"], messages: [message("m1", { message: "Hi abcdefghijklmnopqrstuvwxyz!" })] }),
    });

    await approve(page, world, "m1");

    const [text] = await droppedWithUniqueName(world, "scene-1-text-anchor-1");
    expect(text.text).toBe("Hi abcdefghijklmnopqrst-\nuvwxyz!");
  });

  test("approving a picture paints it onto the anchor", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "CHALK", anchorAssets: ["anchor-1"], messages: [message("m1", { message: undefined, imageUrl: IMAGE_URL })] }),
    });
    await openAdmin(page, world);

    const list = await openSection(page, "Pending Approval");
    await list.locator(".tooltip", { hasText: "Approve" }).getByRole("button").click();
    await expect(section(page, "Pending Approval")).toHaveCount(0);

    expect(await world.events("set-webimage-layers")).toEqual([
      expect.objectContaining({ assetId: "anchor-1", bottom: IMAGE_URL, top: "" }),
    ]);
    expect(await world.keyAssetData()).toMatchObject({ messages: {}, usedSpaces: ["anchor-1"] });
  });

  test("if a stored anchor was deleted, approval re-reads the scene's anchors", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "BULLETIN", anchorAssets: ["anchor-gone"], messages: [message("m1")] }),
    });

    const response = await approve(page, world, "m1");

    expect(response.ok()).toBe(true);
    expect(await droppedWithUniqueName(world, "scene-1-text-anchor-1")).toHaveLength(1);
    expect(await world.keyAssetData()).toMatchObject({ anchorAssets: ["anchor-1"], usedSpaces: ["anchor-1"] });
  });

  test("approving an unknown message fails without touching the board", async ({ page, world }) => {
    await world.seed({ isAdmin: true, extraAssets: anchors(1), assetData: board({ theme: "BULLETIN", messages: [message("m1")] }) });
    const before = await world.keyAssetData();

    const response = await approve(page, world, "nope");

    expect(response.ok()).toBe(false);
    expect((await response.json()).message).toContain("Message not found");
    expect(await world.keyAssetData()).toEqual(before);
    expect(await world.events("particles")).toEqual([]);
  });

  test("rejecting a picture removes it and deletes the upload", async ({ page, world }) => {
    const id = `${world.profileId}-1`;
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(1),
      assetData: board({ theme: "CHALK", messages: [message(id, { message: undefined, imageUrl: IMAGE_URL }), message("m2")] }),
    });
    await openAdmin(page, world);

    const list = await openSection(page, "Pending Approval");
    await list.locator(".tooltip", { hasText: "Delete" }).first().getByRole("button").click();

    await expect(list.locator(".tooltip", { hasText: "Delete" })).toHaveCount(1);
    expect(Object.keys((await world.keyAssetData()).messages)).toEqual(["m2"]);
    expect((await world.s3()).log).toEqual([{ action: "delete", bucket: "e2e_bucket", key: `userUploads/${id}.png` }]);
    expect(await world.events("set-webimage-layers")).toEqual([]);
  });
});

test.describe("settings", () => {
  test("updating title, subtitle and description changes what players see", async ({ page, world }) => {
    test.fail(true, "EXP-432: /admin/theme echoes the form without the theme id, so the board crashes on return");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await world.seed({ isAdmin: true, extraAssets: anchors(1), assetData: board({ theme: "BULLETIN" }) });
    await openAdmin(page, world);

    await openSection(page, "Settings");
    await field(page, "Title:").fill("Kindness Wall");
    await field(page, "Subtitle:").fill("Say something nice");
    await field(page, "Description:").fill("Be kind.");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(async () => (await world.keyAssetData()).theme.title).toBe("Kindness Wall");

    expect((await world.keyAssetData()).theme).toEqual({
      ...THEMES.BULLETIN,
      title: "Kindness Wall",
      subtitle: "Say something nice",
      description: "Be kind.",
    });
    await page.locator("button.icon-with-rounded-border").click();
    await expect(page.getByRole("heading", { name: "Kindness Wall" })).toBeVisible();
    await expect(page.getByText("Say something nice")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("saving settings stores the new copy and keeps submissions", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(2),
      assetData: board({ theme: "BULLETIN", usedSpaces: ["anchor-1"], messages: [message("m1")] }),
    });

    const response = await page.request.post(world.api("/admin/theme"), {
      data: { existingThemeId: "BULLETIN", title: "New title", subtitle: "New subtitle", description: "New description" },
    });

    expect(response.ok()).toBe(true);
    expect(await world.keyAssetData()).toEqual({
      ...board({ theme: "BULLETIN", usedSpaces: ["anchor-1"], messages: [message("m1")] }),
      theme: { ...THEMES.BULLETIN, title: "New title", subtitle: "New subtitle", description: "New description" },
    });
    expect(await world.events("drop-scene")).toEqual([]);
  });

  test("the theme switcher only appears with a scene container", async ({ page, world }) => {
    await world.seed({ isAdmin: true, extraAssets: anchors(1), assetData: board() });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    await expect(field(page, "Title:")).toBeVisible();
    await expect(field(page, "Theme:")).toHaveCount(0);
  });

  test("the theme switcher offers only provisioned themes of the same layout", async ({ page, world }) => {
    await world.seed({ isAdmin: true, extraAssets: { ...anchors(1), ...CONTAINER }, assetData: board({ theme: "CHALK" }) });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    // Group 1 also holds GRATITUDE, FRIENDSHIP and HARVEST, which have no SCENE_ID in this environment.
    await expect(field(page, "Theme:").locator("option")).toHaveText(["Chalk the Block", "Art Gallery", "Easel Gallery"]);
    await expect(field(page, "Theme:")).toHaveValue("CHALK");
  });

  test("switching theme replaces the scene after confirmation", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: { ...anchors(2), ...CONTAINER, elsewhere: { id: "elsewhere", uniqueName: "tree", sceneDropId: "other-scene" } },
      assetData: board({ theme: "CHALK" }),
    });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    await field(page, "Theme:").selectOption("ART");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("heading", { name: "Replace Scene in World" })).toBeVisible();
    expect(await world.events("drop-scene")).toEqual([]);
    await page.locator(".modal").getByRole("button", { name: "Replace" }).click();

    await expect
      .poll(() => world.events("drop-scene"))
      .toEqual([expect.objectContaining({ sceneId: "scene-art", sceneDropId: "scene-1", position: { x: 700, y: 800 }, allowNonAdmins: true })]);
    await expect.poll(async () => (await world.assets()).map((a) => a.id)).toEqual(["elsewhere"]);
    expect(await world.events("close-iframe")).toEqual([expect.objectContaining({ droppedAssetId: KEY_ASSET_ID })]);
  });

  test("a theme switch is refused when the scene has no container", async ({ page, world }) => {
    await world.seed({ isAdmin: true, extraAssets: anchors(1), assetData: board({ theme: "CHALK" }) });

    const response = await page.request.post(world.api("/admin/theme"), {
      data: { existingThemeId: "CHALK", id: "ART", title: "x", subtitle: "x" },
    });

    expect(response.ok()).toBe(false);
    expect((await world.state()).assets[KEY_ASSET_ID]).toBeDefined();
    expect(await world.events("drop-scene")).toEqual([]);
  });

  test("closing the confirmation keeps the current scene", async ({ page, world }) => {
    await world.seed({ isAdmin: true, extraAssets: { ...anchors(1), ...CONTAINER }, assetData: board({ theme: "CHALK" }) });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    await field(page, "Theme:").selectOption("GALLERY");
    await page.getByRole("button", { name: "Submit" }).click();
    await page.locator(".modal").getByRole("button", { name: "Close" }).click();

    await expect(page.locator(".modal")).toHaveCount(0);
    expect(await world.events("drop-scene")).toEqual([]);
    expect(await world.events("delete-asset")).toEqual([]);
    expect((await world.keyAssetData()).theme).toEqual(THEMES.CHALK);
  });
});

test.describe("reset and remove", () => {
  test("hard reset on an image theme clears submissions and repaints the anchors", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: {
        ...anchors(1, { bottomLayerURL: IMAGE_URL }),
        "anchor-2": { id: "anchor-2", uniqueName: "anchor", sceneDropId: "scene-1", bottomLayerURL: "https://example.invalid/chalk-anchor.png" },
      },
      assetData: board({ theme: "CHALK", usedSpaces: ["anchor-1"], messages: [message("m1", { imageUrl: IMAGE_URL })] }),
    });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    await page.getByRole("button", { name: "Reset" }).click();
    await page.getByLabel("Remove all user submissions?").check();
    await page.locator(".modal").getByRole("button", { name: "Reset" }).click();

    await expect
      .poll(() => world.keyAssetData())
      .toMatchObject({ anchorAssets: ["anchor-1", "anchor-2"], messages: {}, usedSpaces: [] });
    // Only the anchor that holds a picture is repainted.
    expect(await world.events("set-webimage-layers")).toEqual([
      expect.objectContaining({ assetId: "anchor-1", bottom: "https://example.invalid/chalk-anchor.png", top: "" }),
    ]);
  });

  test("hard reset on a message theme deletes the dropped signs", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: {
        ...anchors(2),
        bg1: { id: "bg1", uniqueName: "scene-1-background-anchor-1", sceneDropId: "scene-1" },
        txt1: { id: "txt1", uniqueName: "scene-1-text-anchor-1", sceneDropId: "scene-1" },
      },
      assetData: board({ theme: "BULLETIN", usedSpaces: ["anchor-1"], messages: [message("m1")] }),
    });

    const response = await page.request.post(world.api("/admin/reset"), { data: { shouldHardReset: true } });

    expect(response.ok()).toBe(true);
    expect((await world.assets()).map((a) => a.id).sort()).toEqual(["anchor-1", "anchor-2", KEY_ASSET_ID]);
    expect(await world.keyAssetData()).toMatchObject({ messages: {}, usedSpaces: [] });
  });

  test("soft reset keeps submissions and picks up anchors added to the scene", async ({ page, world }) => {
    test.fail(true, "EXP-432: soft reset writes the anchor list to the world data object, not the key asset");
    await world.seed({
      isAdmin: true,
      extraAssets: anchors(3),
      assetData: board({ theme: "BULLETIN", anchorAssets: ["anchor-1"], usedSpaces: ["anchor-1"], messages: [message("m1")] }),
    });

    const response = await page.request.post(world.api("/admin/reset"), { data: { shouldHardReset: false } });

    expect(response.ok()).toBe(true);
    expect(Object.keys(await response.json())).toEqual(["m1"]);
    expect(await world.keyAssetData()).toMatchObject({
      anchorAssets: ["anchor-1", "anchor-2", "anchor-3"],
      usedSpaces: ["anchor-1"],
      messages: { m1: expect.any(Object) },
    });
  });

  test("remove from world deletes the scene and the key asset", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      extraAssets: { ...anchors(2), elsewhere: { id: "elsewhere", uniqueName: "tree", sceneDropId: "other-scene" } },
      assetData: board(),
    });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    await page.getByRole("button", { name: "Remove from world" }).click();
    await expect(page.getByRole("heading", { name: "Remove from World" })).toBeVisible();
    await page.locator(".modal").getByRole("button", { name: "Remove" }).click();

    await expect.poll(async () => (await world.assets()).map((a) => a.id)).toEqual(["elsewhere"]);
    expect(await world.events("close-iframe")).toEqual([expect.objectContaining({ droppedAssetId: KEY_ASSET_ID })]);
    expect(await world.events("drop-scene")).toEqual([]);
  });

  test("opening Reset or Remove doesn't save half-edited settings", async ({ page, world }) => {
    test.fail(true, "EXP-432: Reset/Remove buttons have no type, so they also submit the settings form");
    await world.seed({ isAdmin: true, extraAssets: anchors(1), assetData: board({ theme: "BULLETIN" }) });
    await openAdmin(page, world);
    await openSection(page, "Settings");

    await field(page, "Title:").fill("Draft title");
    await page.getByRole("button", { name: "Reset" }).click();
    await page.locator(".modal").getByRole("button", { name: "Close" }).click();
    await page.waitForLoadState("networkidle");

    expect((await world.keyAssetData()).theme.title).toBe(THEMES.BULLETIN.title);
  });
});
