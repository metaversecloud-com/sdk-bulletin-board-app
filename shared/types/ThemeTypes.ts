/**
 * Canonical list of every theme the bulletin-board app supports.
 *
 * Shared between client and server so the two sides can't drift. The server
 * uses this to decide which `SCENE_ID_<id>` env vars to check (theme is
 * "available" when its env var is set); the client uses it for the admin
 * theme-switcher dropdown values.
 *
 * UI-only metadata (display title, group, etc.) still lives in
 * `client/src/context/constants.ts`; this file is just the wire-level enum.
 */
export enum ThemeIds {
  GRATITUDE = "GRATITUDE",
  FRIENDSHIP = "FRIENDSHIP",
  BULLETIN = "BULLETIN",
  BULLETIN_SKETCH = "BULLETIN_SKETCH",
  CHALK = "CHALK",
  HARVEST = "HARVEST",
  ART = "ART",
  CAR = "CAR",
  PARKING = "PARKING",
}
