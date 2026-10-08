import Page from "../components/Page";
import Logo from "../assets/logo.svg";
import LogoDark from "../assets/LogoDark.svg";
import { subscriptionPrice } from '../config/config';
import React from "react";
import { getPaystackSubscriptionURL } from "../controllers/auth.controller";
import { usePublicSubscriptionPlans } from "../controllers/superadmin.controller";
import { toast } from "react-hot-toast";
import { getUserDetailsInLocalStorage } from "../helpers/UserDetails";
import AppBarDropdown from "../components/AppBarDropdown";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { IconCheck, IconShieldCheck, IconSparkles, IconCrown } from "@tabler/icons-react";

export default function InActiveSubscriptionPage() {
  const { t } = useTranslation();
  const user = getUserDetailsInLocalStorage();
  const { theme } = useTheme();
  const { data: plans, isLoading } = usePublicSubscriptionPlans();

  const btnSubscribe = async (plan) => {
    toast.loading(t("loading_message", "Please wait..."));
    try {
      const res = await getPaystackSubscriptionURL(plan?.id);
      toast.dismiss();

      if (res.status === 200 && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("error_message", "Something went wrong!");
      console.error(error);
      toast.dismiss();
      toast.error(message);
    }
  };

  const getPlanIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("basic")) {
      return <IconShieldCheck size={28} className="text-blue-500" />;
    } else if (lower.includes("advance") || lower.includes("advanced")) {
      return <IconCrown size={28} className="text-amber-500" />;
    }
    return <IconSparkles size={28} className="text-restro-green" />;
  };

  return (
    <Page className="">
      <div className="flex items-center justify-between px-6 py-4 border-b border-restro-gray bg-white dark:bg-restro-card-bg">
        <img src={theme === "black" ? LogoDark : Logo} alt="logo" className="h-12 block" />
        <AppBarDropdown />
      </div>

      {user.role === "admin" ? (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-center mb-2">
            {t("inactive_subscription.no_active_subscription_admin", "Your subscription is inactive")}
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Choose a plan below to activate your account and restore full access to POS, Kitchen, & Inventory.
          </p>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading subscription options...</div>
          ) : Array.isArray(plans) && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => {
                const isPopular =
                  plan.badge?.toLowerCase().includes("popular") ||
                  plan.name?.toLowerCase().includes("premium");

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 ${
                      isPopular
                        ? "border-restro-green shadow-xl bg-gradient-to-b from-green-50/40 to-white dark:from-green-950/20 dark:to-restro-card-bg scale-[1.02]"
                        : "border-gray-200 dark:border-restro-border-green bg-white dark:bg-restro-card-bg shadow-sm hover:shadow-md"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-restro-green text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        {getPlanIcon(plan.name)}
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 min-h-[32px]">
                        {plan.description || "Everything required to run your business smoothly."}
                      </p>

                      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-restro-border-green">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold">
                            {plan.currency || "GH₵"}
                            {Number(plan.price || plan.amount || 0).toFixed(2)}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            / {plan.frequency || "monthly"}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8 text-sm">
                        {Array.isArray(plan.features) && plan.features.length > 0 ? (
                          plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-restro-green flex items-center justify-center shrink-0 mt-0.5">
                                <IconCheck size={12} strokeWidth={3} />
                              </span>
                              <span className="text-gray-700 dark:text-gray-300">{feat}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-center gap-2">
                            <IconCheck size={16} className="text-restro-green" /> Unlimited Orders & POS
                          </li>
                        )}
                      </ul>
                    </div>

                    <button
                      onClick={() => btnSubscribe(plan)}
                      className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition active:scale-95 shadow-md ${
                        isPopular
                          ? "bg-restro-green hover:bg-restro-green-button-hover text-white"
                          : "bg-gray-900 hover:bg-restro-green text-white dark:bg-restro-gray dark:hover:bg-restro-green"
                      }`}
                    >
                      Subscribe to {plan.name} Plan
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="rounded-2xl px-8 py-6 border border-restro-border-green flex flex-col w-full lg:w-96 bg-white dark:bg-restro-card-bg">
                <h3 className="text-4xl text-green-700 font-bold text-center">{subscriptionPrice}</h3>
                <h3 className="font-bold text-2xl text-center">{t("inactive_subscription.price_per_month", "Per Month")}</h3>
                <ul className="text-gray-700 dark:text-white mt-6 flex flex-col gap-2 text-start">
                  <li>{t("inactive_subscription.features.unlimited_orders", "Unlimited Orders")}</li>
                  <li>{t("inactive_subscription.features.monthly_renewals", "Monthly Renewals")}</li>
                  <li>{t("inactive_subscription.features.unlimited_devices", "Unlimited Devices")}</li>
                  <li>{t("inactive_subscription.features.live_kitchen_orders", "Live Kitchen Orders")}</li>
                </ul>
                <button onClick={() => btnSubscribe(null)} className="rounded-full bg-restro-green text-white px-4 py-3 transition active:scale-95 hover:bg-restro-green-button-hover mt-6">
                  Pay with Paystack
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-20">
          <h3 className="mt-4 text-center text-lg">{t("inactive_subscription.no_active_subscription_user", "Your organization subscription is inactive. Please contact your administrator.")}</h3>
        </div>
      )}
    </Page>
  );
}
