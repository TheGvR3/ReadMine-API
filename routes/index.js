// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import autoriRoutes from "./autoriRoutes.js";
import genereRoutes from "./genereRoutes.js";
import tipoRoutes from "./tipoRoutes.js";
import opereRoutes from "./opereRoutes.js";
import edizioniRoutes from "./edizioniRoutes.js";
import serieRoutes from "./serieRoutes.js";
import letturaRoutes from "./letturaRoutes.js";
import chatbotRoutes from "./chatbotRoutes.js";
import importRoutes from "./importRoutes.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Rotte pubbliche: autenticazione
router.use("/auth", authRoutes);

// Rotte protette: richiedono JWT valido
//
// TODO[security]: implementare middleware `requireEditor` (verifica users.editor=true) e applicarlo a:
//   - userRoutes:    /editorrequestslist, /editorrequestshistory, /handleeditorrequest  (BUG ATTIVO: oggi accessibili a chiunque sia loggato)
//   - opereRoutes:   POST/PUT/DELETE
//   - edizioniRoutes: POST/PUT/DELETE
//   - autoriRoutes:  POST/PUT/DELETE
//   - genereRoutes:  POST/PUT/DELETE + /alias (POST/DELETE)
//   - serieRoutes:   POST/PUT/DELETE
//   - importRoutes:  POST /google/import
router.use(auth);
router.use("/users", userRoutes);
router.use("/autori", autoriRoutes);
router.use("/genere", genereRoutes);
router.use("/tipo", tipoRoutes);
router.use("/opere", opereRoutes);
router.use("/edizioni", edizioniRoutes);
router.use("/serie", serieRoutes);
router.use("/letture", letturaRoutes);
router.use("/ai", chatbotRoutes);
router.use("/import", importRoutes);
export default router;
