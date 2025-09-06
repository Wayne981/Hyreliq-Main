import { Router } from "express";
import {
  loginController,
  registerController,
  googleAuthController,
  googleCallbackController,
} from "../controllers/auth.controller";
import { passportAuthenticateGoogle, passportGoogleCallback } from "../config/passport.config";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);

// Google OAuth routes
authRoutes.get("/google", passportAuthenticateGoogle, googleAuthController);
authRoutes.get("/google/callback", passportGoogleCallback, googleCallbackController);

export default authRoutes;

