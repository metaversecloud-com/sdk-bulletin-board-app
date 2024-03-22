import express from "express";
import {
  handleAddNewMessage,
  handleApproveMessages,
  handleCheckInteractiveCredentials, handleDeleteMessage,
  handleGetMyMessages,
  handleGetPendingMessages,
  handleGetTheme,
  handleGetVisitor,
  handleRejectMessages,
} from "./controllers";
import { getVersion } from "./utils/getVersion"

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
    },
  });
});

router.get("/system/interactive-credentials", handleCheckInteractiveCredentials);

router.get("/theme", handleGetTheme);

router.get("/visitor", handleGetVisitor);

router.post("/user/message", handleAddNewMessage);
router.get("/user/pending", handleGetMyMessages);
router.delete("/user/message/:id", handleDeleteMessage);

router.get("/admin/pending", handleGetPendingMessages);
router.post("/admin/message/approve/:id", handleApproveMessages);
router.delete("/admin/message/reject/:id", handleRejectMessages);

export default router;
