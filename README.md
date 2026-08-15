<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Bulletin Board

## Introduction / Summary

Bulletin Board is a message-board style Topia app. Visitors submit text and/or images through an in-world drawer; admins review pending submissions and, on approval, the app drops the content into the scene at pre-placed **anchor** assets. When every anchor is used, the app rewrites a random already-dropped anchor with the newest submission so the board stays fresh.

The app ships with nine interchangeable themes (garden signs, art gallery, chalk sidewalk, parking spaces, etc.). Admins can switch themes at runtime, wiping and re-dropping the scene without leaving the app.

## Key Features

### Canvas elements & interactions

- **Key asset:** clicking it opens the drawer for visitors and admins.
- **Anchor assets:** placeholder dropped assets pre-placed throughout the scene under the unique name `anchor`. The app tracks them on the key-asset data object and rewrites their text/image when a message is approved.
- **Scene switcher container:** an optional dropped asset with unique name `bulletin-board-container`. If present, admins can switch themes from the drawer — the app deletes the current scene's assets and drops the newly-selected theme's scene at the container's position.

### Drawer content

- Message submission form (theme-dependent: text-only, image-only, or both).
- A visitor's own submissions list, showing pending vs. approved state.
- Admin tab (admins only, see below).

### Admin features

- **Access:** open the drawer as an admin and select the Admin tab. Changes affect only this instance of the app; other instances in this or other worlds are unaffected.
- **Settings:** pick a theme and update the Title, Subtitle, and Description shown to visitors.
- **Pending messages:** approve to drop the message/image into the scene immediately; delete to remove it from the data object and permanently delete any S3-hosted image.
- **Soft reset:** refresh anchor slots so new submissions can be placed; existing dropped content is not deleted.
- **Hard reset:** wipe messages and used-space state; for image themes this resets the web-image anchors, for message themes it deletes the background + text dropped assets so the scene is empty.
- **Remove:** clear every dropped asset in the scene, close the iframe, and delete the key asset.

### Themes

Nine themes, all defined in `shared/types/ThemeTypes.ts` and `server/utils/getThemeEnvVars.ts`. Only themes whose `SCENE_ID_<ID>` env var is set at runtime appear in the switcher.

| ID                | Type    | Description                                                                  |
| ----------------- | ------- | ---------------------------------------------------------------------------- |
| `CHALK` (default) | image   | Spiraling sidewalk; approved images replace sidewalk sections.               |
| `ART`             | image   | Art gallery walls; approved images hang in the gallery.                      |
| `HARVEST`         | image   | Fall harvest board; approved images shown on themed anchors.                 |
| `CAR`             | image   | Virtual parking lot; approved images decorate parking spaces.                |
| `PARKING`         | message | Virtual parking lot with text-only messages (uses `DROPPABLE_TEXT_PARKING`). |
| `GRATITUDE`       | message | Garden; approved gratitude messages drop as signs.                           |
| `FRIENDSHIP`      | message | Garden; approved messages drop as flowers.                                   |
| `BULLETIN`        | message | Classic corkboard bulletin; approved messages drop as pinned notes.          |
| `BULLETIN_SKETCH` | message | Sketch-styled bulletin variant.                                              |

## Required Assets with Unique Names

| Unique Name                | Required | Description                                                                                                                    |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `anchor`                   | Yes      | Placeholder assets placed throughout the scene that determine where approved messages/images land. Multiple assets share this. |
| `bulletin-board-container` | No       | Optional container that anchors the scene position. When present, unlocks the admin theme-switcher.                            |

> **Note:** the key asset itself is identified by `credentials.assetId` (the asset the visitor clicked), not by unique name — no fixed unique name is required for it.

## Technical Architecture

### Data Objects

#### Key Asset

The primary store. Attached to the dropped key asset and deleted with it.

```ts
{
  anchorAssets: string[];           // Cached anchor dropped-asset ids
  messages: {                       // Keyed by messageId
    [id: string]: {
      id: string;
      approved: boolean;
      displayName: string;
      imageUrl?: string;
      message?: string;
      userId: string;
      username: string;
    };
  };
  theme: {
    id: string;                     // e.g. "CHALK", "GRATITUDE"
    title: string;
    subtitle: string;
    description: string;
    type: "image" | "message";
  };
  themeId?: string;                 // Bootstrap override (see Theme Defaults)
  usedSpaces: string[];             // Anchor ids that already hold approved content
}
```

