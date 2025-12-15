import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserProfile, updatePassword, updateProfile} from "../controllers//user/index.js";
import { validateProfileUpdate, validatePasswordUpdate } from "../middlewares/validators/userValidator.js";



const router = express.Router();

// Rotta protetta: profilo utente
router.get("/profile", getUserProfile);
router.put("/profile/update", validateProfileUpdate, updateProfile);
router.put("/profile/updatePassword", validatePasswordUpdate, updatePassword);

export default router;