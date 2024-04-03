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
import { checkInteractiveCredentials } from "./middleware/checkInteractiveCredentials.js";
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

router.get("/theme", checkInteractiveCredentials, handleGetTheme);
router.post("/theme", checkInteractiveCredentials, handleUpdateTheme);

router.get("/visitor", checkInteractiveCredentials, handleGetVisitor);

router.get("/messages", checkInteractiveCredentials, handleGetUserMessages);
router.get("/messages/pending", checkInteractiveCredentials, handleGetPendingMessages);
router.post("/message", checkInteractiveCredentials, handleAddNewMessage);
router.post("/message/approve/:messageId", checkInteractiveCredentials, handleApproveMessages);
router.delete("/message/:messageId", checkInteractiveCredentials, handleDeleteMessage);

export default router;
