import React from "react";
import LNavbar from "./LNavbar";
import { Link } from "react-router-dom";
import {
  IconChefHat,
  IconDeviceIpadHorizontal,
  IconDeviceTablet,
  IconLayout,
} from "@tabler/icons-react";
import Logo from "../../assets/logo.svg";
import { subscriptionPrice, supportEmail } from "../../config/config";
import LanguageChanger from "../../components/LanguageChanger";
import { useTranslation } from "react-i18next";

export default function LadingPage() {
  const { t } = useTranslation();

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
            to="/login"
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
      <div
        id="pricing"
        className="w-full container mx-auto grid grid-cols-1 my-16 gap-10 place-items-center px-6 lg:px-0"
      >
        <div className="rounded-3xl px-8 py-8 border border-slate-200 bg-white shadow-lg flex flex-col w-full lg:w-96">
          <h3 className="text-5xl text-blue-900 font-extrabold text-center">{subscriptionPrice}</h3>
          <h3 className="font-bold text-xl text-slate-600 text-center mt-1">{t("landing_page.per_month")}</h3>
          <ul className="text-slate-700 mt-8 flex flex-col gap-3 text-start">
            <li className="flex items-center gap-2">
              <span className="text-blue-900 font-bold">✓</span> {t("landing_page.unlimited_orders")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-900 font-bold">✓</span> {t("landing_page.monthly_renewals")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-900 font-bold">✓</span> {t("landing_page.unlimited_devices")}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-900 font-bold">✓</span> {t("landing_page.live_kitchen_orders")}
            </li>
          </ul>
        </div>
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
