import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((response) => response.data);

export function useAccountabilityDashboard({ from, to, branchId }) {
  const params = new URLSearchParams({ from, to });
  if (branchId) params.set("branchId", branchId);
  const APIURL = `/accountability/dashboard?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(APIURL, fetcher);
  return { data, error, isLoading, mutate };
}

export async function openAccountabilityShift(openingCash, branchId) {
  return ApiClient.post("/accountability/shifts/open", { openingCash, branchId: branchId || null });
}

export async function closeAccountabilityShift(shiftId, countedCash, notes) {
  return ApiClient.post(`/accountability/shifts/${shiftId}/close`, { countedCash, notes });
}

export async function addAccountabilityExpense(expense) {
  return ApiClient.post("/accountability/expenses", expense);
}

export async function setAccountabilityTarget(target) {
  return ApiClient.post("/accountability/targets", target);
}

export async function askAccountabilityQuestion(question, branchId) {
  return ApiClient.post("/accountability/ai-question", { question, branchId: branchId || null });
}
