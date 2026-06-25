import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);

export default router;
