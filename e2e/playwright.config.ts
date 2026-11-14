import { defineConfig, devices } from "@playwright/test";
import { APP_PORT, INTERACTIVE_KEY, INTERACTIVE_SECRET, MOCK_TOPIA_PORT } from "./constants";

// E2E_APP_IMAGE=<image> runs the app from a Docker image (what ships, e.g. to test a Node upgrade)
// instead of local Node. The container reaches the mock on the host through host.docker.internal.
const APP_IMAGE = process.env.E2E_APP_IMAGE;
const mockHost = `${APP_IMAGE ? "host.docker.internal" : "localhost"}:${MOCK_TOPIA_PORT}`;

// The real app (production build) talks to an in-memory fake of the Topia public API.
// Explicit env wins over any developer ../.env because dotenv never overrides existing variables.
const appEnv = {
  PORT: APP_IMAGE ? "3000" : String(APP_PORT),
  NODE_ENV: "test",
  INSTANCE_DOMAIN: mockHost,
  INSTANCE_PROTOCOL: "http",
  INTERACTIVE_KEY,
  INTERACTIVE_SECRET,
  API_KEY: "",
  // Never let a test reach a real service: image uploads go to the mock's fake S3 (path-style, since
  // the underscore makes the bucket name non-DNS-compatible), Google Sheets logging stays off.
  S3_BUCKET: "e2e_bucket",
  AWS_ENDPOINT_URL_S3: `http://${mockHost}/s3`,
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "e2e-access-key",
  AWS_SECRET_ACCESS_KEY: "e2e-secret-key",
  AWS_EC2_METADATA_DISABLED: "true",
  GOOGLESHEETS_SHEET_ID: "",
  GOOGLESHEETS_CLIENT_EMAIL: "",
  GOOGLESHEETS_PRIVATE_KEY: "",
  // Themes: only the ones with a SCENE_ID are offered in the admin switcher (HARVEST, CAR, GRATITUDE and
  // FRIENDSHIP are deliberately left unprovisioned).
  DEFAULT_THEME: "CHALK",
  SCENE_ID_CHALK: "scene-chalk",
  SCENE_ID_ART: "scene-art",
  SCENE_ID_GALLERY: "scene-gallery",
  SCENE_ID_BULLETIN: "scene-bulletin",
  SCENE_ID_BULLETIN_SKETCH: "scene-bulletin-sketch",
  SCENE_ID_PARKING: "scene-parking",
  ANCHOR_ASSET_IMAGE_CHALK: "https://example.invalid/chalk-anchor.png",
  // Background + text theme, offsets as strings (how most env configs write them).
  DROPPABLE_ASSETS_BULLETIN: JSON.stringify([
    { name: "Note", layer0: "https://example.invalid/note.png", imageOffsetX: "5", imageOffsetY: "6", textOffsetX: "10", textOffsetY: "-20", textColor: "black", textSize: "14", textWidth: "150" },
  ]),
  // Same, with numeric offsets.
  DROPPABLE_ASSETS_BULLETIN_SKETCH: JSON.stringify([
    { name: "Sketch", layer0: "https://example.invalid/sketch.png", textOffsetX: 10, textOffsetY: -20 },
  ]),
  // Text-only theme: the anchor already carries the artwork.
  DROPPABLE_TEXT_PARKING: JSON.stringify({ textOffsetX: "0", textOffsetY: "-5", textColor: "yellow", textSize: "18" }),
};

const imageEnvFlags = Object.entries(appEnv)
  // Single-quoted for the shell: some values are JSON.
  .map(([key, value]) => `-e ${key}='${value.replace(/'/g, "'\\''")}'`)
  .join(" ");

const appServer = APP_IMAGE
  ? {
      command: `docker run --rm --init --name sdk-app-e2e --add-host=host.docker.internal:host-gateway -p ${APP_PORT}:3000 ${imageEnvFlags} ${APP_IMAGE}`,
      // Never reuse a server already on the port: it wouldn't be the image under test.
      reuseExistingServer: false,
    }
  : {
      // Production build: server/dist serves client/build (see server/index.ts).
      command: "npm run build --prefix .. && npm start --prefix ..",
      env: appEnv,
      reuseExistingServer: !process.env.CI,
    };

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node mock-topia/server.mjs",
      url: `http://localhost:${MOCK_TOPIA_PORT}/__mock/health`,
      env: { MOCK_TOPIA_PORT: String(MOCK_TOPIA_PORT), INTERACTIVE_KEY },
      reuseExistingServer: !process.env.CI,
    },
    {
      ...appServer,
      url: `http://localhost:${APP_PORT}/api/system/health`,
      timeout: 180_000,
    },
  ],
});
