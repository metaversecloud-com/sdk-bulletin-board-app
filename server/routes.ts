import express from "express";
import {
  handleAddNewMessage,
  handleApproveMessages,
  handleDeleteMessage,
  handleGetUserMessages,
  handleGetPendingMessages,
  handleGetTheme,
  handleGetVisitor,
  handleResetScene,
  handleUpdateTheme,
  handleDeleteUserMessage,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

const SERVER_START_DATE = new Date();
router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      COMMIT_HASH: process.env.COMMIT_HASH ? process.env.COMMIT_HASH : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      INTERACTIVE_SECRET: process.env.INTERACTIVE_SECRET ? "SET" : "NOT SET",
      S3_BUCKET: process.env.S3_BUCKET,
      DEFAULT_THEME: process.env.DEFAULT_THEME ? process.env.DEFAULT_THEME : "NOT SET",
      SCENE_ID_GRATITUDE: process.env.SCENE_ID_GRATITUDE,
      DROPPABLE_ASSETS_GRATITUDE: process.env.DROPPABLE_ASSETS_GRATITUDE,
      SCENE_ID_FRIENDSHIP: process.env.SCENE_ID_FRIENDSHIP,
      DROPPABLE_ASSETS_FRIENDSHIP: process.env.DROPPABLE_ASSETS_FRIENDSHIP,
      SCENE_ID_BULLETIN: process.env.SCENE_ID_BULLETIN,
      DROPPABLE_ASSETS_BULLETIN: process.env.DROPPABLE_ASSETS_BULLETIN,
      SCENE_ID_CHALK: process.env.SCENE_ID_CHALK,
      ANCHOR_ASSET_IMAGE_CHALK: process.env.ANCHOR_ASSET_IMAGE_CHALK,
      SCENE_ID_CAR: process.env.SCENE_ID_CAR,
      ANCHOR_ASSET_IMAGE_CAR: process.env.ANCHOR_ASSET_IMAGE_CAR,
      GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL ? "SET" : "NOT SET",
      GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID ? "SET" : "NOT SET",
      GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY ? "SET" : "NOT SET",
    },
  });
});

router.get("/theme", handleGetTheme);
router.get("/visitor", handleGetVisitor);

// admin
router.post("/admin/theme", handleUpdateTheme);
router.post("/admin/reset", handleResetScene);
router.get("/admin/messages", handleGetPendingMessages);
router.post("/admin/message/approve/:messageId", handleApproveMessages);
router.delete("/admin/message/:messageId", handleDeleteMessage);

// users
router.get("/messages", handleGetUserMessages);
router.post("/message", handleAddNewMessage);
router.delete("/message/:messageId", handleDeleteUserMessage);

export default router;
