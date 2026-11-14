import { APIRequestContext, test as base, expect } from "@playwright/test";
import { INTERACTIVE_KEY, MOCK_TOPIA_URL } from "./constants";

export const KEY_ASSET_ID = "key-asset";
export const SCENE_DROP_ID = "scene-1";
export const VISITOR_ID = 42;

// ---- Bulletin Board data ----

export const THEMES = {
  CHALK: {
    id: "CHALK",
    description: "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    subtitle: "Add a picture to the virtual sidewalk.",
    title: "Chalk the Block",
    type: "image",
  },
  BULLETIN: {
    id: "BULLETIN",
    description: "Enter a message below and click Submit. Once it's approved it will be added to the board.",
    subtitle: "Leave a message.",
    title: "Bulletin Board",
    type: "message",
  },
  BULLETIN_SKETCH: {
    id: "BULLETIN_SKETCH",
    description: "Enter a message below and click Submit. Once it's approved it will be added to the board.",
    subtitle: "Leave a message.",
    title: "Bulletin Board - Sketch",
    type: "message",
  },
  PARKING: {
    id: "PARKING",
    description: "Enter a message below and click Submit. Once it's approved it will be added to the parking lot.",
    subtitle: "Leave a message.",
    title: "Post your First Day of School tips",
    type: "message",
  },
} as const;
export type ThemeId = keyof typeof THEMES;

export type Message = {
  id: string;
  approved: boolean;
  displayName: string;
  imageUrl?: string;
  message?: string;
  userId: string;
  username: string;
};

/** A pending submission, as POST /api/message stores it. */
export const message = (id: string, fields: Partial<Message> = {}): Message => ({
  id,
  approved: false,
  displayName: "Someone",
  message: `Message ${id}`,
  userId: "profile-someone",
  username: "someone",
  ...fields,
});

/** Anchor assets (uniqueName "anchor") in the key asset's scene, at distinct positions. */
export const anchors = (count: number, fields: Record<string, unknown> = {}) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, i) => [
      `anchor-${i + 1}`,
      {
        id: `anchor-${i + 1}`,
        assetName: "Anchor",
        uniqueName: "anchor",
        sceneDropId: SCENE_DROP_ID,
        position: { x: 100 * (i + 1), y: 200 },
        ...fields,
      },
    ]),
  );

/** The scene-switcher container that unlocks the admin theme dropdown. */
export const CONTAINER = {
  container: { id: "container", uniqueName: "bulletin-board-container", sceneDropId: SCENE_DROP_ID, position: { x: 700, y: 800 } },
};

/** An initialized key-asset data object. */
export const board = ({
  theme = "CHALK",
  messages = [],
  anchorAssets = ["anchor-1", "anchor-2"],
  usedSpaces = [],
}: { theme?: ThemeId; messages?: Message[]; anchorAssets?: string[]; usedSpaces?: string[] } = {}) => ({
  anchorAssets,
  messages: Object.fromEntries(messages.map((m) => [m.id, m])),
  theme: { ...THEMES[theme] },
  usedSpaces,
});

/** A 1x1 PNG as the client's canvas sends it. */
export const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export type SeedOptions = {
  isAdmin?: boolean;
  /** Visitor is standing inside the asset's zone. */
  inZone?: boolean;
  /** false = the dropped asset the app was opened from doesn't exist in the world. */
  withAsset?: boolean;
  /** Extra dropped-asset fields (assetName, topLayerURL, uniqueName, ...). */
  asset?: Record<string, unknown>;
  /** The dropped asset's data object. */
  assetData?: Record<string, unknown>;
  /** The world's data object. */
  worldData?: Record<string, unknown>;
  /** The visitor's data object. */
  visitorData?: Record<string, unknown>;
  /** Badges the visitor already owns. */
  badges?: string[];
  /** Further dropped assets in the world, keyed by id. */
  extraAssets?: Record<string, Record<string, unknown>>;
  /** Scenes dropped in the world (World.fetchScenes), keyed by sceneDropId. */
  scenes?: Record<string, Record<string, unknown>>;
};

/** One isolated Topia world in mock-topia, plus helpers to open the app inside it. */
export class TopiaWorld {
  readonly displayName = "E2E Player";

  constructor(
    readonly urlSlug: string,
    readonly profileId: string,
    private request: APIRequestContext,
  ) {}

