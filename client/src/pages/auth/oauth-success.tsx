import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { toast } from "sonner";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const expiresAt = searchParams.get('expiresAt');
    const user = searchParams.get('user');
    const reportSetting = searchParams.get('reportSetting');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (token && expiresAt && user && reportSetting) {
      try {
        const userData = JSON.parse(user);
        const reportSettingData = JSON.parse(reportSetting);

        dispatch(setCredentials({
          user: userData,
          accessToken: token,
          expiresAt: parseInt(expiresAt),
          reportSetting: reportSettingData,
        }));

        if (isNewUser) {
          toast.success("Welcome to Hyreliq! Your account has been created successfully.");
        } else {
          toast.success("Successfully signed in with Google!");
        }
        
        navigate(PROTECTED_ROUTES.OVERVIEW);
      } catch (error) {
        console.error('Error parsing OAuth data:', error);
        toast.error("Authentication failed. Please try again.");
        navigate("/auth/sign-in");
      }
    } else {
      toast.error("Authentication failed. Please try again.");
      navigate("/auth/sign-in");
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;


