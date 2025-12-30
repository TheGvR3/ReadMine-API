import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserProfile, updatePassword, updateProfile} from "../controllers//user/index.js";
import { handleEditorRequest } from "../controllers/user/handleEditorRequest.js";
import { requestEditorRole } from "../controllers/user/requestEditoreRole.js";
import { validateProfileUpdate, validatePasswordUpdate } from "../middlewares/validators/userValidator.js";



const router = express.Router();

// Rotta protetta: profilo utente
router.get("/profile", getUserProfile);
router.put("/profile/update", validateProfileUpdate, updateProfile);
router.put("/profile/updatePassword", validatePasswordUpdate, updatePassword);
// Rotta per richiedere il ruolo di editore
router.post("/editorrequests", requestEditorRole);
// Rotta per gestire le richieste di ruolo editore (accessibile solo agli admin)
router.post("/handleeditorrequest", auth("admin"), handleEditorRequest);



export default router;