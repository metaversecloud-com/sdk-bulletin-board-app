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

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    envs: {
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
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
