// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import autoriRoutes from "./autoriRoutes.js";
import genereRoutes from "./genereRoutes.js";
import tipoRoutes from "./tipoRoutes.js";
import opereRoutes from "./opereRoutes.js";
import serieRoutes from "./serieRoutes.js";
import letturaRoutes from "./letturaRoutes.js";
import chatbotRoutes from "./chatbotRoutes.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Rotte pubbliche: autenticazione
router.use("/auth", authRoutes);

// Rotte protette: richiedono JWT valido
router.use(auth);
router.use("/users", userRoutes);
router.use("/autori", autoriRoutes);
router.use("/genere", genereRoutes);
router.use("/tipo", tipoRoutes);
router.use("/opere", opereRoutes);
router.use("/serie", serieRoutes);
router.use("/letture", letturaRoutes);
router.use("/ai", chatbotRoutes);
export default router;
