import express from "express";
import {
  getMyMessages,
  addNewMessage,
  deleteMessage,
} from "./src/controllers/user.js";
import {
  approveMessages,
  getPendingMessages,
  rejectMessages,
} from "./src/controllers/admin.js";

const router = express.Router();

const userRouter = express.Router();
const adminRouter = express.Router();

userRouter.get("/pending", getMyMessages);
userRouter.post("/message", addNewMessage);
userRouter.delete("/message/:id", deleteMessage);

adminRouter.get("/pending", getPendingMessages);
adminRouter.post("/message/approve/:id", approveMessages);
adminRouter.delete("/message/reject/:id", rejectMessages);
// router.get("/", (req, res) => {
//   res.json({ message: "Hello from server!" });
// });

// delete message
// approve message
// mypending messages
// post message

// get pending message

router.use("/user", userRouter);
router.use("/admin", adminRouter);

// router.get("/user", (req, res) => getMyMessages)
// router.get("/user/approved", (req, res) => {})

// router.post("/user/message", (req, res) => {})

export default router;
