"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const passport_config_1 = require("../config/passport.config");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/register", auth_controller_1.registerController);
authRoutes.post("/login", auth_controller_1.loginController);
// Google OAuth routes
authRoutes.get("/google", passport_config_1.passportAuthenticateGoogle, auth_controller_1.googleAuthController);
authRoutes.get("/google/callback", passport_config_1.passportGoogleCallback, auth_controller_1.googleCallbackController);
exports.default = authRoutes;
