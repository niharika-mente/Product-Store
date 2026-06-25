import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getSavedItems,
  addToSavedForLater,
  removeFromSavedForLater,
  syncSavedItems,
} from "../controllers/savedForLater.controller.js";

const router = express.Router();

router.use(protect); // Ensure user is authenticated

router.get("/", getSavedItems);
router.post("/add", addToSavedForLater);
router.delete("/remove/:productId", removeFromSavedForLater);
router.post("/sync", syncSavedItems);

export default router;
