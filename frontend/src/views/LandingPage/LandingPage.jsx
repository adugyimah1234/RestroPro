import React from "react";
import LNavbar from "./LNavbar";
import { Link } from "react-router-dom";
import {
  IconChefHat,
  IconDeviceIpadHorizontal,
  IconLayout,
  IconSparkles,
  IconShieldCheck,
  IconCrown,
} from "@tabler/icons-react";
import Logo from "../../assets/logo.svg";
import { supportEmail } from "../../config/config";
import LanguageChanger from "../../components/LanguageChanger";
import { useTranslation } from "react-i18next";
import { usePublicSubscriptionPlans } from "../../controllers/superadmin.controller";

export default function LadingPage() {
  const { t } = useTranslation();
  const { data: plans, isLoading } = usePublicSubscriptionPlans();

  const getPlanIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("basic")) {
      return <IconShieldCheck size={28} className="text-blue-600" />;
    } else if (lower.includes("advance") || lower.includes("advanced")) {
      return <IconCrown size={28} className="text-amber-500" />;
    }
    return <IconSparkles size={28} className="text-blue-900" />;
  };

  return (
    <div className="w-full bg-white text-slate-800">
      {/* navbar */}
      <LNavbar />
      {/* navbar */}

      {/* hero */}
      <div className="w-full container mx-auto flex flex-col items-center mt-32 px-6 lg:px-12">
        <h3 className="text-3xl lg:text-5xl font-extrabold text-center text-slate-900 tracking-tight">
          {t("landing_page.all_in_one_pos")}
        </h3>
        <h3 className="text-3xl lg:text-5xl font-extrabold text-center text-blue-900 mt-2 tracking-tight">
          {t("landing_page.for_your_business")}
        </h3>

        <p className="text-slate-600 mt-6 text-center max-w-2xl text-lg">
          {t("landing_page.hero_description")}
        </p>

        <div className="flex items-center gap-4 mt-8">
          <Link
            className="bg-blue-900 hover:bg-slate-900 text-lg text-white font-semibold rounded-full px-7 py-3 transition active:scale-95 shadow-md"
            to="/register"
          >
            {t("landing_page.get_started")}
          </Link>
          <a
            className="hover:bg-slate-100 text-slate-800 font-semibold text-lg rounded-full px-6 py-3 transition active:scale-95 border border-slate-200"
            href="#pricing"
          >
            {t("landing_page.view_pricing")}
          </a>
        </div>
      </div>
      <img
        src="/assets/hero.webp"
        alt="tervoraRestore app preview"
        className="w-full block mt-12 max-w-6xl mx-auto rounded-3xl shadow-xl border border-slate-100"
      />
      {/* hero */}

      {/* features */}
      <h3 className="text-4xl font-extrabold text-center text-slate-900 container mx-auto mt-36">
        {t("landing_page.features")}
      </h3>
      <div
        id="features"
        className="w-full container mx-auto grid grid-cols-1 lg:grid-cols-3 my-16 gap-8 px-6 lg:px-12"
      >
        <div className="rounded-3xl px-8 py-8 border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl text-blue-900 bg-blue-100">
            <IconLayout size={28} />
          </div>
          <h3 className="mt-5 font-bold text-2xl text-center text-slate-900">{t("landing_page.minimal_ui")}</h3>
          <p className="text-slate-600 mt-3 text-center leading-relaxed">
            {t("landing_page.minimal_ui_description")}
          </p>
        </div>

        <div className="rounded-3xl px-8 py-8 border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl text-blue-900 bg-blue-100">
            <IconDeviceIpadHorizontal size={28} />
          </div>
          <h3 className="mt-5 font-bold text-2xl text-center text-slate-900">{t("landing_page.pos")}</h3>
          <p className="text-slate-600 mt-3 text-center leading-relaxed">
            {t("landing_page.pos_description")}
          </p>
        </div>

        <div className="rounded-3xl px-8 py-8 border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl text-blue-900 bg-blue-100">
            <IconChefHat size={28} />
          </div>
          <h3 className="mt-5 font-bold text-2xl text-center text-slate-900">{t("landing_page.live_updates")}</h3>
          <p className="text-slate-600 mt-3 text-center leading-relaxed">
            {t("landing_page.live_updates_description")}
          </p>
        </div>
      </div>
      {/* features */}

      {/* pricing */}
      <h3 className="text-4xl font-extrabold text-center text-slate-900 container mx-auto mt-36">
        {t("landing_page.pricing")}
      </h3>
      <p className="text-slate-600 text-center mt-2 max-w-xl mx-auto">
        Choose the perfect plan for your business with transparent pricing and no hidden fees.
      </p>

      <div
        id="pricing"
        className="w-full container mx-auto my-16 px-6 lg:px-12"
      >
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading pricing plans...</div>
        ) : Array.isArray(plans) && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular =
                plan.badge?.toLowerCase().includes("popular") ||
                plan.name?.toLowerCase().includes("premium");

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? "border-blue-900 shadow-2xl bg-gradient-to-b from-blue-50/60 to-white scale-[1.03]"
                      : "border-slate-200 bg-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {getPlanIcon(plan.name)}
                      <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
                      {plan.description || "Everything you need to run your store effectively."}
                    </p>

                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">
                          {plan.currency || "GH₵"}
                          {Number(plan.price || plan.amount || 0).toFixed(2)}
                        </span>
                        <span className="text-sm font-medium text-slate-500">
                          / {plan.frequency || "monthly"}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 text-sm text-slate-700">
                      {Array.isArray(plan.features) && plan.features.length > 0 ? (
                        plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                              ✓
                            </span>
                            <span>{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center gap-2">
                          <span className="text-blue-900 font-bold">✓</span> Full POS & Orders Management
                        </li>
                      )}
                    </ul>
                  </div>

                  <Link
                    to="/register"
                    className={`w-full text-center py-3.5 px-6 rounded-full font-semibold text-lg transition active:scale-95 shadow-md ${
                      isPopular
                        ? "bg-blue-900 hover:bg-slate-900 text-white"
                        : "bg-slate-900 hover:bg-blue-900 text-white"
                    }`}
                  >
                    Get Started with {plan.name}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="rounded-3xl px-8 py-8 border border-slate-200 bg-white shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic</h3>
                <h3 className="text-4xl font-extrabold text-blue-900 mb-6">GH₵30.00 <span className="text-sm font-normal text-slate-500">/mo</span></h3>
                <ul className="space-y-3 text-slate-700 mb-8">
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Up to 500 orders/mo</li>
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Single Branch Access</li>
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Standard POS & Kitchen Display</li>
                </ul>
              </div>
              <Link to="/register" className="w-full text-center py-3 bg-slate-900 text-white rounded-full font-semibold">Get Started</Link>
            </div>

            <div className="rounded-3xl px-8 py-8 border-2 border-blue-900 bg-blue-50/30 shadow-2xl flex flex-col justify-between">
              <div>
                <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>
                <h3 className="text-2xl font-bold text-slate-900 my-2">Premium</h3>
                <h3 className="text-4xl font-extrabold text-blue-900 mb-6">GH₵50.00 <span className="text-sm font-normal text-slate-500">/mo</span></h3>
                <ul className="space-y-3 text-slate-700 mb-8">
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Unlimited Orders</li>
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Up to 3 Branches</li>
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Inventory & Stock Management</li>
                </ul>
              </div>
              <Link to="/register" className="w-full text-center py-3 bg-blue-900 text-white rounded-full font-semibold">Get Started</Link>
            </div>

            <div className="rounded-3xl px-8 py-8 border border-slate-200 bg-white shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Advance</h3>
                <h3 className="text-4xl font-extrabold text-blue-900 mb-6">GH₵90.00 <span className="text-sm font-normal text-slate-500">/mo</span></h3>
                <ul className="space-y-3 text-slate-700 mb-8">
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Unlimited Orders & Branches</li>
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> Advanced Analytics & PDF Reports</li>
                  <li className="flex items-center gap-2"><span className="text-blue-900 font-bold">✓</span> 24/7 Dedicated Support</li>
                </ul>
              </div>
              <Link to="/register" className="w-full text-center py-3 bg-slate-900 text-white rounded-full font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </div>
      {/* pricing */}

      {/* contact */}
      <div id="contact" className="container mx-auto my-36 px-6 lg:px-12">
        <div
          className="lg:h-44 px-10 py-8 flex gap-6 flex-col md:flex-row lg:items-center rounded-3xl bg-slate-900 text-white shadow-2xl"
        >
          <h3 className="flex-1 font-extrabold text-3xl md:text-4xl text-white">
            {t("landing_page.have_any_queries")}
          </h3>
          <a
            className="bg-white text-lg font-semibold text-slate-900 hover:bg-slate-100 rounded-full px-7 py-3 transition active:scale-95 block text-center"
            href={`mailto:${supportEmail}`}
          >
            {t("landing_page.contact_us")}
          </a>
        </div>
      </div>
      {/* contact */}

      {/* footer */}
      <div className="w-full border-t border-slate-200 bg-slate-50">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-6 container mx-auto px-6 py-12 lg:px-12">
          <div className="w-full md:max-w-80">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="tervoraRestore logo" className="h-10" />
              <span className="font-bold text-xl text-slate-900">tervoraRestore</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              {t('landing_page.footer_description')}
            </p>

            <div className="flex items-center mt-6 gap-2">
              <label htmlFor="language" className="text-sm font-medium text-slate-600">{t("landing_page.language")}</label>
              <LanguageChanger className="border bg-white hover:bg-slate-100 text-slate-700 rounded-full px-4 py-2 text-sm transition active:scale-95" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a
              className="hover:bg-slate-200/60 text-slate-700 rounded-full px-4 py-2 transition text-sm active:scale-95"
              href="#"
            >
              {t("landing_page.privacy_policy")}
            </a>
            <a
              className="hover:bg-slate-200/60 text-slate-700 rounded-full px-4 py-2 transition text-sm active:scale-95"
              href="#"
            >
              {t("landing_page.refund_policy")}
            </a>
            <a
              className="hover:bg-slate-200/60 text-slate-700 rounded-full px-4 py-2 transition text-sm active:scale-95"
              href="#"
            >
              {t("landing_page.terms_conditions")}
            </a>
          </div>
        </div>

        <div className="border-t border-slate-200 text-sm text-slate-500 text-center py-6">
          tervoraRestore POS &copy; {new Date().getFullYear()}
        </div>
      </div>
      {/* footer */}
    </div>
  );
}
