import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  IconBuildingStore,
  IconCashBanknote,
  IconChartBar,
  IconClockHour3,
  IconReceipt,
  IconSparkles,
  IconTargetArrow,
  IconUsers,
} from "@tabler/icons-react";
import {
  addAccountabilityExpense,
  askAccountabilityQuestion,
  closeAccountabilityShift,
  openAccountabilityShift,
  setAccountabilityTarget,
  useAccountabilityDashboard,
} from "../controllers/accountability.controller";

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function money(value, currency = "") {
  return `${currency} ${Number(value || 0).toFixed(2)}`.trim();
}

const initialDate = localDate();
const initialMonth = `${initialDate.slice(0, 7)}-01`;

export default function AccountabilityDashboard() {
  const [from, setFrom] = useState(initialMonth);
  const [to, setTo] = useState(initialDate);
  const [branchId, setBranchId] = useState("");
  const [openingCash, setOpeningCash] = useState("");
  const [countedCash, setCountedCash] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    description: "",
    spentOn: initialDate,
  });
  const [target, setTarget] = useState({
    targetType: "sales",
    amount: "",
    startsOn: initialMonth,
    endsOn: initialDate,
  });
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, error, isLoading, mutate } = useAccountabilityDashboard({ from, to, branchId });

  const runMutation = async (operation, successMessage) => {
    try {
      setBusy(true);
      await operation();
      await mutate();
      toast.success(successMessage);
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "Could not save this accountability update.");
    } finally {
      setBusy(false);
    }
  };

  const handleOpenShift = (event) => {
    event.preventDefault();
    runMutation(() => openAccountabilityShift(Number(openingCash), branchId), "Register session opened.");
    setOpeningCash("");
  };

  const handleCloseShift = (event) => {
    event.preventDefault();
    if (!data?.openShift) return;
    runMutation(
      () => closeAccountabilityShift(data.openShift.id, Number(countedCash), shiftNotes),
      "Register session closed."
    );
    setCountedCash("");
    setShiftNotes("");
  };

  const handleExpense = (event) => {
    event.preventDefault();
    runMutation(
      () => addAccountabilityExpense({ ...expense, amount: Number(expense.amount), branchId: branchId || null }),
      "Expense recorded."
    );
    setExpense({ amount: "", category: "", description: "", spentOn: localDate() });
  };

  const handleTarget = (event) => {
    event.preventDefault();
    runMutation(
      () => setAccountabilityTarget({ ...target, amount: Number(target.amount), branchId: branchId || null }),
      "Business target saved."
    );
  };

  const handleQuestion = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      const response = await askAccountabilityQuestion(question, branchId);
      setAnswer(response.data);
      setQuestion("");
      await mutate();
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || "The reporting assistant could not answer that question.");
    } finally {
      setBusy(false);
    }
  };

  const submitClass = "inline-flex items-center justify-center rounded-xl bg-restro-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-restro-green-button-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50";
  const fieldClass = "w-full rounded-xl border border-restro-border-green bg-restro-card-bg px-3 py-2.5 text-sm text-restro-text transition focus:border-restro-green focus:outline-none focus:ring-2 focus:ring-restro-green/20";
  const panelClass = "rounded-2xl border border-restro-border-green bg-restro-card-bg p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6";

  if (isLoading) return <section className="mt-6 rounded-2xl border border-restro-border-green p-6 text-sm text-gray-500">Loading accountability data…</section>;
  if (error) return <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Could not load accountability data. Refresh the page and try again.</section>;

  if (data?.branchRequired) {
    return (
      <section className="mt-6 rounded-2xl border border-restro-border-green bg-restro-card-bg p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-restro-green/10 p-2.5 text-restro-green"><IconBuildingStore size={22} /></span>
          <div>
            <h2 className="text-xl font-semibold">Choose a branch report</h2>
            <p className="mt-1 text-sm text-gray-500">Choose a location to review its accountability results.</p>
          </div>
        </div>
        <select className={`${fieldClass} mt-4 max-w-md`} value={branchId} onChange={(event) => setBranchId(event.target.value)}>
          <option value="">Select a branch</option>
          {data.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
      </section>
    );
  }

  const currency = data.currency || "";
  const salesTarget = data.targets?.find((item) => item.target_type === "sales" && item.starts_on <= from && item.ends_on >= to);
  const expenseTarget = data.targets?.find((item) => item.target_type === "expense" && item.starts_on <= from && item.ends_on >= to);

  return (
    <section className="mt-6 space-y-5">
      <div className="overflow-hidden rounded-3xl border border-restro-border-green bg-restro-card-bg shadow-sm">
        <div className="relative flex flex-col gap-5 border-b border-restro-border-green bg-gradient-to-br from-restro-green/10 via-restro-card-bg to-restro-card-bg p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-restro-green p-3 text-white shadow-sm"><IconChartBar size={23} stroke={1.8} /></span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-restro-green">Business pulse</p>
                <h2 className="mt-0.5 text-2xl font-semibold tracking-tight">Accountability</h2>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">A clear view of sales, spending, cash closeouts, and the actions behind the numbers.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
            <label className="text-xs font-medium text-gray-500">From<input type="date" className={`${fieldClass} mt-1 min-w-0`} value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label>
            <label className="text-xs font-medium text-gray-500">To<input type="date" className={`${fieldClass} mt-1 min-w-0`} value={to} min={from} onChange={(event) => setTo(event.target.value)} /></label>
            {data.branches?.length > 1 && (
              <label className="col-span-2 text-xs font-medium text-gray-500 sm:col-span-1">Location
                <select className={`${fieldClass} mt-1`} value={branchId} onChange={(event) => setBranchId(event.target.value)}>
                  <option value="">All locations</option>
                  {data.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        <div className="grid gap-3 bg-restro-bg-gray/40 p-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-restro-border-green/80 bg-restro-card-bg p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sales collected</p>
              <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700"><IconChartBar size={19} /></span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{money(data.revenue, currency)}</p>
            <p className="mt-1 text-xs text-gray-500">{data.invoiceCount} paid invoices</p>
          </article>
          <article className="rounded-2xl border border-restro-border-green/80 bg-restro-card-bg p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recorded expenses</p>
              <span className="rounded-xl bg-amber-500/10 p-2 text-amber-700"><IconReceipt size={19} /></span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{money(data.expenses, currency)}</p>
            <p className="mt-1 text-xs text-gray-500">Only expenses entered in RestroPro are included.</p>
          </article>
          <article className="rounded-2xl border border-restro-border-green/80 bg-restro-card-bg p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">After recorded expenses</p>
              <span className="rounded-xl bg-sky-500/10 p-2 text-sky-700"><IconCashBanknote size={19} /></span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{money(data.netAfterRecordedExpenses, currency)}</p>
            <p className="mt-1 text-xs text-gray-500">Before unrecorded costs, taxes, and other liabilities.</p>
          </article>
        </div>
      </div>

      {data.capabilities.multiBranchAnalytics && data.branchComparisons?.length > 0 && !branchId && (
        <div className={panelClass}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-restro-green">Advance</p><h3 className="mt-1 text-lg font-semibold">Location comparison</h3></div>
            <p className="text-xs text-gray-500">Consolidated results for the selected date range</p>
          </div>
          <div className="mt-4 divide-y divide-restro-border-green">
            {data.branchComparisons.map((branch) => (
              <div key={branch.branchId} className="grid grid-cols-1 gap-1 py-3 text-sm sm:grid-cols-4 sm:items-center">
                <span className="font-semibold">{branch.branchName}</span>
                <span>Sales {money(branch.revenue, currency)}</span>
                <span>Expenses {money(branch.expenses, currency)}</span>
                <span className="text-gray-500">{branch.invoiceCount} invoices</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-restro-green/10 p-2.5 text-restro-green"><IconCashBanknote size={21} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-restro-green">Register control</p><h3 className="mt-0.5 text-lg font-semibold">Shift cash closeout</h3></div>
          </div>
          <p className="mt-1 text-sm text-gray-500">Checkout remains available without a session. Sales are attached to an open session for reconciliation.</p>
          {data.openShift ? (
            <form className="mt-5 space-y-3" onSubmit={handleCloseShift}>
              <div className="rounded-xl border border-restro-border-green bg-restro-bg-gray/60 p-4 text-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-restro-green"><IconClockHour3 size={16} /> Session in progress</p>
                <p className="mt-3">Opened by <strong>{data.openShift.opened_by_name || data.openShift.opened_by}</strong> at {new Date(data.openShift.opened_at).toLocaleString()}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <p className="text-gray-500">Opening till<strong className="mt-1 block text-restro-text">{money(data.openShift.opening_cash, currency)}</strong></p>
                  <p className="text-gray-500">Cash sales<strong className="mt-1 block text-restro-text">{money(data.openShift.cashSales, currency)}</strong></p>
                </div>
                <p className="mt-3 flex items-center justify-between border-t border-restro-border-green pt-3 text-gray-500">Expected cash<strong className="text-base text-restro-text">{money(data.openShift.expectedCash, currency)}</strong></p>
              </div>
              <label className="block text-sm">Counted cash<input required type="number" min="0" step="0.01" className={`${fieldClass} mt-1`} value={countedCash} onChange={(event) => setCountedCash(event.target.value)} /></label>
              <label className="block text-sm">Close notes (optional)<textarea className={`${fieldClass} mt-1`} rows="2" value={shiftNotes} onChange={(event) => setShiftNotes(event.target.value)} /></label>
              <button disabled={busy} className={submitClass}>Close register and record variance</button>
            </form>
          ) : (
            <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleOpenShift}>
              <label className="flex-1 text-sm">Opening till cash<input required type="number" min="0" step="0.01" className={`${fieldClass} mt-1`} value={openingCash} onChange={(event) => setOpeningCash(event.target.value)} /></label>
              <button disabled={busy} className={submitClass}>Open register session</button>
            </form>
          )}
          {data.shifts?.length > 0 && (
            <div className="mt-5 border-t border-restro-border-green pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recent closeouts</p>
              {data.shifts.filter((shift) => shift.closed_at).slice(0, 3).map((shift) => (
                <div key={shift.id} className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
                  <span>{shift.closed_by_name || shift.closed_by} · {new Date(shift.closed_at).toLocaleDateString()}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${Number(shift.variance) < 0 ? "bg-red-500/10 text-red-600" : Number(shift.variance) > 0 ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"}`}>
                    Variance {money(shift.variance, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-700"><IconTargetArrow size={21} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-restro-green">Business goals</p><h3 className="mt-0.5 text-lg font-semibold">Targets vs actual</h3></div>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { title: "Sales target", target: salesTarget, actual: data.revenue },
              { title: "Expense budget", target: expenseTarget, actual: data.expenses },
            ].map(({ title, target: targetRow, actual }) => {
              const progress = targetRow ? Math.min(100, (Number(actual) / Number(targetRow.amount)) * 100) : 0;
              return (
                <div key={title}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-medium">{title}</span>
                    <span className="text-gray-500">{targetRow ? `${money(actual, currency)} / ${money(targetRow.amount, currency)}` : "No target set"}</span>
                  </div>
                  {targetRow && <div className="mt-2 h-2 overflow-hidden rounded-full bg-restro-bg-gray"><div className="h-full rounded-full bg-restro-green transition-all" style={{ width: `${progress}%` }} /></div>}
                </div>
              );
            })}
          </div>
          <form className="mt-5 grid gap-3 border-t border-restro-border-green pt-4 sm:grid-cols-2" onSubmit={handleTarget}>
            <label className="text-sm">Target type<select className={`${fieldClass} mt-1`} value={target.targetType} onChange={(event) => setTarget({ ...target, targetType: event.target.value })}><option value="sales">Sales goal</option><option value="expense">Expense budget</option></select></label>
            <label className="text-sm">Amount<input required type="number" min="0.01" step="0.01" className={`${fieldClass} mt-1`} value={target.amount} onChange={(event) => setTarget({ ...target, amount: event.target.value })} /></label>
            <label className="text-sm">Starts<input required type="date" className={`${fieldClass} mt-1`} value={target.startsOn} onChange={(event) => setTarget({ ...target, startsOn: event.target.value })} /></label>
            <label className="text-sm">Ends<input required type="date" min={target.startsOn} className={`${fieldClass} mt-1`} value={target.endsOn} onChange={(event) => setTarget({ ...target, endsOn: event.target.value })} /></label>
            <button disabled={busy} className={`${submitClass} sm:col-span-2`}>Save target for this location and period</button>
          </form>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-700"><IconReceipt size={21} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-restro-green">Expense ledger</p><h3 className="mt-0.5 text-lg font-semibold">Record business spending</h3></div>
          </div>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleExpense}>
            <label className="text-sm">Amount<input required type="number" min="0.01" step="0.01" className={`${fieldClass} mt-1`} value={expense.amount} onChange={(event) => setExpense({ ...expense, amount: event.target.value })} /></label>
            <label className="text-sm">Category<input required maxLength="100" className={`${fieldClass} mt-1`} placeholder="Supplies, rent, utilities…" value={expense.category} onChange={(event) => setExpense({ ...expense, category: event.target.value })} /></label>
            <label className="text-sm sm:col-span-2">Description<input required maxLength="500" className={`${fieldClass} mt-1`} value={expense.description} onChange={(event) => setExpense({ ...expense, description: event.target.value })} /></label>
            <label className="text-sm">Date<input required type="date" className={`${fieldClass} mt-1`} value={expense.spentOn} onChange={(event) => setExpense({ ...expense, spentOn: event.target.value })} /></label>
            <button disabled={busy} className={`${submitClass} self-end`}>Record expense</button>
          </form>
          <div className="mt-5 border-t border-restro-border-green pt-3">
            {data.expensesRecent?.length ? data.expensesRecent.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between gap-3 border-b border-restro-border-green/50 py-2 text-sm last:border-b-0">
                <span><strong>{item.category}</strong><span className="block text-xs text-gray-500">{item.description} · {item.spent_on}</span></span>
                <span className="shrink-0">{money(item.amount, currency)}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No expenses recorded for this date range.</p>}
          </div>
        </section>

        <section className={panelClass}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-sky-500/10 p-2.5 text-sky-700"><IconUsers size={21} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-restro-green">Staff activity</p><h3 className="mt-0.5 text-lg font-semibold">A clear record of key actions</h3></div>
          </div>
          <p className="mt-1 text-sm text-gray-500">New sales, order cancellations, register sessions, expenses, and target changes are logged with the responsible account.</p>
          <div className="mt-4 max-h-72 divide-y divide-restro-border-green overflow-y-auto">
            {data.activity?.length ? data.activity.map((event) => (
              <div key={event.id} className="py-3">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-semibold">{(event.action || "").replaceAll("_", " ")}</span>
                  <time className="text-xs text-gray-500">{new Date(event.occurred_at).toLocaleString()}</time>
                </div>
                <p className="mt-1 text-xs text-gray-500">{event.actor_name || event.actor_username || "System"} · {event.entity_type}{event.entity_id ? ` #${event.entity_id}` : ""}</p>
                {event.details && <p className="mt-1 break-words text-xs text-gray-500">{Object.entries(event.details).filter(([key]) => key !== "orderIds").map(([key, value]) => `${key}: ${value}`).join(" · ")}</p>}
              </div>
            )) : <p className="py-3 text-sm text-gray-500">Activity will appear here as your team records sales and closeouts.</p>}
          </div>
        </section>
      </div>

      {data.capabilities.advancedReporting && (
        <section className="overflow-hidden rounded-3xl border border-restro-green/40 bg-gradient-to-br from-restro-green/10 via-restro-card-bg to-restro-card-bg p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-restro-green p-2.5 text-white"><IconSparkles size={21} /></span><div><p className="text-[11px] font-bold uppercase tracking-widest text-restro-green">Advance intelligence</p><h3 className="mt-0.5 text-xl font-semibold">Ask about your business</h3></div></div>
            <p className="text-xs text-gray-500">{data.capabilities.aiQuota?.remaining ?? 0} of {data.capabilities.monthlyAiQueries} questions remaining this month</p>
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleQuestion}>
            <input required maxLength="500" className={fieldClass} placeholder="How much did we spend this month? Which team member recorded the most sales?" value={question} onChange={(event) => setQuestion(event.target.value)} />
            <button disabled={busy || !data.capabilities.aiQuota?.remaining} className={`${submitClass} shrink-0`}>{busy ? "Checking…" : "Ask"}</button>
          </form>
          {answer && <div className="mt-4 rounded-2xl bg-restro-bg-gray p-4"><p className="text-sm font-medium">{answer.answer}</p><p className="mt-2 text-xs text-gray-500">Based on {answer.period.from} through {answer.period.to}. Only aggregate results are used to answer.</p></div>}
          <p className="mt-3 text-xs text-gray-500">Questions use aggregate sales, expenses, invoice counts, staff totals, and payment-method totals. Individual customer records are not queried.</p>
        </section>
      )}
    </section>
  );
}
