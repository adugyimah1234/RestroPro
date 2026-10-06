import { useEffect, useState } from "react";
import LogoDark from "../../assets/LogoDark.svg";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isRestroUserAuthenticated } from "../../helpers/AuthStatus";
import {
  getUserDetailsInLocalStorage,
  saveUserDetailsInLocalStorage,
} from "../../helpers/UserDetails";
import { signIn } from "../../controllers/superadmin.controller";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconDeviceDesktopAnalytics,
  IconBox,
  IconChartPie,
  IconBuilding,
} from "@tabler/icons-react";

export default function SuperAdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const restroAuthenticated = isRestroUserAuthenticated();
    if (restroAuthenticated) {
      const userDetails = getUserDetailsInLocalStorage();
      if (userDetails && userDetails.role === "superadmin") {
        navigate("/superadmin/dashboard/home", {
          replace: true,
        });
        return;
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username) {
      e.target.username.focus();
      toast.error(t("superadmin_login.username_error"));
      return;
    }

    if (!password) {
      e.target.password.focus();
      toast.error(t("superadmin_login.password_error"));
      return;
    }

    try {
      toast.loading(t("superadmin_login.loading_message"));

      const res = await signIn(username, password);

      if (res.status === 200) {
        toast.dismiss();
        toast.success(t("superadmin_login.success_message"));

        const user = res.data.user;
        saveUserDetailsInLocalStorage(user);

        navigate("/superadmin/dashboard/home", {
          replace: true,
        });
        return;
      } else {
        const message = res.data.message;
        toast.dismiss();
        toast.error(message);
        return;
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message || t("superadmin_login.error_message");

      toast.dismiss();
      toast.error(message);
      return;
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 lg:p-10 overflow-hidden bg-slate-950">
      {/* Full Page Hero Background Image */}
      <img
        src="/assets/hero.png"
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-105"
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-650/75 to-slate-650/85 pointer-events-none" />

      {/* Corner Blue Accents */}
      <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: SuperAdmin Control Branding directly on full page background */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between text-white py-6 lg:py-8 space-y-8">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src={LogoDark}
                alt="RestroPro Admin"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Main Headline */}
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Platform Control & <br />
              <span className="text-blue-400">Tenant Management.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed pt-2">
              Restricted portal for superadministrators to oversee multi-tenant configurations, subscriptions, global metrics, and system settings.
            </p>
          </div>

          {/* Feature Badges Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconBuilding className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Tenants
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconDeviceDesktopAnalytics className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Subscriptions
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconBox className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Global Logs
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconChartPie className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Revenue
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating White/Dark Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 dark:border-slate-800">


            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
               Sign In
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your administrative credentials to continue.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  {t("superadmin_login.email_label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <IconMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="username"
                    name="username"
                    required
                    placeholder={t("superadmin_login.email_placeholder")}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  {t("superadmin_login.password_label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder={t("superadmin_login.password_placeholder")}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeOff className="w-5 h-5" />
                    ) : (
                      <IconEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button WITHOUT SHADOW */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-2 shadow-none border-0"
              >
                <span>{t("superadmin_login.login_button")}</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
