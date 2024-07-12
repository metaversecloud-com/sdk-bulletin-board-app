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
    deployDate: SERVER_START_DATE,
    envs: {
      COMMIT_HASH: process.env.COMMIT_HASH ? process.env.COMMIT_HASH : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      INTERACTIVE_SECRET: process.env.INTERACTIVE_SECRET ? "SET" : "NOT SET",
      DEFAULT_THEME: process.env.DEFAULT_THEME ? process.env.DEFAULT_THEME : "NOT SET",
      S3_BUCKET: process.env.S3_BUCKET,
      GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL ? "SET" : "NOT SET",
      GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID ? "SET" : "NOT SET",
      GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY ? "SET" : "NOT SET",
      SCENE_ID_0: process.env.SCENE_ID_0 ? process.env.SCENE_ID_0 : "NOT SET",
      DROPPABLE_SCENE_IDS_0: process.env.DROPPABLE_SCENE_IDS_0 ? process.env.DROPPABLE_SCENE_IDS_0 : "NOT SET",
      ANCHOR_ASSET_IMAGE_0: process.env.ANCHOR_ASSET_IMAGE_0 ? process.env.ANCHOR_ASSET_IMAGE_0 : "NOT SET",
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
