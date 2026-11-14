import { INTERACTIVE_SECRET } from "../../constants";
import { CONTAINER, PNG_DATA_URL, anchors, board, expect, message, test } from "../../fixtures";

const OTHER_PLAYER = "profile-someone";

// Known bugs, tracked in EXP-432. test.fail() keeps the suite green while a bug exists and turns red
// once it's fixed, so the marker is removed together with the fix.

test.describe("admin endpoints reject players", () => {
  const calls = [
    { name: "list pending messages", method: "get", path: "/admin/messages" },
    { name: "approve a message", method: "post", path: "/admin/message/approve/m1" },
    { name: "reject a message", method: "delete", path: "/admin/message/m1" },
    { name: "change the board copy", method: "post", path: "/admin/theme", data: { existingThemeId: "BULLETIN", title: "Hacked", subtitle: "x" } },
    { name: "switch the scene", method: "post", path: "/admin/theme", data: { existingThemeId: "BULLETIN", id: "PARKING", title: "x", subtitle: "x" } },
    { name: "hard reset", method: "post", path: "/admin/reset", data: { shouldHardReset: true } },
    { name: "remove the board from the world", method: "post", path: "/admin/remove" },
  ] as const;

  for (const call of calls) {
    test(call.name, async ({ page, world }) => {
      test.fail(true, "EXP-432: /api/admin/* never checks visitor.isAdmin");
      await world.seed({
        isAdmin: false,
        extraAssets: { ...anchors(2), ...CONTAINER },
        assetData: board({ theme: "BULLETIN", usedSpaces: ["anchor-2"], messages: [message("m1", { message: "Someone's secret note" })] }),
      });
      const before = await world.state();

      const response = await page.request[call.method](world.api(call.path), { data: "data" in call ? call.data : undefined });

      expect(response.ok()).toBe(false);
      expect(await response.text()).not.toContain("Someone's secret note");
      const after = await world.state();
      expect(after.assets).toEqual(before.assets);
      expect(after.events).toEqual([]);
    });
  }
});

test("a player can't delete another player's pending message", async ({ page, world }) => {
  test.fail(true, "EXP-432: DELETE /api/message/:id doesn't check the message belongs to the caller");
  await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN", messages: [message("theirs", { userId: OTHER_PLAYER })] }) });

  const response = await page.request.delete(world.api("/message/theirs"));

  expect(response.ok()).toBe(false);
  expect(Object.keys((await world.keyAssetData()).messages)).toEqual(["theirs"]);
});

test("a player can still delete their own pending message through the API", async ({ page, world }) => {
  await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN", messages: [message("mine", { userId: world.profileId })] }) });

  const response = await page.request.delete(world.api("/message/mine"));

  expect(response.ok()).toBe(true);
  expect((await world.keyAssetData()).messages).toEqual({});
});

test("a request signed for another app's public key stores nothing", async ({ page, world }) => {
  await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN" }) });

  const response = await page.request.post(world.api("/message", { interactivePublicKey: "someone-else" }), { data: { message: "Hi" } });

  expect(response.ok()).toBe(false);
  expect((await world.keyAssetData()).messages).toEqual({});
});

test.describe("submission rules are enforced by the server", () => {
  test("no more than three pending messages per player", async ({ page, world }) => {
    test.fail(true, "EXP-432: the three-pending limit only exists in the client");
    const mine = ["a", "b", "c"].map((id) => message(id, { userId: world.profileId }));
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN", messages: mine }) });

    const response = await page.request.post(world.api("/message"), { data: { message: "Fourth" } });

    expect(response.ok()).toBe(false);
    expect(Object.keys((await world.keyAssetData()).messages)).toHaveLength(3);
  });

  test("messages are capped at 120 characters", async ({ page, world }) => {
    test.fail(true, "EXP-432: the 120-character limit only exists in the client");
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN" }) });

    const response = await page.request.post(world.api("/message"), { data: { message: "x".repeat(5000) } });

    expect(response.ok()).toBe(false);
    expect((await world.keyAssetData()).messages).toEqual({});
  });

  test("an empty submission is rejected", async ({ page, world }) => {
    test.fail(true, "EXP-432: POST /api/message stores submissions with neither text nor image");
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "BULLETIN" }) });

    const response = await page.request.post(world.api("/message"), { data: {} });

    expect(response.ok()).toBe(false);
    expect((await world.keyAssetData()).messages).toEqual({});
  });

  test("only PNG images are uploaded", async ({ page, world }) => {
    test.fail(true, "EXP-432: imageData is uploaded to the public bucket as image/png without checking it is one");
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "CHALK" }) });
    const html = `data:text/html;base64,${Buffer.from("<script>alert(1)</script>").toString("base64")}`;

    const response = await page.request.post(world.api("/message"), { data: { imageData: html } });

    expect(response.ok()).toBe(false);
    expect((await world.s3()).log).toEqual([]);
  });

  test("a valid PNG upload is accepted", async ({ page, world }) => {
    await world.seed({ extraAssets: anchors(1), assetData: board({ theme: "CHALK" }) });

    const response = await page.request.post(world.api("/message"), { data: { imageData: PNG_DATA_URL } });

    expect(response.ok()).toBe(true);
    expect(Object.values((await world.s3()).objects)).toEqual([expect.objectContaining({ isPng: true })]);
  });
});

test("a failed approval doesn't send the interactive secret to the browser", async ({ page, world }) => {
  test.fail(true, "EXP-432: the SDK error from getWithUniqueName (params.interactiveSecret) is returned as-is");
  // Every anchor is taken, so approval looks up the existing text asset by unique name; it's gone.
  await world.seed({
    isAdmin: true,
    extraAssets: anchors(1),
    assetData: board({ theme: "BULLETIN", anchorAssets: ["anchor-1"], usedSpaces: ["anchor-1"], messages: [message("m1")] }),
  });

  const response = await page.request.post(world.api("/admin/message/approve/m1"));

  expect(response.ok()).toBe(false);
  const body = await response.text();
  expect(body).not.toContain(INTERACTIVE_SECRET);
  expect(body).not.toContain("interactiveSecret");
});
