import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService, googleOAuthService } from "../services/auth.service";
import { Env } from "../config/env.config";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  }
);

// Google OAuth controllers
export const googleAuthController = asyncHandler(
  async (req: Request, res: Response) => {
    // This will be handled by passport middleware
    // User will be redirected to Google
  }
);

export const googleCallbackController = asyncHandler(
  async (req: Request, res: Response) => {
    const authResult = req.user as any;
    
    if (!authResult || !authResult.user) {
      return res.redirect(`${Env.FRONTEND_ORIGIN}/auth/sign-in?error=oauth_failed`);
    }

    const { user, isNewUser } = authResult;
    const { accessToken, expiresAt, reportSetting } = await googleOAuthService(user._id);

    // Redirect to frontend with tokens and user info
    const redirectUrl = new URL(`${Env.FRONTEND_ORIGIN}/auth/oauth-success`);
    redirectUrl.searchParams.set('token', accessToken);
    redirectUrl.searchParams.set('expiresAt', (expiresAt || Date.now() + 15 * 60 * 1000).toString());
    redirectUrl.searchParams.set('user', JSON.stringify(user.omitPassword()));
    redirectUrl.searchParams.set('reportSetting', JSON.stringify(reportSetting));
    redirectUrl.searchParams.set('isNewUser', isNewUser.toString());

    return res.redirect(redirectUrl.toString());
  }
);
