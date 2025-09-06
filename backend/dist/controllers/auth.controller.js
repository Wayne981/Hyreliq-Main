"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallbackController = exports.googleAuthController = exports.loginController = exports.registerController = void 0;
const http_config_1 = require("../config/http.config");
const asyncHandler_middlerware_1 = require("../middlewares/asyncHandler.middlerware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
const env_config_1 = require("../config/env.config");
exports.registerController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const body = auth_validator_1.registerSchema.parse(req.body);
    const result = await (0, auth_service_1.registerService)(body);
    return res.status(http_config_1.HTTPSTATUS.CREATED).json({
        message: "User registered successfully",
        data: result,
    });
});
exports.loginController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const body = auth_validator_1.loginSchema.parse({
        ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } = await (0, auth_service_1.loginService)(body);
    return res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "User logged in successfully",
        user,
        accessToken,
        expiresAt,
        reportSetting,
    });
});
// Google OAuth controllers
exports.googleAuthController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    // This will be handled by passport middleware
    // User will be redirected to Google
});
exports.googleCallbackController = (0, asyncHandler_middlerware_1.asyncHandler)(async (req, res) => {
    const authResult = req.user;
    if (!authResult || !authResult.user) {
        return res.redirect(`${env_config_1.Env.FRONTEND_ORIGIN}/auth/sign-in?error=oauth_failed`);
    }
    const { user, isNewUser } = authResult;
    const { accessToken, expiresAt, reportSetting } = await (0, auth_service_1.googleOAuthService)(user._id);
    // Redirect to frontend with tokens and user info
    const redirectUrl = new URL(`${env_config_1.Env.FRONTEND_ORIGIN}/auth/oauth-success`);
    redirectUrl.searchParams.set('token', accessToken);
    redirectUrl.searchParams.set('expiresAt', (expiresAt || Date.now() + 15 * 60 * 1000).toString());
    redirectUrl.searchParams.set('user', JSON.stringify(user.omitPassword()));
    redirectUrl.searchParams.set('reportSetting', JSON.stringify(reportSetting));
    redirectUrl.searchParams.set('isNewUser', isNewUser.toString());
    return res.redirect(redirectUrl.toString());
});
