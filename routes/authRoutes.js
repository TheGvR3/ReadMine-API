import express from "express";
import {
    register,
    login,
    refreshToken,
    logout
} from "../controllers/auth/index.js";
import { validateRegister, validateLogin } from "../middlewares/validators/authValidator.js";


const router = express.Router(); 

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh", refreshToken);

// rotte protette
router.post("/logout", logout);

export default router;
