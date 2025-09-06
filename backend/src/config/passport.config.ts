import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Env } from "./env.config";
import { findByIdUserService } from "../services/user.service";
import UserModel from "../models/user.model";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report-setting.model";
import { calulateNextReportDate } from "../utils/helper";
import mongoose from "mongoose";

interface JwtPayload {
  userId: string;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: Env.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      if (!payload.userId) {
        return done(null, false, { message: "Invalid token payload" });
      }

      const user = await findByIdUserService(payload.userId);
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const session = await mongoose.startSession();
      
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
          let user = await UserModel.findOne({ 
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
          } else {
            // Create new user
            user = new UserModel({
              name,
              email,
              googleId,
              profilePicture,
              password: undefined, // Google OAuth users don't have passwords
            });
            await user.save({ session });

            // Create default report settings for new user
            const reportSetting = new ReportSettingModel({
              userId: user._id,
              frequency: ReportFrequencyEnum.MONTHLY,
              isEnabled: true,
              nextReportDate: calulateNextReportDate(),
              lastSentDate: null,
            });
            await reportSetting.save({ session });

            result = { user, isNewUser: true };
          }
        });

        return done(null, result);
      } catch (error) {
        return done(error, false);
      } finally {
        await session.endSession();
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});

export const passportAuthenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const passportGoogleCallback = passport.authenticate("google", {
  session: false,
});
