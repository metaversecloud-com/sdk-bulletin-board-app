import { errorHandler } from "./errorHandler.js";
import { ThemeType } from "../types";

enum ThemeIds {
  GRATITUDE = "GRATITUDE",
  FRIENDSHIP = "FRIENDSHIP",
  BULLETIN = "BULLETIN",
  CHALK = "CHALK",
  CAR = "CAR",
}

type DefaultThemesType = {
  [key: string]: ThemeType;
};

const defaultThemes: DefaultThemesType = {
  GRATITUDE: {
    id: "GRATITUDE",
    description: "Enter a message below and click Submit. Once it's approved it will be added to the garden.",
    subtitle: "Leave a message about something you're thankful for.",
    title: "Gratitude Garden",
    type: "message",
  },
  FRIENDSHIP: {
    id: "FRIENDSHIP",
    description: "Enter a message below and click Submit. Once it's approved it will be added to the garden.",
    subtitle: "Leave a message for your friends.",
    title: "Friendship Garden",
    type: "message",
  },
  BULLETIN: {
    id: "BULLETIN",
    description: "Enter a message below and click Submit. Once it's approved it will be added to the board.",
    subtitle: "Leave a message.",
    title: "Bulletin Board",
    type: "message",
  },
  CHALK: {
    id: "CHALK",
    description: "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    subtitle: "Add a picture to the virtual sidewalk.",
    title: "Chalk the Block",
    type: "image",
  },
  CAR: {
    id: "CAR",
    description: "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    subtitle: "Add a picture to the virtual parking lot.",
    title: "Decorate your parking space",
    type: "image",
  },
};

export const getThemeEnvVars = (id: string) => {
  try {
    if (!Object.values(ThemeIds).includes(id as ThemeIds)) throw `Theme id not found: ${id}`;

    const anchorAssetImage = process.env[`ANCHOR_ASSET_IMAGE_${id}`];

    let droppableAssets;
    if (process.env[`DROPPABLE_ASSETS_${id}`]) {
      const unescapedJson = process.env[`DROPPABLE_ASSETS_${id}`]!.replace(/\\"/g, '"');
      droppableAssets = JSON.parse(unescapedJson);
    }

    const sceneId = process.env[`SCENE_ID_${id}`];

    const theme = defaultThemes[id];

    return { anchorAssetImage, droppableAssets, sceneId, theme };
  } catch (error: any) {
    return new Error(error);
  }
};
