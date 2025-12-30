import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserProfile, updatePassword, updateProfile } from "../controllers//user/index.js";
import { handleEditorRequest } from "../controllers/user/handleEditorRequest.js";
import { requestEditorRole } from "../controllers/user/requestEditoreRole.js";
import {getPendingEditorRequests} from "../controllers/user/getPendingEditorRequest.js";
import { getEditorRequestsHistory } from "../controllers/user/getEditorRequestHistory.js";
import { validateProfileUpdate, validatePasswordUpdate } from "../middlewares/validators/userValidator.js";



const router = express.Router();

// Rotta protetta: profilo utente
router.get("/profile", getUserProfile);
router.put("/profile/update", validateProfileUpdate, updateProfile);
router.put("/profile/updatePassword", validatePasswordUpdate, updatePassword);
// Rotta per richiedere il ruolo di editore
router.post("/editorrequests", requestEditorRole);
/**
 * TODO: Proteggere queste rotte con il middleware auth dopo averlo corretto.
 * - /editorrequests: deve essere accessibile a tutti gli utenti loggati (auth).
 * - /handleeditorrequest: deve essere accessibile solo agli admin (auth con controllo ruoli).
 */
router.get("/editorrequestslist", getPendingEditorRequests);
router.get("/editorrequestshistory", getEditorRequestsHistory);
router.post("/handleeditorrequest", handleEditorRequest);



export default router;