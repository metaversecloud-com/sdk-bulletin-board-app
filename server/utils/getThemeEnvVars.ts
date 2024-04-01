import { errorHandler } from "./errorHandler.js"
import { ThemeType } from '../types';

enum ThemeIds {
  GRATITUDE = 'GRATITUDE',
  FRIENDSHIP = 'FRIENDSHIP',
  CHALK = 'CHALK'
}

type DefaultThemesType = {
  [key: string]: ThemeType
}

const defaultThemes: DefaultThemesType = {
  "GRATITUDE": {
    id: "GRATITUDE",
    description: "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
    subtitle: "Leave a message about something you're thankful for.",
    title: "Gratitude Garden",
  },
  "FRIENDSHIP": {
    id: "FRIENDSHIP",
    description: "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
    subtitle: "Leave a message about something you're thankful for.",
    title: "Friendship Garden",
  },
  "CHALK": {
    id: "CHALK",
    description: "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    subtitle: "Add a picture to add to the virtual sidewalk.",
    title: "Chalk the Block",
  }
}


export const getThemeEnvVars = (id: string) => {
  try {
    if (!Object.values(ThemeIds).includes(id as ThemeIds)) throw "Theme id not found"

    const droppableSceneIds = process.env[`DROPPABLE_SCENE_IDS_${id}`] ? process.env[`DROPPABLE_SCENE_IDS_${id}`]!.split(",") : []

    const sceneId = process.env[`SCENE_ID_${id}`]
    // will be required when we're ready to let admins replace entire scenes
    // if (!sceneId) throw `Missing required SCENE_ID_${id} theme environment variables in the .env file`;

    const theme = defaultThemes[id]

    return { droppableSceneIds, sceneId, theme }
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getThemeEnvVars",
      message: "Error getting theme environment variables",
    });
  }
}