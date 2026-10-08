import React, { useState } from "react";
import Page from "../../components/Page";
import {
  IconCreditCard,
  IconPencil,
  IconCheck,
  IconPlus,
  IconTrash,
  IconRefresh,
  IconSparkles,
  IconShieldCheck,
  IconCrown,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import {
  useSuperAdminSubscriptionPlans,
  updateSubscriptionPlan,
  resetSubscriptionPlans,
} from "../../controllers/superadmin.controller";
import { toast } from "react-hot-toast";

export default function SuperAdminBillingPage() {
  const { data: plans, isLoading, error, mutate } = useSuperAdminSubscriptionPlans();

  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    plan_code: "",
    price: 0,
    currency: "GH₵",
    frequency: "monthly",
    badge: "",
    description: "",
    paystack_plan_id: "",
    is_active: true,
    features: [],
  });
  const [newFeatureText, setNewFeatureText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || "",
      plan_code: plan.plan_code || plan.name?.toLowerCase() || "",
      price: plan.price || plan.amount || 0,
      currency: plan.currency || "GH₵",
      frequency: plan.frequency || "monthly",
      badge: plan.badge || "",
      description: plan.description || "",
      paystack_plan_id: plan.paystack_plan_id || "",
      is_active: plan.is_active !== undefined ? plan.is_active : true,
      features: Array.isArray(plan.features) ? [...plan.features] : [],
    });
    setNewFeatureText("");
  };

  const handleCloseEdit = () => {
    setEditingPlan(null);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()],
    }));
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      toast.error("Plan name is required");
      return;
    }

    try {
      setIsSaving(true);
      toast.loading("Saving changes...");
      await updateSubscriptionPlan(editingPlan.id, formData);
      toast.dismiss();
      toast.success("Subscription plan updated successfully!");
      mutate();
      handleCloseEdit();
    } catch (err) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Failed to update subscription plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const isConfirm = window.confirm(
      "Are you sure you want to reset all pricing cards to default Basic, Premium, and Advance plans?"
    );
    if (!isConfirm) return;

    try {
      toast.loading("Resetting pricing plans...");
      await resetSubscriptionPlans();
      toast.dismiss();
      toast.success("Pricing plans reset to default!");
      mutate();
    } catch (err) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Failed to reset plans");
    }
  };

  const getPlanIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("basic")) {
      return <IconShieldCheck size={24} className="text-blue-600" />;
    } else if (lower.includes("advance") || lower.includes("advanced")) {
      return <IconCrown size={24} className="text-amber-600" />;
    }
    return <IconSparkles size={24} className="text-restro-green" />;
  };

  // -------------------------------------------------------------
  // FULL PAGE EDITOR VIEW
  // -------------------------------------------------------------
  if (editingPlan) {
    return (
      <Page>
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-restro-border-green">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseEdit}
                className="p-2 rounded-full border border-gray-200 dark:border-restro-border-green hover:bg-gray-100 dark:hover:bg-restro-gray transition text-gray-600 dark:text-gray-300"
                title="Back to plans"
              >
                <IconArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Edit Plan: <span className="text-restro-green">{editingPlan.name}</span>
                </h1>
                <p className="text-xs text-gray-500">
                  Update plan configuration, pricing, and feature offerings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green hover:bg-gray-100 dark:hover:bg-restro-gray text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-restro-green hover:bg-restro-green-button-hover text-white text-sm font-semibold transition active:scale-95 disabled:opacity-50"
              >
                <IconDeviceFloppy size={18} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: General Details */}
            <div className="bg-white dark:bg-restro-card-bg border border-gray-200 dark:border-restro-border-green rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-restro-border-green">
                General Plan Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Starter, Most Popular, Best Value"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Short Description / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm"
                    placeholder="Brief description explaining who this plan is for..."
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <label className="inline-flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-restro-green rounded"
                    />
                    <span className="text-sm font-medium">
                      Plan is Active (visible to customers on website and subscription page)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Payment Configuration */}
            <div className="bg-white dark:bg-restro-card-bg border border-gray-200 dark:border-restro-border-green rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-restro-border-green">
                Pricing & Payment Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Price Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Billing Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                    Paystack Plan Code / ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PLN_xxxxxxxxxxx"
                    value={formData.paystack_plan_id}
                    onChange={(e) => setFormData({ ...formData, paystack_plan_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent focus:outline-none focus:border-restro-green text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the Paystack Plan ID if managing recurring billing subscriptions via Paystack.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Feature Bullet Points */}
            <div className="bg-white dark:bg-restro-card-bg border border-gray-200 dark:border-restro-border-green rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-restro-border-green">
                Plan Features & Capabilities
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter feature title (e.g. Unlimited Orders, Multi-Branch Access)..."
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green bg-transparent text-sm focus:outline-none focus:border-restro-green"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-restro-green hover:bg-restro-green-button-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shrink-0"
                >
                  <IconPlus size={18} /> Add Feature
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-restro-border-green bg-gray-50/50 dark:bg-restro-gray/40 text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-restro-green flex items-center justify-center shrink-0">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{feat}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Remove feature"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                ))}
                {formData.features.length === 0 && (
                  <p className="text-xs text-gray-400 italic p-2">
                    No feature bullet points added yet. Add feature points above.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-restro-border-green hover:bg-gray-100 dark:hover:bg-restro-gray text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-restro-green hover:bg-restro-green-button-hover text-white text-sm font-semibold transition active:scale-95 disabled:opacity-50"
              >
                <IconDeviceFloppy size={18} />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </Page>
    );
  }

  // -------------------------------------------------------------
  // OVERVIEW CARDS VIEW (Clean, Flat & Professional)
  // -------------------------------------------------------------
  return (
    <Page>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-3">
              <IconCreditCard className="text-restro-green" size={32} stroke={iconStroke} />
              Pricing & Subscription Plans
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure and manage the 3 subscription tiers (Basic, Premium, Advance) for your platform.
            </p>
          </div>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 border border-gray-200 dark:border-restro-border-green hover:bg-gray-100 dark:bg-restro-card-bg dark:hover:bg-restro-gray px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <IconRefresh size={18} />
            Reset to Default 3 Cards
          </button>
        </div>

        {/* Loading / Error state */}
        {isLoading && (
          <div className="py-20 text-center text-gray-500">Loading subscription plans...</div>
        )}

        {error && (
          <div className="py-20 text-center text-red-500">
            Error loading subscription plans. Please refresh or try resetting to defaults.
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && plans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const isPopular =
                plan.badge?.toLowerCase().includes("popular") ||
                plan.name?.toLowerCase().includes("premium");

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 md:p-8 border flex flex-col justify-between bg-white dark:bg-restro-card-bg ${
                    isPopular
                      ? "border-restro-green border-2"
                      : "border-gray-200 dark:border-restro-border-green"
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getPlanIcon(plan.name)}
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <span
                            className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold mt-0.5 ${
                              plan.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            }`}
                          >
                            {plan.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {plan.badge && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-restro-gray text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-restro-border-green">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 min-h-[32px] leading-relaxed">
                      {plan.description || "No description set"}
                    </p>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-gray-100 dark:border-restro-border-green">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {plan.currency || "GH₵"}
                          {Number(plan.price || plan.amount || 0).toFixed(2)}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          / {plan.frequency || "monthly"}
                        </span>
                      </div>
                      {plan.paystack_plan_id && (
                        <p className="text-[11px] font-mono text-gray-400 mt-2">
                          Paystack Code: {plan.paystack_plan_id}
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2.5 mb-8 text-sm">
                      {Array.isArray(plan.features) && plan.features.length > 0 ? (
                        plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-restro-green flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                              ✓
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 text-xs leading-tight">{feat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic text-xs">No features listed</li>
                      )}
                    </ul>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 hover:bg-restro-green text-white dark:bg-restro-gray dark:hover:bg-restro-green font-semibold py-2.5 px-4 rounded-xl transition text-sm"
                  >
                    <IconPencil size={16} />
                    Edit {plan.name} Plan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}
