import { useEffect, useState } from "react";
import LogoDark from "../assets/LogoDark.svg";
import { toast } from "react-hot-toast";
import { signIn } from "../controllers/auth.controller";
import { Link, useNavigate } from "react-router-dom";
import { isRestroUserAuthenticated } from "../helpers/AuthStatus";
import {
  getUserDetailsInLocalStorage,
  saveUserDetailsInLocalStorage,
} from "../helpers/UserDetails";
import { SCOPES } from "../config/scopes";
import { useTranslation } from "react-i18next";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconReceiptTax,
  IconDeviceDesktopAnalytics,
  IconBox,
  IconChartPie,
  IconBuilding,
} from "@tabler/icons-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const restroAuthenticated = isRestroUserAuthenticated();
    if (restroAuthenticated) {
      const userDetails = getUserDetailsInLocalStorage();
      if (!userDetails) {
        return;
      }

      const { role, scope } = userDetails;
      if (role === "superadmin") {
        navigate("/superadmin/dashboard/home", {
          replace: true,
        });
        return;
      }
      if (role === "admin") {
        navigate("/dashboard/home", {
          replace: true,
        });
        return;
      }
      const userScopes = scope.split(",");
      if (userScopes.includes(SCOPES.DASHBOARD)) {
        navigate("/dashboard/home", {
          replace: true,
        });
        return;
      } else {
        navigate("/dashboard/profile", {
          replace: true,
        });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    if (!username) {
      e.target.username.focus();
      toast.error(t("login.username_error"));
      return;
    }

    if (!password) {
      e.target.password.focus();
      toast.error(t("login.password_error"));
      return;
    }

    try {
      toast.loading(t("login.loading_message"));

      const res = await signIn(username, password);

      if (res.status === 200) {
        toast.dismiss();
        toast.success(t("login.success_message"));

        const user = res.data.user;
        saveUserDetailsInLocalStorage(user);

        const userDetails = getUserDetailsInLocalStorage();
        if (!userDetails) {
          return;
        }
        const { role, scope } = userDetails;
        if (role === "admin") {
          navigate("/dashboard/home", {
            replace: true,
          });
          return;
        }
        const userScopes = scope.split(",");
        if (userScopes.includes(SCOPES.DASHBOARD)) {
          navigate("/dashboard/home", {
            replace: true,
          });
          return;
        } else {
          navigate("/dashboard/profile", {
            replace: true,
          });
        }

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
        error?.response?.data?.message || t("login.error_message");

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

      {/* Dark Overlay Gradient for contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/100 via-slate-650/70 to-slate-650/80 pointer-events-none" />

      {/* Corner Blue Accents */}
      <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: SaaS Features & Branding directly on full page background */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between text-white py-6 lg:py-8 space-y-8">
          {/* Logo Header */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src={LogoDark}
                alt="RestroPro"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Main Headline */}
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Run Your Business <br />
              <span className="text-blue-400">Smarter, Faster, Better.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed pt-2">
              Powerful POS and management software for restaurants, cafés,
              hotels and more. Streamline your operations, increase revenue,
              and deliver an exceptional experience.
            </p>
          </div>

          {/* Feature Icons Row (Translucent Dark Square Badges) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconReceiptTax className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                POS & Orders
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconDeviceDesktopAnalytics className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Kitchen Display
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconBuilding className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Branch Mgmt
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconBox className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Inventory & Stock
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md w-24 sm:w-28 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <IconChartPie className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                Reports & Analytics
              </span>
            </div>
          </div>

          {/* Social Trust Badge at bottom left */}
          <div className="inline-flex items-center gap-4 p-2.5 pr-6 rounded-full bg-black/50 border border-white/10 backdrop-blur-md max-w-max">
            <div className="flex -space-x-2">
              <img
                className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                src="/assets/avatar.png"
                alt="User Avatar"
              />
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                4k+
              </div>
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-100">
                Trusted by 10,000+ Businesses
              </p>
              <p className="text-slate-400 text-[11px]">
                Restaurants, Cafés, Hotels & More
              </p>
            </div>
            <div className="text-amber-400 text-xs font-bold flex items-center gap-1 pl-2 border-l border-white/10">
              <span>★★★★★</span>
              <span className="text-white ml-0.5">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Right Column: Distinct Floating White Card Container */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 dark:border-slate-800">

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Login to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Access your dashboard and manage your business from anywhere.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  {t("login.email_label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="username"
                    name="username"
                    required
                    placeholder={t("login.email_placeholder")}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t("login.password_label")}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                  >
                    {t("login.forgot_password")}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder={t("login.password_placeholder")}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
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
                <span>{t("login.login_button")}</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                >
                  {t("login.create_account")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
