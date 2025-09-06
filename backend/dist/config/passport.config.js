"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportGoogleCallback = exports.passportAuthenticateGoogle = exports.passportAuthenticateJwt = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_config_1 = require("./env.config");
const user_service_1 = require("../services/user.service");
const user_model_1 = __importDefault(require("../models/user.model"));
const report_setting_model_1 = __importStar(require("../models/report-setting.model"));
const helper_1 = require("../utils/helper");
const mongoose_1 = __importDefault(require("mongoose"));
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env_config_1.Env.JWT_SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
};
passport_1.default.use(new passport_jwt_1.Strategy(options, async (payload, done) => {
    try {
        if (!payload.userId) {
            return done(null, false, { message: "Invalid token payload" });
        }
        const user = await (0, user_service_1.findByIdUserService)(payload.userId);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
// Google OAuth Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_config_1.Env.GOOGLE_CLIENT_ID,
    clientSecret: env_config_1.Env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    const session = await mongoose_1.default.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;
            const googleId = profile.id;
            const profilePicture = profile.photos?.[0]?.value || null;
            if (!email) {
                throw new Error("No email found in Google profile");
            }
            // Check if user already exists with this email or Google ID
            let user = await user_model_1.default.findOne({
                $or: [{ email }, { googleId }]
            }).session(session);
            if (user) {
                // Update Google ID and profile picture if not set
                let updated = false;
                if (!user.googleId) {
                    user.googleId = googleId;
                    updated = true;
                }
                if (!user.profilePicture && profilePicture) {
                    user.profilePicture = profilePicture;
                    updated = true;
                }
                if (updated) {
                    await user.save({ session });
                }
                result = { user, isNewUser: false };
            }
            else {
                // Create new user
                user = new user_model_1.default({
                    name,
                    email,
                    googleId,
                    profilePicture,
                    password: undefined, // Google OAuth users don't have passwords
                });
                await user.save({ session });
                // Create default report settings for new user
                const reportSetting = new report_setting_model_1.default({
                    userId: user._id,
                    frequency: report_setting_model_1.ReportFrequencyEnum.MONTHLY,
                    isEnabled: true,
                    nextReportDate: (0, helper_1.calulateNextReportDate)(),
                    lastSentDate: null,
                });
                await reportSetting.save({ session });
                result = { user, isNewUser: true };
            }
        });
        return done(null, result);
    }
    catch (error) {
        return done(error, false);
    }
    finally {
        await session.endSession();
    }
}));
passport_1.default.serializeUser((user, done) => done(null, user));
passport_1.default.deserializeUser((user, done) => done(null, user));
exports.passportAuthenticateJwt = passport_1.default.authenticate("jwt", {
    session: false,
});
exports.passportAuthenticateGoogle = passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
});
exports.passportGoogleCallback = passport_1.default.authenticate("google", {
    session: false,
});