  async seed({
    isAdmin = false,
    inZone = true,
    withAsset = true,
    asset = {},
    assetData = {},
    worldData = {},
    visitorData = {},
    badges = [],
    extraAssets = {},
    scenes = {},
  }: SeedOptions = {}) {
    const assets: Record<string, any> = { ...extraAssets };
    if (withAsset) {
      assets[KEY_ASSET_ID] = {
        id: KEY_ASSET_ID,
        assetName: "E2E Asset",
        position: { x: 500, y: 500 },
        uniqueName: "e2e-asset",
        sceneDropId: SCENE_DROP_ID,
        topLayerURL: "https://example.invalid/e2e-asset.png",
        ...asset,
        dataObject: assetData,
      };
    }

    const response = await this.request.post(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`, {
      data: {
        dataObject: worldData,
        scenes,
        assets,
        visitors: {
          [VISITOR_ID]: {
            isAdmin,
            profileId: this.profileId,
            displayName: this.displayName,
            landmarkZonesString: inZone ? Object.keys(assets).join(",") : "",
            privateZoneId: "",
            dataObject: visitorData,
            inventory: badges.map((name) => ({
              id: `owned-${name}`,
              item_id: `owned-${name}`,
              status: "ACTIVE",
              item: { name, type: "BADGE", image_url: "" },
            })),
          },
        },
      },
    });
    if (!response.ok()) throw new Error(`Seeding mock world failed: ${response.status()}`);
  }

  async state() {
    const response = await this.request.get(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`);
    return (await response.json()) as {
      dataObject: Record<string, any>;
      assets: Record<string, any>;
      visitors: Record<string, any>;
      events: Array<Record<string, any>>;
      unhandled: string[];
    };
  }

  async assetData(assetId = KEY_ASSET_ID) {
    return (await this.state()).assets[assetId]?.dataObject;
  }

  /** Dropped assets in the world, without data objects. */
  async assets() {
    const { assets } = await this.state();
    return Object.values(assets).map(({ dataObject, ...details }) => details) as Array<Record<string, any>>;
  }

  /** The fake S3 bucket (shared across tests: filter by this world's profileId). */
  async s3() {
    const response = await this.request.get(`${MOCK_TOPIA_URL}/__mock/s3`);
    const { objects, log } = (await response.json()) as {
      objects: Record<string, { bytes: number; contentType: string; isPng: boolean }>;
      log: Array<{ action: string; key: string }>;
    };
    const mine = (key: string) => key.startsWith(`userUploads/${this.profileId}-`);
    return {
      objects: Object.fromEntries(Object.entries(objects).filter(([key]) => mine(key))),
      log: log.filter((entry) => mine(entry.key)),
    };
  }

  async keyAssetData() {
    return (await this.state()).assets[KEY_ASSET_ID]?.dataObject;
  }

  async visitorData() {
    return (await this.state()).visitors[VISITOR_ID].dataObject;
  }

  async events(type?: string) {
    const { events } = await this.state();
    return type ? events.filter((e) => e.type === type) : events;
  }

  /** Session credentials Topia appends to the app's iframe URL. */
  credentials(overrides: Record<string, string> = {}) {
    return new URLSearchParams({
      assetId: KEY_ASSET_ID,
      displayName: this.displayName,
      identityId: "identity-1",
      interactiveNonce: "e2e-nonce",
      interactivePublicKey: INTERACTIVE_KEY,
      profileId: this.profileId,
      sceneDropId: SCENE_DROP_ID,
      uniqueName: "e2e-asset",
      urlSlug: this.urlSlug,
      username: "e2e-player",
      visitorId: String(VISITOR_ID),
      ...overrides,
    });
  }

  /** App page URL as Topia opens it in the iframe. */
  url(path = "/", overrides: Record<string, string> = {}) {
    return `${path}?${this.credentials(overrides)}`;
  }

  /** App API path carrying the session credentials, as the client's backendAPI sends them. */
  api(path: string, overrides: Record<string, string> = {}) {
    return `/api${path}?${this.credentials(overrides)}`;
  }
}

export const test = base.extend<{ world: TopiaWorld }>({
  // Keep the browser hermetic: only the app itself is reachable (icons and uploaded-image URLs point at
  // real S3 buckets).
  page: async ({ page }, use) => {
    await page.route(
      (url) => url.hostname !== "localhost",
      (route) => route.abort(),
    );
    await use(page);
  },
  world: async ({ request }, use, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`.replace(/[^a-zA-Z0-9-]/g, "");
    const world = new TopiaWorld(`world-${id}`, `profile-${id}`, request);
    await use(world);

    // Fail the test if the app called a public-API endpoint the mock doesn't implement (e.g. after an
    // @rtsdk/topia upgrade): it would otherwise pass against a 501 the real API never returns.
    expect((await world.state()).unhandled, "public-API calls mock-topia doesn't implement").toEqual([]);
    const outside = await (await request.get(`${MOCK_TOPIA_URL}/__mock/unhandled`)).json();
    expect(outside, "public-API calls mock-topia doesn't implement").toEqual([]);
  },
});

export { expect } from "@playwright/test";
