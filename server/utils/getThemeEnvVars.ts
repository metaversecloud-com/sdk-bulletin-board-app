import { errorHandler } from "./errorHandler"

enum ThemeIds {
  GRATITUDE = 'GRATITUDE',
  FRIENDSHIP = 'FRIENDSHIP',
  CHALK = 'CHALK'
}

export const getThemeEnvVars = (id: ThemeIds) => {
  try {
    if (!Object.values(ThemeIds).includes(id as ThemeIds)) throw "Theme id not found"

    const anchors = process.env[`ANCHORS_${id}`]
    if (!anchors) throw `Missing required ANCHORS_${id} theme environment variables in the .env file`;

    const droppableSceneIds = process.env[`DROPPABLE_SCENE_IDS_${id}`].split(",")
    if (!droppableSceneIds) throw `Missing required DROPPABLE_SCENE_IDS_${id} theme environment variables in the .env file`;

    const sceneId = process.env[`SCENE_ID_${id}`]
    if (!sceneId) throw `Missing required SCENE_ID_${id} theme environment variables in the .env file`;

    return { anchors, droppableSceneIds, sceneId }
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getThemeEnvVars",
      message: "Error getting theme environment variables",
    });
  }
}