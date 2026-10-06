import Logo from "../assets/logo.svg";
import LogoDark from "../assets/LogoDark.svg";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { forgotPassword } from "../controllers/auth.controller";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import {
  IconMail,
  IconArrowRight,
  IconChevronLeft,
  IconShieldCheck,
  IconKey,
} from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;

    if (!username) {
      e.target.username.focus();
      toast.error(t("login.username_error"));
      return;
    }

    try {
      toast.loading(t("login.loading_message"));

      const res = await forgotPassword(username);

      if (res.status === 200) {
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || t("reset_password.error_message");
      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-slate-950">
      {/* Left Column */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-slate-950 text-white relative overflow-hidden flex-col justify-between p-12 lg:p-16 border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0596691a_0,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <img src={LogoDark} alt="RestroPro" className="h-10 w-auto object-contain" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            Account Recovery
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
            <IconKey className="w-6 h-6" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Secure Password <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              Recovery Process.
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-base xl:text-lg leading-relaxed">
            Enter your registered email address and we'll send you instructions to reset your password securely.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <IconShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Encrypted security tokens • Expire in 15 minutes</span>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <div className="lg:hidden mb-6 flex items-center justify-between">
              <img src={theme === "black" ? LogoDark : Logo} alt="Logo" className="h-10 w-auto" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your email address to receive a password reset link.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 mt-2"
            >
              <span>{t("reset_password.reset_button")}</span>
              <IconArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <IconChevronLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
