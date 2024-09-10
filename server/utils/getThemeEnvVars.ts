import { errorHandler } from "./errorHandler.js";
import { ThemeType } from "../types";

enum ThemeIds {
  GRATITUDE = "GRATITUDE",
  FRIENDSHIP = "FRIENDSHIP",
  CHALK = "CHALK",
}

type DefaultThemesType = {
  [key: string]: ThemeType;
};

const defaultThemes: DefaultThemesType = {
  GRATITUDE: {
    id: "GRATITUDE",
    description: "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
    subtitle: "Leave a message about something you're thankful for.",
    title: "Gratitude Garden",
  },
  FRIENDSHIP: {
    id: "FRIENDSHIP",
    description: "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
    subtitle: "Leave a message about something you're thankful for.",
    title: "Friendship Garden",
  },
  CHALK: {
    id: "CHALK",
    description: "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    subtitle: "Add a picture to add to the virtual sidewalk.",
    title: "Chalk the Block",
  },
};

export const getThemeEnvVars = (id: string) => {
  try {
    if (!Object.values(ThemeIds).includes(id as ThemeIds)) throw "Theme id not found";

    const anchorAssetImage = process.env[`ANCHOR_ASSET_IMAGE_${id}`];

    let droppableAssets;
    if (process.env[`DROPPABLE_ASSETS_${id}`]) {
      const unescapedJson = process.env[`DROPPABLE_ASSETS_${id}`]!.replace(/\\"/g, '"');
      droppableAssets = JSON.parse(unescapedJson);
    }

    const sceneId = process.env[`SCENE_ID_${id}`];

    const theme = defaultThemes[id];

    return { anchorAssetImage, droppableAssets, sceneId, theme };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getThemeEnvVars",
      message: "Error getting theme environment variables",
    });
  }
};
