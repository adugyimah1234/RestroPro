import { useState } from "react";
import LogoDark from "../assets/LogoDark.svg";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../controllers/auth.controller";
import { validateEmail } from "../utils/emailValidator";
import { validateGhanaPhone, formatPhoneNumber } from "../utils/phoneValidator";
import {
  checkPasswordRequirements,
  generateStrongPassword,
} from "../utils/passwordValidator";
import { useTranslation } from "react-i18next";
import {
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconCheck,
  IconWand,
  IconX,
  IconReceiptTax,
  IconDeviceDesktopAnalytics,
  IconBox,
  IconChartPie,
} from "@tabler/icons-react";

export default function RegistrationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [bizName, setBizName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(16);
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(generated);
      toast.success(
        t("register.password_copied") ||
          "Strong password generated and copied to clipboard!"
      );
    } else {
      toast.success("Strong password generated!");
    }
  };

  const validateStep1 = () => {
    if (!bizName.trim()) {
      toast.error(t("register.business_name_error"));
      return false;
    }

    if (!email.trim()) {
      toast.error(t("register.email_error"));
      return false;
    }

    if (!validateEmail(email)) {
      toast.error(t("register.valid_email_error"));
      return false;
    }

    if (!phone.trim()) {
      toast.error(t("register.phone_error") || "Please provide phone number!");
      return false;
    }

    if (!validateGhanaPhone(phone)) {
      toast.error(
        t("register.valid_ghana_phone_error") ||
          "Please provide a valid Ghanaian phone number (e.g. 024XXXXXXX or +23324XXXXXXX)!"
      );
      return false;
    }

    if (!location.trim()) {
      toast.error(t("register.location_error") || "Please provide location!");
      return false;
    }

    return true;
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!password) {
      toast.error(t("register.password_error"));
      return;
    }

    if (!confirmPassword) {
      toast.error(
        t("register.confirm_password_error") || "Please confirm your password!"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        t("register.password_mismatch_error") || "Passwords do not match!"
      );
      return;
    }

    const { isValid } = checkPasswordRequirements(password);
    if (!isValid) {
      toast.error(
        t("register.weak_password_error") ||
          "Please set a strong password meeting all security requirements!"
      );
      return;
    }

    try {
      toast.loading(t("register.loading_message"));

      const res = await signUp(bizName, email, password, phone, location);
      toast.dismiss();
      if (res.status === 200) {
        toast.success(res.data.message);
        navigate("/login", {
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
        error?.response?.data?.message || t("register.error_message");

      toast.dismiss();
      toast.error(message);
      return;
    }
  };

  const passwordValidation = checkPasswordRequirements(password);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 lg:p-10 overflow-hidden bg-slate-950">
      {/* Full Page Hero Background Image */}
      <img
        src="/assets/hero.png"
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-105"
      />

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-650/70 to-slate-450/80 pointer-events-none" />

      {/* Corner Blue Accents */}
      <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: SaaS Feature Showcase directly on full page background */}
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
              Start Managing Your <br />
              <span className="text-blue-400">Operations Today.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed pt-2">
              Join thousands of restaurants, cafés, and bars streamlining their
              billing, kitchen workflows, and staff management with RestroPro.
            </p>
          </div>

          {/* Feature Icons Row */}
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

          {/* Social Trust Badge */}
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

        {/* Right Column: Distinct Floating Card Container */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800">

            {/* Step Indicator / Progress */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 1
                      ? "bg-blue-600 text-white "
                      : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {step > 1 ? <IconCheck className="w-4 h-4 stroke-[3]" /> : "1"}
                </div>
                <div>
                  <p className={`text-xs font-bold leading-none ${step === 1 ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                    Step 1
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Business Info</p>
                </div>
              </div>

              <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-3">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 2
                      ? "bg-blue-600 text-white "
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  2
                </div>
                <div>
                  <p className={`text-xs font-bold leading-none ${step === 2 ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                    Step 2
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Security</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {step === 1 ? "Business Details" : "Account Security"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {step === 1
                ? "Enter your restaurant and contact details."
                : "Create a secure password to protect your account."}
            </p>

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {step === 1 ? (
                <>
                  {/* Business Name */}
                  <div>
                    <label
                      htmlFor="biz_name"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      {t("register.business_name_label")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconBuilding className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        id="biz_name"
                        name="biz_name"
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        required
                        placeholder={t("register.business_name_placeholder")}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      {t("register.email_label")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconMail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        id="username"
                        name="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t("register.email_placeholder")}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                      />
                    </div>
                  </div>

                  {/* Phone Number (Ghanaian) */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      {t("register.phone_label")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconPhone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => {
                          if (phone) {
                            setPhone(formatPhoneNumber(phone));
                          }
                        }}
                        required
                        placeholder={t("register.phone_placeholder")}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                      />
                    </div>
                  </div>

                  {/* Location / Address */}
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      {t("register.location_label")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconMapPin className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        placeholder={t("register.location_placeholder")}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                      />
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mt-6 shadow-none border-0"
                  >
                    <span>Continue</span>
                    <IconArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {/* Password Field + Generate Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {t("register.password_label")}
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline transition-colors"
                      >
                        <IconWand className="w-3.5 h-3.5" />
                        <span>{t("register.generate_password")}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconLock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={t("register.password_placeholder")}
                        className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <IconEyeOff className="w-5 h-5" />
                        ) : (
                          <IconEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label
                      htmlFor="confirm_password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      {t("register.confirm_password_label")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <IconLock className="w-5 h-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm_password"
                        name="confirm_password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder={t("register.confirm_password_placeholder")}
                        className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <IconEyeOff className="w-5 h-5" />
                        ) : (
                          <IconEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Real-time Password Strength Requirements Checklist */}
                  {password && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs space-y-1.5 border border-slate-200/80 dark:border-slate-700/80">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {passwordValidation.reqs.map((req) => (
                          <div
                            key={req.id}
                            className={`flex items-center gap-1.5 ${
                              req.met
                                ? "text-blue-600 dark:text-blue-400 font-medium"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {req.met ? (
                              <IconCheck className="w-3.5 h-3.5 flex-shrink-0" />
                            ) : (
                              <IconX className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons: Back & Register */}
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all focus:outline-none"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-none border-0"
                    >
                      <span>{t("register.register_button")}</span>
                      <IconArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Login Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                >
                  {t("register.signin_button")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