#### World

The world data object holds per-scene state and legacy migration flags. Kept minimal to avoid size limits.

```ts
{
  missingScenesDeleted?: boolean;                                // Legacy migration marker
  scenes: {
    [sceneDropId: string]:
      | KeyAssetDataObject                                       // Per-scene state
      | "Data transferred to Bulletin Board's Key Asset";        // Legacy migration marker
  };
  anchorAssets?: string[];                                       // Refreshed on soft reset
}
```

#### Visitor

Not used. This app does not read from or write to visitor data objects.

### Theme Defaults

If you want to override a theme's copy without editing it from the admin panel, set a `themeId` on the key asset before it's first interacted with — the app will initialize using the matching default. Full defaults for all nine themes live in `server/utils/getThemeEnvVars.ts`. Example for the default (Chalk):

```json
{
  "themeId": "CHALK",
  "theme": {
    "id": "CHALK",
    "title": "Chalk the Block",
    "subtitle": "Add a picture to the virtual sidewalk.",
    "description": "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    "type": "image"
  }
}
```

## API Endpoints

All routes mount under `/api`.

| Method   | Route                               | Description                                                                                                     |
| -------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/`                                 | Hello ping.                                                                                                     |
| `GET`    | `/system/health`                    | Server version, uptime, and env-var SET/NOT-SET status.                                                         |
| `GET`    | `/game-state`                       | Returns `{ theme, isAdmin, canSwitchScenes, availableThemeIds }`. `availableThemeIds` = themes with a scene id. |
| `GET`    | `/messages`                         | Current visitor's own submissions (approved + pending).                                                         |
| `POST`   | `/message`                          | Submit a new message with optional base64 `imageData`. Uploads to S3 if present.                                |
| `DELETE` | `/message/:messageId`               | Visitor deletes their own message. Also removes the S3 object if any.                                           |
| `GET`    | `/admin/messages`                   | Admin-only: list all pending submissions.                                                                       |
| `POST`   | `/admin/message/approve/:messageId` | Admin-only: approve a message. Drops it into the world (or rewrites a used anchor) and fires analytics.         |
| `DELETE` | `/admin/message/:messageId`         | Admin-only: reject a message and delete its S3 object.                                                          |
| `POST`   | `/admin/theme`                      | Admin-only: update theme copy in place, or switch themes (tears down + re-drops the scene).                     |
| `POST`   | `/admin/reset`                      | Admin-only. `shouldHardReset` flag controls soft (refresh anchors) vs. hard (wipe messages + reset in-world).   |
| `POST`   | `/admin/remove`                     | Admin-only: delete every dropped asset in the scene, close the iframe, and delete the key asset.                |

Approval uses an update-data-object lock (`updateDataObject({}, { lock })`) as a probe — if another admin is holding the lock the endpoint returns HTTP 409.

## Analytics

The app dual-writes to Topia's public-key analytics and (optionally) a Google Sheet.

| Event                          | Fired when                        | Where                                     |
| ------------------------------ | --------------------------------- | ----------------------------------------- |
| `newMessages`                  | Visitor submits a message.        | `POST /message`.                          |
| `messageApprovals`             | Admin approves a pending message. | `POST /admin/message/approve/:messageId`. |
| `resets`                       | Admin runs a soft or hard reset.  | `POST /admin/reset`.                      |
| `${theme.id}-newMessages`      | Same trigger, per-theme variant.  | `POST /message`.                          |
| `${theme.id}-messageApprovals` | Same trigger, per-theme variant.  | `POST /admin/message/approve/:messageId`. |
| `${theme.id}-resets`           | Same trigger, per-theme variant.  | `POST /admin/reset`.                      |

If `GOOGLESHEETS_SHEET_ID` is set, approvals also append a row to the configured Sheet via `addNewRowToGoogleSheets` — with `GOOGLESHEETS_CLIENT_EMAIL` + `GOOGLESHEETS_PRIVATE_KEY` used to authenticate a service account.

## Environment Variables

Create a `.env` file in the root directory. See `.env-example` for a template.

| Variable                     | Description                                                                                                                           | Required    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `INTERACTIVE_KEY`            | Topia interactive app key.                                                                                                            | Yes         |
| `INTERACTIVE_SECRET`         | Topia interactive app secret.                                                                                                         | Yes         |
| `API_KEY`                    | Topia API key passed to SDK `initialize()`.                                                                                           | Yes         |
| `INSTANCE_DOMAIN`            | Topia API domain (`api.topia.io` for production, `api-stage.topia.io` for staging).                                                   | Yes         |
| `INSTANCE_PROTOCOL`          | `https` for production/staging, `http` only for local.                                                                                | Yes         |
| `S3_BUCKET`                  | S3 bucket for image uploads and static theme assets.                                                                                  | Yes         |
| `DEFAULT_THEME`              | Theme id used on first-ever init. One of the nine ids above.                                                                          | Yes         |
| `SCENE_ID_<THEME>`           | One per theme you want available. Only themes whose scene id is set show up in the admin switcher.                                    | ≥1          |
| `DROPPABLE_ASSETS_<THEME>`   | JSON config listing droppable message assets. Required for message themes (`GRATITUDE`, `FRIENDSHIP`, `BULLETIN`, `BULLETIN_SKETCH`). | Conditional |
| `ANCHOR_ASSET_IMAGE_<THEME>` | Static image URL used for the "unused anchor" placeholder. Required for image themes (`CHALK`, `ART`, `HARVEST`, `CAR`).              | Conditional |
| `DROPPABLE_TEXT_<THEME>`     | JSON config for text-only themes. Required for `PARKING`.                                                                             | Conditional |
| `IMG_ASSET_ID`               | Asset template id used when creating web-image drops.                                                                                 | No          |
| `TEXT_ASSET_ID`              | Asset template id used when creating text drops.                                                                                      | No          |
| `PORT`                       | Server port (defaults to `3000`).                                                                                                     | No          |
| `NODE_ENV`                   | Node environment.                                                                                                                     | No          |
| `COMMIT_HASH`                | Surfaced in `/system/health` for deploy tracking.                                                                                     | No          |
| `GOOGLESHEETS_CLIENT_EMAIL`  | Google service-account email for optional analytics logging.                                                                          | No          |
| `GOOGLESHEETS_PRIVATE_KEY`   | Google service-account private key.                                                                                                   | No          |
| `GOOGLESHEETS_SHEET_ID`      | Google Sheet id to write approvals to. If unset, Sheets logging is skipped.                                                           | No          |
| `GOOGLESHEETS_SHEET_RANGE`   | Sheet range (defaults to `Sheet1`).                                                                                                   | No          |
| `SKIP_PREFLIGHT_CHECK`       | Skip CRA preflight check.                                                                                                             | No          |

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

## Getting Started

```bash
# from the app root
npm install
cd client && npm install && cd ..

# create a .env at the app root (see Environment Variables above)
cp .env-example .env

# run the dev server
npm run dev
```

## For Developers

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

### App-specific notes

- **S3 layout:** user uploads live at `s3://${S3_BUCKET}/userUploads/{profileId}-{Date.now()}.png`. When an admin rejects or a visitor deletes a submission, the S3 object is deleted alongside the data-object entry.
- **Placement strategy:** approvals populate any unused `anchor` asset first. When all anchors are used, a random already-populated anchor is rewritten in place — either via `updateCustomTextAsset` (message themes) or `updateWebImageLayers` (image themes).
- **Particle effect:** approvals trigger a `purpleSmoke_puff` particle at the drop position.
- **Theme switch flow:** admin switches theme → `removeSceneFromWorld` deletes all dropped assets in the current `sceneDropId` → `world.dropScene({ sceneId, position, sceneDropId, allowNonAdmins: true })` at the `bulletin-board-container`'s position.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- View it in action: [Dev](https://topia.io/bulletin-board-prod), [Prod](https://topia.io/bulletin-board-prod)
- [Notion One Pager](https://www.notion.so/topiaio/Bulletin-Board-18171cde990b447693aee8b26b03f872?pvs=4)
