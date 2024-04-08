import express from "express";
import {
  handleAddNewMessage,
  handleApproveMessages,
  handleDeleteMessage,
  handleGetUserMessages,
  handleGetPendingMessages,
  handleGetTheme,
  handleGetVisitor,
  handleUpdateTheme,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js"

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
router.post("/theme", handleUpdateTheme);

router.get("/visitor", handleGetVisitor);

router.get("/messages", handleGetUserMessages);
router.get("/messages/pending", handleGetPendingMessages);
router.post("/message", handleAddNewMessage);
router.post("/message/approve/:messageId", handleApproveMessages);
router.delete("/message/:messageId", handleDeleteMessage);

export default router;
